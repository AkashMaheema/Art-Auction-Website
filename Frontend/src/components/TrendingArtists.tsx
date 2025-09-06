import React from 'react';
import { TrendingUp, Award, DollarSign } from 'lucide-react';
import { Artist } from '../types';
import { formatCurrency } from '../utils/currency';

interface TrendingArtistsProps {
  artists: Artist[];
  onViewArtist: (artist: Artist) => void;
}

export const TrendingArtists: React.FC<TrendingArtistsProps> = ({ artists, onViewArtist }) => {
  const trendingArtists = artists.filter(artist => artist.trending);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
        <h3 className="text-xl font-bold text-gray-900">Trending Artists</h3>
      </div>

      <div className="space-y-4">
        {trendingArtists.map((artist, index) => (
          <div
            key={artist.id}
            className="flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewArtist(artist)}
          >
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full font-bold text-sm mr-4">
              {index + 1}
            </div>
            
            <img
              src={artist.image}
              alt={artist.name}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-semibold text-gray-900">{artist.name}</h4>
                {artist.verified && (
                  <Award className="h-4 w-4 text-blue-500 ml-2" />
                )}
              </div>
              <p className="text-sm text-gray-600">{artist.style}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center text-green-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(artist.averagePrice)}
              </div>
              <p className="text-xs text-gray-500">avg. price</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};