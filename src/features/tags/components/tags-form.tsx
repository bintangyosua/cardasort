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
import { TagsService } from '@/lib/api/tags.service';
import { Tag } from '@/types/entity';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Tag name must be at least 2 characters.'
  })
});

export default function TagsForm({
  initialData,
  pageTitle
}: {
  initialData: Tag | null;
  pageTitle: string;
}) {
  const router = useRouter();

  const defaultValues = {
    name: initialData?.name || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const tagData = {
      ...values
    };

    try {
      if (initialData?.id) {
        await TagsService.update(initialData.id, tagData);
      } else {
        await TagsService.create(tagData);
      }

      // Redirect to tags list page
      router.push('/dashboard/tags');
    } catch (error) {
      // Error handling is done in the service with toast
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
                  <FormLabel>Tag Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter tag name (e.g., blonde, cute, ugly)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full'>
              {initialData ? 'Update Tag' : 'Create Tag'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
