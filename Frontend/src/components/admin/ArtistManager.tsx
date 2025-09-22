import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, Award } from "lucide-react";
import { Artist } from "../../types";
import { formatCurrency } from "../../utils/currency";

interface ArtistManagerProps {
  artists: Artist[];
  onCreateArtist: (artist: Omit<Artist, "id">) => Promise<boolean>;
  onUpdateArtist: (id: number, updates: Partial<Artist>) => Promise<boolean>;
  onDeleteArtist: (id: number) => Promise<boolean>;
  hasPermission: (resource: string, action: string) => boolean;
}

export const ArtistManager: React.FC<ArtistManagerProps> = ({
  artists,
  onCreateArtist,
  onUpdateArtist,
  onDeleteArtist,
  hasPermission,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArtists = artists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.style.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (formData: any) => {
    if (editingArtist) {
      onUpdateArtist(editingArtist.id, formData);
    } else {
      onCreateArtist(formData);
    }

    setShowForm(false);
    setEditingArtist(null);
  };

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this artist?")) {
      onDeleteArtist(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Artist Management
          </h2>
          <p className="text-gray-600">
            Manage featured artists and their profiles
          </p>
        </div>
        {hasPermission("artists", "create") && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Artist</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search artists by name, nationality, or style..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <div
            key={artist.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={artist.image}
              alt={artist.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {artist.name}
                </h3>
                <div className="flex items-center space-x-2">
                  {artist.verified && (
                    <Award
                      className="h-5 w-5 text-blue-500"
                      title="Verified Artist"
                    />
                  )}
                  {artist.trending && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Trending
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-2">{artist.nationality}</p>
              <p className="text-sm text-gray-500 mb-3">
                {artist.birthYear}
                {artist.deathYear ? ` - ${artist.deathYear}` : " - Present"}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Style:</span>
                  <span className="font-medium">{artist.style}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Avg. Price:</span>
                  <span className="font-medium">
                    {formatCurrency(artist.averagePrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Sales:</span>
                  <span className="font-medium">
                    {formatCurrency(artist.totalSales)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {artist.bio}
              </p>

              <div className="flex space-x-2">
                {hasPermission("artists", "update") && (
                  <button
                    onClick={() => handleEdit(artist)}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center justify-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
                {hasPermission("artists", "delete") && (
                  <button
                    onClick={() => handleDelete(artist.id)}
                    className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ArtistForm
          artist={editingArtist}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingArtist(null);
          }}
        />
      )}
    </div>
  );
};

// Artist Form Component
const ArtistForm: React.FC<{
  artist: Artist | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ artist, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: artist?.name || "",
    bio: artist?.bio || "",
    image: artist?.image || "",
    nationality: artist?.nationality || "",
    birthYear: artist?.birthYear || new Date().getFullYear() - 30,
    deathYear: artist?.deathYear || undefined,
    style: artist?.style || "",
    verified: artist?.verified || false,
    totalSales: artist?.totalSales || 0,
    averagePrice: artist?.averagePrice || 0,
    trending: artist?.trending || false,
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
            {artist ? "Edit Artist" : "Add New Artist"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biography
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth Year
              </label>
              <input
                type="number"
                value={formData.birthYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    birthYear: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Death Year (Optional)
              </label>
              <input
                type="number"
                value={formData.deathYear || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deathYear: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <input
                type="text"
                value={formData.style}
                onChange={(e) =>
                  setFormData({ ...formData, style: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Sales ($)
              </label>
              <input
                type="number"
                value={formData.totalSales}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalSales: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Price ($)
              </label>
              <input
                type="number"
                value={formData.averagePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    averagePrice: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verified"
                checked={formData.verified}
                onChange={(e) =>
                  setFormData({ ...formData, verified: e.target.checked })
                }
                className="mr-2"
              />
              <label
                htmlFor="verified"
                className="text-sm font-medium text-gray-700"
              >
                Verified Artist
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="trending"
                checked={formData.trending}
                onChange={(e) =>
                  setFormData({ ...formData, trending: e.target.checked })
                }
                className="mr-2"
              />
              <label
                htmlFor="trending"
                className="text-sm font-medium text-gray-700"
              >
                Trending
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
              {artist ? "Update" : "Create"} Artist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
