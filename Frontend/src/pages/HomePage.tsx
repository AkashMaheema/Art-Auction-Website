import React from 'react';
import { Clock } from 'lucide-react';
import { Painting } from '../types';
import { PaintingCard } from '../components/PaintingCard';
import { TrendingArtists } from '../components/TrendingArtists';
import { LiveAuctionFeed } from '../components/LiveAuctionFeed';
import { Artist } from '../types';

interface HomePageProps {
  featuredPaintings: Painting[];
  artists: Artist[];
  onViewPainting: (painting: Painting) => void;
  onViewArtist: (artist: Artist) => void;
  onNavigateToAuctions: () => void;
  onNavigateToArtists: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  featuredPaintings,
  artists,
  onViewPainting,
  onViewArtist,
  onNavigateToAuctions,
  onNavigateToArtists
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Exceptional Art
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Premium paintings from renowned artists worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNavigateToAuctions}
                className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Browse Auctions
              </button>
              <button
                onClick={onNavigateToArtists}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors"
              >
                Meet Artists
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Auctions
            </h2>
            <p className="text-xl text-gray-600">
              Exceptional pieces ending soon
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPaintings.map((painting) => (
              <PaintingCard
                key={painting.id}
                painting={painting}
                onViewDetails={onViewPainting}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live Feed and Trending */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LiveAuctionFeed />
            <TrendingArtists artists={artists} onViewArtist={onViewArtist} />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2,847</div>
              <div className="text-blue-200">Artworks Sold</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$12.4M</div>
              <div className="text-blue-200">Total Sales</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">356</div>
              <div className="text-blue-200">Featured Artists</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-200">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};