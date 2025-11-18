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
      <div className='w-full space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Sorting Complete!</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-muted-foreground'>
              All entities have been sorted into {ranking.length} rank(s).
            </p>

            {/* Display final ranking */}
            <div className='space-y-6'>
              {ranking.map((group, index) => (
                <div key={index} className='space-y-4 rounded-lg border p-4'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='px-3 py-1 text-base'>
                      Rank {index + 1}
                    </Badge>
                    <span className='text-muted-foreground text-sm'>
                      {group.members.length}{' '}
                      {group.members.length === 1 ? 'entity' : 'entities'}
                    </span>
                  </div>

                  {/* Grid of entities with images */}
                  <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                    {group.members.map((entity) => (
                      <div key={entity.id} className='space-y-2'>
                        {entity.imageUrl ? (
                          <div className='bg-muted relative aspect-square overflow-hidden rounded-lg'>
                            <img
                              src={entity.imageUrl}
                              alt={entity.name}
                              className='h-full w-full object-cover'
                            />
                          </div>
                        ) : (
                          <div className='bg-muted flex aspect-square items-center justify-center rounded-lg'>
                            <span className='text-muted-foreground text-xs'>
                              No Image
                            </span>
                          </div>
                        )}
                        <div className='space-y-1'>
                          <p className='line-clamp-2 text-center text-sm font-medium'>
                            {entity.name}
                          </p>
                          {entity.tags.length > 0 && (
                            <div className='flex flex-wrap justify-center gap-1'>
                              {entity.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant='outline'
                                  className='px-1.5 py-0 text-xs'
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {entity.tags.length > 2 && (
                                <Badge
                                  variant='outline'
                                  className='px-1.5 py-0 text-xs'
                                >
                                  +{entity.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the representative from current comparison group
  // If no ranking yet, show the first entity from remaining as comparison
  const comparisonEntity =
    ranking.length > 0 && compareIndex < ranking.length
      ? ranking[compareIndex].members[0]
      : remaining.length > 0
        ? remaining[0]
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
        <div className='flex items-center justify-center gap-3 p-4'>
          <Button size='lg' variant='default' onClick={onLeft}>
            ← Left
          </Button>
          <Button
            size='lg'
            variant='outline'
            onClick={onTie}
            disabled={ranking.length === 0}
          >
            Tie
          </Button>
          <Button size='lg' variant='secondary' onClick={onRight}>
            Right →
          </Button>
        </div>

        {/* Right: Comparison Entity */}
        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle className='text-muted-foreground text-center text-sm'>
              {ranking.length > 0 && compareIndex < ranking.length
                ? `Rank ${compareIndex + 1} Representative`
                : 'Next Entity'}
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
                  No more entities to compare
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
