import { searchParamsCache } from '@/lib/searchparams';
import { TagsTable } from './tags-tables/index';
import { TagsServerService } from '@/lib/api/tags.server.service';
import { columns } from './tags-tables/columns';

type TagsListingPageProps = {};

export default async function TagsListingPage({}: TagsListingPageProps) {
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

  const data = await TagsServerService.getAdminTags(filters);
  const totalTags = data.data?.length || 0;
  const tags = Array.isArray(data.data) ? data.data : [];

  return <TagsTable data={tags} totalItems={totalTags} columns={columns} />;
}
