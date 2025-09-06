import React, { useState } from 'react';
import { Clock, TrendingUp, Users } from 'lucide-react';
import { Painting } from '../types';
import { formatCurrency } from '../utils/currency';

interface BidHistoryPanelProps {
  painting: Painting;
}

export const BidHistoryPanel: React.FC<BidHistoryPanelProps> = ({ painting }) => {
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  const displayedBids = showFullHistory ? painting.bidHistory : painting.bidHistory.slice(-3);
  const sortedBids = [...displayedBids].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Bidding Activity</h3>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          {painting.watchedBy} watching
        </div>
      </div>

      <div className="space-y-3">
        {sortedBids.map((bid, index) => (
          <div key={bid.id} className={`flex items-center justify-between p-3 rounded-lg ${
            index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                index === 0 ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div>
                <p className="font-medium text-gray-900">{bid.userName}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(bid.timestamp)}
                </div>
              </div>
            </div>
            <div className={`text-lg font-bold ${
              index === 0 ? 'text-green-600' : 'text-gray-900'
            }`}>
              {formatCurrency(bid.amount)}
            </div>
          </div>
        ))}
      </div>

      {painting.bidHistory.length > 3 && (
        <button
          onClick={() => setShowFullHistory(!showFullHistory)}
          className="w-full mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          {showFullHistory ? 'Show Less' : `Show All ${painting.bidHistory.length} Bids`}
        </button>
      )}
    </div>
  );
};