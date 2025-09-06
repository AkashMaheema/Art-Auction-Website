import React from 'react';
import { Clock, Star } from 'lucide-react';
import { Painting } from '../types';
import { formatCurrency } from '../utils/currency';

interface PaintingCardProps {
  painting: Painting;
  onViewDetails: (painting: Painting) => void;
  onPlaceBid?: (painting: Painting) => void;
  showBidButton?: boolean;
}

export const PaintingCard: React.FC<PaintingCardProps> = ({
  painting,
  onViewDetails,
  onPlaceBid,
  showBidButton = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={painting.image} 
          alt={painting.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          <Clock className="inline-block h-4 w-4 mr-1" />
          {painting.timeLeft}
        </div>
        {painting.featured && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium">
            <Star className="inline-block h-4 w-4 mr-1" />
            Featured
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{painting.title}</h3>
        <p className="text-gray-600 mb-1">by {painting.artist}</p>
        <p className="text-sm text-gray-500 mb-4">{painting.year} • {painting.medium}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Current Bid</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(painting.currentBid)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{painting.bidCount} bids</p>
            {showBidButton && (
              <p className="text-sm text-gray-500">Min: {formatCurrency(painting.minBid)}</p>
            )}
          </div>
        </div>
        
        <div className={`flex gap-2 ${showBidButton ? '' : 'justify-center'}`}>
          <button
            onClick={() => onViewDetails(painting)}
            className={`${showBidButton ? 'flex-1' : 'w-full'} bg-gray-100 text-gray-900 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors`}
          >
            View Details
          </button>
          {showBidButton && onPlaceBid && (
            <button
              onClick={() => onPlaceBid(painting)}
              className="flex-1 bg-blue-900 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-800 transition-colors"
            >
              Place Bid
            </button>
          )}
        </div>
      </div>
    </div>
  );
};