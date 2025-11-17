import { EntityCategoriesServerService } from '@/lib/api/entities-categories.server.service';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/entity-categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const result = await EntityCategoriesServerService.getAdminCategories({
      page,
      limit,
      search,
      sort
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/entity-categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, label } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await EntityCategoriesServerService.createCategory({
      name,
      label
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
