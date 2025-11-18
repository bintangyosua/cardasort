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

export interface SorterState {
  allEntities: Entity[]; // All entities being sorted
  sorted: Entity[]; // Already ranked entities (in order, best first)
  unsorted: Entity[]; // Still need to be inserted into sorted
  leftEntity: Entity | null; // Current entity being inserted
  rightEntity: Entity | null; // Entity from sorted array being compared
  searchStart: number; // Binary search start index
  searchEnd: number; // Binary search end index
  round: number;
  ranking: RankingGroup[];
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
      sortingWinners: false,
      winnersQueue: [],
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
    sortingWinners: false,
    winnersQueue: [],
    ranking: [],
    started: true,
    isFinished: false
  };
}

/**
 * Move to next comparison or next round
 * This implements a tournament where both winners and losers are sorted:
 * 1. Compare all entities in pairs
 * 2. Winners go to winners pool, losers to losers pool
 * 3. Sort winners among themselves (to get top ranks)
 * 4. Then sort losers among themselves
 * 5. Repeat recursively until all ranked
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
  const oddEntity =
    totalProcessed < state.currentBatch.length
      ? state.currentBatch[totalProcessed]
      : null;

  // Separate entities based on comparison results
  const winners: Entity[] = [];
  const losers: Entity[] = [];
  const ties: Entity[][] = [];

  newComparisonResults.forEach((result) => {
    if (result.isTie) {
      ties.push([result.winner, result.loser]);
    } else {
      winners.push(result.winner);
      losers.push(result.loser);
    }
  });

  if (oddEntity) {
    // Odd entity goes to losers
    losers.push(oddEntity);
  }

  // Add ties to ranking immediately (they share the same rank)
  const newRankedEntities = [...state.rankedEntities];
  ties.forEach((tieGroup) => {
    newRankedEntities.push(tieGroup);
  });

  // Decide what to sort next
  // Priority: Sort winners first (for top ranks), then sort losers

  if (state.sortingWinners) {
    // We just finished sorting winners
    // Winners of winners get highest rank
    if (winners.length === 1) {
      newRankedEntities.push(winners);
    } else if (winners.length > 1) {
      // Multiple winners at this level share the rank
      newRankedEntities.push(winners);
    }

    // Now check if there are losers from winner sorting to continue
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
        round: state.round + 1,
        sortingWinners: true // Still sorting winners group
      };
    } else if (losers.length === 1) {
      newRankedEntities.push([losers[0]]);
    }

    // Done with winners, now sort the losers queue
    if (state.winnersQueue.length >= 2) {
      const pairs = createPairs(state.winnersQueue);
      const firstPair = pairs[0];

      return {
        ...state,
        rankedEntities: newRankedEntities,
        currentBatch: state.winnersQueue,
        currentPairs: pairs,
        comparisonResults: [],
        pairIndex: 0,
        leftEntity: firstPair.left,
        rightEntity: firstPair.right,
        round: state.round + 1,
        sortingWinners: false,
        winnersQueue: []
      };
    } else if (state.winnersQueue.length === 1) {
      newRankedEntities.push([state.winnersQueue[0]]);
    }

    // All done
    const finalRanking: RankingGroup[] = newRankedEntities.map((group) => ({
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

  // First round or sorting losers
  // Check if winners need sorting
  if (winners.length >= 2) {
    const pairs = createPairs(winners);
    const firstPair = pairs[0];

    return {
      ...state,
      rankedEntities: newRankedEntities,
      currentBatch: winners,
      currentPairs: pairs,
      comparisonResults: [],
      pairIndex: 0,
      leftEntity: firstPair.left,
      rightEntity: firstPair.right,
      round: state.round + 1,
      sortingWinners: true,
      winnersQueue: losers // Save losers for later
    };
  } else if (winners.length === 1) {
    newRankedEntities.push(winners);
  }

  // No winners or single winner, continue with losers
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
      round: state.round + 1,
      sortingWinners: false
    };
  } else if (losers.length === 1) {
    newRankedEntities.push([losers[0]]);
  }

  // Build final ranking
  const finalRanking: RankingGroup[] = newRankedEntities.map((group) => ({
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
