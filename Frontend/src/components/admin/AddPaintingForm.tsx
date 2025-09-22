import React, { useMemo, useState } from "react";
import api from "../../utils/api";

type AddPaintingFormProps = {
  onCreated?: (created: any) => void; // receives the created PaintingDto from backend
  onCancel?: () => void;
};

type FormState = {
  title: string;
  artist: string;
  category: string;
  description: string;
  imageUrl: string;
  minBid: string; // keep as string in form, convert to number on submit
  featured: boolean;

  year: string;
  medium: string;
  dimensions: string;
  condition: string;
  estimateLow: string;
  estimateHigh: string;
};

const initialState: FormState = {
  title: "",
  artist: "",
  category: "General",
  description: "",
  imageUrl: "",
  minBid: "",
  featured: false,

  year: "",
  medium: "",
  dimensions: "",
  condition: "",
  estimateLow: "",
  estimateHigh: "",
};

export const AddPaintingForm: React.FC<AddPaintingFormProps> = ({
  onCreated,
  onCancel,
}) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canPreview = useMemo(
    () => form.imageUrl.trim().startsWith("http"),
    [form.imageUrl]
  );

  const validate = (): string | null => {
    if (!form.title.trim()) return "Title is required.";
    if (!form.artist.trim()) return "Artist is required.";
    if (!form.minBid || isNaN(Number(form.minBid)) || Number(form.minBid) < 0)
      return "Min Bid must be a non-negative number.";

    if (form.year) {
      const y = Number(form.year);
      if (isNaN(y) || y < 1000 || y > 3000)
        return "Year must be between 1000 and 3000.";
    }

    const low = form.estimateLow ? Number(form.estimateLow) : undefined;
    const high = form.estimateHigh ? Number(form.estimateHigh) : undefined;
    if ((low && isNaN(low)) || (high && isNaN(high)))
      return "Estimate values must be numbers.";
    if (low !== undefined && high !== undefined && low > high)
      return "Estimate low cannot be greater than estimate high.";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        artist: form.artist.trim(),
        category: form.category.trim() || "General",
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        minBid: Number(form.minBid),
        featured: form.featured,

        year: form.year ? Number(form.year) : undefined,
        medium: form.medium.trim() || undefined,
        dimensions: form.dimensions.trim() || undefined,
        condition: form.condition.trim() || undefined,
        estimateLow: form.estimateLow ? Number(form.estimateLow) : undefined,
        estimateHigh: form.estimateHigh ? Number(form.estimateHigh) : undefined,
      };
      console.log("Submitting painting with payload:", payload);
      // NOTE: baseURL of `api` should already include `/api`
      const res = await api.post("/paintings", payload);
      setSuccess("Painting created successfully.");
      setForm(initialState);
      onCreated?.(res.data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to create painting.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Add Painting</h3>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artist
            </label>
            <input
              type="text"
              value={form.artist}
              onChange={(e) => set("artist", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="General"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Bid
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.minBid}
              onChange={(e) => set("minBid", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="featured"
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="text-sm text-gray-700">
              Featured
            </label>
          </div>
        </div>

        {/* Row 3 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Row 4 — image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {canPreview && (
            <img
              src={form.imageUrl}
              alt="Preview"
              className="mt-3 h-40 w-full object-cover rounded-md border"
              onError={(e) =>
                ((e.currentTarget as HTMLImageElement).style.display = "none")
              }
            />
          )}
        </div>

        {/* Row 5 — extra metadata */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              placeholder="2023"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medium
            </label>
            <input
              type="text"
              value={form.medium}
              onChange={(e) => set("medium", e.target.value)}
              placeholder="Oil on canvas"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dimensions
            </label>
            <input
              type="text"
              value={form.dimensions}
              onChange={(e) => set("dimensions", e.target.value)}
              placeholder="36 x 48 inches"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <input
              type="text"
              value={form.condition}
              onChange={(e) => set("condition", e.target.value)}
              placeholder="Excellent"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Row 6 — estimate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimate (Low)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.estimateLow}
              onChange={(e) => set("estimateLow", e.target.value)}
              placeholder="12000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimate (High)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.estimateHigh}
              onChange={(e) => set("estimateHigh", e.target.value)}
              placeholder="18000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-blue-900 text-white font-medium hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Save Painting"}
          </button>
        </div>
      </form>
    </div>
  );
};
