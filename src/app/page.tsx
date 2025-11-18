import { EntityCategoriesServerService } from '@/lib/api/entities-categories.server.service';
import { TagsServerService } from '@/lib/api/tags.server.service';
import { SelectionForm } from '@/features/home/components/selection-form';

export default async function Page() {
  // Fetch categories and tags server-side
  const [categoriesResult, tagsResult] = await Promise.all([
    EntityCategoriesServerService.getAdminCategories({ limit: 100 }),
    TagsServerService.getAdminTags({ limit: 100 })
  ]);

  const categories = categoriesResult.success ? categoriesResult.data : [];
  const tags = tagsResult.success ? tagsResult.data : [];

  return (
    <main className='flex min-h-screen flex-col items-center p-8'>
      <div className='w-full max-w-4xl space-y-8'>
        <div className='space-y-2 text-center'>
          <h1 className='text-4xl font-bold tracking-tight'>CardaSort</h1>
          <p className='text-muted-foreground'>
            Pilih kategori dan tags untuk memulai
          </p>
        </div>

        <SelectionForm categories={categories} tags={tags} />
      </div>
    </main>
  );
}
