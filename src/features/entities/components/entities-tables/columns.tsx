'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';
import { CellAction } from './cell-action';
import {
  createEntityColumnsConfig,
  type EntityColumnsConfig
} from '@/lib/columns/entity-columns';
import Image from 'next/image';
import { Entity } from '@/types/entity';
import { config as envConfig } from '@/config/env';

// Re-export the type for convenience
export type { EntityColumnsConfig };

// Client-side columns implementation using server config
export const createEntityColumnsFromConfig = (
  config: EntityColumnsConfig
): ColumnDef<Entity>[] => [
  {
    id: 'imageUrl',
    accessorKey: 'imageUrl',
    header: 'IMAGE',
    cell: ({ row }) => {
      const imageUrl = row.getValue('imageUrl') as string | null;
      let imageSrc =
        'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

      if (imageUrl) {
        // Check if imageUrl is already a full URL
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          imageSrc = imageUrl;
        } else if (envConfig.API_URL) {
          // It's a relative path, prepend API_URL
          imageSrc = `${envConfig.API_URL}${imageUrl}`;
        } else {
          // No API_URL configured, use as is
          imageSrc = imageUrl;
        }
      }

      return (
        <div className='relative aspect-square overflow-hidden'>
          <Image
            src={imageSrc}
            alt={row.getValue('name')}
            fill
            className='rounded-lg object-cover'
          />
        </div>
      );
    }
  },
  {
    id: 'name',
    accessorKey: 'name',
    accessorFn: (row) => row.name, // Explicit accessor function
    header: ({ column }: { column: Column<Entity, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Entity['name']>()}</div>,
    meta: {
      label: 'Name',
      placeholder: 'Search...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true,
    enableSorting: true
  },
  {
    id: 'category',
    accessorKey: 'category',
    accessorFn: (row) => row.category, // Explicit accessor function
    header: ({ column }: { column: Column<Entity, unknown> }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => {
      const category = row.getValue('category') as Entity['category'];
      return <div>{category?.label || category?.name || 'No Category'}</div>;
    },
    enableColumnFilter: true,
    enableSorting: true,
    meta: {
      label: 'Category',
      variant: 'select',
      options: config.categoryOptions.map((option) => ({
        ...option,
        value: String(option.value)
      }))
    }
  },
  {
    id: 'tags',
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags = row.getValue('tags') as Entity['tags'];
      return (
        <div className='flex flex-wrap gap-1'>
          {tags?.map((tag) => (
            <span
              key={tag.id}
              className='bg-secondary rounded-md px-2 py-1 text-xs'
            >
              {tag.name}
            </span>
          )) || 'No Tags'}
        </div>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }: { column: Column<Entity, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt');
      return (
        <div>
          {createdAt
            ? new Date(createdAt as string | number | Date).toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }
              )
            : ''}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

// Dynamic columns function that accepts categories (backward compatibility)
export const createEntityColumns = (
  categoryOptions: Array<{ value: string; label: string }> = []
): ColumnDef<Entity>[] => {
  const config = createEntityColumnsConfig(categoryOptions);
  return createEntityColumnsFromConfig(config);
};
