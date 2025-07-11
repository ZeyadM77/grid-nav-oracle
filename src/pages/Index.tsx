
import React, { useState, useCallback, useEffect } from 'react';
import { PathfindingGrid } from '@/components/PathfindingGrid';
import { ControlPanel } from '@/components/ControlPanel';
import { AlgorithmComparison } from '@/components/AlgorithmComparison';
import { AIAnalysis } from '@/components/AIAnalysis';
import { DisasterPanel } from '@/components/DisasterPanel';
import { usePathfinding } from '@/hooks/usePathfinding';
import { GridCell, Algorithm, DisasterType, PathfindingResult } from '@/types/pathfinding';

const Index = () => {
  const {
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
  } = usePathfinding();

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('astar');
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>('none');
  const [showComparison, setShowComparison] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const handleRunSingle = useCallback(() => {
    runAlgorithm(selectedAlgorithm);
  }, [runAlgorithm, selectedAlgorithm]);

  const handleRunAll = useCallback(() => {
    runAllAlgorithms();
    setShowComparison(true);
  }, [runAllAlgorithms]);

  const handleDisasterApply = useCallback((type: DisasterType, intensity: number) => {
    applyDisaster(type, intensity);
    setSelectedDisaster(type);
  }, [applyDisaster]);

  const handleAIAnalysis = useCallback(() => {
    if (results.length > 0) {
      setShowAIAnalysis(true);
    }
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            PathFinder AI
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Visualize pathfinding algorithms, simulate disasters, and get AI-powered recommendations
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Grid Visualization */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
              <PathfindingGrid
                grid={grid}
                startPoint={startPoint}
                endPoint={endPoint}
                onUpdateGrid={updateGrid}
                onSetStart={setStartPoint}
                onSetEnd={setEndPoint}
                isRunning={isRunning}
              />
            </div>

            {/* Algorithm Comparison */}
            {showComparison && results.length > 0 && (
              <div className="mt-6">
                <AlgorithmComparison results={results} />
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <ControlPanel
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmChange={setSelectedAlgorithm}
              onRunSingle={handleRunSingle}
              onRunAll={handleRunAll}
              onClear={clearGrid}
              onReset={resetPaths}
              isRunning={isRunning}
            />

            <DisasterPanel
              selectedDisaster={selectedDisaster}
              onApplyDisaster={handleDisasterApply}
              isRunning={isRunning}
            />

            {results.length > 0 && (
              <button
                onClick={handleAIAnalysis}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🤖 Get AI Analysis
              </button>
            )}
          </div>
        </div>

        {/* AI Analysis Modal */}
        {showAIAnalysis && (
          <AIAnalysis
            results={results}
            disasterType={selectedDisaster}
            onClose={() => setShowAIAnalysis(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
