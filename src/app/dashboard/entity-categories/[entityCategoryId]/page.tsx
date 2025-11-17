import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import EntityCategoriesViewPage from '@/features/article-categories/components/entity-categories-view-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Entity View'
};

type PageProps = { params: Promise<{ entityCategoryId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <EntityCategoriesViewPage
            entityCategoryId={params.entityCategoryId}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}
