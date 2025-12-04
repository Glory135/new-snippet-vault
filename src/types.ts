
export enum SnippetLanguage {
  TypeScript = 'typescript',
  JavaScript = 'javascript',
  Python = 'python',
  HTML = 'html',
  CSS = 'css',
  SQL = 'sql',
  JSON = 'json',
  Markdown = 'markdown',
  Other = 'text',
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Snippet {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: SnippetLanguage;
  tags: string[];
  isFavorite: boolean;
  ownerId?: string; // If null, it's a local-only snippet
  createdAt: string;
  updatedAt: string;
}

export interface CreateSnippetDTO {
  title: string;
  description: string;
  code: string;
  language: SnippetLanguage;
  tags: string[];
}

export type ViewMode = 'LIST' | 'CREATE' | 'EDIT' | 'DETAIL' | 'LOGIN';

export interface FilterState {
  search: string;
  language: SnippetLanguage | 'ALL';
  favoritesOnly: boolean;
}

/* 
  === PRISMA SCHEMA REFERENCE (For Backend) ===

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  model User {
    id            String    @id @default(cuid())
    name          String?
    email         String    @unique
    emailVerified DateTime?
    image         String?
    accounts      Account[]
    sessions      Session[]
    snippets      Snippet[]
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
  }

  model Snippet {
    id          String   @id @default(cuid())
    title       String
    description String?  @db.Text
    code        String   @db.Text
    language    String
    tags        String[]
    isFavorite  Boolean  @default(false)
    userId      String
    user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    @@index([userId])
  }
*/
