
import React from 'react';
import { PathfindingResult } from '@/types/pathfinding';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AlgorithmComparisonProps {
  results: PathfindingResult[];
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({ results }) => {
  const chartData = results.map(result => ({
    name: result.algorithm.toUpperCase(),
    distance: result.success ? result.distance : 0,
    time: parseFloat(result.executionTime.toFixed(2)),
    nodes: result.nodesExplored,
    success: result.success
  }));

  const successfulResults = results.filter(r => r.success);
  const bestDistance = successfulResults.length > 0 ? Math.min(...successfulResults.map(r => r.distance)) : 0;
  const fastestTime = successfulResults.length > 0 ? Math.min(...successfulResults.map(r => r.executionTime)) : 0;
  const leastNodes = successfulResults.length > 0 ? Math.min(...successfulResults.map(r => r.nodesExplored)) : 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6">Algorithm Comparison</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
          <h4 className="text-green-400 font-semibold mb-2">Shortest Path</h4>
          <div className="text-2xl font-bold text-white">{bestDistance}</div>
          <div className="text-sm text-slate-300">
            {successfulResults.find(r => r.distance === bestDistance)?.algorithm.toUpperCase() || 'N/A'}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4">
          <h4 className="text-blue-400 font-semibold mb-2">Fastest Time</h4>
          <div className="text-2xl font-bold text-white">{fastestTime.toFixed(2)}ms</div>
          <div className="text-sm text-slate-300">
            {successfulResults.find(r => Math.abs(r.executionTime - fastestTime) < 0.01)?.algorithm.toUpperCase() || 'N/A'}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4">
          <h4 className="text-purple-400 font-semibold mb-2">Most Efficient</h4>
          <div className="text-2xl font-bold text-white">{leastNodes}</div>
          <div className="text-sm text-slate-300">
            {successfulResults.find(r => r.nodesExplored === leastNodes)?.algorithm.toUpperCase() || 'N/A'} nodes
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Path Length Comparison */}
        <div className="bg-slate-900/50 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-4">Path Length</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar 
                dataKey="distance" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Execution Time Comparison */}
        <div className="bg-slate-900/50 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-4">Execution Time (ms)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar 
                dataKey="time" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-slate-300 font-semibold py-3 px-4">Algorithm</th>
              <th className="text-slate-300 font-semibold py-3 px-4">Success</th>
              <th className="text-slate-300 font-semibold py-3 px-4">Path Length</th>
              <th className="text-slate-300 font-semibold py-3 px-4">Time (ms)</th>
              <th className="text-slate-300 font-semibold py-3 px-4">Nodes Explored</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className="border-b border-slate-700/50">
                <td className="py-3 px-4">
                  <span className="text-white font-medium">{result.algorithm.toUpperCase()}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.success 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {result.success ? result.distance : 'N/A'}
                  {result.success && result.distance === bestDistance && (
                    <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1 py-0.5 rounded">Best</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {result.executionTime.toFixed(2)}
                  {result.success && Math.abs(result.executionTime - fastestTime) < 0.01 && (
                    <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded">Fastest</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {result.nodesExplored}
                  {result.success && result.nodesExplored === leastNodes && (
                    <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded">Most Efficient</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
