'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Tag {
  id: number;
  name: string;
}

interface TagSelectorProps {
  tags: Tag[];
  onTagsChange: (tagNames: string[]) => void;
}

export function TagSelector({ tags, onTagsChange }: TagSelectorProps) {
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);

  const handleTagToggle = (tagName: string) => {
    let updatedTags: string[];

    if (selectedTagNames.includes(tagName)) {
      // Remove tag
      updatedTags = selectedTagNames.filter((name) => name !== tagName);
    } else {
      // Add tag
      updatedTags = [...selectedTagNames, tagName];
    }

    setSelectedTagNames(updatedTags);
    onTagsChange(updatedTags);
  };

  const isSelected = (tagName: string) => selectedTagNames.includes(tagName);

  return (
    <div className='space-y-3'>
      <Label>Select Tags</Label>
      <div className='flex flex-wrap gap-2'>
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant={isSelected(tag.name) ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-colors hover:opacity-80',
              isSelected(tag.name) && 'bg-primary text-primary-foreground'
            )}
            onClick={() => handleTagToggle(tag.name)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
      {selectedTagNames.length > 0 && (
        <div className='text-muted-foreground text-sm'>
          Selected: {selectedTagNames.join(', ')}
        </div>
      )}
    </div>
  );
}
