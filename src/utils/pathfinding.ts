
import { GridCell, Algorithm, PathfindingResult, Point } from '@/types/pathfinding';

export const createGrid = (size: number): GridCell[][] => {
  const grid: GridCell[][] = [];
  
  for (let y = 0; y < size; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < size; x++) {
      row.push({
        x,
        y,
        isWall: false,
        isPath: false,
        isVisited: false,
        isExplored: false,
        distance: Infinity,
        heuristic: 0,
        parent: null
      });
    }
    grid.push(row);
  }
  
  return grid;
};

const heuristic = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const getNeighbors = (grid: GridCell[][], cell: GridCell): GridCell[] => {
  const neighbors: GridCell[] = [];
  const { x, y } = cell;
  
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 1, dy: 0 },  // right
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }  // left
  ];
  
  for (const { dx, dy } of directions) {
    const newX = x + dx;
    const newY = y + dy;
    
    if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length) {
      if (!grid[newY][newX].isWall) {
        neighbors.push(grid[newY][newX]);
      }
    }
  }
  
  return neighbors;
};

const reconstructPath = (endCell: GridCell): GridCell[] => {
  const path: GridCell[] = [];
  let current = endCell;
  
  while (current) {
    path.unshift(current);
    current = current.parent!;
  }
  
  return path;
};

const animateExploration = async (
  cell: GridCell,
  setGrid: React.Dispatch<React.SetStateAction<GridCell[][]>>,
  timeoutRefs: React.MutableRefObject<NodeJS.Timeout[]>,
  algorithm: Algorithm,
  delay: number = 20
): Promise<void> => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[cell.y][cell.x] = {
          ...cell,
          isExplored: true,
          algorithmClass: `explored-${algorithm}`
        };
        return newGrid;
      });
      resolve();
    }, delay);
    
    timeoutRefs.current.push(timeout);
  });
};

const animatePath = async (
  path: GridCell[],
  setGrid: React.Dispatch<React.SetStateAction<GridCell[][]>>,
  timeoutRefs: React.MutableRefObject<NodeJS.Timeout[]>,
  algorithm: Algorithm
): Promise<void> => {
  for (let i = 1; i < path.length - 1; i++) {
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[path[i].y][path[i].x] = {
            ...path[i],
            isPath: true,
            algorithmClass: `path-${algorithm}`
          };
          return newGrid;
        });
        resolve();
      }, 50);
      
      timeoutRefs.current.push(timeout);
    });
  }
};

export const runAStar = async (
  grid: GridCell[][],
  start: Point,
  end: Point,
  setGrid: React.Dispatch<React.SetStateAction<GridCell[][]>>,
  timeoutRefs: React.MutableRefObject<NodeJS.Timeout[]>
): Promise<PathfindingResult> => {
  const startTime = performance.now();
  const openSet: GridCell[] = [];
  const closedSet: Set<GridCell> = new Set();
  
  const startCell = grid[start.y][start.x];
  const endCell = grid[end.y][end.x];
  
  startCell.distance = 0;
  startCell.heuristic = heuristic(start, end);
  openSet.push(startCell);
  
  let nodesExplored = 0;
  
  while (openSet.length > 0) {
    // Find cell with lowest f-score
    openSet.sort((a, b) => (a.distance + a.heuristic) - (b.distance + b.heuristic));
    const current = openSet.shift()!;
    
    if (current === endCell) {
      const path = reconstructPath(current);
      await animatePath(path, setGrid, timeoutRefs, 'astar');
      
      return {
        algorithm: 'astar',
        path,
        visitedCells: Array.from(closedSet),
        distance: path.length - 1,
        executionTime: performance.now() - startTime,
        nodesExplored,
        success: true
      };
    }
    
    closedSet.add(current);
    nodesExplored++;
    
    await animateExploration(current, setGrid, timeoutRefs, 'astar');
    
    const neighbors = getNeighbors(grid, current);
    
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor)) continue;
      
      const tentativeDistance = current.distance + 1;
      
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeDistance >= neighbor.distance) {
        continue;
      }
      
      neighbor.parent = current;
      neighbor.distance = tentativeDistance;
      neighbor.heuristic = heuristic({ x: neighbor.x, y: neighbor.y }, end);
    }
  }
  
  return {
    algorithm: 'astar',
    path: [],
    visitedCells: Array.from(closedSet),
    distance: -1,
    executionTime: performance.now() - startTime,
    nodesExplored,
    success: false
  };
};

