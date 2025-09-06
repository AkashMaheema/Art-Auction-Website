import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react';
import { Painting } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface PaintingManagerProps {
  paintings: Painting[];
  onCreatePainting: (painting: Omit<Painting, 'id'>) => boolean;
  onUpdatePainting: (id: number, updates: Partial<Painting>) => boolean;
  onDeletePainting: (id: number) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

export const PaintingManager: React.FC<PaintingManagerProps> = ({
  paintings,
  onCreatePainting,
  onUpdatePainting,
  onDeletePainting,
  hasPermission
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredPaintings = paintings.filter(painting => {
    const matchesSearch = painting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         painting.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || painting.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (formData: any) => {
    const paintingData = {
      ...formData,
      bidHistory: [],
      watchedBy: 0,
      similarPaintings: []
    };

    if (editingPainting) {
      onUpdatePainting(editingPainting.id, paintingData);
    } else {
      onCreatePainting(paintingData);
    }
    
    setShowForm(false);
    setEditingPainting(null);
  };

  const handleEdit = (painting: Painting) => {
    setEditingPainting(painting);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this painting?')) {
      onDeletePainting(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Painting Management</h2>
          <p className="text-gray-600">Manage auction paintings and artwork</p>
        </div>
        {hasPermission('paintings', 'create') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Painting</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search paintings or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Contemporary">Contemporary</option>
              <option value="Abstract">Abstract</option>
              <option value="Portrait">Portrait</option>
              <option value="Landscape">Landscape</option>
              <option value="Still Life">Still Life</option>
              <option value="Digital">Digital</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paintings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artwork
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Bid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPaintings.map((painting) => (
                <tr key={painting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={painting.image}
                        alt={painting.title}
                        className="h-12 w-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{painting.title}</div>
                        <div className="text-sm text-gray-500">{painting.year}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {painting.artist}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {painting.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(painting.currentBid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      painting.featured 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {painting.featured ? 'Featured' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {hasPermission('paintings', 'update') && (
                        <button
                          onClick={() => handleEdit(painting)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('paintings', 'delete') && (
                        <button
                          onClick={() => handleDelete(painting.id)}
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
      </div>

      {/* Form Modal */}
      {showForm && (
        <PaintingForm
          painting={editingPainting}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPainting(null);
          }}
        />
      )}
    </div>
  );
};

// Painting Form Component
const PaintingForm: React.FC<{
  painting: Painting | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ painting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: painting?.title || '',
    artist: painting?.artist || '',
    year: painting?.year || new Date().getFullYear(),
    medium: painting?.medium || '',
    dimensions: painting?.dimensions || '',
    currentBid: painting?.currentBid || 0,
    minBid: painting?.minBid || 0,
    bidCount: painting?.bidCount || 0,
    timeLeft: painting?.timeLeft || '24h 00m',
    image: painting?.image || '',
    description: painting?.description || '',
    provenance: painting?.provenance || '',
    condition: painting?.condition || 'Excellent',
    category: painting?.category || 'Contemporary',
    featured: painting?.featured || false,
    estimate: {
      low: painting?.estimate?.low || 0,
      high: painting?.estimate?.high || 0
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            {painting ? 'Edit Painting' : 'Add New Painting'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Artist</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({...formData, artist: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medium</label>
              <input
                type="text"
                value={formData.medium}
                onChange={(e) => setFormData({...formData, medium: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Contemporary">Contemporary</option>
                <option value="Abstract">Abstract</option>
                <option value="Portrait">Portrait</option>
                <option value="Landscape">Landscape</option>
                <option value="Still Life">Still Life</option>
                <option value="Digital">Digital</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Bid ($)</label>
              <input
                type="number"
                value={formData.currentBid}
                onChange={(e) => setFormData({...formData, currentBid: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Bid ($)</label>
              <input
                type="number"
                value={formData.minBid}
                onChange={(e) => setFormData({...formData, minBid: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Featured Painting
            </label>
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
              {painting ? 'Update' : 'Create'} Painting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};