import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Site {
  id: string;
  name: string;
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromSite: Site;
  itemName: string;
  currentQuantity: number;
  availableSites: Site[];
  onTransfer: (toSiteId: string, quantity: number) => void;
}

export default function TransferModal({
  isOpen,
  onClose,
  fromSite,
  itemName,
  currentQuantity,
  availableSites,
  onTransfer,
}: TransferModalProps) {
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [quantity, setQuantity] = useState('1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQuantity = parseInt(quantity);
    if (parsedQuantity > 0 && parsedQuantity <= currentQuantity && selectedSiteId) {
      onTransfer(selectedSiteId, parsedQuantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Transfer Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Site
            </label>
            <input
              type="text"
              value={fromSite.name}
              disabled
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item
            </label>
            <input
              type="text"
              value={itemName}
              disabled
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Available quantity: {currentQuantity}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Site *
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select destination site</option>
              {availableSites
                .filter(site => site.id !== fromSite.id)
                .map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Transfer *
            </label>
            <input
              type="number"
              min="1"
              max={currentQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={!selectedSiteId || parseInt(quantity) < 1 || parseInt(quantity) > currentQuantity}
            >
              Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}