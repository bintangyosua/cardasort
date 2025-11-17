import { EntityCategory } from '@/types/entity';
import { notFound } from 'next/navigation';
import ArticleCategoriesForm from './article-categories-form';
import { articleCategoriesService } from '@/lib/api/article-categories.service';
import { EntityCategoriesServerService } from '@/lib/api/articles-categories.server.service';

type TEntityCategoryViewPageProps = {
  entityCategoryId: number | string;
};

export default async function ArticleCategoriesViewPage({
  entityCategoryId
}: TEntityCategoryViewPageProps) {
  let entityCategory = null;
  let pageTitle = 'Create New Entity Category';

  if (entityCategoryId !== 'new') {
    try {
      const data = await EntityCategoriesServerService.getCategoryById(
        Number(entityCategoryId)
      );

      if (data.success && data.data) {
        entityCategory = data.data as EntityCategory;
        pageTitle = `Edit Entity Category`;
      } else {
        notFound();
      }
    } catch (error) {
      console.error('Error fetching entity category:', error);
      notFound();
    }
  }

  return (
    <ArticleCategoriesForm
      initialData={entityCategory}
      pageTitle={pageTitle}
    />
  );
}
