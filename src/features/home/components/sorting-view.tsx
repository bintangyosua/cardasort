'use client';

import { useState } from 'react';
import { SorterState, handleLeft, handleTie, handleRight } from '../lib/sorter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SortingViewProps {
  sorterState: SorterState;
}

export function SortingView({ sorterState: initialState }: SortingViewProps) {
  const [state, setState] = useState(initialState);

  const { currentCandidate, remaining, ranking, compareIndex, isFinished } =
    state;

  const onLeft = () => {
    setState(handleLeft(state));
  };

  const onTie = () => {
    setState(handleTie(state));
  };

  const onRight = () => {
    setState(handleRight(state));
  };

  if (isFinished || !currentCandidate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sorting Complete!</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            All entities have been sorted into {ranking.length} rank(s).
          </p>

          {/* Display final ranking */}
          <div className='space-y-3'>
            {ranking.map((group, index) => (
              <div key={index} className='rounded-lg border p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <Badge variant='secondary'>Rank {index + 1}</Badge>
                  <span className='text-muted-foreground text-sm'>
                    {group.members.length}{' '}
                    {group.members.length === 1 ? 'entity' : 'entities'}
                  </span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {group.members.map((entity) => (
                    <Badge key={entity.id} variant='outline'>
                      {entity.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the representative from current comparison group
  const comparisonEntity =
    ranking.length > 0 && compareIndex < ranking.length
      ? ranking[compareIndex].members[0]
      : null;

  return (
    <div className='w-full max-w-6xl space-y-6'>
      {/* Progress Info */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              Remaining:{' '}
              <span className='font-semibold'>{remaining.length}</span>
            </div>
            <div className='text-muted-foreground text-sm'>
              Ranked Groups:{' '}
              <span className='font-semibold'>{ranking.length}</span>
            </div>
            <div className='text-muted-foreground text-sm'>
              Total Entities:{' '}
              <span className='font-semibold'>
                {remaining.length +
                  ranking.reduce((sum, g) => sum + g.members.length, 0) +
                  1}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duel UI */}
      <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-3'>
        {/* Left: Current Candidate */}
        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle className='text-muted-foreground text-center text-sm'>
              Current Candidate
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {currentCandidate.imageUrl && (
              <div className='bg-muted relative aspect-square overflow-hidden rounded-lg'>
                <img
                  src={currentCandidate.imageUrl}
                  alt={currentCandidate.name}
                  className='h-full w-full object-cover'
                />
              </div>
            )}
            <div className='text-center'>
              <h3 className='text-lg font-semibold'>{currentCandidate.name}</h3>
              {currentCandidate.tags.length > 0 && (
                <div className='mt-2 flex flex-wrap justify-center gap-1'>
                  {currentCandidate.tags.map((tag) => (
                    <Badge key={tag.id} variant='secondary' className='text-xs'>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Center: Action Buttons */}
        <div className='flex flex-col items-center justify-center gap-3 p-4'>
          <Button
            size='lg'
            variant='default'
            className='w-full'
            onClick={onLeft}
          >
            ← Left (Better)
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='w-full'
            onClick={onTie}
            disabled={ranking.length === 0}
          >
            = Tie (Same)
          </Button>
          <Button
            size='lg'
            variant='secondary'
            className='w-full'
            onClick={onRight}
          >
            Right (Worse) →
          </Button>
        </div>

        {/* Right: Comparison Entity */}
        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle className='text-muted-foreground text-center text-sm'>
              {comparisonEntity
                ? `Rank ${compareIndex + 1} Representative`
                : 'First Entity'}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {comparisonEntity ? (
              <>
                {comparisonEntity.imageUrl && (
                  <div className='bg-muted relative aspect-square overflow-hidden rounded-lg'>
                    <img
                      src={comparisonEntity.imageUrl}
                      alt={comparisonEntity.name}
                      className='h-full w-full object-cover'
                    />
                  </div>
                )}
                <div className='text-center'>
                  <h3 className='text-lg font-semibold'>
                    {comparisonEntity.name}
                  </h3>
                  {comparisonEntity.tags.length > 0 && (
                    <div className='mt-2 flex flex-wrap justify-center gap-1'>
                      {comparisonEntity.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant='secondary'
                          className='text-xs'
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className='bg-muted flex aspect-square items-center justify-center rounded-lg'>
                <p className='text-muted-foreground px-4 text-center text-sm'>
                  This is the first entity.
                  <br />
                  Click Left to start ranking.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Ranking Display */}
      {ranking.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Current Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {ranking.map((group, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 ${
                    index === compareIndex ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className='mb-1 flex items-center gap-2'>
                    <Badge variant='secondary' className='text-xs'>
                      Rank {index + 1}
                    </Badge>
                    {index === compareIndex && (
                      <Badge variant='default' className='text-xs'>
                        Comparing
                      </Badge>
                    )}
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {group.members.map((entity) => (
                      <span
                        key={entity.id}
                        className='text-muted-foreground text-sm'
                      >
                        {entity.name}
                        {entity !== group.members[group.members.length - 1] &&
                          ','}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
