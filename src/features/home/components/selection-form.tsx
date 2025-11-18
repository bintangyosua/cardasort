'use client';

import { useState, useEffect } from 'react';
import { CategorySelector } from './category-selector';
import { TagSelector } from './tag-selector';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from '@/lib/axios';

interface EntityCategory {
  id: number;
  name: string;
  label: string | null;
}

interface Tag {
  id: number;
  name: string;
}

interface SelectionFormProps {
  categories: EntityCategory[];
  tags: Tag[];
}

export function SelectionForm({ categories, tags }: SelectionFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [entityCount, setEntityCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Fetch entity count whenever filters change
  useEffect(() => {
    const fetchCount = async () => {
      setIsLoadingCount(true);
      try {
        const params: any = {};
        if (selectedCategoryId) {
          params.categoryId = selectedCategoryId;
        }
        if (selectedTagNames.length > 0) {
          params.tagNames = selectedTagNames.join(',');
        }

        const response = await axios.get('/entities/count', { params });

        if (response.data.success) {
          setEntityCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching count:', error);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchCount();
  }, [selectedCategoryId, selectedTagNames]);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    console.log('Selected category:', categoryId);
  };

  const handleTagsChange = (tagNames: string[]) => {
    setSelectedTagNames(tagNames);
    console.log('Selected tags:', tagNames);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Selection</CardTitle>
        <CardDescription>
          Select the categories and tags you want to use
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <CategorySelector
          categories={categories}
          onCategoryChange={handleCategoryChange}
        />

        <TagSelector tags={tags} onTagsChange={handleTagsChange} />

        {/* Entity Count Display */}
        <div className='bg-muted/50 flex items-center justify-between rounded-lg border p-4'>
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Entities to Sort</p>
            <p className='text-muted-foreground text-xs'>
              {selectedCategoryId === null && selectedTagNames.length === 0
                ? 'Select filters to see count'
                : 'Based on your current selection'}
            </p>
          </div>
          <Badge variant='secondary' className='px-4 py-2 text-lg'>
            {isLoadingCount ? '...' : entityCount !== null ? entityCount : '0'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
