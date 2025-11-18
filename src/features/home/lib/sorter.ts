export interface Entity {
  id: number;
  name: string;
  imageUrl: string | null;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

export interface RankingGroup {
  members: Entity[];
}

export interface ComparisonPair {
  left: Entity;
  right: Entity;
}

export interface ComparisonResult {
  winner: Entity;
  loser: Entity;
  isTie: boolean;
}

export interface SorterState {
  allEntities: Entity[]; // All entities being sorted
  rankedEntities: Entity[][]; // Entities grouped by rank (index 0 = rank 1, etc)
  currentBatch: Entity[]; // Current batch being sorted
  currentPairs: ComparisonPair[]; // Current round of comparisons
  comparisonResults: ComparisonResult[]; // Track all comparisons in current round
  pairIndex: number; // Which pair we're comparing now
  leftEntity: Entity | null;
  rightEntity: Entity | null;
  round: number; // Which round of comparison (1, 2, 3, etc)
  ranking: RankingGroup[]; // Final ranking when finished
  started: boolean;
  isFinished: boolean;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create pairs from an array of entities
 */
function createPairs(entities: Entity[]): ComparisonPair[] {
  const pairs: ComparisonPair[] = [];
  for (let i = 0; i < entities.length - 1; i += 2) {
    pairs.push({
      left: entities[i],
      right: entities[i + 1]
    });
  }
  return pairs;
}

/**
 * Initialize the sorter state with merge sort paired comparison
 */
export function initializeSorter(entities: Entity[]): SorterState {
  const shuffled = shuffleArray(entities);

  if (shuffled.length < 2) {
    return {
      allEntities: shuffled,
      rankedEntities: shuffled.length === 1 ? [[shuffled[0]]] : [],
      currentBatch: [],
      currentPairs: [],
      comparisonResults: [],
      pairIndex: 0,
      ranking: shuffled.length === 1 ? [{ members: [shuffled[0]] }] : [],
      leftEntity: null,
      rightEntity: null,
      round: 1,
      started: true,
      isFinished: true
    };
  }

  const pairs = createPairs(shuffled);
  const firstPair = pairs[0];

  return {
    allEntities: shuffled,
    rankedEntities: [],
    currentBatch: shuffled,
    currentPairs: pairs,
    comparisonResults: [],
    pairIndex: 0,
    leftEntity: firstPair.left,
    rightEntity: firstPair.right,
    round: 1,
    ranking: [],
    started: true,
    isFinished: false
  };
}

/**
 * Move to next comparison or next round
 * This implements a simple elimination tournament where:
 * - Each comparison produces winners and losers
 * - Winners get ranked higher
 * - Losers continue to next round of comparisons
 * - Process repeats until all entities are ranked
 */
function getNextState(
  state: SorterState,
  winner: Entity,
  loser: Entity,
  isTie: boolean
): SorterState {
  // Add current comparison result
  const newComparisonResults: ComparisonResult[] = [
    ...state.comparisonResults,
    { winner, loser, isTie }
  ];

  const nextPairIndex = state.pairIndex + 1;

  // Check if there's a next pair in current round
  if (nextPairIndex < state.currentPairs.length) {
    const nextPair = state.currentPairs[nextPairIndex];
    return {
      ...state,
      comparisonResults: newComparisonResults,
      pairIndex: nextPairIndex,
      leftEntity: nextPair.left,
      rightEntity: nextPair.right
    };
  }

  // Current round finished - process all results
  const totalProcessed = state.currentPairs.length * 2;
  const oddEntity = totalProcessed < state.currentBatch.length 
    ? state.currentBatch[totalProcessed] 
    : null;

  // Separate entities based on comparison results
  const winners: Entity[] = [];
  const losers: Entity[] = [];
  const ties: Entity[][] = [];

  newComparisonResults.forEach(result => {
    if (result.isTie) {
      ties.push([result.winner, result.loser]);
    } else {
      winners.push(result.winner);
      losers.push(result.loser);
    }
  });

  if (oddEntity) {
    losers.push(oddEntity);
  }

  // Add current round results to ranking
  const newRankedEntities = [...state.rankedEntities];
  
  // Winners from this round share the same rank
  if (winners.length > 0) {
    newRankedEntities.push(winners);
  }

  // Ties get their own ranks
  ties.forEach(tieGroup => {
    newRankedEntities.push(tieGroup);
  });

  // Continue sorting losers if there are 2 or more
  if (losers.length >= 2) {
    const pairs = createPairs(losers);
    const firstPair = pairs[0];
    
    return {
      ...state,
      rankedEntities: newRankedEntities,
      currentBatch: losers,
      currentPairs: pairs,
      comparisonResults: [],
      pairIndex: 0,
      leftEntity: firstPair.left,
      rightEntity: firstPair.right,
      round: state.round + 1
    };
  }

  // Only 1 or 0 losers remain - we're done
  if (losers.length === 1) {
    newRankedEntities.push([losers[0]]);
  }

  // Build final ranking
  const finalRanking: RankingGroup[] = newRankedEntities.map(group => ({
    members: group
  }));

  return {
    ...state,
    rankedEntities: newRankedEntities,
    ranking: finalRanking,
    leftEntity: null,
    rightEntity: null,
    isFinished: true
  };
}

/**
 * Handle "Left" button click - left entity is better than right
 */
export function handleLeft(state: SorterState): SorterState {
  if (!state.leftEntity || !state.rightEntity) return state;
  return getNextState(state, state.leftEntity, state.rightEntity, false);
}

/**
 * Handle "Tie" button click - both entities have same rank
 */
export function handleTie(state: SorterState): SorterState {
  if (!state.leftEntity || !state.rightEntity) return state;
  return getNextState(state, state.leftEntity, state.rightEntity, true);
}

/**
 * Handle "Right" button click - right entity is better than left
 */
export function handleRight(state: SorterState): SorterState {
  if (!state.leftEntity || !state.rightEntity) return state;
  return getNextState(state, state.rightEntity, state.leftEntity, false);
}
