'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SorterState,
  handleLeft,
  handleTie,
  handleRight
} from '../lib/sorter-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface SortingViewProps {
  sorterState: SorterState;
  onBack?: () => void;
}

// Helper functions to encode/decode state to URL
function encodeStateToUrl(state: SorterState): string {
  const compressed = {
    g: Array.from(state.graph.entries()).map(([k, v]) => [k, Array.from(v)]),
    r: state.round,
    rp: state.remainingPairs.map((p) => [p.left.id, p.right.id]),
    l: state.leftEntity?.id,
    ri: state.rightEntity?.id,
    f: state.isFinished
  };
  return btoa(JSON.stringify(compressed));
}

function decodeStateFromUrl(
  encoded: string,
  allEntities: SorterState['allEntities']
): Partial<SorterState> | null {
  try {
    const compressed = JSON.parse(atob(encoded));
    const entityMap = new Map(allEntities.map((e) => [e.id, e]));

    return {
      graph: new Map(
        compressed.g.map(([k, v]: [number, number[]]) => [k, new Set(v)])
      ),
      round: compressed.r,
      remainingPairs: compressed.rp.map(([l, r]: [number, number]) => ({
        left: entityMap.get(l)!,
        right: entityMap.get(r)!
      })),
      leftEntity: compressed.l ? entityMap.get(compressed.l)! : null,
      rightEntity: compressed.ri ? entityMap.get(compressed.ri)! : null,
      isFinished: compressed.f
    };
  } catch {
    return null;
  }
}

export function SortingView({
  sorterState: initialState,
  onBack
}: SortingViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Try to restore state from URL on mount
  const [state, setState] = useState<SorterState>(() => {
    const urlState = searchParams?.get('state');
    if (urlState) {
      const decoded = decodeStateFromUrl(urlState, initialState.allEntities);
      if (decoded) {
        return { ...initialState, ...decoded };
      }
    }
    return initialState;
  });

  // Update URL whenever state changes
  useEffect(() => {
    if (!state.started) return; // Don't update URL if not started

    const encoded = encodeStateToUrl(state);
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (state.isFinished) {
      params.set('view', 'results');
    } else {
      params.set('view', 'sorting');
    }
    params.set('state', encoded);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [state, router, searchParams]);

  const {
    leftEntity,
    rightEntity,
    ranking,
    isFinished,
    round,
    remainingPairs,
    graph,
    allEntities
  } = state;

  const onLeft = () => {
    setState(handleLeft(state));
  };

  const onTie = () => {
    setState(handleTie(state));
  };

  const onRight = () => {
    setState(handleRight(state));
  };

  if (isFinished || !leftEntity || !rightEntity) {
    return (
      <div className='w-full space-y-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Sorting Complete!</CardTitle>
            {onBack && (
              <Button variant='outline' onClick={onBack}>
                ← New Sort
              </Button>
            )}
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
                          <div className='bg-muted relative aspect-2/3 overflow-hidden rounded-lg'>
                            <Image
                              src={entity.imageUrl}
                              alt={entity.name}
                              fill
                              className='object-cover'
                            />
                          </div>
                        ) : (
                          <div className='bg-muted flex aspect-2/3 items-center justify-center rounded-lg'>
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

  return (
    <div className='w-full max-w-6xl space-y-6'>
      {/* Progress Info */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between text-sm'>
            <div className='text-muted-foreground'>
              Comparisons: <span className='font-semibold'>{round}</span>
            </div>
            <div className='text-muted-foreground'>
              Remaining:{' '}
              <span className='font-semibold'>{remainingPairs.length}</span>
            </div>
            <div className='text-muted-foreground'>
              Total Pairs:{' '}
              <span className='font-semibold'>
                {(allEntities.length * (allEntities.length - 1)) / 2}
              </span>
            </div>
            <div className='text-muted-foreground'>
              Progress:{' '}
              <span className='font-semibold'>
                {Math.round(
                  (1 -
                    remainingPairs.length /
                      ((allEntities.length * (allEntities.length - 1)) / 2)) *
                    100
                )}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duel UI */}
      <div className='flex flex-col items-stretch gap-4 lg:grid lg:grid-cols-3 lg:items-center'>
        {/* Left/Top Entity */}
        <Card className='w-full lg:col-span-1'>
          <CardHeader>
            <CardTitle className='text-muted-foreground text-center text-sm'>
              Option A
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {leftEntity.imageUrl && (
              <div className='bg-muted relative aspect-2/3 overflow-hidden rounded-lg'>
                <Image
                  src={leftEntity.imageUrl}
                  alt={leftEntity.name}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <div className='text-center'>
              <h3 className='text-lg font-semibold'>{leftEntity.name}</h3>
              {leftEntity.tags.length > 0 && (
                <div className='mt-2 flex flex-wrap justify-center gap-1'>
                  {leftEntity.tags.map((tag) => (
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
        <div className='flex w-full flex-col items-center justify-center gap-3 p-4 lg:flex-row'>
          <Button
            size='lg'
            variant='default'
            onClick={onLeft}
            className='w-full lg:w-auto'
          >
            <span className='lg:hidden'>↑ Top</span>
            <span className='hidden lg:inline'>← Left</span>
          </Button>
          <Button
            size='lg'
            variant='outline'
            onClick={onTie}
            className='w-full lg:w-auto'
          >
            Tie
          </Button>
          <Button
            size='lg'
            variant='secondary'
            onClick={onRight}
            className='w-full lg:w-auto'
          >
            <span className='lg:hidden'>↓ Bottom</span>
            <span className='hidden lg:inline'>Right →</span>
          </Button>
        </div>

        {/* Right/Bottom Entity */}
        <Card className='w-full lg:col-span-1'>
          <CardHeader>
            <CardTitle className='text-muted-foreground text-center text-sm'>
              Option B
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {rightEntity.imageUrl && (
              <div className='bg-muted relative aspect-2/3 overflow-hidden rounded-lg'>
                <Image
                  src={rightEntity.imageUrl}
                  alt={rightEntity.name}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <div className='text-center'>
              <h3 className='text-lg font-semibold'>{rightEntity.name}</h3>
              {rightEntity.tags.length > 0 && (
                <div className='mt-2 flex flex-wrap justify-center gap-1'>
                  {rightEntity.tags.map((tag) => (
                    <Badge key={tag.id} variant='secondary' className='text-xs'>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
