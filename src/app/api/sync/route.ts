import { NextResponse } from 'next/server';
import { headers } from "next/headers";
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/sync
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })


  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { snippets } = await req.json(); // Array of local snippets

  if (!Array.isArray(snippets) || snippets.length === 0) {
    return NextResponse.json({ message: 'Nothing to sync' });
  }

  // Get User ID
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Batch create
  // Note: Prisma createMany doesn't support relations easily with SQLite/Postgres in some versions depending on config
  // We will map them to promises for simplicity

  const operations = snippets.map(s =>
    prisma.snippet.create({
      data: {
        title: s.title,
        description: s.description,
        code: s.code,
        language: s.language,
        tags: s.tags,
        isFavorite: s.isFavorite,
        userId: user.id,
        // We ignore the local ID and let Postgres generate a new CUID
      }
    })
  );

  await prisma.$transaction(operations);

  return NextResponse.json({ success: true, syncedCount: snippets.length });
}
