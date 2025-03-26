import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, History, Package, ArrowDown, ArrowUp, MapPin, Mail, Phone, Building2, ImageOff, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Site {
  id: string;
  name: string;
  type: 'warehouse' | 'office' | 'client_site' | 'project_site';
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  notes: string | null;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string;
  cost_price: number;
  unit_price: number;
  site_quantity: number;
  min_quantity: number;
  image_url: string | null;
}

interface Transaction {
  id: string;
  type: 'check_in' | 'check_out';
  quantity: number;
  notes: string | null;
  created_at: string;
  user: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  item: {
    name: string;
  };
}

interface TransferSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (targetSiteId: string) => void;
  availableSites: Site[];
  currentSiteName: string;
}

function TransferSiteModal({
  isOpen,
  onClose,
  onTransfer,
  availableSites,
  currentSiteName
}: TransferSiteModalProps) {
  const [selectedSiteId, setSelectedSiteId] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transfer Inventory from {currentSiteName}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Select a site to transfer all inventory to before deleting this site.
        </p>

        <select
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        >
          <option value="">Select a site...</option>
          {availableSites.map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onTransfer(selectedSiteId)}
            disabled={!selectedSiteId}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            Transfer & Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SiteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [availableSites, setAvailableSites] = useState<Site[]>([]);

  useEffect(() => {
    if (id) {
      fetchSiteDetails();
      fetchAvailableSites();
    }
  }, [id]);

  const fetchSiteDetails = async () => {
    try {
      const [siteResponse, inventoryResponse, transactionsResponse] = await Promise.all([
        supabase
          .from('inventory_sites')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('inventory_site_items')
          .select(`
            quantity,
            inventory_items!inner (
              id,
              name,
              sku,
              description,
              category,
              cost_price,
              unit_price,
              min_quantity,
              image_url
            )
          `)
          .eq('site_id', id),
        supabase
          .from('inventory_transactions')
          .select(`
            *,
            user:user_profiles (
              first_name,
              last_name
            ),
            item:inventory_items (
              name
            )
          `)
          .eq('site_id', id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (siteResponse.error) throw siteResponse.error;
      if (inventoryResponse.error) throw inventoryResponse.error;
      if (transactionsResponse.error) throw transactionsResponse.error;

      setSite(siteResponse.data);
      setInventory(
        inventoryResponse.data
          .map(item => ({
            ...item.inventory_items,
            site_quantity: item.quantity
          }))
          .filter(item => item.site_quantity > 0)
      );
      setRecentTransactions(transactionsResponse.data || []);
    } catch (error) {
      console.error('Error fetching site details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSites = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_sites')
        .select('*')
        .neq('id', id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAvailableSites(data || []);
    } catch (error) {
      console.error('Error fetching available sites:', error);
    }
  };

  const handleDelete = async () => {
    if (!site) return;

    try {
      if (inventory.length > 0) {
        setIsTransferModalOpen(true);
      } else {
        if (!confirm('Are you sure you want to delete this site?')) return;

        const { error } = await supabase
          .from('inventory_sites')
          .delete()
          .eq('id', site.id);

        if (error) throw error;
        navigate('/inventory');
      }
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Error deleting site. Please try again.');
    }
  };

  const handleTransferAndDelete = async (targetSiteId: string) => {
    if (!site || !id) return;

    try {
      // Transfer all inventory to target site
      for (const item of inventory) {
        await supabase.rpc('transfer_inventory_between_sites', {
          p_item_id: item.id,
          p_from_site_id: id,
          p_to_site_id: targetSiteId,
          p_quantity: item.site_quantity,
          p_notes: `Transfer from ${site.name} (site deletion)`
        });
      }

      // Delete the site
      const { error } = await supabase
        .from('inventory_sites')
        .delete()
        .eq('id', site.id);

      if (error) throw error;

      navigate('/inventory');
    } catch (error) {
      console.error('Error transferring inventory and deleting site:', error);
      alert('Error transferring inventory and deleting site. Please try again.');
    }
  };

  const handleCheckInOut = async (itemId: string, type: 'check_in' | 'check_out') => {
    const quantity = window.prompt(
      `Enter quantity to ${type === 'check_in' ? 'check in' : 'check out'}:`,
      '1'
    );

    if (!quantity) return;

    const notes = window.prompt('Enter notes (optional):');
    const parsedQuantity = parseInt(quantity);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      const { error } = await supabase.rpc(
        type === 'check_in' ? 'check_in_inventory_at_site' : 'check_out_inventory_from_site',
        {
          p_item_id: itemId,
          p_site_id: id,
          p_quantity: parsedQuantity,
          p_notes: notes
        }
      );

      if (error) throw error;

      fetchSiteDetails();
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Error updating inventory. Please try again.');
    }
  };

  const getSiteTypeIcon = (type: Site['type']) => {
    switch (type) {
      case 'warehouse':
        return <Package className="w-5 h-5" />;
      case 'office':
        return <Building2 className="w-5 h-5" />;
      case 'client_site':
        return <MapPin className="w-5 h-5" />;
      case 'project_site':
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getSiteTypeLabel = (type: Site['type']) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!site) {
    return <div className="text-center py-8">Site not found</div>;
  }

  const totalInventoryValue = inventory.reduce((sum, item) => 
    sum + (item.site_quantity * item.cost_price), 0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/inventory')}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">{site.name}</h1>
            <span className="px-2 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700 flex items-center gap-1.5">
              {getSiteTypeIcon(site.type)}
              {getSiteTypeLabel(site.type)}
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-red-600 hover:text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors border border-red-200 flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Delete Site
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Information */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Site Information</h2>
          
          {site.description && (
            <p className="text-gray-600 mb-4">{site.description}</p>
          )}

          {(site.address || site.city || site.state || site.postal_code) && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Address</h3>
              <div className="text-gray-600">
                {site.address && <p>{site.address}</p>}
                <p>
                  {[site.city, site.state, site.postal_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}

          {(site.contact_name || site.contact_email || site.contact_phone) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
              <div className="space-y-2">
                {site.contact_name && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {site.contact_name}
                  </p>
                )}
                {site.contact_email && (
                  <a 
                    href={`mailto:${site.contact_email}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {site.contact_email}
                  </a>
                )}
                {site.contact_phone && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {site.contact_phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent transactions</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'check_in'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {transaction.type === 'check_in' ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.type === 'check_in' ? 'Checked In' : 'Checked Out'}{' '}
                      {transaction.quantity} {transaction.quantity === 1 ? 'unit' : 'units'}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.item.name}</p>
                    {transaction.notes && (
                      <p className="text-sm text-gray-500 mt-1">{transaction.notes}</p>
                    )}
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <History className="w-3 h-3 mr-1" />
                      {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                      {transaction.user && (
                        <>
                          <span className="mx-1">by</span>
                          {transaction.user.first_name} {transaction.user.last_name}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Site Inventory */}
        <div className="bg-white rounded-lg shadow-md p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Site Inventory</h2>
              <p className="text-sm text-gray-500">
                Total Value: <span className="font-medium">${totalInventoryValue.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {inventory.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No inventory items at this site</p>
          ) : (
            <div className="space-y-4">
              {inventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageOff className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                      {item.sku && (
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      )}
                      <div className="mt-1 space-x-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {item.site_quantity} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCheckInOut(item.id, 'check_in')}
                      className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                      title="Check In"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCheckInOut(item.id, 'check_out')}
                      className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                      title="Check Out"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TransferSiteModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransfer={handleTransferAndDelete}
        availableSites={availableSites}
        currentSiteName={site.name}
      />
    </div>
  );
}