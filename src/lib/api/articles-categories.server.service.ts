import { prisma } from '../prisma';

export class EntityCategoriesServerService {
  static async getCategoryById(id: number) {
    try {
      const category = await prisma.entityCategory.findUnique({
        where: { id },
        include: {
          entities: true
        }
      });

      if (!category) {
        return {
          success: false,
          error: 'Category not found'
        };
      }

      return {
        success: true,
        data: category
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch category'
      };
    }
  }

  static async getAdminCategories(filters: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  }) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 100; // Default higher for categories
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      // Search filter
      if (filters.search) {
        where.OR = [
          {
            name: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            label: {
              contains: filters.search,
              mode: 'insensitive'
            }
          }
        ];
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
      const [categories, totalCategories] = await Promise.all([
        prisma.entityCategory.findMany({
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
        prisma.entityCategory.count({ where })
      ]);

      return {
        success: true,
        data: categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          label: cat.label,
          slug: cat.name.toLowerCase().replace(/\s+/g, '-')
        }))
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch categories',
        data: []
      };
    }
  }
}
