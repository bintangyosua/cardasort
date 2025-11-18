'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SorterState,
  handleLeft,
  handleTie,
  handleRight,
  Entity
} from '../lib/sorter-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from '@/lib/axios';
import Link from 'next/link';

// Helper functions to encode/decode state to URL
function encodeStateToUrl(state: SorterState): string {
  const compressed = {
    g: Array.from(state.graph.entries()).map(([k, v]) => [k, Array.from(v)]),
    r: state.round,
    rp: state.remainingPairs.map((p) => [p.left.id, p.right.id]),
    l: state.leftEntity?.id,
    ri: state.rightEntity?.id,
    f: state.isFinished,
    e: state.allEntities.map((e) => e.id) // Store entity IDs
  };
  return btoa(JSON.stringify(compressed));
}

function decodeStateFromUrl(
  encoded: string,
  allEntities: Entity[]
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
      isFinished: compressed.f,
      started: true
    };
  } catch {
    return null;
  }
}

export function SortingPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<SorterState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load state from URL ONCE on mount
  useEffect(() => {
    // Prevent re-loading if already loaded
    if (hasLoadedRef.current) return;
    
    const loadState = async () => {
      const urlState = searchParams?.get('state');

      if (!urlState) {
        // No state, redirect to home
        router.replace('/');
        return;
      }

      try {
        // Decode to get entity IDs
        const compressed = JSON.parse(atob(urlState));
        const entityIds = compressed.e;

        // Fetch entities
        const response = await axios.get('/entities', {
          params: { ids: entityIds.join(',') }
        });

        if (response.data.success) {
          const entities = response.data.data;

          if (!entities || entities.length === 0) {
            setError('No entities found');
            setIsLoading(false);
            return;
          }

          const decoded = decodeStateFromUrl(urlState, entities);

          if (!decoded) {
            setError('Invalid state data');
            setIsLoading(false);
            return;
          }

          if (decoded.isFinished) {
            // Redirect to results if finished
            router.replace(`/results?state=${urlState}`);
            return;
          }

          // Set state for sorting
          setState({
            allEntities: entities,
            graph: decoded.graph!,
            remainingPairs: decoded.remainingPairs!,
            leftEntity: decoded.leftEntity!,
            rightEntity: decoded.rightEntity!,
            round: decoded.round!,
            ranking: [],
            started: true,
            isFinished: false
          });
          setIsLoading(false);
          hasLoadedRef.current = true;
        } else {
          setError('Failed to fetch entities');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load state:', err);
        setError('Failed to load sorting session');
        setIsLoading(false);
      }
    };

    loadState();
  }, []); // Empty deps - only run once on mount

  // Update URL when state changes
  useEffect(() => {
    if (!state || !hasLoadedRef.current) return;

    const encoded = encodeStateToUrl(state);

    // If finished, show transition then redirect to results
    if (state.isFinished) {
      setIsTransitioning(true);
      // Small delay for smooth transition
      setTimeout(() => {
        router.push(`/results?state=${encoded}`);
      }, 300);
    } else {
      router.replace(`/sort?state=${encoded}`, { scroll: false });
    }
  }, [state, router]);

  const onLeft = () => {
    if (state) setState(handleLeft(state));
  };

  const onTie = () => {
    if (state) setState(handleTie(state));
  };

  const onRight = () => {
    if (state) setState(handleRight(state));
  };

  if (isLoading) {
    return (
      <main className='flex min-h-screen items-center justify-center'>
        <div className='text-muted-foreground'>Loading...</div>
      </main>
    );
  }

  if (isTransitioning) {
    return (
      <main className='flex min-h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <div className='text-muted-foreground'>Calculating results...</div>
          <div className='text-muted-foreground/60 text-sm'>Please wait</div>
        </div>
      </main>
    );
  }

  if (error || !state) {
    return (
      <main className='flex min-h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <p className='text-muted-foreground'>{error || 'Invalid session'}</p>
          <Button onClick={() => router.push('/')}>← Back to Home</Button>
        </div>
      </main>
    );
  }

  const { leftEntity, rightEntity, round, remainingPairs, allEntities } = state;

  if (!leftEntity || !rightEntity) {
    return null;
  }

  return (
    <main className='flex flex-col items-center p-8'>
      <div className='w-full max-w-6xl space-y-6'>
        <div className='space-y-2 text-center'>
          <Link href='/'>
            <h1 className='text-4xl font-bold tracking-tight'>CardaSort</h1>
          </Link>
          <p className='text-muted-foreground'>
            Compare and choose your preference
          </p>
        </div>

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
                <div className='bg-muted relative aspect-square overflow-hidden rounded-lg'>
                  <img
                    src={leftEntity.imageUrl}
                    alt={leftEntity.name}
                    className='h-full w-full object-cover'
                  />
                </div>
              )}
              <div className='text-center'>
                <h3 className='text-lg font-semibold'>{leftEntity.name}</h3>
                {leftEntity.tags.length > 0 && (
                  <div className='mt-2 flex flex-wrap justify-center gap-1'>
                    {leftEntity.tags.map((tag) => (
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
                <div className='bg-muted relative aspect-square overflow-hidden rounded-lg'>
                  <img
                    src={rightEntity.imageUrl}
                    alt={rightEntity.name}
                    className='h-full w-full object-cover'
                  />
                </div>
              )}
              <div className='text-center'>
                <h3 className='text-lg font-semibold'>{rightEntity.name}</h3>
                {rightEntity.tags.length > 0 && (
                  <div className='mt-2 flex flex-wrap justify-center gap-1'>
                    {rightEntity.tags.map((tag) => (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
