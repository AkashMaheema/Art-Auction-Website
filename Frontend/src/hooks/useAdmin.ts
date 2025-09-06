import { useState } from "react";
import { Painting, Artist } from "../types";
import { Auction } from "../types/auction";
import { AdminUser, AdminStats, AuditLog } from "../types/admin";
import { paintings as initialPaintings } from "../data/paintings";
import { artists as initialArtists } from "../data/artists";
import { adminStats, auditLogs } from "../data/admin";
import { useAuctions } from "./useAuctions";
import api from "../utils/api";

export const useAdmin = () => {
  const [paintings, setPaintings] = useState<Painting[]>(initialPaintings);
  const [artists, setArtists] = useState<Artist[]>(initialArtists);
  const [stats, setStats] = useState<AdminStats>(adminStats);
  const [logs, setLogs] = useState<AuditLog[]>(auditLogs);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  const {
    auctions,
    createAuction: createAuctionHook,
    updateAuction: updateAuctionHook,
    deleteAuction: deleteAuctionHook,
    startAuction,
    pauseAuction,
    endAuction,
  } = useAuctions();

  // Admin Authentication
  const loginAdmin = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await api.post("/auth/login", {
        email: email,
        password,
      });

      console.log("Login response:", response.data);
      // backend returns { token: "JWT..." }
      const { token } = response.data;
      localStorage.setItem("token", token);

      // decode token to get admin info (optional)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const admin: AdminUser = {
        id: payload.nameid, // ClaimTypes.NameIdentifier
        email,
        name: payload.unique_name || email,
        permissions: [], // later load from backend
        isActive: true,
        role: "admin",
        lastLogin: "",
      };

      setCurrentAdmin(admin);
      addAuditLog("LOGIN", "system", 0, `Admin ${admin.name} logged in`);
      return true;
    } catch (err) {
      console.error("Login failed", err);
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

  // Audit Logging
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

  // Permission Check
  const hasPermission = (resource: string, action: string): boolean => {
    if (!currentAdmin) return false;
    const permission = currentAdmin.permissions.find(
      (p) => p.resource === resource
    );
    return permission?.actions.includes(action as any) || false;
  };

  // Painting CRUD Operations
  const createPainting = (paintingData: Omit<Painting, "id">) => {
    if (!hasPermission("paintings", "create")) return false;

    const newPainting: Painting = {
      ...paintingData,
      id: Math.max(...paintings.map((p) => p.id)) + 1,
    };

    setPaintings((prev) => [...prev, newPainting]);
    addAuditLog(
      "CREATE",
      "painting",
      newPainting.id,
      `Added new painting: ${newPainting.title}`
    );
    updateStats();
    return true;
  };

  const updatePainting = (id: number, updates: Partial<Painting>) => {
    if (!hasPermission("paintings", "update")) return false;

    setPaintings((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    const painting = paintings.find((p) => p.id === id);
    addAuditLog(
      "UPDATE",
      "painting",
      id,
      `Updated painting: ${painting?.title}`
    );
    return true;
  };

  const deletePainting = (id: number) => {
    if (!hasPermission("paintings", "delete")) return false;

    const painting = paintings.find((p) => p.id === id);
    setPaintings((prev) => prev.filter((p) => p.id !== id));
    addAuditLog(
      "DELETE",
      "painting",
      id,
      `Deleted painting: ${painting?.title}`
    );
    updateStats();
    return true;
  };

  // Artist CRUD Operations
  const createArtist = (artistData: Omit<Artist, "id">) => {
    if (!hasPermission("artists", "create")) return false;

    const newArtist: Artist = {
      ...artistData,
      id: Math.max(...artists.map((a) => a.id)) + 1,
    };

    setArtists((prev) => [...prev, newArtist]);
    addAuditLog(
      "CREATE",
      "artist",
      newArtist.id,
      `Added new artist: ${newArtist.name}`
    );
    updateStats();
    return true;
  };

  const updateArtist = (id: number, updates: Partial<Artist>) => {
    if (!hasPermission("artists", "update")) return false;

    setArtists((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );

    const artist = artists.find((a) => a.id === id);
    addAuditLog("UPDATE", "artist", id, `Updated artist: ${artist?.name}`);
    return true;
  };

  const deleteArtist = (id: number) => {
    if (!hasPermission("artists", "delete")) return false;

    const artist = artists.find((a) => a.id === id);
    setArtists((prev) => prev.filter((a) => a.id !== id));
    addAuditLog("DELETE", "artist", id, `Deleted artist: ${artist?.name}`);
    updateStats();
    return true;
  };

  // Auction CRUD Operations
  const createAuction = (auctionData: Omit<Auction, "id">) => {
    if (!hasPermission("auctions", "create")) return false;

    const success = createAuctionHook(auctionData);
    if (success) {
      addAuditLog(
        "CREATE",
        "auction",
        0,
        `Created new auction: ${auctionData.title}`
      );
      updateStats();
    }
    return success;
  };

  const updateAuction = (id: number, updates: Partial<Auction>) => {
    if (!hasPermission("auctions", "update")) return false;

    const success = updateAuctionHook(id, updates);
    if (success) {
      const auction = auctions.find((a) => a.id === id);
      addAuditLog(
        "UPDATE",
        "auction",
        id,
        `Updated auction: ${auction?.title}`
      );
    }
    return success;
  };

  const deleteAuction = (id: number) => {
    if (!hasPermission("auctions", "delete")) return false;

    const auction = auctions.find((a) => a.id === id);
    const success = deleteAuctionHook(id);
    if (success) {
      addAuditLog(
        "DELETE",
        "auction",
        id,
        `Deleted auction: ${auction?.title}`
      );
      updateStats();
    }
    return success;
  };

  const startAuctionAdmin = (id: number) => {
    if (!hasPermission("auctions", "update")) return false;

    const success = startAuction(id);
    if (success) {
      const auction = auctions.find((a) => a.id === id);
      addAuditLog(
        "UPDATE",
        "auction",
        id,
        `Started auction: ${auction?.title}`
      );
    }
    return success;
  };

  const pauseAuctionAdmin = (id: number) => {
    if (!hasPermission("auctions", "update")) return false;

    const success = pauseAuction(id);
    if (success) {
      const auction = auctions.find((a) => a.id === id);
      addAuditLog("UPDATE", "auction", id, `Paused auction: ${auction?.title}`);
    }
    return success;
  };

  const endAuctionAdmin = (id: number) => {
    if (!hasPermission("auctions", "update")) return false;

    const success = endAuction(id);
    if (success) {
      const auction = auctions.find((a) => a.id === id);
      addAuditLog("UPDATE", "auction", id, `Ended auction: ${auction?.title}`);
    }
    return success;
  };

  // Update Statistics
  const updateStats = () => {
    setStats((prev) => ({
      ...prev,
      totalPaintings: paintings.length,
      totalArtists: artists.length,
      // Other stats would be calculated from real data
    }));
  };

  return {
    // Data
    paintings,
    artists,
    auctions,
    stats,
    logs,
    currentAdmin,

    // Authentication
    loginAdmin,
    logoutAdmin,
    hasPermission,

    // Painting Operations
    createPainting,
    updatePainting,
    deletePainting,

    // Artist Operations
    createArtist,
    updateArtist,
    deleteArtist,

    // Auction Operations
    createAuction,
    updateAuction,
    deleteAuction,
    startAuction: startAuctionAdmin,
    pauseAuction: pauseAuctionAdmin,
    endAuction: endAuctionAdmin,
  };
};
