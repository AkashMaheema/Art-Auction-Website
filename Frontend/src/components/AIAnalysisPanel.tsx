import React, { useState } from 'react';
import { Brain, Sparkles, Palette, History } from 'lucide-react';
import { Painting } from '../types';

interface AIAnalysisPanelProps {
  painting: Painting;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ painting }) => {
  const [activeTab, setActiveTab] = useState<'style' | 'emotion' | 'technique' | 'history'>('style');

  if (!painting.aiAnalysis) return null;

  const tabs = [
    { id: 'style' as const, label: 'Style', icon: Palette, content: painting.aiAnalysis.style },
    { id: 'emotion' as const, label: 'Emotion', icon: Sparkles, content: painting.aiAnalysis.emotion },
    { id: 'technique' as const, label: 'Technique', icon: Brain, content: painting.aiAnalysis.technique },
    { id: 'history' as const, label: 'Context', icon: History, content: painting.aiAnalysis.historicalContext }
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Brain className="h-6 w-6 text-purple-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-900">AI Art Analysis</h3>
        <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Beta</span>
      </div>
      
      <div className="flex space-x-1 mb-4 bg-white rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Icon className="h-4 w-4 mr-1" />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      <div className="bg-white rounded-lg p-4">
        <p className="text-gray-700 leading-relaxed">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </p>
      </div>
    </div>
  );
};