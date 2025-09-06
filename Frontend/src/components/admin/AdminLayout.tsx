import React from 'react';
import { Shield, LogOut, Home, Palette, Users, Gavel, BarChart3, Settings, FileText } from 'lucide-react';
import { AdminUser } from '../../types/admin';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentAdmin: AdminUser;
  currentSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentAdmin,
  currentSection,
  onSectionChange,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'paintings', label: 'Paintings', icon: Palette },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'auctions', label: 'Auctions', icon: Gavel },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-sm text-gray-400">ArtAuction</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      currentSection === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{currentAdmin.name}</p>
              <p className="text-sm text-gray-400 capitalize">{currentAdmin.role.replace('_', ' ')}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {currentSection.replace('_', ' ')}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Last login: {new Date(currentAdmin.lastLogin).toLocaleDateString()}
              </span>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentAdmin.role === 'super_admin' 
                  ? 'bg-purple-100 text-purple-800'
                  : currentAdmin.role === 'admin'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {currentAdmin.role.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};