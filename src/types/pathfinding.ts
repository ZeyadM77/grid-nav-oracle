
export interface GridCell {
  x: number;
  y: number;
  isWall: boolean;
  isPath: boolean;
  isVisited: boolean;
  isExplored: boolean;
  distance: number;
  heuristic: number;
  parent: GridCell | null;
  algorithmClass?: string;
}

export type Algorithm = 'astar' | 'dijkstra' | 'bfs' | 'dfs';

export type DisasterType = 'none' | 'flood' | 'fire' | 'earthquake';

export interface PathfindingResult {
  algorithm: Algorithm;
  path: GridCell[];
  visitedCells: GridCell[];
  distance: number;
  executionTime: number;
  nodesExplored: number;
  success: boolean;
}

export interface Point {
  x: number;
  y: number;
}
