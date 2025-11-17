'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { EntityCategory } from '@/types/entity';
import { articleCategoriesService } from '@/lib/api/article-categories.service';
import { useReactTable } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Entity Category name must be at least 2 characters.'
  }),
  label: z.string().optional()
});

export default function ArticleCategoriesForm({
  initialData,
  pageTitle
}: {
  initialData: EntityCategory | null;
  pageTitle: string;
}) {
  const router = useRouter();

  const defaultValues = {
    name: initialData?.name || '',
    label: initialData?.label || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Add data for new EntityCategories
    const categoryData = {
      ...values
    };

    try {
      if (initialData?.id) {
        const result = await articleCategoriesService.update(
          initialData.id,
          categoryData
        );
      } else {
        const result = await articleCategoriesService.create(categoryData);
      }

      // Redirect to entity categories list page
      router.push('/dashboard/article-categories');
    } catch (error) {
      // You can add error handling here (toast notification, etc)
    }
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entity Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter entity category name (e.g., ACTRESS, ACTOR)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Label (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter display label (e.g., Actress, Actor)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full'>
              {initialData
                ? 'Update Entity Category'
                : 'Create Entity Category'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
