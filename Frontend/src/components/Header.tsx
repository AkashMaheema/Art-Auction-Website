import React from "react";
import { Gavel, Menu, X } from "lucide-react";
import type { Page } from "../types/nav";

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: Page) => void;
  isLoggedIn: boolean;
  userName: string;
  setIsLoggedIn: (value: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  isLoggedIn,
  userName,
  setIsLoggedIn,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Gavel className="h-8 w-8 text-blue-900" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                ArtAuction
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => setCurrentPage("home")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === "home"
                  ? "text-blue-900 bg-blue-50"
                  : "text-gray-700 hover:text-blue-900"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage("auctions")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === "auctions"
                  ? "text-blue-900 bg-blue-50"
                  : "text-gray-700 hover:text-blue-900"
              }`}
            >
              Auctions
            </button>
            <button
              onClick={() => setCurrentPage("artists")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === "artists"
                  ? "text-blue-900 bg-blue-50"
                  : "text-gray-700 hover:text-blue-900"
              }`}
            >
              Artists
            </button>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Welcome, {userName}
                </span>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage("login")}
                  className="text-sm text-gray-700 hover:text-blue-900"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentPage("register")}
                  className="bg-blue-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-900"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                setCurrentPage("home");
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-900"
            >
              Home
            </button>
            <button
              onClick={() => {
                setCurrentPage("auctions");
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-900"
            >
              Auctions
            </button>
            <button
              onClick={() => {
                setCurrentPage("artists");
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-900"
            >
              Artists
            </button>
            {!isLoggedIn && (
              <>
                <button
                  onClick={() => {
                    setCurrentPage("login");
                    setMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-900"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("register");
                    setMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-900"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
