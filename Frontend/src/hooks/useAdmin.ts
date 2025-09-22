import { useCallback, useEffect, useMemo, useState } from "react";
import type { Painting, Artist } from "../types";
import type { Auction } from "../types/auction";
import type { AdminUser, AdminStats, AuditLog } from "../types/admin";
import { useAuctions } from "./useAuctions";
import api from "../utils/api";

/** ===== Helpers ===== */

type JwtPayload = {
  nameid?: string; // ClaimTypes.NameIdentifier
  unique_name?: string; // ClaimTypes.Name
  email?: string;
  role?: string | string[];
  exp?: number;
  [k: string]: any;
};

function decodeJwt<T = JwtPayload>(token: string): T | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

const isAdminRole = (role?: string | string[]) => {
  if (!role) return false;
  if (Array.isArray(role)) return role.some((r) => r.toLowerCase() === "admin");
  return role.toLowerCase() === "admin";
};

/** Backend DTO for /paintings */
type PaintingDto = {
  id: number;
  title: string;
  artist: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  minBid: number;
  featured: boolean;
  year?: number | null;
  medium?: string | null;
  dimensions?: string | null;
  condition?: string | null;
  estimateLow?: number | null;
  estimateHigh?: number | null;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
};

const mapDtoToPainting = (dto: PaintingDto): Painting => ({
  id: dto.id,
  title: dto.title,
  artist: dto.artist,
  year: dto.year ?? 0,
  medium: dto.medium ?? "",
  dimensions: dto.dimensions ?? "",

  // UI-only fields – set safe defaults until bids feature arrives
  minBid: dto.minBid,

  imageUrl: dto.imageUrl ?? "",
  description: dto.description ?? "",
  condition: dto.condition ?? "",
  estimate: {
    low: dto.estimateLow ?? 0,
    high: dto.estimateHigh ?? 0,
  },
  category: dto.category ?? "General",
  featured: dto.featured ?? false,
});

/** ===== Hook ===== */

