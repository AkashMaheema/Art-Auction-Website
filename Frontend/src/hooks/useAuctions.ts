import { useState } from 'react';
import { Auction, AuctionStatus } from '../types/auction';
import { auctions as initialAuctions } from '../data/auctions';

export const useAuctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>(initialAuctions);

  const createAuction = (auctionData: Omit<Auction, 'id'>) => {
    const newAuction: Auction = {
      ...auctionData,
      id: Math.max(...auctions.map(a => a.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setAuctions(prev => [...prev, newAuction]);
    return true;
  };

  const updateAuction = (id: number, updates: Partial<Auction>) => {
    setAuctions(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    ));
    return true;
  };

  const deleteAuction = (id: number) => {
    setAuctions(prev => prev.filter(a => a.id !== id));
    return true;
  };

  const startAuction = (id: number) => {
    return updateAuction(id, { status: 'live' as AuctionStatus });
  };

  const pauseAuction = (id: number) => {
    return updateAuction(id, { status: 'paused' as AuctionStatus });
  };

  const endAuction = (id: number) => {
    return updateAuction(id, { status: 'ended' as AuctionStatus });
  };

  return {
    auctions,
    createAuction,
    updateAuction,
    deleteAuction,
    startAuction,
    pauseAuction,
    endAuction
  };
};