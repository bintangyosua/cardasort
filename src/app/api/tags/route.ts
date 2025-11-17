import { TagsServerService } from '@/lib/api/tags.server.service';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const result = await TagsServerService.getAdminTags({
      page,
      limit,
      search,
      sort
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await TagsServerService.createTag({
      name
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
