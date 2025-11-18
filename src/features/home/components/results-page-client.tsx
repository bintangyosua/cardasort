'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Entity, RankingGroup } from '../lib/sorter-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from '@/lib/axios';

function decodeResultsFromUrl(encoded: string, allEntities: Entity[]): RankingGroup[] | null {
  try {
    const compressed = JSON.parse(atob(encoded));
    const entityMap = new Map(allEntities.map((e) => [e.id, e]));

    // Build graph
    const graph = new Map<number, Set<number>>(
      compressed.g.map(([k, v]: [number, number[]]) => [k, new Set(v)])
    );

    // Calculate ranking from graph
    const ranking: RankingGroup[] = [];
    const processed = new Set<number>();
    
    while (processed.size < allEntities.length) {
      const currentRank: Entity[] = [];
      
      for (const entity of allEntities) {
        if (processed.has(entity.id)) continue;
        
        // Check if entity is beaten by any unprocessed entity
        let isBeaten = false;
        for (const [beaterId, beaten] of Array.from(graph.entries())) {
          if (!processed.has(beaterId) && beaten.has(entity.id)) {
            isBeaten = true;
            break;
          }
        }
        
        if (!isBeaten) {
          currentRank.push(entity);
        }
      }
      
      if (currentRank.length === 0) break;
      
      ranking.push({ members: currentRank });
      currentRank.forEach((e) => processed.add(e.id));
    }

    return ranking;
  } catch {
    return null;
  }
}

export function ResultsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ranking, setRanking] = useState<RankingGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      const urlState = searchParams?.get('state');

      if (!urlState) {
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
          const results = decodeResultsFromUrl(urlState, entities);

          if (results) {
            setRanking(results);
          } else {
            setError('Failed to calculate ranking');
          }
        }
      } catch (err) {
        console.error('Failed to load results:', err);
        setError('Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <main className='flex min-h-screen items-center justify-center'>
        <div className='text-muted-foreground'>Loading results...</div>
      </main>
    );
  }

  if (error || !ranking) {
    return (
      <main className='flex min-h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <p className='text-muted-foreground'>{error || 'Invalid results'}</p>
          <Button onClick={() => router.push('/')}>← Back to Home</Button>
        </div>
      </main>
    );
  }

  return (
    <main className='flex flex-col items-center p-8'>
      <div className='w-full max-w-6xl space-y-6'>
        <div className='space-y-2 text-center'>
          <a href='/'>
            <h1 className='text-4xl font-bold tracking-tight'>CardaSort</h1>
          </a>
          <p className='text-muted-foreground'>Your sorting results</p>
        </div>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Sorting Complete!</CardTitle>
            <Button variant='outline' onClick={() => router.push('/')}>
              ← New Sort
            </Button>
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
    </main>
  );
}
