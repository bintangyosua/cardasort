import { EntityCategoriesServerService } from '@/lib/api/entities-categories.server.service';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/entity-categories/[id] - Get single category
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

    const result = await EntityCategoriesServerService.getCategoryById(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PATCH /api/entity-categories/[id] - Update category
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
    const { name, label } = body;

    const result = await EntityCategoriesServerService.updateCategory(id, {
      name,
      label
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/entity-categories/[id] - Delete category
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

    const result = await EntityCategoriesServerService.deleteCategory(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
