import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Painting } from '../types';
import { formatCurrency } from '../utils/currency';

interface BiddingPanelProps {
  painting: Painting;
  isLoggedIn: boolean;
  onBid: (painting: Painting, amount: number) => void;
  onLogin: () => void;
}

export const BiddingPanel: React.FC<BiddingPanelProps> = ({
  painting,
  isLoggedIn,
  onBid,
  onLogin
}) => {
  const [bidAmount, setBidAmount] = useState('');

  const handleBid = () => {
    if (!isLoggedIn) {
      onLogin();
      return;
    }
    
    const bid = parseFloat(bidAmount);
    if (bid >= painting.minBid) {
      onBid(painting, bid);
      setBidAmount('');
    } else {
      alert(`Minimum bid is ${formatCurrency(painting.minBid)}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Current Auction</h3>
        <div className="flex items-center text-red-500 font-medium">
          <Clock className="h-5 w-5 mr-1" />
          {painting.timeLeft}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Current Bid</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(painting.currentBid)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Minimum Bid</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(painting.minBid)}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">Estimate</p>
        <p className="text-lg font-medium text-gray-900">
          {formatCurrency(painting.estimate.low)} - {formatCurrency(painting.estimate.high)}
        </p>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="number"
          placeholder="Enter bid amount"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleBid}
          className="bg-blue-900 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-800 transition-colors"
        >
          Place Bid
        </button>
      </div>
      
      <p className="text-sm text-gray-500">{painting.bidCount} bids placed</p>
    </div>
  );
};