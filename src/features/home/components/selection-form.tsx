'use client';

import { useState } from 'react';
import { CategorySelector } from './category-selector';
import { TagSelector } from './tag-selector';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

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
          Pilih kategori dan tags yang ingin Anda gunakan
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <CategorySelector
          categories={categories}
          onCategoryChange={handleCategoryChange}
        />

        <TagSelector tags={tags} onTagsChange={handleTagsChange} />
      </CardContent>
    </Card>
  );
}
