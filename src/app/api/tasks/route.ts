import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateTaskInput } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // Create user if they don't exist (handles OAuth users)
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const tags = searchParams.get('tags')?.split(',');

    const where: any = { userId: user.id };
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    // Convert Prisma dates to proper Date objects for the frontend
    const formattedTasks = tasks.map(task => ({
      ...task,
      scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
      scheduledTime: task.scheduledTime 
        ? task.scheduledTime.toISOString().substring(11, 16) // Extract HH:MM from time
        : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // Create user if they don't exist (handles OAuth users)
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
        },
      });
    }

    const body: CreateTaskInput = await request.json();
    
    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        estimatedDuration: body.estimatedDuration || 60,
        status: body.status || 'someday',
        scheduledDate: body.scheduledDate ? (() => {
          // Handle date string (YYYY-MM-DD) to avoid timezone issues
          if (typeof body.scheduledDate === 'string' && body.scheduledDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Create a Date object using UTC noon to avoid timezone shifts
            // This ensures the date stored in PostgreSQL matches the intended date
            return new Date(body.scheduledDate + 'T12:00:00.000Z');
          } else {
            return new Date(body.scheduledDate);
          }
        })() : null,
        scheduledTime: body.scheduledTime ? (() => {
          const timeStr = body.scheduledTime.includes(':') 
            ? (body.scheduledTime.split(':').length === 2 ? `${body.scheduledTime}:00` : body.scheduledTime)
            : `${body.scheduledTime}:00:00`;
          // Use UTC to avoid timezone conversion issues
          return new Date(`1970-01-01T${timeStr}Z`);
        })() : null,
        tags: body.tags || [],
        priority: body.priority || 'medium',
      },
    });

    // Format the response
    const formattedTask = {
      ...task,
      scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
      scheduledTime: task.scheduledTime 
        ? task.scheduledTime.toISOString().substring(11, 16) // Extract HH:MM from time
        : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    };

    return NextResponse.json(formattedTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}