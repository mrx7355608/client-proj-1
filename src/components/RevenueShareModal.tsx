import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RevenueShare {
  id: string;
  partner_id: string;
  percentage: number | null;
  flat_rate: number | null;
  start_date: string;
  end_date: string | null;
  priority_order: number;
}

interface Partner {
  id: string;
  name: string;
  type: string;
}

interface RevenueShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  clientId: string;
  revenueShare?: RevenueShare;
}

export default function RevenueShareModal({
  isOpen,
  onClose,
  onSaved,
  clientId,
  revenueShare,
}: RevenueShareModalProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [formData, setFormData] = useState({
    partner_id: '',
    type: 'percentage' as 'percentage' | 'flat_rate',
    percentage: '',
    flat_rate: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (revenueShare) {
      setFormData({
        partner_id: revenueShare.partner_id,
        type: revenueShare.percentage !== null ? 'percentage' : 'flat_rate',
        percentage: revenueShare.percentage?.toString() || '',
        flat_rate: revenueShare.flat_rate?.toString() || '',
        start_date: revenueShare.start_date,
        end_date: revenueShare.end_date || '',
      });
    } else {
      setFormData({
        partner_id: '',
        type: 'percentage',
        percentage: '',
        flat_rate: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
    }
  }, [revenueShare]);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('id, name, type')
        .order('name');

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        partner_id: formData.partner_id,
        client_id: clientId,
        percentage: formData.type === 'percentage' ? parseFloat(formData.percentage) : null,
        flat_rate: formData.type === 'flat_rate' ? parseFloat(formData.flat_rate) : null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
      };

      if (revenueShare) {
        const { error } = await supabase
          .from('partner_revenue_shares')
          .update(data)
          .eq('id', revenueShare.id);

        if (error) throw error;
      } else {
        // Get the highest priority_order
        const { data: existingShares, error: fetchError } = await supabase
          .from('partner_revenue_shares')
          .select('priority_order')
          .eq('client_id', clientId)
          .order('priority_order', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        const nextPriorityOrder = existingShares && existingShares.length > 0
          ? existingShares[0].priority_order + 1
          : 0;

        const { error: insertError } = await supabase
          .from('partner_revenue_shares')
          .insert([{ ...data, priority_order: nextPriorityOrder }]);

        if (insertError) throw insertError;
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving revenue share:', error);
      alert('Error saving revenue share. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {revenueShare ? 'Edit Revenue Share' : 'Add Revenue Share'}
          </h2>
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
              Partner *
            </label>
            <select
              required
              value={formData.partner_id}
              onChange={(e) => setFormData({ ...formData, partner_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a partner</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'flat_rate' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage of Net Profit</option>
              <option value="flat_rate">Flat Rate</option>
            </select>
          </div>

          {formData.type === 'percentage' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Percentage *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flat Rate (Monthly) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.flat_rate}
                  onChange={(e) => setFormData({ ...formData, flat_rate: e.target.value })}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              min={formData.start_date}
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
            >
              {revenueShare ? 'Save Changes' : 'Add Revenue Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}