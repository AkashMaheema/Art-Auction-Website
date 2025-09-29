export type AuctionStatus =
  | "Scheduled"
  | "Live"
  | "Paused"
  | "Ended"
  | "Cancelled";

export interface Auction {
  id: number;
  title: string;
  /** ISO string mapped from backend `startsAtUtc` */
  startTime: string;
  /** ISO string mapped from backend `endsAtUtc` */
  endTime: string;
  status: AuctionStatus;
  /** From backend `paintingIds` */
  paintingIds: number[];
  /** Optional (backend `description` is nullable) */
  description?: string | null;
}

export interface AuctionBid {
  id: number;
  auctionId: number;
  paintingId: number;
  /** Backend user id is a GUID string */
  userId: string;
  amount: number;
  /** ISO string mapped from backend `CreatedAtUtc` */
  timestamp: string;
}
