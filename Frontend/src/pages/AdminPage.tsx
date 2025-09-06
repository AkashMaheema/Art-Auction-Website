import React, { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { PaintingManager } from '../components/admin/PaintingManager';
import { ArtistManager } from '../components/admin/ArtistManager';
import { AuctionManager } from '../components/admin/AuctionManager';
import { AuditLogs } from '../components/admin/AuditLogs';

export const AdminPage: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
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
    endAuction
  } = useAdmin();

  if (!currentAdmin) {
    return <AdminLogin onLogin={loginAdmin} />;
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminDashboard stats={stats} recentLogs={logs.slice(0, 5)} />;
      case 'paintings':
        return (
          <PaintingManager
            paintings={paintings}
            onCreatePainting={createPainting}
            onUpdatePainting={updatePainting}
            onDeletePainting={deletePainting}
            hasPermission={hasPermission}
          />
        );
      case 'artists':
        return (
          <ArtistManager
            artists={artists}
            onCreateArtist={createArtist}
            onUpdateArtist={updateArtist}
            onDeleteArtist={deleteArtist}
            hasPermission={hasPermission}
          />
        );
      case 'auctions':
        return (
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
        );
      case 'logs':
        return <AuditLogs logs={logs} />;
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
            <p className="text-gray-600">Advanced analytics and reporting features coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">System Settings</h3>
            <p className="text-gray-600">System configuration and settings coming soon...</p>
          </div>
        );
      default:
        return <AdminDashboard stats={stats} recentLogs={logs.slice(0, 5)} />;
    }
  };

  return (
    <AdminLayout
      currentAdmin={currentAdmin}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      onLogout={logoutAdmin}
    >
      {renderSection()}
    </AdminLayout>
  );
};