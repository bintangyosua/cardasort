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
  allEntities: Entity[];
  // Graph: key = entity id, value = set of entity ids that this entity beats
  graph: Map<number, Set<number>>;
  // Pairs that need comparison
  remainingPairs: Array<{ left: Entity; right: Entity }>;
  // Current comparison
  leftEntity: Entity | null;
  rightEntity: Entity | null;
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
 * Generate all possible pairs
 */
function generateAllPairs(
  entities: Entity[]
): Array<{ left: Entity; right: Entity }> {
  const pairs: Array<{ left: Entity; right: Entity }> = [];
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      pairs.push({ left: entities[i], right: entities[j] });
    }
  }
  return shuffleArray(pairs); // Randomize order
}

/**
 * Apply transitive closure to infer relationships
 * If A beats B and B beats C, then A beats C
 */
function applyTransitiveClosure(graph: Map<number, Set<number>>): void {
  const ids = Array.from(graph.keys());

  // Floyd-Warshall for transitive closure
  for (const k of ids) {
    for (const i of ids) {
      if (graph.get(i)?.has(k)) {
        const kBeats = graph.get(k);
        if (kBeats) {
          const kBeatsArray = Array.from(kBeats);
          for (const j of kBeatsArray) {
            graph.get(i)?.add(j);
          }
        }
      }
    }
  }
}

/**
 * Check if relationship can be inferred from graph
 */
function canInfer(
  graph: Map<number, Set<number>>,
  id1: number,
  id2: number
): boolean {
  return graph.get(id1)?.has(id2) || graph.get(id2)?.has(id1) || false;
}

/**
 * Get inferred winner
 */
function getInferredWinner(
  graph: Map<number, Set<number>>,
  e1: Entity,
  e2: Entity
): Entity | null {
  if (graph.get(e1.id)?.has(e2.id)) return e1;
  if (graph.get(e2.id)?.has(e1.id)) return e2;
  return null;
}

/**
 * Initialize tournament sorting
 */
export function initializeSorter(entities: Entity[]): SorterState {
  if (entities.length < 2) {
    return {
      allEntities: entities,
      graph: new Map(),
      remainingPairs: [],
      ranking: entities.length === 1 ? [{ members: [entities[0]] }] : [],
      leftEntity: null,
      rightEntity: null,
      round: 1,
      started: true,
      isFinished: true
    };
  }

  // Initialize graph with all entities
  const graph = new Map<number, Set<number>>();
  entities.forEach((e) => graph.set(e.id, new Set()));

  // Generate all pairs that need comparison
  const allPairs = generateAllPairs(entities);

  return {
    allEntities: entities,
    graph,
    remainingPairs: allPairs,
    leftEntity: allPairs[0].left,
    rightEntity: allPairs[0].right,
    round: 1,
    ranking: [],
    started: true,
    isFinished: false
  };
}

/**
 * Handle comparison and update graph
 */
function handleComparison(
  state: SorterState,
  winner: Entity,
  loser: Entity
): SorterState {
  // Update graph: winner beats loser
  const newGraph = new Map(state.graph);
  newGraph.get(winner.id)?.add(loser.id);

  // Apply transitive closure to infer more relationships
  applyTransitiveClosure(newGraph);

  // Filter remaining pairs - skip pairs that can be inferred
  const newRemainingPairs = state.remainingPairs.slice(1).filter((pair) => {
    return !canInfer(newGraph, pair.left.id, pair.right.id);
  });

  // Check if we're done
  if (newRemainingPairs.length === 0) {
    const ranking = buildFinalRanking(state.allEntities, newGraph);
    return {
      ...state,
      graph: newGraph,
      remainingPairs: [],
      ranking,
      leftEntity: null,
      rightEntity: null,
      isFinished: true
    };
  }

  // Get next pair
  const nextPair = newRemainingPairs[0];

  return {
    ...state,
    graph: newGraph,
    remainingPairs: newRemainingPairs,
    leftEntity: nextPair.left,
    rightEntity: nextPair.right,
    round: state.round + 1
  };
}

/**
 * Build final ranking based on graph
 * Entities ranked by number of wins (entities they beat)
 */
function buildFinalRanking(
  entities: Entity[],
  graph: Map<number, Set<number>>
): RankingGroup[] {
  // Calculate wins for each entity
  const winsMap = new Map<number, number>();
  entities.forEach((e) => {
    winsMap.set(e.id, graph.get(e.id)?.size || 0);
  });

  // Sort by wins (descending)
  const sorted = [...entities].sort((a, b) => {
    const aWins = winsMap.get(a.id) || 0;
    const bWins = winsMap.get(b.id) || 0;
    return bWins - aWins; // More wins = better rank
  });

  // Group entities with same number of wins
  const groups: RankingGroup[] = [];
  let currentGroup: Entity[] = [];
  let currentWins = -1;

  sorted.forEach((entity) => {
    const wins = winsMap.get(entity.id) || 0;
    if (wins !== currentWins) {
      if (currentGroup.length > 0) {
        groups.push({ members: currentGroup });
      }
      currentGroup = [entity];
      currentWins = wins;
    } else {
      currentGroup.push(entity);
    }
  });

  if (currentGroup.length > 0) {
    groups.push({ members: currentGroup });
  }

  return groups;
}

/**
 * Handle "Left" button click
 */
export function handleLeft(state: SorterState): SorterState {
  if (!state.leftEntity || !state.rightEntity) return state;
  return handleComparison(state, state.leftEntity, state.rightEntity);
}

/**
 * Handle "Tie" button click - treat as no clear winner, skip for now
 */
export function handleTie(state: SorterState): SorterState {
  if (!state.leftEntity || !state.rightEntity) return state;
  // For ties, just move to next pair without adding to graph
  const newRemainingPairs = state.remainingPairs.slice(1);

  if (newRemainingPairs.length === 0) {
    const ranking = buildFinalRanking(state.allEntities, state.graph);
    return {
      ...state,
      remainingPairs: [],
      ranking,
      leftEntity: null,
      rightEntity: null,
      isFinished: true
    };
  }

  const nextPair = newRemainingPairs[0];
  return {
    ...state,
    remainingPairs: newRemainingPairs,
    leftEntity: nextPair.left,
    rightEntity: nextPair.right
  };
}

/**
 * Handle "Right" button click
 */
export function handleRight(state: SorterState): SorterState {
  if (!state.leftEntity || !state.rightEntity) return state;
  return handleComparison(state, state.rightEntity, state.leftEntity);
}
