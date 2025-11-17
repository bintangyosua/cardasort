import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import TagsViewPage from '@/features/tags/components/tags-view-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard : Tag View'
};

type PageProps = { params: Promise<{ tagId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <TagsViewPage tagId={params.tagId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
