import { Snippet, CreateSnippetDTO, User } from '../types';
import { INITIAL_SNIPPETS } from '../constants';

const LOCAL_STORAGE_KEY = 'snippet_vault_local_db';


// --- Local Storage Helpers (Offline Mode) ---

const getLocalSnippets = (): Snippet[] => {
  if (typeof window === 'undefined') return []; // SSR safety
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_SNIPPETS;
  } catch (e) {
    console.error("LocalStorage Access Error", e);
    return [];
  }
};

const setLocalSnippets = (snippets: Snippet[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snippets));
};


// --- Real API Client (For Production) ---

const api = {
  async getSnippets(): Promise<Snippet[]> {
    const res = await fetch('/api/snippets');
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },

  async createSnippet(data: CreateSnippetDTO): Promise<Snippet> {
    const res = await fetch('/api/snippets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateSnippet(id: string, data: Partial<CreateSnippetDTO>): Promise<Snippet> {
    const res = await fetch(`/api/snippets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteSnippet(id: string): Promise<void> {
    await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
  },

  async sync(snippets: Snippet[]): Promise<void> {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snippets }),
    });
  }
};

// --- Unified Public API ---

export const getSnippets = async (user: User | null): Promise<Snippet[]> => {
  // 1. Guest User -> Local Storage
  if (!user) {
    return getLocalSnippets();
  }
  return api.getSnippets();
};

export const createSnippet = async (data: CreateSnippetDTO, user: User | null): Promise<Snippet> => {
  // 1. Guest User
  if (!user) {
    const newSnippet: Snippet = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = getLocalSnippets();
    setLocalSnippets([newSnippet, ...current]);
    return newSnippet;
  }

  return api.createSnippet(data);
};

export const updateSnippet = async (id: string, data: Partial<CreateSnippetDTO>, user: User | null): Promise<Snippet> => {
  if (!user) {
    const snippets = getLocalSnippets();
    const index = snippets.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Snippet not found");

    const updated = { ...snippets[index], ...data, updatedAt: new Date().toISOString() };
    snippets[index] = updated;
    setLocalSnippets(snippets);
    return updated;
  }

  return api.updateSnippet(id, data);
};

export const deleteSnippet = async (id: string, user: User | null): Promise<void> => {
  if (!user) {
    const snippets = getLocalSnippets().filter(s => s.id !== id);
    setLocalSnippets(snippets);
    return;
  }

  await api.deleteSnippet(id);
};

export const toggleFavorite = async (id: string, user: User | null): Promise<void> => {
  let snippet: Snippet | undefined;

  if (!user) {
    snippet = getLocalSnippets().find(s => s.id === id);
  } else {
    const all = await getSnippets(user);
    snippet = all.find(s => s.id === id);
  }
  if (!snippet) return;

  await updateSnippet(id, { isFavorite: !snippet.isFavorite } as any, user);
};

// --- Synchronization Logic ---

export const hasUnsyncedSnippets = (): boolean => {
  const local = getLocalSnippets();
  return local.length > 0;
};

export const syncLocalToCloud = async (user: User): Promise<void> => {
  console.log("Starting sync process...");

  const localSnippets = getLocalSnippets();
  if (localSnippets.length === 0) return;

  await api.sync(localSnippets);

  // Clear Local Storage after successful sync
  setLocalSnippets([]);
  console.log("Sync complete.");
};