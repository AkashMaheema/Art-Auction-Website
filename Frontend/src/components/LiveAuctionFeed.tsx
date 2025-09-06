import React, { useState, useEffect } from 'react';
import { Radio, Clock, Gavel } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface LiveBidUpdate {
  id: number;
  paintingTitle: string;
  bidAmount: number;
  bidder: string;
  timestamp: string;
}

export const LiveAuctionFeed: React.FC = () => {
  const [liveBids, setLiveBids] = useState<LiveBidUpdate[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Simulate live bid updates
  useEffect(() => {
    if (!isLive) return;

    const mockBids: LiveBidUpdate[] = [
      { id: 1, paintingTitle: "Autumn Reflections", bidAmount: 15500, bidder: "ArtCollector_2024", timestamp: new Date().toISOString() },
      { id: 2, paintingTitle: "Urban Symphony", bidAmount: 9200, bidder: "ModernArt_Fan", timestamp: new Date(Date.now() - 30000).toISOString() },
      { id: 3, paintingTitle: "Portrait of a Lady", bidAmount: 23500, bidder: "ClassicArt_Expert", timestamp: new Date(Date.now() - 60000).toISOString() },
    ];

    setLiveBids(mockBids);

    const interval = setInterval(() => {
      const randomBid: LiveBidUpdate = {
        id: Date.now(),
        paintingTitle: ["Autumn Reflections", "Urban Symphony", "Portrait of a Lady"][Math.floor(Math.random() * 3)],
        bidAmount: Math.floor(Math.random() * 50000) + 5000,
        bidder: ["ArtLover123", "Collector_NY", "ModernArt_Fan", "ClassicArt_Expert"][Math.floor(Math.random() * 4)],
        timestamp: new Date().toISOString()
      };

      setLiveBids(prev => [randomBid, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const bidTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - bidTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <Radio className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Live Auction Feed</h3>
          </div>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isLive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isLive ? 'LIVE' : 'PAUSED'}
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {liveBids.map((bid) => (
          <div key={bid.id} className="flex items-center p-3 bg-gray-50 rounded-lg animate-fade-in">
            <Gavel className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {bid.paintingTitle}
              </p>
              <p className="text-xs text-gray-500">by {bid.bidder}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">
                {formatCurrency(bid.bidAmount)}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(bid.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};