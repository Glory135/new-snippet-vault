import { SnippetLanguage } from './types';

export const LANGUAGES = [
  { label: 'TypeScript', value: SnippetLanguage.TypeScript },
  { label: 'JavaScript', value: SnippetLanguage.JavaScript },
  { label: 'Python', value: SnippetLanguage.Python },
  { label: 'HTML', value: SnippetLanguage.HTML },
  { label: 'CSS', value: SnippetLanguage.CSS },
  { label: 'SQL', value: SnippetLanguage.SQL },
  { label: 'JSON', value: SnippetLanguage.JSON },
  { label: 'Markdown', value: SnippetLanguage.Markdown },
  { label: 'Plain Text', value: SnippetLanguage.Other },
];

// Initial seed data if storage is empty
export const INITIAL_SNIPPETS = [
  {
    id: '1',
    title: 'React UseEffect Fetch',
    description: 'Standard pattern for fetching data with cleanup.',
    code: `useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setData(data));
    
  return () => controller.abort();
}, []);`,
    language: SnippetLanguage.TypeScript,
    tags: ['react', 'hooks', 'fetch'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Python List Comprehension',
    description: 'Filter even numbers from a list.',
    code: `numbers = [1, 2, 3, 4, 5, 6]
evens = [n for n in numbers if n % 2 == 0]
print(evens)`,
    language: SnippetLanguage.Python,
    tags: ['python', 'basics'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
