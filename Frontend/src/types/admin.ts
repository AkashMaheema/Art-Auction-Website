export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermission[];
  lastLogin: string;
  isActive: boolean;
}

export interface AdminPermission {
  resource: 'paintings' | 'artists' | 'users' | 'auctions' | 'bids';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface AdminStats {
  totalPaintings: number;
  totalArtists: number;
  totalUsers: number;
  totalBids: number;
  totalRevenue: number;
  activeBidders: number;
  pendingApprovals: number;
}

export interface AuditLog {
  id: number;
  adminId: number;
  adminName: string;
  action: string;
  resource: string;
  resourceId: number;
  timestamp: string;
  details: string;
}