import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Search, Filter, Eye } from "lucide-react";
import { Painting } from "../../types";
import api from "../../utils/api";

interface PaintingManagerProps {
  paintings: Painting[];
  onCreatePainting: (
    painting: Omit<Painting, "id"> & { artistId: number }
  ) => Promise<boolean>;
  onUpdatePainting: (
    id: number,
    updates: Partial<Painting> & { artistId?: number }
  ) => Promise<boolean>;
  onDeletePainting: (id: number) => Promise<boolean>;
  hasPermission: (resource: string, action: string) => boolean;
}

type ArtistOption = { id: number; name: string };

export const PaintingManager: React.FC<PaintingManagerProps> = ({
  paintings,
  onCreatePainting,
  onUpdatePainting,
  onDeletePainting,
  hasPermission,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredPaintings = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return paintings.filter((painting) => {
      const matchesSearch =
        painting.title.toLowerCase().includes(term) ||
        (painting.artist ?? "").toLowerCase().includes(term);
      const matchesCategory =
        filterCategory === "all" || painting.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [paintings, searchTerm, filterCategory]);

  const handleSubmit = (formData: PaintingFormState) => {
    // Payload expected by backend create/update:
    const payload = {
      title: formData.title.trim(),
      artistId: formData.artistId!, // validated as required
      year: formData.year,
      medium: formData.medium.trim(),
      dimensions: formData.dimensions.trim(),
      minBid: formData.minBid,
      imageUrl: formData.imageUrl.trim(),
      description: formData.description.trim(),
      condition: formData.condition.trim(),
      category: formData.category,
      featured: formData.featured,
      estimate: {
        low: formData.estimate.low,
        high: formData.estimate.high,
      },
    };

    console.log("Submitting painting:", payload);
    if (editingPainting) {
      // update
      onUpdatePainting(editingPainting.id, payload as any);
    } else {
      // create
      onCreatePainting(payload as any);
    }

    setShowForm(false);
    setEditingPainting(null);
  };

  const handleEdit = (painting: Painting) => {
    setEditingPainting(painting);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this painting?")) {
      onDeletePainting(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Painting Management
          </h2>
          <p className="text-gray-600">Manage auction paintings and artwork</p>
        </div>
        {hasPermission("paintings", "create") && (
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
                  Minimum Bid
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
                      {painting.imageUrl ? (
                        <img
                          src={painting.imageUrl}
                          alt={painting.title}
                          className="h-12 w-12 rounded-lg object-cover mr-4"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 mr-4" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {painting.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {painting.year}
                        </div>
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
                    {painting.minBid?.toLocaleString?.() ?? painting.minBid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        painting.featured
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {painting.featured ? "Featured" : "Active"}
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
                      {hasPermission("paintings", "update") && (
                        <button
                          onClick={() => handleEdit(painting)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission("paintings", "delete") && (
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
              {filteredPaintings.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No paintings found.
                  </td>
                </tr>
              )}
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

/* =========================
   Painting Form
========================= */

type PaintingFormState = {
  title: string;
  artistId?: number; // required
  year: number;
  medium: string;
  dimensions: string;
  minBid: number;
  imageUrl: string;
  description: string;
  condition: string;
  category: string;
  featured: boolean;
  estimate: { low: number; high: number };
};

const PaintingForm: React.FC<{
  painting: Painting | null;
  onSubmit: (data: PaintingFormState) => void;
  onCancel: () => void;
}> = ({ painting, onSubmit, onCancel }) => {
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);

  const [formData, setFormData] = useState<PaintingFormState>({
    title: painting?.title || "",
    // If your Painting type has artistId, use it here:
    artistId: (painting as any)?.artistId ?? undefined,
    year: painting?.year || new Date().getFullYear(),
    medium: painting?.medium || "",
    dimensions: painting?.dimensions || "",
    minBid: (painting as any)?.minBid ?? 0,
    imageUrl: (painting as any)?.imageUrl || "",
    description: (painting as any)?.description || "",
    condition: (painting as any)?.condition || "Excellent",
    category: painting?.category || "Contemporary",
    featured: (painting as any)?.featured || false,
    estimate: {
      low: (painting as any)?.estimate?.low ?? 0,
      high: (painting as any)?.estimate?.high ?? 0,
    },
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingArtists(true);
      try {
        const res = await api.get<ArtistOption[]>("/artists");
        if (alive) setArtists(res.data);
      } catch (e) {
        console.error("Failed to load artists", e);
      } finally {
        if (alive) setLoadingArtists(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.artistId) {
      alert("Please select an artist");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            {painting ? "Edit Painting" : "Add New Painting"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Artist (dropdown) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artist
              </label>
              <select
                value={formData.artistId ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    artistId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="" disabled>
                  {loadingArtists ? "Loading artists..." : "Select an artist"}
                </option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              {formData.artistId && (
                <p className="mt-1 text-xs text-gray-500">
                  Selected:{" "}
                  {artists.find((a) => a.id === formData.artistId)?.name}
                </p>
              )}
            </div>
          </div>

          {/* Year, Medium, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: parseInt(e.target.value || "0", 10),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medium
              </label>
              <input
                type="text"
                value={formData.medium}
                onChange={(e) =>
                  setFormData({ ...formData, medium: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
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

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Dimensions / MinBid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) =>
                  setFormData({ ...formData, dimensions: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 36 x 48 inches"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Bid ($)
              </label>
              <input
                type="number"
                value={formData.minBid}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minBid: parseFloat(e.target.value || "0"),
                  })
                }
                min={0}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Condition / Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <input
                type="text"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="mr-2"
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium text-gray-700"
              >
                Featured Painting
              </label>
            </div>
          </div>

          {/* Estimate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimate Low ($)
              </label>
              <input
                type="number"
                value={formData.estimate.low}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimate: {
                      ...formData.estimate,
                      low: parseFloat(e.target.value || "0"),
                    },
                  })
                }
                min={0}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimate High ($)
              </label>
              <input
                type="number"
                value={formData.estimate.high}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimate: {
                      ...formData.estimate,
                      high: parseFloat(e.target.value || "0"),
                    },
                  })
                }
                min={0}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
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
              {painting ? "Update" : "Create"} Painting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
