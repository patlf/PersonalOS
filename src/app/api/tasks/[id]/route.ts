import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UpdateTaskInput } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const params = await context.params;
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

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

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

    return NextResponse.json(formattedTask);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  const params = await context.params;
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

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body: Partial<UpdateTaskInput> = await request.json();
    
    console.log('🔧 API: Received update request for task:', params.id);
    console.log('📝 API: Update body:', body);
    
    // Prepare update data
    const updateData: any = {};
    
    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json(
          { error: 'Title cannot be empty' },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }
    
    if (body.estimatedDuration !== undefined) {
      updateData.estimatedDuration = body.estimatedDuration;
    }
    
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    
    if (body.scheduledDate !== undefined) {
      updateData.scheduledDate = body.scheduledDate;
    }
    
    if (body.scheduledTime !== undefined) {
      if (body.scheduledTime) {
        // Ensure the time format is HH:MM:SS for PostgreSQL TIME type
        const timeStr = body.scheduledTime.includes(':') 
          ? (body.scheduledTime.split(':').length === 2 ? `${body.scheduledTime}:00` : body.scheduledTime)
          : `${body.scheduledTime}:00:00`;
        updateData.scheduledTime = new Date(`1970-01-01T${timeStr}`);
      } else {
        updateData.scheduledTime = null;
      }
    }
    
    if (body.tags !== undefined) {
      updateData.tags = body.tags;
    }
    
    if (body.priority !== undefined) {
      updateData.priority = body.priority;
    }

    console.log('💾 API: Final update data:', updateData);
    
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
    });
    
    console.log('✅ API: Task updated successfully:', updatedTask.id);

    // Format the response
    const formattedTask = {
      ...updatedTask,
      scheduledDate: updatedTask.scheduledDate ? new Date(updatedTask.scheduledDate) : null,
      scheduledTime: updatedTask.scheduledTime 
        ? updatedTask.scheduledTime.toISOString().substring(11, 16) // Extract HH:MM from time
        : null,
      createdAt: new Date(updatedTask.createdAt),
      updatedAt: new Date(updatedTask.updatedAt),
    };

    return NextResponse.json(formattedTask);
  } catch (error) {
    console.error('❌ API: Error updating task:', error);
    console.error('❌ API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const params = await context.params;
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

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}