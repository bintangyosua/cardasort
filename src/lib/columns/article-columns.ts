export function createArticleColumnsConfig(
  categoryOptions: Array<{ value: string; label: string }> = []
) {
  return {
    imageColumn: {
      accessorKey: 'imageUrl',
      header: 'IMAGE'
    },
    nameColumn: {
      id: 'name',
      accessorKey: 'name',
      meta: {
        label: 'Name',
        placeholder: 'Search...',
        variant: 'text'
      },
      enableColumnFilter: true,
      enableSorting: true
    },
    categoryColumn: {
      id: 'category', // Changed to 'categories' for URL param
      accessorKey: 'category',
      enableColumnFilter: true,
      enableSorting: true,
      meta: {
        label: 'Category',
        variant: 'select',
        options: categoryOptions.map((option) => ({
          ...option,
          value: String(option.value)
        }))
      }
    },
    tagsColumn: {
      id: 'tags',
      accessorKey: 'tags'
    },
    createdAtColumn: {
      accessorKey: 'createdAt',
      enableSorting: true
    },
    actionsColumn: {
      id: 'actions'
    },
    categoryOptions
  };
}

export type ArticleColumnsConfig = ReturnType<
  typeof createArticleColumnsConfig
>;
