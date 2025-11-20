'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';
import { Tag } from '@/types/entity';
import { CellAction } from './cell-action';

type TagWithCount = Tag & {
  _count?: {
    entities: number;
  };
};

export const columns: ColumnDef<TagWithCount>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<TagWithCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<TagWithCount['name']>()}</div>,
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
    id: 'entities',
    accessorFn: (row) => row._count?.entities ?? 0,
    header: ({ column }: { column: Column<TagWithCount, unknown> }) => (
      <DataTableColumnHeader column={column} title='Entities' />
    ),
    cell: ({ row }) => {
      const count = row.original._count?.entities || 0;
      return <div>{count}</div>;
    },
    enableSorting: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
