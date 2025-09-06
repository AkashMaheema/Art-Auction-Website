export type AuctionStatus = 'draft' | 'scheduled' | 'live' | 'paused' | 'ended' | 'cancelled';

export interface Auction {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  paintingIds: number[];
  totalBidders: number;
  totalRevenue: number;
  reservePrice: number;
  incrementAmount: number;
  maxBidIncrement: number;
  featured: boolean;
  allowAbsenteeBids: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionBid {
  id: number;
  auctionId: number;
  paintingId: number;
  userId: number;
  userName: string;
  amount: number;
  timestamp: string;
  isAbsentee: boolean;
  isWinning: boolean;
}

export interface AuctionEvent {
  id: number;
  auctionId: number;
  type: 'start' | 'pause' | 'resume' | 'end' | 'bid_placed' | 'item_sold';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}