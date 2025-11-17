import { searchParamsCache } from '@/lib/searchparams';
import { columns } from './entity-categories-tables/columns';
import { EntityCategoriesTable } from './entity-categories-tables';
import { EntityCategory } from '@/types/entity';
import { EntityCategoriesServerService } from '@/lib/api/entities-categories.server.service';

type EntityCategoriesListingPageProps = {};

export default async function EntityCategoriesListingPage({}: EntityCategoriesListingPageProps) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(sort && { sort })
  };

  const data = await EntityCategoriesServerService.getAdminCategories(filters);
  const totalEntityCategories = data.data?.length || 0;
  const EntityCategories = Array.isArray(data.data) ? data.data : [];

  return (
    <EntityCategoriesTable
      data={EntityCategories}
      totalItems={totalEntityCategories}
      columns={columns}
    />
  );
}
