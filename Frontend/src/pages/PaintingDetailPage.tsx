import React from 'react';
import { Painting } from '../types';
import { BiddingPanel } from '../components/BiddingPanel';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';
import { VirtualTourButton } from '../components/VirtualTourButton';
import { BidHistoryPanel } from '../components/BidHistoryPanel';
import { SimilarPaintings } from '../components/SimilarPaintings';
import { WatchlistButton } from '../components/WatchlistButton';
import { PriceAlertModal } from '../components/PriceAlertModal';
import { Bell } from 'lucide-react';

interface PaintingDetailPageProps {
  painting: Painting;
  allPaintings: Painting[];
  isLoggedIn: boolean;
  userWatchlist: number[];
  onBack: () => void;
  onBid: (painting: Painting, amount: number) => void;
  onLogin: () => void;
  onToggleWatchlist: (paintingId: number) => void;
  onSetPriceAlert: (paintingId: number, targetPrice: number) => void;
}

export const PaintingDetailPage: React.FC<PaintingDetailPageProps> = ({
  painting,
  allPaintings,
  isLoggedIn,
  userWatchlist,
  onBack,
  onBid,
  onLogin,
  onToggleWatchlist,
  onSetPriceAlert
}) => {
  const [showPriceAlert, setShowPriceAlert] = React.useState(false);
  const isWatched = userWatchlist.includes(painting.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="mb-6 text-blue-900 hover:text-blue-800 font-medium"
        >
          ← Back to Auctions
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={painting.image} 
                alt={painting.title}
                className="w-full h-96 lg:h-[600px] object-cover"
              />
            </div>
            
            <div className="mt-6 space-y-4">
              <VirtualTourButton 
                tourUrl={painting.virtualTour} 
                paintingTitle={painting.title} 
              />
              
              <div className="flex space-x-4">
                <WatchlistButton
                  paintingId={painting.id}
                  isWatched={isWatched}
                  onToggleWatchlist={onToggleWatchlist}
                  isLoggedIn={isLoggedIn}
                  onLogin={onLogin}
                />
                <button
                  onClick={() => setShowPriceAlert(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span>Price Alert</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 lg:col-span-1">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{painting.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {painting.artist}</p>
              <p className="text-gray-500">{painting.year} • {painting.medium}</p>
              <p className="text-gray-500">{painting.dimensions}</p>
            </div>

            <BiddingPanel
              painting={painting}
              isLoggedIn={isLoggedIn}
              onBid={onBid}
              onLogin={onLogin}
            />

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 mb-4">{painting.description}</p>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-900">Provenance:</span>
                  <span className="text-gray-700 ml-2">{painting.provenance}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Condition:</span>
                  <span className="text-gray-700 ml-2">{painting.condition}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Category:</span>
                  <span className="text-gray-700 ml-2">{painting.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Sections */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AIAnalysisPanel painting={painting} />
          <BidHistoryPanel painting={painting} />
        </div>
        
        <div className="mt-8">
          <SimilarPaintings
            currentPainting={painting}
            allPaintings={allPaintings}
            onViewPainting={(p) => window.location.reload()} // Simple refresh for demo
          />
        </div>
        
        <PriceAlertModal
          isOpen={showPriceAlert}
          onClose={() => setShowPriceAlert(false)}
          paintingTitle={painting.title}
          currentPrice={painting.currentBid}
          onSetAlert={(price) => onSetPriceAlert(painting.id, price)}
        />
      </div>
    </div>
  );
};