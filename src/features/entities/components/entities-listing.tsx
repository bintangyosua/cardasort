import { searchParamsCache } from '@/lib/searchparams';
import { EntitiesTable } from './entities-tables';
import { EntityCategoriesServerService } from '@/lib/api/entities-categories.server.service';
import { createEntityColumnsConfig } from '@/lib/columns/entity-columns';
import { EntitiesServerService } from '@/lib/api/entities.server.service';

type EntitiesListingPageProps = {};

export default async function EntitiesListingPage({}: EntitiesListingPageProps) {
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
  const columnsConfig = createEntityColumnsConfig(categoryOptions);

  const data = await EntitiesServerService.getAdminEntities(filters);
  const totalEntities = data.data.total_entities;
  const entities = data.data.entities;

  return (
    <EntitiesTable
      data={entities}
      totalItems={totalEntities}
      columnsConfig={columnsConfig}
    />
  );
}
