import { searchParamsCache } from '@/lib/searchparams';
import { columns } from './article-categories-tables/columns';
import { ArticleCategoriesTable } from './article-categories-tables';
import { fakeArticleCategories } from '@/constants/mock-api';

import { EntityCategoriesServerService } from '@/lib/api/articles-categories.server.service';
import { ArticleCategory } from '@/types/entity';

type ArticleCategoriesListingPageProps = {};

export default async function ArticleCategoriesListingPage({}: ArticleCategoriesListingPageProps) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('search');
  const pageLimit = searchParamsCache.get('perPage');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(sort && { sort })
  };

  const data = await EntityCategoriesServerService.getAdminCategories(filters);
  const totalArticleCategories = data.data?.length || 0;
  const ArticleCategories = Array.isArray(data.data) ? data.data : [];

  return (
    <ArticleCategoriesTable
      data={ArticleCategories}
      totalItems={totalArticleCategories}
      columns={columns}
    />
  );
}
