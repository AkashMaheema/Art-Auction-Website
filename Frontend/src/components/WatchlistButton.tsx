import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface WatchlistButtonProps {
  paintingId: number;
  isWatched: boolean;
  onToggleWatchlist: (paintingId: number) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  paintingId,
  isWatched,
  onToggleWatchlist,
  isLoggedIn,
  onLogin
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (!isLoggedIn) {
      onLogin();
      return;
    }

    setIsAnimating(true);
    onToggleWatchlist(paintingId);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        isWatched
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${isAnimating ? 'transform scale-110' : ''}`}
    >
      <Heart
        className={`h-5 w-5 transition-all duration-300 ${
          isWatched ? 'fill-current text-red-500' : ''
        } ${isAnimating ? 'animate-pulse' : ''}`}
      />
      <span>{isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
    </button>
  );
};