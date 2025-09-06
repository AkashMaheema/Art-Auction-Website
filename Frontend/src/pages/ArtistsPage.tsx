import React from 'react';
import { Artist } from '../types';
import { ArtistCard } from '../components/ArtistCard';

interface ArtistsPageProps {
  artists: Artist[];
  onViewArtist: (artist: Artist) => void;
}

export const ArtistsPage: React.FC<ArtistsPageProps> = ({ artists, onViewArtist }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Featured Artists</h1>
          <p className="text-xl text-gray-600">Discover the talented artists behind our exceptional collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onViewPortfolio={onViewArtist}
            />
          ))}
        </div>
      </div>
    </div>
  );
};