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
import { EntityCategoriesService } from '@/lib/api/entity-categories.service';
import { useReactTable } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useNameAvailability } from '@/hooks/use-name-availability';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Entity Category name must be at least 2 characters.'
  }),
  label: z.string().optional()
});

export default function EntityCategoriesForm({
  initialData,
  pageTitle
}: {
  initialData: EntityCategory | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const [nameValue, setNameValue] = useState(initialData?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isChecking, isAvailable } = useNameAvailability({
    endpoint: '/entity-categories/check-name',
    name: nameValue,
    excludeId: initialData?.id,
    enabled: nameValue.length >= 2
  });

  const defaultValues = {
    name: initialData?.name || '',
    label: initialData?.label || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    // Add data for new EntityCategories
    const categoryData = {
      ...values
    };

    try {
      if (initialData?.id) {
        const result = await EntityCategoriesService.update(
          initialData.id,
          categoryData
        );
      } else {
        const result = await EntityCategoriesService.create(categoryData);
      }

      // Redirect to entity categories list page
      router.push('/dashboard/entity-categories');
    } catch (error) {
      // You can add error handling here (toast notification, etc)
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    !isSubmitting &&
    nameValue.length >= 2 &&
    !isChecking &&
    (isAvailable === true || isAvailable === null);

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
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Entity Category Name</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          placeholder='Enter entity category name (e.g., ACTRESS, ACTOR)'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setNameValue(e.target.value);
                          }}
                          className={
                            isAvailable === false
                              ? 'border-destructive pr-10'
                              : isAvailable === true
                                ? 'border-green-500 pr-10'
                                : ''
                          }
                        />
                        {isChecking && (
                          <Loader2 className='text-muted-foreground absolute top-3 right-3 h-4 w-4 animate-spin' />
                        )}
                        {!isChecking && isAvailable === true && (
                          <CheckCircle2 className='absolute top-3 right-3 h-4 w-4 text-green-500' />
                        )}
                        {!isChecking && isAvailable === false && (
                          <XCircle className='text-destructive absolute top-3 right-3 h-4 w-4' />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {!isChecking && isAvailable === false && (
                      <p className='text-destructive text-sm'>
                        This name is already taken
                      </p>
                    )}
                    {!isChecking && isAvailable === true && (
                      <p className='text-xs text-green-600'>
                        This name is available
                      </p>
                    )}
                  </FormItem>
                );
              }}
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
            <Button type='submit' className='w-full' disabled={!canSubmit}>
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
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
