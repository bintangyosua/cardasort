import { prisma } from '../prisma';

export class TagsServerService {
  static async getTagById(id: number) {
    try {
      const tag = await prisma.tag.findUnique({
        where: { id },
        include: {
          entities: true
        }
      });

      if (!tag) {
        return {
          success: false,
          error: 'Tag not found'
        };
      }

      return {
        success: true,
        data: tag
      };
    } catch (error) {
      console.error('Error fetching tag:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tag'
      };
    }
  }

  static async getAdminTags(filters: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  }) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 100; // Default higher for tags
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // Search filter
      if (filters.search) {
        where.name = {
          contains: filters.search,
          mode: 'insensitive'
        };
      }

      // Build orderBy clause
      let orderBy: any = { name: 'asc' };
      if (filters.sort) {
        try {
          const sortParams = JSON.parse(filters.sort);
          if (Array.isArray(sortParams) && sortParams.length > 0) {
            const { id, desc } = sortParams[0];
            if (id === 'name') {
              orderBy = { name: desc ? 'desc' : 'asc' };
            }
          }
        } catch (e) {
          // Invalid sort, use default
        }
      }

      // Execute queries
      const [tags, totalTags] = await Promise.all([
        prisma.tag.findMany({
          where,
          include: {
            _count: {
              select: { entities: true }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.tag.count({ where })
      ]);

      return {
        success: true,
        data: tags
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch tags',
        data: []
      };
    }
  }

  static async createTag(data: { name: string }) {
    try {
      const tag = await prisma.tag.create({
        data: {
          name: data.name
        }
      });

      return {
        success: true,
        data: tag
      };
    } catch (error) {
      console.error('Error creating tag:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create tag'
      };
    }
  }

  static async updateTag(id: number, data: { name?: string }) {
    try {
      const tag = await prisma.tag.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name })
        }
      });

      return {
        success: true,
        data: tag
      };
    } catch (error) {
      console.error('Error updating tag:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update tag'
      };
    }
  }

  static async deleteTag(id: number) {
    try {
      await prisma.tag.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Tag deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting tag:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete tag'
      };
    }
  }

  static async getAllTags() {
    try {
      const tags = await prisma.tag.findMany({
        orderBy: {
          name: 'asc'
        }
      });

      return {
        success: true,
        data: tags
      };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tags',
        data: []
      };
    }
  }
}
