
import { useState, useCallback, useRef } from 'react';
import { GridCell, Algorithm, DisasterType, PathfindingResult, Point } from '@/types/pathfinding';
import { createGrid, runAStar, runDijkstra, runBFS, runDFS } from '@/utils/pathfinding';
import { applyDisasterEffect } from '@/utils/disasters';

const GRID_SIZE = 25;

export const usePathfinding = () => {
  const [grid, setGrid] = useState<GridCell[][]>(() => createGrid(GRID_SIZE));
  const [startPoint, setStartPoint] = useState<Point>({ x: 1, y: 1 });
  const [endPoint, setEndPoint] = useState<Point>({ x: GRID_SIZE - 2, y: GRID_SIZE - 2 });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<PathfindingResult[]>([]);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const updateGrid = useCallback((newGrid: GridCell[][]) => {
    setGrid(newGrid);
  }, []);

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  }, []);

  const resetPaths = useCallback(() => {
    clearTimeouts();
    setGrid(prevGrid => 
      prevGrid.map(row => 
        row.map(cell => ({
          ...cell,
          isPath: false,
          isVisited: false,
          isExplored: false,
          distance: Infinity,
          heuristic: 0,
          parent: null,
          algorithmClass: undefined
        }))
      )
    );
    setResults([]);
  }, [clearTimeouts]);

  const clearGrid = useCallback(() => {
    clearTimeouts();
    setGrid(createGrid(GRID_SIZE));
    setResults([]);
  }, [clearTimeouts]);

  const runAlgorithm = useCallback(async (algorithm: Algorithm) => {
    if (isRunning) return;
    
    setIsRunning(true);
    resetPaths();

    const startTime = performance.now();
    let result: PathfindingResult;

    try {
      switch (algorithm) {
        case 'astar':
          result = await runAStar(grid, startPoint, endPoint, setGrid, timeoutRefs);
          break;
        case 'dijkstra':
          result = await runDijkstra(grid, startPoint, endPoint, setGrid, timeoutRefs);
          break;
        case 'bfs':
          result = await runBFS(grid, startPoint, endPoint, setGrid, timeoutRefs);
          break;
        case 'dfs':
          result = await runDFS(grid, startPoint, endPoint, setGrid, timeoutRefs);
          break;
        default:
          throw new Error('Unknown algorithm');
      }

      result.executionTime = performance.now() - startTime;
      setResults([result]);
    } catch (error) {
      console.error('Error running algorithm:', error);
    } finally {
      setIsRunning(false);
    }
  }, [grid, startPoint, endPoint, isRunning, resetPaths]);

  const runAllAlgorithms = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    resetPaths();

    const algorithms: Algorithm[] = ['astar', 'dijkstra', 'bfs', 'dfs'];
    const newResults: PathfindingResult[] = [];

    for (const algorithm of algorithms) {
      const startTime = performance.now();
      
      try {
        let result: PathfindingResult;
        
        switch (algorithm) {
          case 'astar':
            result = await runAStar(grid, startPoint, endPoint, setGrid, timeoutRefs);
            break;
          case 'dijkstra':
            result = await runDijkstra(grid, startPoint, endPoint, setGrid, timeoutRefs);
            break;
          case 'bfs':
            result = await runBFS(grid, startPoint, endPoint, setGrid, timeoutRefs);
            break;
          case 'dfs':
            result = await runDFS(grid, startPoint, endPoint, setGrid, timeoutRefs);
            break;
          default:
            continue;
        }

        result.executionTime = performance.now() - startTime;
        newResults.push(result);
        
        // Small delay between algorithms
        await new Promise(resolve => setTimeout(resolve, 500));
        resetPaths();
      } catch (error) {
        console.error(`Error running ${algorithm}:`, error);
      }
    }

    setResults(newResults);
    setIsRunning(false);
  }, [grid, startPoint, endPoint, isRunning, resetPaths]);

  const applyDisaster = useCallback((type: DisasterType, intensity: number) => {
    if (type === 'none') return;
    
    const newGrid = applyDisasterEffect(grid, type, intensity);
    setGrid(newGrid);
    resetPaths();
  }, [grid, resetPaths]);

  return {
    grid,
    startPoint,
    endPoint,
    isRunning,
    results,
    updateGrid,
    setStartPoint,
    setEndPoint,
    runAlgorithm,
    runAllAlgorithms,
    clearGrid,
    resetPaths,
    applyDisaster
  };
};
