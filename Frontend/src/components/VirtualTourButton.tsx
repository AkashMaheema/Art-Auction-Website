import React from 'react';
import { Eye, ExternalLink } from 'lucide-react';

interface VirtualTourButtonProps {
  tourUrl?: string;
  paintingTitle: string;
}

export const VirtualTourButton: React.FC<VirtualTourButtonProps> = ({ tourUrl, paintingTitle }) => {
  if (!tourUrl) return null;

  const handleVirtualTour = () => {
    // In a real app, this would open a 3D viewer or VR experience
    window.open(tourUrl, '_blank');
  };

  return (
    <button
      onClick={handleVirtualTour}
      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
    >
      <Eye className="h-5 w-5" />
      <span>Virtual Gallery Tour</span>
      <ExternalLink className="h-4 w-4" />
    </button>
  );
};