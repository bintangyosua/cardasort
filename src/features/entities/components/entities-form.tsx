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
import { MultiSelectCreatable } from '@/components/multi-select-creatable';
import { Entity } from '@/types/entity';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { entitiesService } from '@/lib/api/entities.service';
import axios from '@/lib/axios';
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useNameAvailability } from '@/hooks/use-name-availability';

// Separate field components to properly use hooks
function ImageUrlField({ control, index }: { control: any; index: number }) {
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState(false);

  return (
    <FormField
      control={control}
      name={`entities.${index}.imageUrl`}
      render={({ field }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          setImagePreview(field.value);
          setImageError(false);
        }, [field.value]);

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
                        Failed to load image. Please check the URL.
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
  );
}

function NameField({
  control,
  index,
  initialData,
  onValidationChange
}: {
  control: any;
  index: number;
  initialData: Entity | null;
  onValidationChange: (
    index: number,
    isChecking: boolean,
    isAvailable: boolean | null
  ) => void;
}) {
  return (
    <FormField
      control={control}
      name={`entities.${index}.name`}
      render={({ field }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { isChecking, isAvailable } = useNameAvailability({
          endpoint: '/entities/check-name',
          name: field.value,
          excludeId: initialData?.id,
          enabled: field.value.length >= 3
        });

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          onValidationChange(index, isChecking, isAvailable);
        }, [isChecking, isAvailable]);

        return (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <div className='relative'>
                <Input
                  placeholder='Enter entity name'
                  {...field}
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
              <p className='text-xs text-green-600'>This name is available</p>
            )}
          </FormItem>
        );
      }}
    />
  );
}

function EntityFieldSet({
  index,
  control,
  initialData,
  categories,
  availableTags,
  handleCreateTag,
  onValidationChange
}: {
  index: number;
  control: any;
  initialData: Entity | null;
  categories: Array<{ id: number; name: string; label?: string | null }>;
  availableTags: Array<{ id: number; name: string }>;
  handleCreateTag: (tagName: string) => Promise<any>;
  onValidationChange: (
    index: number,
    isChecking: boolean,
    isAvailable: boolean | null
  ) => void;
}) {
  return (
    <div className='space-y-6'>
      <ImageUrlField control={control} index={index} />
      <NameField
        control={control}
        index={index}
        initialData={initialData}
        onValidationChange={onValidationChange}
      />
      <FormField
        control={control}
        name={`entities.${index}.categoryId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              value={field.value > 0 ? String(field.value) : undefined}
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
        control={control}
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
                onValueChange={(values) => field.onChange(values.map(Number))}
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
  );
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entityNameStates, setEntityNameStates] = useState<
    Record<number, { isChecking: boolean; isAvailable: boolean | null }>
  >({});

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
    if (isSubmitting) return;

    setIsSubmitting(true);
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
      toast.error('Failed to save entities');
    } finally {
      setIsSubmitting(false);
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

  // Check if all entities have valid names
  const canSubmit =
    !isSubmitting &&
    Object.values(entityNameStates).every(
      (state) =>
        !state.isChecking &&
        (state.isAvailable === true || state.isAvailable === null)
    ) &&
    fields.length > 0;

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
                  <EntityFieldSet
                    index={index}
                    control={form.control}
                    initialData={initialData}
                    categories={categories}
                    availableTags={availableTags}
                    handleCreateTag={handleCreateTag}
                    onValidationChange={(idx, isChecking, isAvailable) => {
                      setEntityNameStates((prev) => ({
                        ...prev,
                        [idx]: { isChecking, isAvailable }
                      }));
                    }}
                  />
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
            <Button type='submit' className='w-full' disabled={!canSubmit}>
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
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
