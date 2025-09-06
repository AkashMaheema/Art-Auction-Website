import React from 'react';
import { Sparkles } from 'lucide-react';
import { Painting } from '../types';
import { PaintingCard } from './PaintingCard';

interface SimilarPaintingsProps {
  currentPainting: Painting;
  allPaintings: Painting[];
  onViewPainting: (painting: Painting) => void;
}

export const SimilarPaintings: React.FC<SimilarPaintingsProps> = ({
  currentPainting,
  allPaintings,
  onViewPainting
}) => {
  const similarPaintings = allPaintings.filter(p => 
    currentPainting.similarPaintings.includes(p.id)
  );

  if (similarPaintings.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
        <h3 className="text-xl font-bold text-gray-900">Similar Artworks</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {similarPaintings.map((painting) => (
          <div key={painting.id} className="transform hover:scale-105 transition-transform">
            <PaintingCard
              painting={painting}
              onViewDetails={onViewPainting}
              showBidButton={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};