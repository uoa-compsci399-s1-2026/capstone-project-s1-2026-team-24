import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, category, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !category?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        category: category.trim(),
        message: message.trim(),
      },
    });

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit contact form:', error);
    return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 });
  }
}
