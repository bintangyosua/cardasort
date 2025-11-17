import { notFound } from 'next/navigation';
import EntitiesForm from './entities-form';
import { Entity } from '@/types/entity';
import { prisma } from '@/lib/prisma';
import { EntitiesServerService } from '@/lib/api/entities.server.service';
import { EntityCategoriesServerService } from '@/lib/api/entities-categories.server.service';

type TEntityViewPageProps = {
  articleId: string;
};

export default async function EntitiesViewPage({
  articleId
}: TEntityViewPageProps) {
  let entity = null;
  let pageTitle = 'Create New Entity';

  if (articleId !== 'new') {
    try {
      const data = await EntitiesServerService.getById(Number(articleId));

      if (data.success && data.data) {
        entity = data.data;
        pageTitle = `Edit Entity`;
      } else {
        notFound();
      }
    } catch (error) {
      console.error('Error fetching entity:', error);
      notFound();
    }
  }

  // Fetch categories and tags
  const categoriesResponse =
    await EntityCategoriesServerService.getAdminCategories({});
  const categories = categoriesResponse.success
    ? (categoriesResponse.data as any[])
    : [];

  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <EntitiesForm
      initialData={entity}
      pageTitle={pageTitle}
      categories={categories}
      tags={tags}
    />
  );
}
