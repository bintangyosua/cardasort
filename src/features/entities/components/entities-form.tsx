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
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { MultiSelect } from '@/components/multi-select';
import { MultiSelectCreatable } from '@/components/multi-select-creatable';
import { Entity } from '@/types/entity';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { entitiesService } from '@/lib/api/entities.service';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

export default function EntitiesForm({
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
  const router = useRouter();
  const [availableTags, setAvailableTags] = useState(tags);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const entitySchema = z.object({
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
    imageUrl: z
      .string()
      .min(1, { message: 'Image URL is required.' })
      .url({ message: 'Please enter a valid URL.' })
  });

  const formSchema = z.object({
    entities: z
      .array(entitySchema)
      .min(1, { message: 'At least one entity is required' })
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          entities: [
            {
              name: initialData.name || '',
              categoryId: initialData.categoryId || 0,
              tags: initialData.tags?.map((tag) => tag.id) || [],
              imageUrl: initialData.imageUrl || ''
            }
          ]
        }
      : {
          entities: [
            {
              name: '',
              categoryId: 0,
              tags: [],
              imageUrl: ''
            }
          ]
        }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'entities'
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (initialData?.id) {
        // Update single entity
        const data = values.entities[0];
        await entitiesService.update(initialData.id, data);
        toast.success('Entity updated successfully!');
      } else {
        // Bulk create
        const promises = values.entities.map((entity) =>
          entitiesService.create(entity)
        );
        await Promise.all(promises);
        toast.success(
          `${values.entities.length} entities created successfully!`
        );
      }
      router.push('/dashboard/entities');
      router.refresh();
    } catch (error) {
      console.error('Error saving entities:', error);
      toast.error('Failed to save entities');
    }
  }

  const handleCreateTag = async (tagName: string) => {
    if (isCreatingTag) return;

    setIsCreatingTag(true);
    try {
      const response = await axios.post('/tags', { name: tagName });

      if (response.data.success) {
        const newTag = response.data.data;
        setAvailableTags([...availableTags, newTag]);

        toast.success(`Tag "${tagName}" created successfully!`);
        return newTag;
      } else {
        toast.error('Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
    } finally {
      setIsCreatingTag(false);
    }
  };

  const addNewEntity = () => {
    append({
      name: '',
      categoryId: 0,
      tags: [],
      imageUrl: ''
    });
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {fields.map((field, index) => (
              <Card key={field.id} className='relative border-2'>
                <CardContent>
                  {!initialData && fields.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute top-2 right-2'
                      onClick={() => remove(index)}
                    >
                      <Trash2 className='text-destructive h-4 w-4' />
                    </Button>
                  )}
                  <div className='space-y-6'>
                    <FormField
                      control={form.control}
                      name={`entities.${index}.imageUrl`}
                      render={({ field }) => {
                        const [imagePreview, setImagePreview] = useState(
                          field.value
                        );
                        const [imageError, setImageError] = useState(false);

                        return (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            {imagePreview && (
                              <div className='mb-4 flex justify-center'>
                                <div className='bg-muted relative aspect-square w-full max-w-md overflow-hidden rounded-md border'>
                                  {!imageError ? (
                                    <Image
                                      src={imagePreview}
                                      alt='Preview'
                                      fill
                                      className='object-cover'
                                      onError={() => setImageError(true)}
                                    />
                                  ) : (
                                    <div className='text-muted-foreground flex h-full items-center justify-center'>
                                      <p className='text-sm'>
                                        Failed to load image. Please check the
                                        URL.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <FormControl>
                              <Input
                                placeholder='https://example.com/image.jpg'
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setImagePreview(e.target.value);
                                  setImageError(false);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name={`entities.${index}.name`}
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
                      name={`entities.${index}.categoryId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={
                              field.value > 0 ? String(field.value) : undefined
                            }
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
                      name={`entities.${index}.tags`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <MultiSelectCreatable
                              options={availableTags.map((tag) => ({
                                value: String(tag.id),
                                label: tag.name
                              }))}
                              defaultValue={field.value.map(String)}
                              onValueChange={(values) =>
                                field.onChange(values.map(Number))
                              }
                              placeholder='Choose or create tags...'
                              maxCount={5}
                              onCreateOption={handleCreateTag}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className='text-muted-foreground text-xs'>
                            Select one or more tags or create a new one
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!initialData && (
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={addNewEntity}
              >
                <Plus className='mr-2 h-4 w-4' />
                Add More Entity
              </Button>
            )}
            <Button type='submit' className='w-full'>
              {initialData
                ? 'Update Entity'
                : `Create ${fields.length} ${fields.length === 1 ? 'Entity' : 'Entities'}`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
