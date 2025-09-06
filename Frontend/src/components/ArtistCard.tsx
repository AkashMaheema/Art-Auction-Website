import React from 'react';
import { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
  onViewPortfolio: (artist: Artist) => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onViewPortfolio }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={artist.image} 
          alt={artist.name}
          className="w-full h-64 object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{artist.name}</h3>
        <p className="text-gray-600 mb-2">{artist.nationality}</p>
        <p className="text-sm text-gray-500 mb-4">
          {artist.birthYear}{artist.deathYear ? ` - ${artist.deathYear}` : ' - Present'}
        </p>
        <p className="text-gray-700 mb-4 line-clamp-3">{artist.bio}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-900 font-medium">{artist.style}</span>
          <button
            onClick={() => onViewPortfolio(artist)}
            className="text-blue-900 hover:text-blue-800 font-medium"
          >
            View Portfolio →
          </button>
        </div>
      </div>
    </div>
  );
};