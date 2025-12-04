import { NextResponse } from 'next/server';
import { headers } from "next/headers";
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/snippets - List user's snippets
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const snippets = await prisma.snippet.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(snippets);
}

// POST /api/snippets - Create a snippet
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const snippet = await prisma.snippet.create({
    data: {
      title: body.title,
      description: body.description,
      code: body.code,
      language: body.language,
      tags: body.tags,
      isFavorite: body.isFavorite || false,
      user: { connect: { email: session.user.email } },
    },
  });

  return NextResponse.json(snippet);
}
