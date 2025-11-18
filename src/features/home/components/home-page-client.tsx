'use client';

import { SelectionForm } from './selection-form';

interface HomePageClientProps {
  categories: any[];
  tags: any[];
}

export function HomePageClient({ categories, tags }: HomePageClientProps) {
  return (
    <main className='flex flex-col items-center p-8'>
      <div className='w-full max-w-6xl space-y-8 pb-16'>
        <div className='space-y-2 text-center'>
          <h1 className='text-4xl font-bold tracking-tight'>CardaSort</h1>
          <p className='text-muted-foreground'>
            Select categories and tags to get started
          </p>
        </div>

        <div className='mx-auto max-w-4xl'>
          <SelectionForm categories={categories} tags={tags} />
        </div>
      </div>
    </main>
  );
}
