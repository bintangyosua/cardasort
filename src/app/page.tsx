import { HomePageClient } from '@/features/home/components/home-page-client';
import { EntityCategoriesServerService } from '@/lib/api/entities-categories.server.service';
import { TagsServerService } from '@/lib/api/tags.server.service';

export default async function Page() {
  // Fetch categories and tags server-side
  const [categoriesResult, tagsResult] = await Promise.all([
    EntityCategoriesServerService.getAdminCategories({ limit: 100 }),
    TagsServerService.getAdminTags({ limit: 100 })
  ]);

  const categories = categoriesResult.success ? categoriesResult.data : [];
  const tags = tagsResult.success ? tagsResult.data : [];

  return <HomePageClient categories={categories} tags={tags} />;
}
