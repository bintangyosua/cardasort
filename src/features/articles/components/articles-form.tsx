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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { FileUploader } from '@/components/file-uploader';
import { MultiSelect } from '@/components/multi-select';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/constants/form';
import { useState } from 'react';
import { Entity } from '@/types/entity';
import { useRouter } from 'next/navigation';

export default function ArticlesForm({
  initialData,
  pageTitle,
  categories = [],
  tags = []
}: {
  initialData: Entity | null;
  pageTitle: string;
  categories?: Array<{ id: number; name: string; label?: string | null }>;
  tags?: Array<{ id: number; name: string }>;
}) {
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    initialData?.imageUrl || null
  );

  const router = useRouter();

  const formSchema = z.object({
    name: z
      .string()
      .min(3, {
        message: 'Entity name must be at least 3 characters.'
      })
      .max(200, {
        message: 'Entity name must not exceed 200 characters.'
      }),
    categoryId: z.coerce
      .number()
      .min(1, { message: 'Please select a category.' }),
    tags: z.array(z.coerce.number()).default([]),
    imageUrl: z.string().optional(),
    image: z
      .any()
      .refine(
        (files) => {
          if (
            !initialData &&
            (!files || files.length === 0) &&
            !existingImageUrl
          ) {
            return false;
          }
          if (files && files.length > 0) {
            return files.length === 1;
          }
          return true;
        },
        initialData ? 'Please select only one image.' : 'Image is required.'
      )
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return files[0]?.size <= MAX_FILE_SIZE;
      }, `Max file size is 5MB.`)
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type);
      }, '.jpg, .jpeg, .png and .webp files are accepted.')
  });

  const defaultValues = {
    name: initialData?.name || '',
    categoryId: initialData?.categoryId || 0,
    tags: initialData?.tags?.map((tag) => tag.id) || [],
    imageUrl: initialData?.imageUrl || '',
    image: [] as File[]
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('categoryId', String(values.categoryId));

    if (values.tags && values.tags.length > 0) {
      formData.append('tags', JSON.stringify(values.tags));
    }

    if (values.image && values.image.length > 0) {
      formData.append('image', values.image[0]);
    }

    try {
      if (initialData?.id) {
        // TODO: Implement update API
        // await entitiesService.update(initialData.id, formData);
        console.log('Update entity:', values);
      } else {
        // TODO: Implement create API
        // await entitiesService.create(formData);
        console.log('Create entity:', values);
      }
      router.push('/dashboard/articles');
    } catch (error) {
      console.error('Error saving entity:', error);
    } finally {
      form.reset();
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
              name='image'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='w-full'>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={1}
                        maxSize={5 * 1024 * 1024}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter entity name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.label || cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='tags'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={tags.map((tag) => ({
                        value: String(tag.id),
                        label: tag.name
                      }))}
                      defaultValue={field.value.map(String)}
                      onValueChange={(values) =>
                        field.onChange(values.map(Number))
                      }
                      placeholder='Choose tags...'
                      searchable={true}
                      hideSelectAll={false}
                      maxCount={5}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className='text-muted-foreground text-xs'>
                    Select one or more tags for this entity
                  </p>
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full'>
              {initialData ? 'Update Entity' : 'Create Entity'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
