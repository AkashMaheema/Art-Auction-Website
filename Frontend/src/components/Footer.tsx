import React from 'react';
import { Gavel } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Gavel className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">ArtAuction</span>
            </div>
            <p className="text-gray-400">
              The world's premier destination for fine art auctions and collecting.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Auctions</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Current Auctions</a></li>
              <li><a href="#" className="hover:text-white">Upcoming Sales</a></li>
              <li><a href="#" className="hover:text-white">Past Results</a></li>
              <li><a href="#" className="hover:text-white">Catalogues</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Consign</a></li>
              <li><a href="#" className="hover:text-white">Appraisals</a></li>
              <li><a href="#" className="hover:text-white">Authentication</a></li>
              <li><a href="#" className="hover:text-white">Collection Management</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>New York: +1 (555) 123-4567</li>
              <li>London: +44 20 7123 4567</li>
              <li>info@artauction.com</li>
              <li>support@artauction.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ArtAuction. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};