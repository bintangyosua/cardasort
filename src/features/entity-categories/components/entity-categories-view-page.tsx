import { EntityCategory } from '@/types/entity';
import { notFound } from 'next/navigation';
import EntityCategoriesForm from './entity-categories-form';
import { EntityCategoriesServerService } from '@/lib/api/entities-categories.server.service';

type TEntityCategoryViewPageProps = {
  entityCategoryId: number | string;
};

export default async function EntityCategoriesViewPage({
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
    <EntityCategoriesForm initialData={entityCategory} pageTitle={pageTitle} />
  );
}
