
import React, { useState, useEffect } from 'react';
import { X, Brain, Loader, AlertTriangle } from 'lucide-react';
import { PathfindingResult, DisasterType } from '@/types/pathfinding';

interface AIAnalysisProps {
  results: PathfindingResult[];
  disasterType: DisasterType;
  onClose: () => void;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({
  results,
  disasterType,
  onClose
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    // Check if we have an API key in localStorage
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      performAnalysis(storedApiKey);
    } else {
      setShowApiKeyInput(true);
      setIsLoading(false);
    }
  }, []);

  const performAnalysis = async (key: string) => {
    setIsLoading(true);
    setError('');

    try {
      const analysisPrompt = generateAnalysisPrompt();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an AI expert in pathfinding algorithms and emergency response scenarios. Provide clear, concise analysis and recommendations.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data.choices[0].message.content);
      
      // Store the API key for future use
      localStorage.setItem('openai_api_key', key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnalysisPrompt = (): string => {
    const successfulResults = results.filter(r => r.success);
    const resultsSummary = successfulResults.map(r => 
      `${r.algorithm.toUpperCase()}: Path length ${r.distance}, ${r.executionTime.toFixed(2)}ms, ${r.nodesExplored} nodes explored`
    ).join('\n');

    const disasterContext = disasterType !== 'none' 
      ? `The scenario includes a ${disasterType} disaster affecting the terrain.` 
      : 'This is a normal pathfinding scenario without disasters.';

    return `
Analyze these pathfinding algorithm results and provide recommendations:

${disasterContext}

Results:
${resultsSummary}

Please provide:
1. Which algorithm performed best overall and why
2. Specific recommendations for this scenario type
3. Trade-offs between the algorithms
4. Best algorithm choice for emergency/disaster scenarios

Keep the response concise and practical.
    `;
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      performAnalysis(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Algorithm Analysis</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showApiKeyInput ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 bg-amber-400/10 p-3 rounded-lg">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">
                  To get AI analysis, please enter your OpenAI API key. It will be stored locally for future use.
                </p>
              </div>
              
              <form onSubmit={handleApiKeySubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">
                    OpenAI API Key:
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Analyze Results
                </button>
              </form>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-slate-300">Analyzing pathfinding results...</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowApiKeyInput(true);
                  setError('');
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Algorithm Results Summary */}
              <div className="bg-slate-900/50 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Results Summary</h4>
                <div className="space-y-2">
                  {results.filter(r => r.success).map((result, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">{result.algorithm.toUpperCase()}</span>
                      <span className="text-slate-400">
                        {result.distance} steps, {result.executionTime.toFixed(2)}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-4">
                <h4 className="text-purple-400 font-semibold mb-3">AI Recommendation</h4>
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {analysis}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowApiKeyInput(true);
                    setAnalysis('');
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  New Analysis
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
