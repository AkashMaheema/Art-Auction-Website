import React from 'react';
import { TrendingUp, Users, Palette, Gavel, DollarSign, Eye, AlertCircle, Activity } from 'lucide-react';
import { AdminStats, AuditLog } from '../../types/admin';
import { formatCurrency } from '../../utils/currency';

interface AdminDashboardProps {
  stats: AdminStats;
  recentLogs: AuditLog[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, recentLogs }) => {
  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%'
    },
    {
      title: 'Active Paintings',
      value: stats.totalPaintings.toString(),
      icon: Palette,
      color: 'bg-blue-500',
      change: '+3.2%'
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-purple-500',
      change: '+8.1%'
    },
    {
      title: 'Total Bids',
      value: stats.totalBids.toLocaleString(),
      icon: Gavel,
      color: 'bg-orange-500',
      change: '+15.3%'
    },
    {
      title: 'Active Bidders',
      value: stats.activeBidders.toString(),
      icon: Activity,
      color: 'bg-red-500',
      change: '+5.7%'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: '-2.1%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  log.action === 'CREATE' ? 'bg-green-500' :
                  log.action === 'UPDATE' ? 'bg-blue-500' :
                  log.action === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {log.adminName}
                  </p>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Palette className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Add Painting</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Add Artist</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <Gavel className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">New Auction</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">View Reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};