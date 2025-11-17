import { searchParamsCache } from '@/lib/searchparams';
import { createArticleColumnsConfig } from '@/lib/columns/article-columns';
import { ArticlesTable } from './articles-tables';

import type { Article } from '@/constants/mock-api';
import { EntitiesServerService } from '@/lib/api/articles.server.service';
import { EntityCategoriesServerService } from '@/lib/api/articles-categories.server.service';
import { Entity } from 'prisma/generated/prisma/client';

type ArticlesListingPageProps = {};

export default async function ArticlesListingPage({}: ArticlesListingPageProps) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name'); // Changed from 'title' to 'search'
  const pageLimit = searchParamsCache.get('perPage');
  const category = searchParamsCache.get('category');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    scope: 'admin',
    ...(search && { search }),
    ...(category && { category: category }),
    ...(sort && { sort })
  };

  const categoryResponse =
    await EntityCategoriesServerService.getAdminCategories({});

  // Format categories for column options
  let categoryOptions: Array<{ value: string; label: string }> = [];

  if (categoryResponse.success && categoryResponse.data) {
    // The backend returns categories array directly
    const categories = Array.isArray(categoryResponse.data)
      ? categoryResponse.data
      : [];

    if (Array.isArray(categories)) {
      categoryOptions = categories.map((category: any) => ({
        // Use name as value for filtering (consistent with Prisma schema)
        value: category.name || String(category.id),
        label:
          category.label || category.name
            ? (category.label || category.name).charAt(0).toUpperCase() +
              (category.label || category.name).slice(1)
            : String(category.id)
      }));
    }
  }

  // Create server-safe column config (no client components)
  const columnsConfig = createArticleColumnsConfig(categoryOptions);

  const data = await EntitiesServerService.getAdminEntities(filters);
  const totalArticles = data.data.total_entities;
  const articles = data.data.entities;

  return (
    <ArticlesTable
      data={articles}
      totalItems={totalArticles}
      columnsConfig={columnsConfig}
    />
  );
}