export const runDijkstra = async (
  grid: GridCell[][],
  start: Point,
  end: Point,
  setGrid: React.Dispatch<React.SetStateAction<GridCell[][]>>,
  timeoutRefs: React.MutableRefObject<NodeJS.Timeout[]>
): Promise<PathfindingResult> => {
  const startTime = performance.now();
  const unvisited: GridCell[] = [];
  const visited: Set<GridCell> = new Set();
  
  // Initialize all cells
  for (const row of grid) {
    for (const cell of row) {
      cell.distance = Infinity;
      cell.parent = null;
      if (!cell.isWall) {
        unvisited.push(cell);
      }
    }
  }
  
  const startCell = grid[start.y][start.x];
  const endCell = grid[end.y][end.x];
  startCell.distance = 0;
  
  let nodesExplored = 0;
  
  while (unvisited.length > 0) {
    // Find unvisited cell with minimum distance
    unvisited.sort((a, b) => a.distance - b.distance);
    const current = unvisited.shift()!;
    
    if (current.distance === Infinity) break;
    if (current === endCell) {
      const path = reconstructPath(current);
      await animatePath(path, setGrid, timeoutRefs, 'dijkstra');
      
      return {
        algorithm: 'dijkstra',
        path,
        visitedCells: Array.from(visited),
        distance: path.length - 1,
        executionTime: performance.now() - startTime,
        nodesExplored,
        success: true
      };
    }
    
    visited.add(current);
    nodesExplored++;
    
    await animateExploration(current, setGrid, timeoutRefs, 'dijkstra');
    
    const neighbors = getNeighbors(grid, current);
    
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      
      const tentativeDistance = current.distance + 1;
      
      if (tentativeDistance < neighbor.distance) {
        neighbor.distance = tentativeDistance;
        neighbor.parent = current;
      }
    }
  }
  
  return {
    algorithm: 'dijkstra',
    path: [],
    visitedCells: Array.from(visited),
    distance: -1,
    executionTime: performance.now() - startTime,
    nodesExplored,
    success: false
  };
};

export const runBFS = async (
  grid: GridCell[][],
  start: Point,
  end: Point,
  setGrid: React.Dispatch<React.SetStateAction<GridCell[][]>>,
  timeoutRefs: React.MutableRefObject<NodeJS.Timeout[]>
): Promise<PathfindingResult> => {
  const startTime = performance.now();
  const queue: GridCell[] = [];
  const visited: Set<GridCell> = new Set();
  
  const startCell = grid[start.y][start.x];
  const endCell = grid[end.y][end.x];
  
  queue.push(startCell);
  visited.add(startCell);
  
  let nodesExplored = 0;
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    nodesExplored++;
    
    if (current === endCell) {
      const path = reconstructPath(current);
      await animatePath(path, setGrid, timeoutRefs, 'bfs');
      
      return {
        algorithm: 'bfs',
        path,
        visitedCells: Array.from(visited),
        distance: path.length - 1,
        executionTime: performance.now() - startTime,
        nodesExplored,
        success: true
      };
    }
    
    await animateExploration(current, setGrid, timeoutRefs, 'bfs');
    
    const neighbors = getNeighbors(grid, current);
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        neighbor.parent = current;
        queue.push(neighbor);
      }
    }
  }
  
  return {
    algorithm: 'bfs',
    path: [],
    visitedCells: Array.from(visited),
    distance: -1,
    executionTime: performance.now() - startTime,
    nodesExplored,
    success: false
  };
};

export const runDFS = async (
  grid: GridCell[][],
  start: Point,
  end: Point,
  setGrid: React.Dispatch<React.SetStateAction<GridCell[][]>>,
  timeoutRefs: React.MutableRefObject<NodeJS.Timeout[]>
): Promise<PathfindingResult> => {
  const startTime = performance.now();
  const stack: GridCell[] = [];
  const visited: Set<GridCell> = new Set();
  
  const startCell = grid[start.y][start.x];
  const endCell = grid[end.y][end.x];
  
  stack.push(startCell);
  
  let nodesExplored = 0;
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (visited.has(current)) continue;
    
    visited.add(current);
    nodesExplored++;
    
    if (current === endCell) {
      const path = reconstructPath(current);
      await animatePath(path, setGrid, timeoutRefs, 'dfs');
      
      return {
        algorithm: 'dfs',
        path,
        visitedCells: Array.from(visited),
        distance: path.length - 1,
        executionTime: performance.now() - startTime,
        nodesExplored,
        success: true
      };
    }
    
    await animateExploration(current, setGrid, timeoutRefs, 'dfs');
    
    const neighbors = getNeighbors(grid, current);
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        neighbor.parent = current;
        stack.push(neighbor);
      }
    }
  }
  
  return {
    algorithm: 'dfs',
    path: [],
    visitedCells: Array.from(visited),
    distance: -1,
    executionTime: performance.now() - startTime,
    nodesExplored,
    success: false
  };
};
