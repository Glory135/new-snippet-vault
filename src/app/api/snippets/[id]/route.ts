import { NextResponse } from 'next/server';
import { headers } from "next/headers";
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';


// PATCH /api/snippets/[id] - Update snippet
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id } = await params;

  // Verify ownership
  const existing = await prisma.snippet.findFirst({
    where: { id, user: { email: session.user.email } }
  });

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.snippet.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      code: body.code,
      language: body.language,
      tags: body.tags,
      isFavorite: body.isFavorite,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/snippets/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const count = await prisma.snippet.deleteMany({
    where: { id, user: { email: session.user.email } }
  });

  if (count.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
