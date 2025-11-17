import { EntitiesServerService } from '@/lib/api/entities.server.service';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/entities/[id] - Get single entity
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const result = await EntitiesServerService.getById(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching entity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch entity' },
      { status: 500 }
    );
  }
}

// PATCH /api/entities/[id] - Update entity
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, categoryId, imageUrl, tags } = body;

    const result = await EntitiesServerService.updateEntity(id, {
      name,
      categoryId: categoryId ? Number(categoryId) : undefined,
      imageUrl,
      tags
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating entity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update entity' },
      { status: 500 }
    );
  }
}

// DELETE /api/entities/[id] - Delete entity
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const result = await EntitiesServerService.deleteEntity(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting entity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete entity' },
      { status: 500 }
    );
  }
}
