import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import EntitiesViewPage from '@/features/entities/components/entities-view-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Entity View'
};

type PageProps = { params: Promise<{ entityId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <EntitiesViewPage entityId={params.entityId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
