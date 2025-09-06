import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Play, Pause, Clock, Users, DollarSign, Eye, Calendar } from 'lucide-react';
import { Painting } from '../../types';
import { Auction, AuctionStatus } from '../../types/auction';
import { formatCurrency } from '../../utils/currency';

interface AuctionManagerProps {
  auctions: Auction[];
  paintings: Painting[];
  onCreateAuction: (auction: Omit<Auction, 'id'>) => boolean;
  onUpdateAuction: (id: number, updates: Partial<Auction>) => boolean;
  onDeleteAuction: (id: number) => boolean;
  onStartAuction: (id: number) => boolean;
  onPauseAuction: (id: number) => boolean;
  onEndAuction: (id: number) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

export const AuctionManager: React.FC<AuctionManagerProps> = ({
  auctions,
  paintings,
  onCreateAuction,
  onUpdateAuction,
  onDeleteAuction,
  onStartAuction,
  onPauseAuction,
  onEndAuction,
  hasPermission
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AuctionStatus | 'all'>('all');
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || auction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: AuctionStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'ended': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (formData: any) => {
    if (editingAuction) {
      onUpdateAuction(editingAuction.id, formData);
    } else {
      onCreateAuction(formData);
    }
    
    setShowForm(false);
    setEditingAuction(null);
  };

  const handleEdit = (auction: Auction) => {
    setEditingAuction(auction);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this auction?')) {
      onDeleteAuction(id);
    }
  };

  const handleStatusAction = (auction: Auction, action: 'start' | 'pause' | 'end') => {
    switch (action) {
      case 'start':
        onStartAuction(auction.id);
        break;
      case 'pause':
        onPauseAuction(auction.id);
        break;
      case 'end':
        onEndAuction(auction.id);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Auction Management</h2>
          <p className="text-gray-600">Create and manage live auctions</p>
        </div>
        {hasPermission('auctions', 'create') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Auction</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Live Auctions</p>
              <p className="text-2xl font-bold text-green-600">
                {auctions.filter(a => a.status === 'live').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Play className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {auctions.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bidders</p>
              <p className="text-2xl font-bold text-purple-600">
                {auctions.reduce((sum, a) => sum + a.totalBidders, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(auctions.reduce((sum, a) => sum + a.totalRevenue, 0))}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AuctionStatus | 'all')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Auctions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bidders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAuctions.map((auction) => (
                <tr key={auction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{auction.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{auction.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(auction.status)}`}>
                      {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Start: {new Date(auction.startTime).toLocaleDateString()}</div>
                      <div className="text-gray-500">End: {new Date(auction.endTime).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {auction.paintingIds.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {auction.totalBidders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(auction.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedAuction(auction)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {auction.status === 'scheduled' && hasPermission('auctions', 'update') && (
                        <button
                          onClick={() => handleStatusAction(auction, 'start')}
                          className="text-green-600 hover:text-green-900"
                          title="Start Auction"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      
                      {auction.status === 'live' && hasPermission('auctions', 'update') && (
                        <button
                          onClick={() => handleStatusAction(auction, 'pause')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Pause Auction"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      )}
                      
                      {hasPermission('auctions', 'update') && (
                        <button
                          onClick={() => handleEdit(auction)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      
                      {hasPermission('auctions', 'delete') && auction.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(auction.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAuctions.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No auctions found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <AuctionForm
          auction={editingAuction}
          paintings={paintings}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAuction(null);
          }}
        />
      )}

      {/* Auction Detail Modal */}
      {selectedAuction && (
        <AuctionDetailModal
          auction={selectedAuction}
          paintings={paintings}
          onClose={() => setSelectedAuction(null)}
        />
      )}
    </div>
  );
};

// Auction Form Component
const AuctionForm: React.FC<{
  auction: Auction | null;
  paintings: Painting[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ auction, paintings, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: auction?.title || '',
    description: auction?.description || '',
    startTime: auction?.startTime || new Date().toISOString().slice(0, 16),
    endTime: auction?.endTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    paintingIds: auction?.paintingIds || [],
    reservePrice: auction?.reservePrice || 0,
    incrementAmount: auction?.incrementAmount || 100,
    status: auction?.status || 'draft' as AuctionStatus,
    featured: auction?.featured || false,
    allowAbsenteeBids: auction?.allowAbsenteeBids || true,
    maxBidIncrement: auction?.maxBidIncrement || 10000
  });

  const availablePaintings = paintings.filter(p => 
    !auction || auction.paintingIds.includes(p.id) || !paintings.some(other => other.id === p.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalBidders: auction?.totalBidders || 0,
      totalRevenue: auction?.totalRevenue || 0,
      createdAt: auction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handlePaintingToggle = (paintingId: number) => {
    setFormData(prev => ({
      ...prev,
      paintingIds: prev.paintingIds.includes(paintingId)
        ? prev.paintingIds.filter(id => id !== paintingId)
        : [...prev.paintingIds, paintingId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            {auction ? 'Edit Auction' : 'Create New Auction'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as AuctionStatus})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="paused">Paused</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reserve Price ($)</label>
              <input
                type="number"
                value={formData.reservePrice}
                onChange={(e) => setFormData({...formData, reservePrice: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bid Increment ($)</label>
              <input
                type="number"
                value={formData.incrementAmount}
                onChange={(e) => setFormData({...formData, incrementAmount: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Bid Increment ($)</label>
              <input
                type="number"
                value={formData.maxBidIncrement}
                onChange={(e) => setFormData({...formData, maxBidIncrement: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Paintings</label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availablePaintings.map((painting) => (
                  <label key={painting.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={formData.paintingIds.includes(painting.id)}
                      onChange={() => handlePaintingToggle(painting.id)}
                      className="rounded"
                    />
                    <img src={painting.image} alt={painting.title} className="w-8 h-8 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{painting.title}</p>
                      <p className="text-xs text-gray-500">{painting.artist}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{formData.paintingIds.length} paintings selected</p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Featured Auction
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowAbsenteeBids"
                checked={formData.allowAbsenteeBids}
                onChange={(e) => setFormData({...formData, allowAbsenteeBids: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="allowAbsenteeBids" className="text-sm font-medium text-gray-700">
                Allow Absentee Bids
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {auction ? 'Update' : 'Create'} Auction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Auction Detail Modal Component
const AuctionDetailModal: React.FC<{
  auction: Auction;
  paintings: Painting[];
  onClose: () => void;
}> = ({ auction, paintings, onClose }) => {
  const auctionPaintings = paintings.filter(p => auction.paintingIds.includes(p.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{auction.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Auction Details</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(auction.status)}`}>{auction.status}</span></div>
                <div><span className="font-medium">Start:</span> {new Date(auction.startTime).toLocaleString()}</div>
                <div><span className="font-medium">End:</span> {new Date(auction.endTime).toLocaleString()}</div>
                <div><span className="font-medium">Reserve Price:</span> {formatCurrency(auction.reservePrice)}</div>
                <div><span className="font-medium">Bid Increment:</span> {formatCurrency(auction.incrementAmount)}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Total Bidders:</span> {auction.totalBidders}</div>
                <div><span className="font-medium">Total Revenue:</span> {formatCurrency(auction.totalRevenue)}</div>
                <div><span className="font-medium">Items:</span> {auction.paintingIds.length}</div>
                <div><span className="font-medium">Featured:</span> {auction.featured ? 'Yes' : 'No'}</div>
                <div><span className="font-medium">Absentee Bids:</span> {auction.allowAbsenteeBids ? 'Allowed' : 'Not Allowed'}</div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-700">{auction.description}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Auction Items ({auctionPaintings.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctionPaintings.map((painting) => (
                <div key={painting.id} className="border rounded-lg p-3">
                  <img src={painting.image} alt={painting.title} className="w-full h-32 object-cover rounded mb-2" />
                  <h5 className="font-medium text-sm">{painting.title}</h5>
                  <p className="text-xs text-gray-600">{painting.artist}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(painting.currentBid)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function getStatusColor(status: AuctionStatus) {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'live': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'ended': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
};