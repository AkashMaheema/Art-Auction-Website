import { AdminUser, AdminStats, AuditLog } from '../types/admin';

export const adminUsers: AdminUser[] = [
  {
    id: 1,
    email: 'admin@artauction.com',
    name: 'John Admin',
    role: 'super_admin',
    permissions: [
      { resource: 'paintings', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'artists', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'auctions', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'bids', actions: ['read', 'update', 'delete'] }
    ],
    lastLogin: '2024-01-15T10:30:00Z',
    isActive: true
  }
];

export const adminStats: AdminStats = {
  totalPaintings: 156,
  totalArtists: 43,
  totalUsers: 2847,
  totalBids: 12456,
  totalRevenue: 2450000,
  activeBidders: 234,
  pendingApprovals: 8
};

export const auditLogs: AuditLog[] = [
  {
    id: 1,
    adminId: 1,
    adminName: 'John Admin',
    action: 'CREATE',
    resource: 'painting',
    resourceId: 7,
    timestamp: '2024-01-15T14:30:00Z',
    details: 'Added new painting: Digital Dreams by Alex Rivera'
  },
  {
    id: 2,
    adminId: 1,
    adminName: 'John Admin',
    action: 'UPDATE',
    resource: 'artist',
    resourceId: 2,
    timestamp: '2024-01-15T13:15:00Z',
    details: 'Updated artist bio for Marcus Chen'
  },
  {
    id: 3,
    adminId: 1,
    adminName: 'John Admin',
    action: 'DELETE',
    resource: 'painting',
    resourceId: 12,
    timestamp: '2024-01-15T12:00:00Z',
    details: 'Removed painting: Sunset Valley (sold)'
  }
];