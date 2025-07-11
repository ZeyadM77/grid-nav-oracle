
import React, { useState } from 'react';
import { Waves, Flame, Zap } from 'lucide-react';
import { DisasterType } from '@/types/pathfinding';

interface DisasterPanelProps {
  selectedDisaster: DisasterType;
  onApplyDisaster: (type: DisasterType, intensity: number) => void;
  isRunning: boolean;
}

const disasterInfo = {
  flood: {
    name: 'Flood',
    description: 'Water blocks from bottom-left',
    icon: Waves,
    color: 'bg-blue-600',
    gradient: 'from-blue-600 to-cyan-600'
  },
  fire: {
    name: 'Wildfire',
    description: 'Scattered fire obstacles',
    icon: Flame,
    color: 'bg-red-600',
    gradient: 'from-red-600 to-orange-600'
  },
  earthquake: {
    name: 'Earthquake',
    description: 'Cracks and debris',
    icon: Zap,
    color: 'bg-yellow-600',
    gradient: 'from-yellow-600 to-orange-600'
  }
};

export const DisasterPanel: React.FC<DisasterPanelProps> = ({
  selectedDisaster,
  onApplyDisaster,
  isRunning
}) => {
  const [intensity, setIntensity] = useState(50);
  const [activeDisaster, setActiveDisaster] = useState<DisasterType>('flood');

  const handleApplyDisaster = () => {
    onApplyDisaster(activeDisaster, intensity);
  };

  const handleClearDisaster = () => {
    onApplyDisaster('none', 0);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6">Disaster Simulation</h3>
      
      {/* Disaster Type Selection */}
      <div className="space-y-3 mb-4">
        <label className="text-slate-300 font-medium">Disaster Type:</label>
        {Object.entries(disasterInfo).map(([key, info]) => {
          const IconComponent = info.icon;
          return (
            <div key={key} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`disaster-${key}`}
                name="disaster"
                value={key}
                checked={activeDisaster === key}
                onChange={(e) => setActiveDisaster(e.target.value as DisasterType)}
                disabled={isRunning}
                className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 focus:ring-red-500"
              />
              <label 
                htmlFor={`disaster-${key}`} 
                className={`flex-1 p-3 rounded-lg border transition-all cursor-pointer ${
                  activeDisaster === key
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${info.color}`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{info.name}</div>
                    <div className="text-sm opacity-75">{info.description}</div>
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Intensity Control */}
      <div className="mb-6">
        <label className="text-slate-300 font-medium mb-2 block">
          Intensity: {intensity}%
        </label>
        <input
          type="range"
          min="20"
          max="80"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          disabled={isRunning}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Mild</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleApplyDisaster}
          disabled={isRunning}
          className={`w-full bg-gradient-to-r ${
            disasterInfo[activeDisaster].gradient
          } hover:opacity-90 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center justify-center space-x-2`}
        >
          {React.createElement(disasterInfo[activeDisaster].icon, { className: "w-4 h-4" })}
          <span>Simulate {disasterInfo[activeDisaster].name}</span>
        </button>

        <button
          onClick={handleClearDisaster}
          disabled={isRunning}
          className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-300 font-medium py-2 px-4 rounded-lg transition-all duration-200"
        >
          Clear Disaster
        </button>
      </div>

      {/* Current Status */}
      {selectedDisaster !== 'none' && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-400">
            {React.createElement(disasterInfo[selectedDisaster as keyof typeof disasterInfo].icon, { 
              className: "w-4 h-4" 
            })}
            <span className="font-medium">
              {disasterInfo[selectedDisaster as keyof typeof disasterInfo].name} Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
