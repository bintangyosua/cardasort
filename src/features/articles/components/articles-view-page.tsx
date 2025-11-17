import { notFound } from 'next/navigation';
import ArticlesForm from './articles-form';
import { Article } from '@/types/entity';
import { articlesService } from '@/lib/api/articles.service';
import { EntitiesServerService } from '@/lib/api/articles.server.service';
import { EntityCategoriesServerService } from '@/lib/api/articles-categories.server.service';
import { prisma } from '@/lib/prisma';

type TArticleViewPageProps = {
  articleId: string;
};

export default async function ArticlesViewPage({
  articleId
}: TArticleViewPageProps) {
  let article = null;
  let pageTitle = 'Create New Article';

  if (articleId !== 'new') {
    try {
      const data = await EntitiesServerService.getById(Number(articleId));

      if (data.success && data.data) {
        article = data.data;
        pageTitle = `Edit Article`;
      } else {
        notFound();
      }
    } catch (error) {
      console.error('Error fetching article:', error);
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
    <ArticlesForm
      initialData={article}
      pageTitle={pageTitle}
      categories={categories}
      tags={tags}
    />
  );
}
