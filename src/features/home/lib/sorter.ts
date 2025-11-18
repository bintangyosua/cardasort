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
  pool: Entity[];
  ranking: RankingGroup[];
  currentCandidate: Entity | null;
  remaining: Entity[];
  compareIndex: number;
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
 * Initialize the sorter state
 */
export function initializeSorter(entities: Entity[]): SorterState {
  const shuffled = shuffleArray(entities);

  return {
    pool: shuffled,
    ranking: [],
    currentCandidate: shuffled[0] || null,
    remaining: shuffled.slice(1),
    compareIndex: 0,
    started: true,
    isFinished: false
  };
}

/**
 * Get next candidate from remaining pool
 */
function getNextCandidate(state: SorterState): {
  currentCandidate: Entity | null;
  remaining: Entity[];
  compareIndex: number;
  isFinished: boolean;
} {
  if (state.remaining.length === 0) {
    return {
      currentCandidate: null,
      remaining: [],
      compareIndex: 0,
      isFinished: true
    };
  }

  return {
    currentCandidate: state.remaining[0],
    remaining: state.remaining.slice(1),
    compareIndex: 0,
    isFinished: false
  };
}

/**
 * Handle "Left" button click - currentCandidate is better than current group
 */
export function handleLeft(state: SorterState): SorterState {
  if (!state.currentCandidate) return state;

  const newRanking = [...state.ranking];

  // Insert new group above the current compareIndex
  newRanking.splice(state.compareIndex, 0, {
    members: [state.currentCandidate]
  });

  const next = getNextCandidate(state);

  return {
    ...state,
    ranking: newRanking,
    currentCandidate: next.currentCandidate,
    remaining: next.remaining,
    compareIndex: next.compareIndex,
    isFinished: next.isFinished
  };
}

/**
 * Handle "Tie" button click - currentCandidate has same rank as current group
 */
export function handleTie(state: SorterState): SorterState {
  if (!state.currentCandidate || state.ranking.length === 0) return state;

  const newRanking = [...state.ranking];

  // Add currentCandidate to the current group
  newRanking[state.compareIndex] = {
    members: [...newRanking[state.compareIndex].members, state.currentCandidate]
  };

  const next = getNextCandidate(state);

  return {
    ...state,
    ranking: newRanking,
    currentCandidate: next.currentCandidate,
    remaining: next.remaining,
    compareIndex: next.compareIndex,
    isFinished: next.isFinished
  };
}

/**
 * Handle "Right" button click - currentCandidate is worse than current group
 */
export function handleRight(state: SorterState): SorterState {
  if (!state.currentCandidate) return state;

  const isLastGroup = state.compareIndex >= state.ranking.length - 1;

  if (isLastGroup) {
    // Add new group at the bottom
    const newRanking = [
      ...state.ranking,
      { members: [state.currentCandidate] }
    ];

    const next = getNextCandidate(state);

    return {
      ...state,
      ranking: newRanking,
      currentCandidate: next.currentCandidate,
      remaining: next.remaining,
      compareIndex: next.compareIndex,
      isFinished: next.isFinished
    };
  } else {
    // Move to next group for comparison
    return {
      ...state,
      compareIndex: state.compareIndex + 1
    };
  }
}
