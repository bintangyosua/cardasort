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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from '@/lib/axios';
import { Entity, initializeSorter, SorterState } from '../lib/sorter-new';

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
  onStartSorting?: (sorterState: SorterState) => void;
}

export function SelectionForm({
  categories,
  tags,
  onStartSorting
}: SelectionFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [entityCount, setEntityCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const params: any = {};
      if (selectedCategoryId) {
        params.categoryId = selectedCategoryId;
      }
      if (selectedTagNames.length > 0) {
        params.tagNames = selectedTagNames.join(',');
      }

      const response = await axios.get<{
        success: boolean;
        data: Entity[];
        error?: string;
      }>('/entities/filter', { params });

      if (response.data.success) {
        const entities = response.data.data;

        if (entities.length === 0) {
          setError('No entities found for this filter');
          return;
        }

        // Initialize sorter
        const sorterState = initializeSorter(entities);

        // Callback to parent or navigate to sorting page
        if (onStartSorting) {
          onStartSorting(sorterState);
        }
      } else {
        setError(response.data.error || 'Failed to fetch entities');
      }
    } catch (error) {
      console.error('Error starting sort:', error);
      setError('Failed to start sorting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    entityCount === null || entityCount === 0 || isLoadingCount || isSubmitting;

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

        {/* Error Message */}
        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          className='w-full'
          size='lg'
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? 'Loading...' : 'Start Sorting'}
        </Button>
      </CardContent>
    </Card>
  );
}
