'use client';

import { useState } from 'react';
import { SelectionForm } from './selection-form';
import { SortingView } from './sorting-view';
import { SorterState } from '../lib/sorter';

interface HomePageClientProps {
  categories: any[];
  tags: any[];
}

export function HomePageClient({ categories, tags }: HomePageClientProps) {
  const [sorterState, setSorterState] = useState<SorterState | null>(null);

  const handleStartSorting = (state: SorterState) => {
    setSorterState(state);
  };

  return (
    <main className='flex flex-col items-center p-8'>
      <div className='w-full max-w-6xl space-y-8 pb-16'>
        <div className='space-y-2 text-center'>
          <h1 className='text-4xl font-bold tracking-tight'>CardaSort</h1>
          <p className='text-muted-foreground'>
            {sorterState
              ? 'Sort your entities'
              : 'Select categories and tags to get started'}
          </p>
        </div>

        {!sorterState ? (
          <div className='mx-auto max-w-4xl'>
            <SelectionForm
              categories={categories}
              tags={tags}
              onStartSorting={handleStartSorting}
            />
          </div>
        ) : (
          <SortingView sorterState={sorterState} />
        )}
      </div>
    </main>
  );
}
