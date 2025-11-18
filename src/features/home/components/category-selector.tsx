'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface EntityCategory {
  id: number;
  name: string;
  label: string | null;
}

interface CategorySelectorProps {
  categories: EntityCategory[];
  onCategoryChange: (categoryId: number | null) => void;
}

export function CategorySelector({
  categories,
  onCategoryChange
}: CategorySelectorProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const handleValueChange = (value: string) => {
    setSelectedCategoryId(value);
    if (value === 'all') {
      onCategoryChange(null);
    } else {
      onCategoryChange(parseInt(value));
    }
  };

  return (
    <div className='space-y-2'>
      <Label htmlFor='category-select'>Pilih Kategori</Label>
      <Select value={selectedCategoryId} onValueChange={handleValueChange}>
        <SelectTrigger id='category-select' className='w-full md:w-[300px]'>
          <SelectValue placeholder='Pilih kategori' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.label || category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
