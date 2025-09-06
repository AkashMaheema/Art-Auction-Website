import React, { useState } from 'react';
import { X, Bell, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  paintingTitle: string;
  currentPrice: number;
  onSetAlert: (targetPrice: number) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  paintingTitle,
  currentPrice,
  onSetAlert
}) => {
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (price > 0) {
      onSetAlert(price);
      onClose();
      setTargetPrice('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Set Price Alert</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Get notified when "{paintingTitle}" reaches your target price.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert me when price goes:
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="above"
                  checked={alertType === 'above'}
                  onChange={(e) => setAlertType(e.target.value as 'above')}
                  className="mr-2"
                />
                Above
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="below"
                  checked={alertType === 'below'}
                  onChange={(e) => setAlertType(e.target.value as 'below')}
                  className="mr-2"
                />
                Below
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Current price: {formatCurrency(currentPrice)}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Set Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};