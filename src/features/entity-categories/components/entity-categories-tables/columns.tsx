'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';
import { CellAction } from './cell-action';
import { EntityCategory } from '@/types/entity';

export const columns: ColumnDef<EntityCategory>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<EntityCategory, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<EntityCategory['name']>()}</div>,
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
    id: 'label',
    accessorKey: 'label',
    header: ({ column }: { column: Column<EntityCategory, unknown> }) => (
      <DataTableColumnHeader column={column} title='Label' />
    ),
    cell: ({ cell }) => (
      <div>{cell.getValue<EntityCategory['label']>() || '-'}</div>
    ),
    enableSorting: true
  },
  {
    id: 'entities',
    accessorFn: (row) => row._count?.entities ?? 0,
    header: ({ column }: { column: Column<EntityCategory, unknown> }) => (
      <DataTableColumnHeader column={column} title='Entities' />
    ),
    cell: ({ row }) => <div>{row.original._count?.entities ?? 0}</div>,
    enableSorting: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
