'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    onCategoryChange(categoryId);
  };

  return (
    <div className='space-y-3'>
      <Label>Select Category</Label>
      <div className='flex flex-wrap gap-2'>
        <Badge
          variant={selectedCategoryId === null ? 'default' : 'outline'}
          className='cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105'
          onClick={() => handleCategoryClick(null)}
        >
          {selectedCategoryId === null && <Check className='mr-1 h-3 w-3' />}
          All Categories
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategoryId === category.id ? 'default' : 'outline'}
            className='cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105'
            onClick={() => handleCategoryClick(category.id)}
          >
            {selectedCategoryId === category.id && (
              <Check className='mr-1 h-3 w-3' />
            )}
            {category.label || category.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
