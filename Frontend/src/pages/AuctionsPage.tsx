import React from 'react';
import { Painting } from '../types';
import { PaintingCard } from '../components/PaintingCard';
import { SearchAndFilter } from '../components/SearchAndFilter';

interface AuctionsPageProps {
  paintings: Painting[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  onViewPainting: (painting: Painting) => void;
  onPlaceBid: (painting: Painting) => void;
}

export const AuctionsPage: React.FC<AuctionsPageProps> = ({
  paintings,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  onViewPainting,
  onPlaceBid
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Live Auctions</h1>
          
          <SearchAndFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
        </div>

        {/* Auction Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paintings.map((painting) => (
            <PaintingCard
              key={painting.id}
              painting={painting}
              onViewDetails={onViewPainting}
              onPlaceBid={onPlaceBid}
              showBidButton={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};