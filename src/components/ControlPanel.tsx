
import React from 'react';
import { Play, PlayCircle, RotateCcw, Trash2 } from 'lucide-react';
import { Algorithm } from '@/types/pathfinding';

interface ControlPanelProps {
  selectedAlgorithm: Algorithm;
  onAlgorithmChange: (algorithm: Algorithm) => void;
  onRunSingle: () => void;
  onRunAll: () => void;
  onClear: () => void;
  onReset: () => void;
  isRunning: boolean;
}

const algorithmInfo = {
  astar: {
    name: 'A* (A-Star)',
    description: 'Optimal pathfinding with heuristic',
    color: 'bg-blue-500'
  },
  dijkstra: {
    name: "Dijkstra's",
    description: 'Guaranteed shortest path',
    color: 'bg-purple-500'
  },
  bfs: {
    name: 'Breadth-First Search',
    description: 'Explores layer by layer',
    color: 'bg-green-500'
  },
  dfs: {
    name: 'Depth-First Search',
    description: 'Goes deep before wide',
    color: 'bg-orange-500'
  }
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  onRunSingle,
  onRunAll,
  onClear,
  onReset,
  isRunning
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6">Algorithm Control</h3>
      
      {/* Algorithm Selection */}
      <div className="space-y-3 mb-6">
        <label className="text-slate-300 font-medium">Select Algorithm:</label>
        {Object.entries(algorithmInfo).map(([key, info]) => (
          <div key={key} className="flex items-center space-x-3">
            <input
              type="radio"
              id={key}
              name="algorithm"
              value={key}
              checked={selectedAlgorithm === key}
              onChange={(e) => onAlgorithmChange(e.target.value as Algorithm)}
              disabled={isRunning}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
            />
            <label 
              htmlFor={key} 
              className={`flex-1 p-3 rounded-lg border transition-all cursor-pointer ${
                selectedAlgorithm === key
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
                <div>
                  <div className="font-medium">{info.name}</div>
                  <div className="text-sm opacity-75">{info.description}</div>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onRunSingle}
          disabled={isRunning}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{isRunning ? 'Running...' : 'Run Selected'}</span>
        </button>

        <button
          onClick={onRunAll}
          disabled={isRunning}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center justify-center space-x-2"
        >
          <PlayCircle className="w-4 h-4" />
          <span>{isRunning ? 'Running All...' : 'Compare All'}</span>
        </button>

        <div className="flex space-x-2">
          <button
            onClick={onReset}
            disabled={isRunning}
            className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-300 font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={onClear}
            disabled={isRunning}
            className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-slate-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <h4 className="font-medium text-slate-200 mb-2">Instructions:</h4>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Click and drag to draw walls</li>
          <li>• Drag start/end points to move them</li>
          <li>• Select an algorithm and run it</li>
          <li>• Compare all algorithms at once</li>
        </ul>
      </div>
    </div>
  );
};
