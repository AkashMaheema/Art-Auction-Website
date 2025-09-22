export interface Painting {
  id: number;
  title: string;
  artist: string;
  year: number;
  medium: string;
  dimensions: string;
  minBid: number;
  imageUrl: string;
  description: string;
  condition: string;
  estimate: { low: number; high: number };
  category: string;
  featured: boolean;
}

export interface Artist {
  id: number;
  name: string;
  bio: string;
  image: string;
  nationality: string;
  birthYear: number;
  deathYear?: number;
  style: string;
  verified: boolean;
  totalSales: number;
  averagePrice: number;
  trending: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  watchlist: number[];
  bidHistory: BidHistoryEntry[];
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    artists: string[];
  };
}

export interface BidHistoryEntry {
  id: number;
  paintingId: number;
  userId: number;
  amount: number;
  timestamp: string;
  userName: string;
}

export interface Notification {
  id: number;
  type: "bid_outbid" | "auction_ending" | "new_similar" | "price_drop";
  message: string;
  timestamp: string;
  read: boolean;
  paintingId?: number;
}
