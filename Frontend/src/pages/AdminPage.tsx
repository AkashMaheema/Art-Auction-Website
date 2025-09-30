import React, { useRef } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAdmin } from "../hooks/useAdmin";

import { AdminLayout } from "../components/admin/AdminLayout";
import { AdminLogin } from "../components/admin/AdminLogin";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { PaintingManager } from "../components/admin/PaintingManager";
import { ArtistManager } from "../components/admin/ArtistManager";
import { AuctionManager } from "../components/admin/AuctionManager";
import { AuditLogs } from "../components/admin/AuditLogs";

import { Modal } from "../components/common/Modal";
import { AddPaintingForm } from "../components/admin/AddPaintingForm";

/**
 * defensive AdminPage that prevents navigation floods by:
 * - ignoring navigation to the current path
 * - rate-limiting repeated navigations (simple timestamp guard)
 * - logging navigation attempts so you can trace the source
 */
export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const lastNavRef = useRef<{ time: number; path: string } | null>(null);

  // Simple safe navigate: don't navigate to the same path; rate-limit repeated navigations.
  const safeNavigate = (to: string, opts?: { replace?: boolean }) => {
    try {
      if (!to) return;
      const now = Date.now();
      const current = location.pathname + location.search + location.hash;

      // 1) if already on the same path, ignore
      if (current === to) {
        // small log for diagnostics (can remove in production)
        // console.debug(`[safeNavigate] skipped same-path navigation to ${to}`);
        return;
      }

      // 2) rate-limit: if last navigation was to the same target within 300ms, ignore
      const last = lastNavRef.current;
      if (last && last.path === to && now - last.time < 300) {
        // console.warn(`[safeNavigate] rate-limited navigation to ${to}`);
        return;
      }

      // 3) record and navigate
      lastNavRef.current = { time: now, path: to };
      navigate(to, opts as any);
    } catch (err) {
      // defensive: swallow errors so devtools don't get spammed
      // console.error("[safeNavigate] error", err);
    }
  };

  const {
    paintings,
    artists,
    auctions,
    stats,
    logs,
    currentAdmin,
    loginAdmin,
    logoutAdmin,
    hasPermission,
    createPainting,
    updatePainting,
    deletePainting,
    createArtist,
    updateArtist,
    deleteArtist,
    createAuction,
    updateAuction,
    deleteAuction,
    startAuction,
    pauseAuction,
    endAuction,
  } = useAdmin();

  // If not logged in show login. Avoid navigating in render - simply return login UI.
  if (!currentAdmin) {
    return <AdminLogin onLogin={loginAdmin} />;
  }

  return (
    <AdminLayout
      currentAdmin={currentAdmin}
      // derive section from URL so AdminLayout's active item stays in sync with real URL
      currentSection={location.pathname.split("/")[2] || "dashboard"}
      onSectionChange={(section) => safeNavigate(`/admin/${section}`)}
      onLogout={logoutAdmin}
    >
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route
          path="dashboard"
          element={
            <AdminDashboard
              stats={stats}
              recentLogs={logs.slice(0, 5)}
              onAddPaintingClick={() => safeNavigate("/admin/paintings/new")}
            />
          }
        />

        <Route
          path="paintings"
          element={
            <PaintingManager
              paintings={paintings}
              onCreatePainting={createPainting}
              onUpdatePainting={updatePainting}
              onDeletePainting={deletePainting}
              hasPermission={hasPermission}
            />
          }
        />

        {/* modal as nested route — painting list remains in background */}
        <Route
          path="paintings/new"
          element={
            <>
              <PaintingManager
                paintings={paintings}
                onCreatePainting={createPainting}
                onUpdatePainting={updatePainting}
                onDeletePainting={deletePainting}
                hasPermission={hasPermission}
              />
              <Modal
                open
                title="Add Painting"
                onClose={() => safeNavigate("/admin/paintings")}
              >
                <AddPaintingForm
                  onCreated={async (created) => {
                    // IMPORTANT: createPainting might be async and could change app state.
                    // Make sure createPainting itself does not call navigate() unguarded.
                    await createPainting({
                      title: created.title ?? "",
                      // prefer artistId if your form provides it; fallback to artist string
                      artist: created.artist ?? "",
                      category: created.category ?? "General",
                      description: created.description ?? "",
                      imageUrl: created.imageUrl ?? "",
                      minBid: Number(created.minBid ?? 0),
                      featured: Boolean(created.featured),
                      year: created.year ? Number(created.year) : undefined,
                      medium: created.medium ?? "",
                      dimensions: created.dimensions ?? "",
                      condition: created.condition ?? "Excellent",
                      estimate: {
                        low: Number(created.estimateLow ?? 0),
                        high: Number(created.estimateHigh ?? 0),
                      },
                    } as any);

                    // navigate back to paintings view
                    safeNavigate("/admin/paintings");
                  }}
                  onCancel={() => safeNavigate("/admin/paintings")}
                />
              </Modal>
            </>
          }
        />

        <Route
          path="artists"
          element={
            <ArtistManager
              artists={artists}
              onCreateArtist={createArtist}
              onUpdateArtist={updateArtist}
              onDeleteArtist={deleteArtist}
              hasPermission={hasPermission}
            />
          }
        />

        <Route
          path="auctions"
          element={
            <AuctionManager
              auctions={auctions}
              paintings={paintings}
              onCreateAuction={createAuction}
              onUpdateAuction={updateAuction}
              onDeleteAuction={deleteAuction}
              onStartAuction={startAuction}
              onPauseAuction={pauseAuction}
              onEndAuction={endAuction}
              hasPermission={hasPermission}
            />
          }
        />

        <Route path="logs" element={<AuditLogs logs={logs} />} />

        <Route
          path="analytics"
          element={
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600">
                Advanced analytics and reporting features coming soon...
              </p>
            </div>
          }
        />

        <Route
          path="settings"
          element={
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                System Settings
              </h3>
              <p className="text-gray-600">
                System configuration and settings coming soon...
              </p>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};