export const useAdmin = () => {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]); // TODO: hook up when /artists exists
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalPaintings: 0,
    totalArtists: 0,
    totalUsers: 0,
    totalBids: 0,
    activeBidders: 0,
    pendingApprovals: 0,
  });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Auctions (leave as-is for now; you can wire API later)
  const {
    auctions,
    createAuction: createAuctionHook,
    updateAuction: updateAuctionHook,
    deleteAuction: deleteAuctionHook,
    startAuction,
    pauseAuction,
    endAuction,
  } = useAuctions();

  /** ===== Auth ===== */

  const loginAdmin = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, name, role } = res.data || {};
      if (!token) return false;

      localStorage.setItem("token", token); // api interceptor should pick this up

      const payload = decodeJwt(token) || {};
      const admin: AdminUser = {
        id: Number(payload.nameid || payload.sub || 0),
        email: email,
        name: name || (payload.unique_name as string) || email,
        permissions: [], // optional: fetch from your backend later
        isActive: true,
        role:
          (Array.isArray(role) ? role[0] : role) ||
          (payload.role as string) ||
          "Bidder",
        lastLogin: new Date().toISOString(),
      };

      setCurrentAdmin(admin);
      addAuditLog("LOGIN", "system", 0, `Admin ${admin.name} logged in`);

      // Load data right after login
      await refreshAll();
      return true;
    } catch (err) {
      console.error("Admin login failed:", err);
      return false;
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem("token");
    if (currentAdmin) {
      addAuditLog(
        "LOGOUT",
        "system",
        0,
        `Admin ${currentAdmin.name} logged out`
      );
    }
    setCurrentAdmin(null);
  };

  /** ===== Permissions ===== */

  const hasPermission = (resource: string, action: string): boolean => {
    if (!currentAdmin) return false;
    // Simple rule: Admin => full; others => none (until you model fine-grained perms)
    if (isAdminRole(currentAdmin.role)) return true;
    return false;
  };

  /** ===== Audit log (front-end only for now) ===== */

  const addAuditLog = (
    action: string,
    resource: string,
    resourceId: number,
    details: string
  ) => {
    if (!currentAdmin) return;
    const newLog: AuditLog = {
      id: Date.now(),
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  /** ===== Paintings API ===== */

  const loadPaintings = useCallback(async () => {
    const res = await api.get<PaintingDto[]>("/paintings");
    setPaintings(res.data.map(mapDtoToPainting));
  }, []);

  const createPainting = async (paintingData: Omit<Painting, "id">) => {
    if (!hasPermission("paintings", "create")) return false;

    // Map UI -> API
    const payload = {
      title: paintingData.title,
      artist: paintingData.artist,
      category: paintingData.category || "General",
      description: paintingData.description || undefined,
      imageUrl: paintingData.imageUrl || undefined,
      minBid: paintingData.minBid ?? 0,
      featured: !!paintingData.featured,
      year: paintingData.year ?? undefined,
      medium: paintingData.medium || undefined,
      dimensions: paintingData.dimensions || undefined,
      condition: paintingData.condition || undefined,
      estimateLow: paintingData.estimate?.low ?? undefined,
      estimateHigh: paintingData.estimate?.high ?? undefined,
    };
    console.log("Creating painting with payload:", payload);

    const res = await api.post<PaintingDto>("/paintings", payload);
    const created = mapDtoToPainting(res.data);
    setPaintings((prev) => [created, ...prev]);
    addAuditLog(
      "CREATE",
      "painting",
      created.id,
      `Added painting: ${created.title}`
    );
    recalcStats();
    return true;
  };

  const updatePainting = async (id: number, updates: Partial<Painting>) => {
    if (!hasPermission("paintings", "update")) return false;

    const payload = {
      title: updates.title,
      artist: updates.artist,
      category: updates.category,
      description: updates.description,
      imageUrl: updates.imageUrl,
      minBid: updates.minBid,
      featured: updates.featured,
      year: updates.year,
      medium: updates.medium,
      dimensions: updates.dimensions,
      condition: updates.condition,
      estimateLow: updates.estimate?.low,
      estimateHigh: updates.estimate?.high,
    };
    console.log("Updating painting with payload:", payload);

    await api.put(`/paintings/${id}`, payload);
    setPaintings((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    const p = paintings.find((x) => x.id === id);
    addAuditLog(
      "UPDATE",
      "painting",
      id,
      `Updated painting: ${p?.title ?? id}`
    );
    return true;
  };

  const deletePainting = async (id: number) => {
    if (!hasPermission("paintings", "delete")) return false;

    await api.delete(`/paintings/${id}`);
    const removed = paintings.find((p) => p.id === id);
    setPaintings((prev) => prev.filter((p) => p.id !== id));
    addAuditLog(
      "DELETE",
      "painting",
      id,
      `Deleted painting: ${removed?.title ?? id}`
    );
    recalcStats();
    return true;
  };

  /** ===== Artists (stub until backend exists) ===== */

  const loadArtists = useCallback(async () => {
    // If you add /artists endpoints, replace this with a real call
    setArtists([]);
  }, []);

  const createArtist = async (_artistData: Omit<Artist, "id">) => {
    if (!hasPermission("artists", "create")) return false;
    // TODO: call POST /artists and update state
    return false;
  };

  const updateArtist = async (_id: number, _updates: Partial<Artist>) => {
    if (!hasPermission("artists", "update")) return false;
    // TODO: call PUT /artists/:id and update state
    return false;
  };

  const deleteArtist = async (_id: number) => {
    if (!hasPermission("artists", "delete")) return false;
    // TODO: call DELETE /artists/:id and update state
    return false;
  };

  /** ===== Auctions (using your existing local hook for now) ===== */

  const createAuction = (auctionData: Omit<Auction, "id">) => {
    if (!hasPermission("auctions", "create")) return false;
    const ok = createAuctionHook(auctionData);
    if (ok)
      addAuditLog(
        "CREATE",
        "auction",
        0,
        `Created auction: ${auctionData.title}`
      );
    return ok;
  };

  const updateAuction = (id: number, updates: Partial<Auction>) => {
    if (!hasPermission("auctions", "update")) return false;
    const ok = updateAuctionHook(id, updates);
    if (ok) addAuditLog("UPDATE", "auction", id, `Updated auction #${id}`);
    return ok;
  };

  const deleteAuction = (id: number) => {
    if (!hasPermission("auctions", "delete")) return false;
    const ok = deleteAuctionHook(id);
    if (ok) addAuditLog("DELETE", "auction", id, `Deleted auction #${id}`);
    return ok;
  };

  const startAuctionAdmin = (id: number) => {
    if (!hasPermission("auctions", "update")) return false;
    const ok = startAuction(id);
    if (ok) addAuditLog("UPDATE", "auction", id, `Started auction #${id}`);
    return ok;
  };

  const pauseAuctionAdmin = (id: number) => {
    if (!hasPermission("auctions", "update")) return false;
    const ok = pauseAuction(id);
    if (ok) addAuditLog("UPDATE", "auction", id, `Paused auction #${id}`);
    return ok;
  };

  const endAuctionAdmin = (id: number) => {
    if (!hasPermission("auctions", "update")) return false;
    const ok = endAuction(id);
    if (ok) addAuditLog("UPDATE", "auction", id, `Ended auction #${id}`);
    return ok;
  };

  /** ===== Stats ===== */

  const recalcStats = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      totalPaintings: paintings.length,
      totalArtists: artists.length,
      // Keep others zero until you have backend support (revenue/bids/users)
    }));
  }, [paintings.length, artists.length]);

  /** ===== Bulk refresh ===== */

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadPaintings(), loadArtists()]);
      recalcStats();
    } finally {
      setLoading(false);
    }
  }, [loadPaintings, loadArtists, recalcStats]);

  /** ===== Auto-load when token exists ===== */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = decodeJwt(token);
    if (!payload) return;

    const admin: AdminUser = {
      id: Number(payload.nameid || payload.sub || 0),
      email: (payload.email as string) || "",
      name: (payload.unique_name as string) || "",
      permissions: [],
      isActive: true,
      role:
        payload.role === "super_admin"
          ? "super_admin"
          : payload.role === "admin"
          ? "admin"
          : payload.role === "moderator"
          ? "moderator"
          : "admin",
      lastLogin: "",
    };
    setCurrentAdmin(admin);

    // Preload data
    refreshAll();
  }, [refreshAll]);

  /** ===== Expose API ===== */

  return {
    // Data
    paintings,
    artists,
    auctions,
    stats,
    logs,
    currentAdmin,
    loading,

    // Auth
    loginAdmin,
    logoutAdmin,
    hasPermission,

    // Painting Operations (real API)
    createPainting,
    updatePainting,
    deletePainting,

    // Artist Operations (stubs until backend exists)
    createArtist,
    updateArtist,
    deleteArtist,

    // Auction Operations (local for now)
    createAuction,
    updateAuction,
    deleteAuction,
    startAuction: startAuctionAdmin,
    pauseAuction: pauseAuctionAdmin,
    endAuction: endAuctionAdmin,

    // Utilities
    refreshAll,
  };
};
