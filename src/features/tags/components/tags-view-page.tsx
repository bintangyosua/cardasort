import { notFound } from 'next/navigation';
import TagsForm from './tags-form';
import { TagsServerService } from '@/lib/api/tags.server.service';

type TTagsViewPageProps = {
  tagId: string;
};

export default async function TagsViewPage({ tagId }: TTagsViewPageProps) {
  let tag = null;
  let pageTitle = 'Create New Tag';

  if (tagId !== 'new') {
    const response = await TagsServerService.getTagById(parseInt(tagId));

    if (!response.success) {
      notFound();
    }
    tag = response.data || null;
    pageTitle = 'Edit Tag';
  }

  return <TagsForm initialData={tag} pageTitle={pageTitle} />;
}
