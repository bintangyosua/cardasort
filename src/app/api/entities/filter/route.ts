import { EntityFilterService } from '@/lib/api/entity-filter.service';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/entities/filter - Get entities for sorting based on filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const tagNames = searchParams.get('tagNames');

    const result = await EntityFilterService.getEntitiesForSorting({
      categoryId: categoryId ? parseInt(categoryId) : null,
      tagNames: tagNames ? tagNames.split(',').filter(Boolean) : []
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching entities for sorting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch entities', data: [] },
      { status: 500 }
    );
  }
}
