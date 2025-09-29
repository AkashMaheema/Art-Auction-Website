import { useCallback, useEffect, useState } from "react";
import type { Painting, Artist } from "../types";
import type { Auction } from "../types/auction";
import type { AdminUser, AdminStats, AuditLog } from "../types/admin";
import api from "../utils/api";

/* =========================
   JWT helpers
========================= */

type JwtPayload = {
  sub?: string;
  nameid?: string;
  unique_name?: string;
  email?: string;
  role?: string | string[];
  exp?: number;
  [k: string]: any;
};

function decodeJwt<T = JwtPayload>(token: string): T | null {
  try {
    const b = token.split(".")[1];
    const json = atob(b.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

const isAdminRole = (role?: string | string[]) => {
  if (!role) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.some((r) => r.toLowerCase() === "admin");
};

/* =========================
   Backend DTOs
========================= */

/** Paintings */
type PaintingDto = {
  id: number;
  title: string;
  artistId: number;
  artistName: string;
  category?: string | null;
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
};

type CreatePaintingPayload = {
  title: string;
  artistId: number;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  minBid: number;
  featured?: boolean;
  year?: number | null;
  medium?: string | null;
  dimensions?: string | null;
  condition?: string | null;
  estimateLow?: number | null;
  estimateHigh?: number | null;
};

type UpdatePaintingPayload = Partial<CreatePaintingPayload>;

/** Artists */
type ArtistDto = {
  id: number;
  name: string;
  bio?: string | null;
  image?: string | null;
  nationality?: string | null;
  birthYear?: number | null;
  style?: string | null;
  verified: boolean;
  totalSales?: number | null;
  averagePrice?: number | null;
  trending: boolean;
};

type CreateArtistPayload = Omit<ArtistDto, "id">;
type UpdateArtistPayload = Partial<CreateArtistPayload>;

/** Auctions */
type AuctionDto = {
  id: number;
  title: string;
  description?: string | null;
  startsAtUtc: string; // ISO
  endsAtUtc: string; // ISO
  status: "Scheduled" | "Live" | "Paused" | "Ended";
  paintingIds: number[];
};

type CreateAuctionPayload = {
  title: string;
  description?: string | null;
  startsAtUtc: string; // ISO
  endsAtUtc: string; // ISO
  paintingIds?: number[];
};

type UpdateAuctionPayload = Partial<CreateAuctionPayload>;
type SetAuctionStatusPayload = { status: AuctionDto["status"] };
type SetAuctionPaintingsPayload = { paintingIds: number[] };

/* =========================
   mappers (server -> UI)
========================= */

const mapPaintingDto = (
  dto: PaintingDto
): Painting & { artistId: number; artistName: string } => ({
  id: dto.id,
  title: dto.title,
  artist: dto.artistName, // keep existing UI field
  artistId: dto.artistId, // extra for admin forms
  artistName: dto.artistName, // extra for display
  year: dto.year ?? 0,
  medium: dto.medium ?? "",
  dimensions: dto.dimensions ?? "",
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

const mapArtistDto = (dto: ArtistDto): Artist => ({
  id: dto.id,
  name: dto.name,
  bio: dto.bio ?? "",
  image: dto.image ?? "",
  nationality: dto.nationality ?? "",
  birthYear: dto.birthYear ?? 0,
  style: dto.style ?? "",
  verified: dto.verified,
  totalSales: dto.totalSales ?? 0,
  averagePrice: dto.averagePrice ?? 0,
  trending: dto.trending,
});

const mapAuctionDto = (
  dto: AuctionDto
): Auction & { paintingIds: number[]; status: AuctionDto["status"] } => ({
  id: dto.id,
  title: dto.title,
  description: dto.description ?? "",
  startTime: dto.startsAtUtc,
  endTime: dto.endsAtUtc,
  // extend with backend fields used in admin screens
  paintingIds: dto.paintingIds ?? [],
  status: dto.status,
});

/* =========================
   Hook
========================= */

export const useAdmin = () => {
  const [paintings, setPaintings] = useState<
    (Painting & { artistId?: number; artistName?: string })[]
  >([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [auctions, setAuctions] = useState<
    (Auction & { paintingIds?: number[]; status?: AuctionDto["status"] })[]
  >([]);
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
  const [loading, setLoading] = useState(false);

  /* ===== Auth ===== */

  const loginAdmin = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, name, role } = res.data || {};
      if (!token) return false;

      localStorage.setItem("token", token);

      const payload = decodeJwt(token) || {};
      const admin: AdminUser = {
        id:
          payload.sub || payload.nameid
            ? Number(payload.sub || payload.nameid)
            : 0,
        email,
        name: (name as string) || (payload.unique_name as string) || email,
        role:
          (Array.isArray(role) ? role[0] : role) ||
          (payload.role as string) ||
          "Bidder",
        permissions: [],
        isActive: true,
        lastLogin: new Date().toISOString(),
      };

      setCurrentAdmin(admin);
      addAuditLog("LOGIN", "system", 0, `Admin ${admin.name} logged in`);

      await refreshAll();
      return true;
    } catch (err) {
      console.error("Admin login failed:", err);
      return false;
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem("token");
    if (currentAdmin)
      addAuditLog(
        "LOGOUT",
        "system",
        0,
        `Admin ${currentAdmin.name} logged out`
      );
    setCurrentAdmin(null);
  };

  const hasPermission = (_resource: string, _action: string) => {
    if (!currentAdmin) return false;
    return isAdminRole(currentAdmin.role);
  };

  /* ===== Audit (client-side) ===== */

  const addAuditLog = (
    action: string,
    resource: string,
    resourceId: number,
    details: string
  ) => {
    if (!currentAdmin) return;
    const log: AuditLog = {
      id: Date.now(),
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
      details,
    };
    setLogs((prev) => [log, ...prev]);
  };

  /* ===== Paintings ===== */

  const loadPaintings = useCallback(async () => {
    const res = await api.get<PaintingDto[]>("/paintings");
    setPaintings(res.data.map(mapPaintingDto));
  }, []);

  const createPainting = async (
    p: Omit<Painting, "id"> & { artistId: number }
  ) => {
    if (!hasPermission("paintings", "create")) return false;

    const payload: CreatePaintingPayload = {
      title: p.title,
      artistId: p.artistId,
      category: p.category ?? "General",
      description: p.description || null,
      imageUrl: p.imageUrl || null,
      minBid: p.minBid ?? 0,
      featured: !!p.featured,
      year: p.year ?? null,
      medium: p.medium || null,
      dimensions: p.dimensions || null,
      condition: p.condition || null,
      estimateLow: p.estimate?.low ?? null,
      estimateHigh: p.estimate?.high ?? null,
    };

    const res = await api.post<PaintingDto>("/paintings", payload);
    const created = mapPaintingDto(res.data);
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

  const updatePainting = async (
    id: number,
    updates: Partial<Painting> & { artistId?: number }
  ) => {
    if (!hasPermission("paintings", "update")) return false;

    const payload: UpdatePaintingPayload = {
      title: updates.title,
      artistId: updates.artistId,
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
    console.log("Updating painting:", id, payload);
    await api.put(`/paintings/${id}`, payload);
    setPaintings((prev) =>
      prev.map((pp) =>
        pp.id === id
          ? {
              ...pp,
              ...updates,
              // if artistId changed, you may want to refresh list to get artistName
            }
          : pp
      )
    );
    addAuditLog("UPDATE", "painting", id, `Updated painting #${id}`);
    return true;
  };

  const deletePainting = async (id: number) => {
    if (!hasPermission("paintings", "delete")) return false;
    await api.delete(`/paintings/${id}`);
    setPaintings((prev) => prev.filter((p) => p.id !== id));
    addAuditLog("DELETE", "painting", id, `Deleted painting #${id}`);
    recalcStats();
    return true;
  };

  /* ===== Artists ===== */

  const loadArtists = useCallback(async () => {
    const res = await api.get<ArtistDto[]>("/artists");
    console.log("Loaded artists:", res.data);
    setArtists(res.data.map(mapArtistDto));
  }, []);

  const createArtist = async (a: Omit<Artist, "id">) => {
    if (!hasPermission("artists", "create")) return false;

    const payload: CreateArtistPayload = {
      name: a.name,
      bio: a.bio || null,
      image: a.image || null,
      nationality: a.nationality || null,
      birthYear: a.birthYear ?? null,
      style: a.style || null,
      verified: !!a.verified,
      totalSales: a.totalSales ?? 0,
      averagePrice: a.averagePrice ?? 0,
      trending: !!a.trending,
    };

    const res = await api.post<ArtistDto>("/artists", payload);
    const created = mapArtistDto(res.data);
    setArtists((prev) => [created, ...prev]);
    addAuditLog(
      "CREATE",
      "artist",
      created.id,
      `Added artist: ${created.name}`
    );
    recalcStats();
    return true;
  };

  const updateArtist = async (id: number, updates: Partial<Artist>) => {
    if (!hasPermission("artists", "update")) return false;

    const payload: UpdateArtistPayload = {
      name: updates.name,
      bio: updates.bio,
      image: updates.image,
      nationality: updates.nationality,
      birthYear: updates.birthYear,
      style: updates.style,
      verified: updates.verified,
      totalSales: updates.totalSales,
      averagePrice: updates.averagePrice,
      trending: updates.trending,
    };

    await api.put(`/artists/${id}`, payload);
    setArtists((prev) =>
      prev.map((a) => (a.id === id ? ({ ...a, ...updates } as Artist) : a))
    );
    addAuditLog("UPDATE", "artist", id, `Updated artist #${id}`);
    return true;
  };

  const deleteArtist = async (id: number) => {
    if (!hasPermission("artists", "delete")) return false;
    await api.delete(`/artists/${id}`);
    setArtists((prev) => prev.filter((a) => a.id !== id));
    addAuditLog("DELETE", "artist", id, `Deleted artist #${id}`);
    recalcStats();
    return true;
  };

  /* ===== Auctions (real API) ===== */

  const loadAuctions = useCallback(async () => {
    const res = await api.get<AuctionDto[]>("/auctions");
    setAuctions(res.data.map(mapAuctionDto));
  }, []);

  const createAuction = async (
    a: Omit<Auction, "id"> & { paintingIds?: number[] }
  ) => {
    if (!hasPermission("auctions", "create")) return false;

    const payload: CreateAuctionPayload = {
      title: a.title,
      description: (a as any).description ?? null, // adapt if your Auction type differs
      startsAtUtc: (a as any).startTime, // ensure ISO strings
      endsAtUtc: (a as any).endTime,
      paintingIds: a.paintingIds ?? [],
    };

    const res = await api.post<AuctionDto>("/auctions", payload);
    const created = mapAuctionDto(res.data);
    setAuctions((prev) => [created, ...prev]);
    addAuditLog(
      "CREATE",
      "auction",
      created.id,
      `Created auction: ${created.title}`
    );
    return true;
  };

  const updateAuction = async (
    id: number,
    updates: Partial<Auction> & { paintingIds?: number[] }
  ) => {
    if (!hasPermission("auctions", "update")) return false;

    const payload: UpdateAuctionPayload = {
      title: updates.title,
      description: (updates as any).description,
      startsAtUtc: (updates as any).startTime,
      endsAtUtc: (updates as any).endTime,
      paintingIds: (updates as any).paintingIds, // typically you’ll call the dedicated endpoint below
    };

    await api.put(`/auctions/${id}`, payload);
    setAuctions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    addAuditLog("UPDATE", "auction", id, `Updated auction #${id}`);
    return true;
  };

  const deleteAuction = async (id: number) => {
    if (!hasPermission("auctions", "delete")) return false;
    await api.delete(`/auctions/${id}`);
    setAuctions((prev) => prev.filter((a) => a.id !== id));
    addAuditLog("DELETE", "auction", id, `Deleted auction #${id}`);
    return true;
  };

  // set paintings for an auction (replace all)
  const setAuctionPaintings = async (
    auctionId: number,
    paintingIds: number[]
  ) => {
    if (!hasPermission("auctions", "update")) return false;
    const payload: SetAuctionPaintingsPayload = { paintingIds };
    await api.put(`/auctions/${auctionId}/paintings`, payload);
    setAuctions((prev) =>
      prev.map((a) => (a.id === auctionId ? { ...a, paintingIds } : a))
    );
    addAuditLog(
      "UPDATE",
      "auction",
      auctionId,
      `Set ${paintingIds.length} painting(s)`
    );
    return true;
  };

  // status changes: "Live" | "Paused" | "Ended"
  const setAuctionStatus = async (
    auctionId: number,
    status: AuctionDto["status"]
  ) => {
    if (!hasPermission("auctions", "update")) return false;
    const payload: SetAuctionStatusPayload = { status };
    await api.put(`/auctions/${auctionId}/status`, payload);
    setAuctions((prev) =>
      prev.map((a) => (a.id === auctionId ? { ...a, status } : a))
    );
    addAuditLog("UPDATE", "auction", auctionId, `Status -> ${status}`);
    return true;
  };

  const startAuction = (id: number) => setAuctionStatus(id, "Live");
  const pauseAuction = (id: number) => setAuctionStatus(id, "Paused");
  const endAuction = (id: number) => setAuctionStatus(id, "Ended");

  /* ===== Stats ===== */

  const recalcStats = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      totalPaintings: paintings.length,
      totalArtists: artists.length,
      // You can expand these via future Admin stats endpoint
      totalBids: prev.totalBids,
      totalUsers: prev.totalUsers,
      totalRevenue: prev.totalRevenue,
      activeBidders: prev.activeBidders,
      pendingApprovals: prev.pendingApprovals,
    }));
  }, [paintings.length, artists.length]);

  /* ===== Bulk refresh ===== */

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      // Load in parallel
      await Promise.all([loadArtists(), loadPaintings(), loadAuctions()]);
      recalcStats();
    } finally {
      setLoading(false);
    }
  }, [loadArtists, loadPaintings, loadAuctions, recalcStats]);

  /* ===== Auto-load if token exists ===== */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = decodeJwt(token);
    if (!payload) return;

    const admin: AdminUser = {
      id: Number(payload.sub || payload.nameid || 0),
      email: (payload.email as string) || "",
      name: (payload.unique_name as string) || "",
      role: (() => {
        const allowedRoles = ["super_admin", "admin", "moderator"] as const;
        let roleValue: string | undefined;
        if (payload.role === "super_admin") return "super_admin";
        if (Array.isArray(payload.role)) roleValue = payload.role[0];
        else roleValue = payload.role;
        return allowedRoles.includes(roleValue as any)
          ? (roleValue as (typeof allowedRoles)[number])
          : "admin";
      })(),
      permissions: [],
      isActive: true,
      lastLogin: "",
    };
    setCurrentAdmin(admin);
    refreshAll();
  }, [refreshAll]);

  /* ===== Expose ===== */

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

    // Paintings
    loadPaintings,
    createPainting,
    updatePainting,
    deletePainting,

    // Artists
    loadArtists,
    createArtist,
    updateArtist,
    deleteArtist,

    // Auctions
    loadAuctions,
    createAuction,
    updateAuction,
    deleteAuction,
    setAuctionPaintings,
    startAuction,
    pauseAuction,
    endAuction,

    // Utils
    refreshAll,
  };
};
