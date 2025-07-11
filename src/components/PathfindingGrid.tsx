
import React, { useState, useCallback } from 'react';
import { GridCell, Point } from '@/types/pathfinding';

interface PathfindingGridProps {
  grid: GridCell[][];
  startPoint: Point;
  endPoint: Point;
  onUpdateGrid: (grid: GridCell[][]) => void;
  onSetStart: (point: Point) => void;
  onSetEnd: (point: Point) => void;
  isRunning: boolean;
}

export const PathfindingGrid: React.FC<PathfindingGridProps> = ({
  grid,
  startPoint,
  endPoint,
  onUpdateGrid,
  onSetStart,
  onSetEnd,
  isRunning
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'wall' | 'erase'>('wall');
  const [dragMode, setDragMode] = useState<'none' | 'start' | 'end'>('none');

  const handleMouseDown = useCallback((x: number, y: number, e: React.MouseEvent) => {
    if (isRunning) return;
    
    e.preventDefault();
    
    if (x === startPoint.x && y === startPoint.y) {
      setDragMode('start');
      return;
    }
    
    if (x === endPoint.x && y === endPoint.y) {
      setDragMode('end');
      return;
    }
    
    setIsDrawing(true);
    toggleWall(x, y);
  }, [startPoint, endPoint, isRunning]);

  const handleMouseEnter = useCallback((x: number, y: number) => {
    if (isRunning) return;
    
    if (dragMode === 'start') {
      onSetStart({ x, y });
      return;
    }
    
    if (dragMode === 'end') {
      onSetEnd({ x, y });
      return;
    }
    
    if (isDrawing) {
      toggleWall(x, y);
    }
  }, [isDrawing, dragMode, onSetStart, onSetEnd, isRunning]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setDragMode('none');
  }, []);

  const toggleWall = useCallback((x: number, y: number) => {
    if (x === startPoint.x && y === startPoint.y) return;
    if (x === endPoint.x && y === endPoint.y) return;
    
    const newGrid = [...grid];
    newGrid[y][x] = {
      ...newGrid[y][x],
      isWall: drawMode === 'wall' ? true : false
    };
    onUpdateGrid(newGrid);
  }, [grid, startPoint, endPoint, drawMode, onUpdateGrid]);

  const getCellClass = (cell: GridCell) => {
    const baseClass = "w-4 h-4 md:w-5 md:h-5 border border-slate-600/30 transition-all duration-200 cursor-pointer select-none";
    
    if (cell.x === startPoint.x && cell.y === startPoint.y) {
      return `${baseClass} bg-green-500 shadow-lg shadow-green-500/50 transform scale-110 rounded-sm`;
    }
    
    if (cell.x === endPoint.x && cell.y === endPoint.y) {
      return `${baseClass} bg-red-500 shadow-lg shadow-red-500/50 transform scale-110 rounded-sm`;
    }
    
    if (cell.isWall) {
      return `${baseClass} bg-slate-700 shadow-inner`;
    }
    
    if (cell.isPath) {
      const algorithmColors = {
        'path-astar': 'bg-blue-400 shadow-blue-400/50',
        'path-dijkstra': 'bg-purple-400 shadow-purple-400/50',
        'path-bfs': 'bg-green-400 shadow-green-400/50',
        'path-dfs': 'bg-orange-400 shadow-orange-400/50'
      };
      const colorClass = algorithmColors[cell.algorithmClass as keyof typeof algorithmColors] || 'bg-blue-400';
      return `${baseClass} ${colorClass} shadow-lg animate-pulse`;
    }
    
    if (cell.isExplored) {
      const algorithmColors = {
        'explored-astar': 'bg-blue-200/30',
        'explored-dijkstra': 'bg-purple-200/30',
        'explored-bfs': 'bg-green-200/30',
        'explored-dfs': 'bg-orange-200/30'
      };
      const colorClass = algorithmColors[cell.algorithmClass as keyof typeof algorithmColors] || 'bg-blue-200/30';
      return `${baseClass} ${colorClass}`;
    }
    
    return `${baseClass} bg-slate-800/50 hover:bg-slate-700/50`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Drawing Controls */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setDrawMode('wall')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            drawMode === 'wall'
              ? 'bg-slate-600 text-white shadow-lg'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }`}
          disabled={isRunning}
        >
          Draw Walls
        </button>
        <button
          onClick={() => setDrawMode('erase')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            drawMode === 'erase'
              ? 'bg-slate-600 text-white shadow-lg'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }`}
          disabled={isRunning}
        >
          Erase
        </button>
      </div>

      {/* Grid */}
      <div 
        className="inline-grid gap-0 p-4 bg-slate-900/50 rounded-xl border border-slate-600/30 shadow-2xl"
        style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 0}, minmax(0, 1fr))` }}
        onMouseLeave={handleMouseUp}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={getCellClass(cell)}
              onMouseDown={(e) => handleMouseDown(x, y, e)}
              onMouseEnter={() => handleMouseEnter(x, y)}
              onMouseUp={handleMouseUp}
            />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm shadow-lg"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm shadow-lg"></div>
          <span>End</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-slate-700 rounded-sm"></div>
          <span>Wall</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
          <span>Path</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-200/30 rounded-sm"></div>
          <span>Explored</span>
        </div>
      </div>
    </div>
  );
};
