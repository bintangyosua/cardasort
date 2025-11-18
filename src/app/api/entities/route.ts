import { EntitiesServerService } from '@/lib/api/entities.server.service';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/entities - Get all entities
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids');

    // If IDs are provided, fetch specific entities
    if (ids) {
      const entityIds = ids
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));

      if (entityIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid entity IDs' },
          { status: 400 }
        );
      }

      const result = await EntitiesServerService.getEntitiesByIds(entityIds);
      return NextResponse.json(result);
    }

    // Otherwise, use pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const result = await EntitiesServerService.getAdminEntities({
      page,
      limit,
      search,
      category,
      sort
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}

// POST /api/entities - Create new entity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categoryId, imageUrl, tags } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Name and category are required' },
        { status: 400 }
      );
    }

    const result = await EntitiesServerService.createEntity({
      name,
      categoryId: Number(categoryId),
      imageUrl,
      tags: tags || []
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating entity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create entity' },
      { status: 500 }
    );
  }
}
