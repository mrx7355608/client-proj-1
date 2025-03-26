import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Search, Package, ArrowDown, ArrowUp, History, AlertCircle, Upload, Eye, ClipboardList, ChevronLeft, ChevronRight, X, Pencil, Download, Building2, Filter, ChevronDown, ChevronUp, MapPin, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';
import InventoryItemModal from '../components/InventoryItemModal';
import InventoryLogModal from '../components/InventoryLogModal';
import ImportInventoryModal from '../components/ImportInventoryModal';
import SiteModal from '../components/SiteModal';
import TransferModal from '../components/TransferModal';

interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string;
  subcategory: string | null;
  unit_price: number;
  cost_price: number;
  quantity: number;
  min_quantity: number;
  location: string | null;
  image_url: string | null;
  notes: string | null;
  vendor_id: string | null;
  web_link: string | null;
  vendor?: {
    name: string;
  };
  site_items?: {
    site: {
      id: string;
      name: string;
    };
    quantity: number;
  }[];
}

interface Site {
  id: string;
  name: string;
  type: 'warehouse' | 'office' | 'client_site' | 'project_site';
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  notes: string | null;
}

interface Vendor {
  id: string;
  name: string;
}

interface Category {
  name: string;
  subcategories: string[];
}

interface Filters {
  search: string;
  vendor: string;
  category: string;
  subcategory: string;
  site: string;
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
  site?: {
    id: string;
    name: string;
  };
}

interface TransferModalState {
  isOpen: boolean;
  item: InventoryItem | null;
  fromSite: Site | null;
}

function Inventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>();
  const [selectedSite, setSelectedSite] = useState<Site | undefined>();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<{id: string; name: string} | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Filters>({
    search: '',
    vendor: '',
    category: '',
    subcategory: '',
    site: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name' as keyof InventoryItem,
    direction: 'asc' as 'asc' | 'desc'
  });
  const [transferModal, setTransferModal] = useState<TransferModalState>({
    isOpen: false,
    item: null,
    fromSite: null
  });

  useEffect(() => {
    fetchItems();
    fetchSites();
    fetchVendors();
    fetchCategories();
    fetchRecentTransactions();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          vendor:inventory_vendors (
            name
          ),
          site_items:inventory_site_items (
            quantity,
            site:inventory_sites (
              id,
              name
            )
          )
        `)
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_sites')
        .select('*')
        .order('name');

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_vendors')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('category, subcategory');

      if (error) throw error;

      // Process categories and subcategories
      const categoryMap = new Map<string, Set<string>>();
      data?.forEach(item => {
        if (!categoryMap.has(item.category)) {
          categoryMap.set(item.category, new Set());
        }
        if (item.subcategory) {
          categoryMap.get(item.category)?.add(item.subcategory);
        }
      });

      const processedCategories: Category[] = Array.from(categoryMap).map(([name, subs]) => ({
        name,
        subcategories: Array.from(subs).sort()
      })).sort((a, b) => a.name.localeCompare(b.name));

      setCategories(processedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          user:user_profiles (
            first_name,
            last_name
          ),
          item:inventory_items (
            name
          ),
          site:inventory_sites (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentTransactions(data || []);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  const handleCheckInOut = async (item: InventoryItem, site: Site, type: 'check_in' | 'check_out') => {
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
          p_item_id: item.id,
          p_site_id: site.id,
          p_quantity: parsedQuantity,
          p_notes: notes
        }
      );

      if (error) throw error;

      fetchItems();
      fetchRecentTransactions();
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Error updating inventory. Please try again.');
    }
  };

  const handleTransfer = async (toSiteId: string, quantity: number) => {
    if (!transferModal.item || !transferModal.fromSite) return;

    try {
      const { error } = await supabase.rpc(
        'transfer_inventory_between_sites',
        {
          p_item_id: transferModal.item.id,
          p_from_site_id: transferModal.fromSite.id,
          p_to_site_id: toSiteId,
          p_quantity: quantity,
          p_notes: `Transfer from ${transferModal.fromSite.name}`
        }
      );

      if (error) throw error;

      fetchItems();
      fetchRecentTransactions();
      setTransferModal({ isOpen: false, item: null, fromSite: null });
    } catch (error) {
      console.error('Error transferring inventory:', error);
      alert('Error transferring inventory. Please try again.');
    }
  };

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      vendor: '',
      category: '',
      subcategory: '',
      site: ''
    });
  };

  const filteredItems = items.filter(item => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(searchLower) ||
      item.sku?.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      item.vendor?.name.toLowerCase().includes(searchLower);

    const matchesVendor = !filters.vendor || item.vendor_id === filters.vendor;
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesSubcategory = !filters.subcategory || item.subcategory === filters.subcategory;
    const matchesSite = !filters.site || item.site_items?.some(si => si.site.id === filters.site);

    return matchesSearch && matchesVendor && matchesCategory && matchesSubcategory && matchesSite;
  }).sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const getSiteTypeIcon = (type: Site['type']) => {
    switch (type) {
      case 'warehouse':
        return <Package className="w-4 h-4" />;
      case 'office':
        return <Building2 className="w-4 h-4" />;
      case 'client_site':
        return <MapPin className="w-4 h-4" />;
      case 'project_site':
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getSiteTypeLabel = (type: Site['type']) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Inventory</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors"
          >
            <ClipboardList className="w-4 h-4 mr-1.5" />
            View Log
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            Import
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Sites Section */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Inventory Sites</h2>
          <button
            onClick={() => {
              setSelectedSite(undefined);
              setIsSiteModalOpen(true);
            }}
            className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Site
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sites.map((site) => (
            <div
              key={site.id}
              onClick={() => navigate(`/inventory/sites/${site.id}`)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                site.is_active
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    {getSiteTypeIcon(site.type)}
                    <h3 className="font-medium text-gray-800">{site.name}</h3>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {getSiteTypeLabel(site.type)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSite(site);
                    setIsSiteModalOpen(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {site.address && (
                <div className="mt-2 text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5 inline-block mr-1" />
                  {[site.address, site.city, site.state].filter(Boolean).join(', ')}
                </div>
              )}

              {(site.contact_name || site.contact_email || site.contact_phone) && (
                <div className="mt-2 text-sm text-gray-600">
                  {site.contact_name && <div>{site.contact_name}</div>}
                  {site.contact_email && (
                    <a href={`mailto:${site.contact_email}`} className="text-blue-600 hover:text-blue-800" onClick={e => e.stopPropagation()}>
                      {site.contact_email}
                    </a>
                  )}
                  {site.contact_phone && <div>{site.contact_phone}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
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
                  {transaction.site && (
                    <p className="text-sm text-gray-500">
                      Site: {transaction.site.name}
                    </p>
                  )}
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

      {/* Inventory Items */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <div className="space-y-4 mb-6">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filters.vendor}
              onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Vendors</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                category: e.target.value,
                subcategory: '' // Reset subcategory when category changes
              }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.name} value={category.name}>{category.name}</option>
              ))}
            </select>

            {filters.category && (
              <select
                value={filters.subcategory}
                onChange={(e) => setFilters(prev => ({ ...prev, subcategory: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subcategories</option>
                {categories
                  .find(c => c.name === filters.category)
                  ?.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))
                }
              </select>
            )}

            <select
              value={filters.site}
              onChange={(e) => setFilters(prev => ({ ...prev, site: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sites</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>

            {(filters.search || filters.vendor || filters.category || filters.subcategory || filters.site) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('name')}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                sortConfig.key === 'name'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Name {sortConfig.key === 'name' && (
                sortConfig.direction === 'asc' ? '↑' : '↓'
              )}
            </button>
            <button
              onClick={() => handleSort('sku')}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                sortConfig.key === 'sku'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              SKU {sortConfig.key === 'sku' && (
                sortConfig.direction === 'asc' ? '↑' : '↓'
              )}
            </button>
            <button
              onClick={() => handleSort('quantity')}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                sortConfig.key === 'quantity'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Quantity {sortConfig.key === 'quantity' && (
                sortConfig.direction === 'asc' ? '↑' : '↓'
              )}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No items found</div>
        ) : (
          <div className="space-y-4">
            
            {filteredItems.map((item) => (
              <div key={item.id}>
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        {item.sku && (
                          <p className="text-sm text-gray-500">{item.sku}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleItemExpanded(item.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title={expandedItems.has(item.id) ? "Collapse" : "Expand"}
                        >
                          {expandedItems.has(item.id) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItemForHistory({ id: item.id, name: item.name });
                            setIsHistoryModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View History"
                        >
                          <History className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Edit Item"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                      {item.vendor && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.vendor.name}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.quantity <= item.min_quantity
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.quantity} total in stock
                      </span>
                    </div>

                    {item.description && (
                      <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                    )}

                    {expandedItems.has(item.id) && (
                      <div className="mt-4 space-y-4">
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Site Inventory</h4>
                          <div className="space-y-2">
                            {sites.map(site => {
                              const siteItem = item.site_items?.find(si => si.site.id === site.id);
                              return (
                                <div key={site.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                  <div>
                                    <span className="text-sm font-medium text-gray-800">{site.name}</span>
                                    <span className="ml-2 text-sm text-gray-500">
                                      {siteItem ? `${siteItem.quantity} units` : 'No stock'}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                
                                      onClick={() => handleCheckInOut(item, site, 'check_in')}
                                      className="p-1 text-green-600 hover:text-green-800"
                                      title="Check In"
                                    >
                                      <ArrowDown className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleCheckInOut(item, site, 'check_out')}
                                      className="p-1 text-blue-600 hover:text-blue-800"
                                      title="Check Out"
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                    </button>
                                    {siteItem && siteItem.quantity > 0 && (
                                      <button
                                        onClick={() => setTransferModal({
                                          isOpen: true,
                                          item,
                                          fromSite: site
                                        })}
                                        className="p-1 text-purple-600 hover:text-purple-800"
                                        title="Transfer"
                                      >
                                        <ArrowRightLeft className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Cost Price:</span>
                              <span className="ml-2 font-medium">${item.cost_price.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Sale Price:</span>
                              <span className="ml-2 font-medium">${item.unit_price.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Min Quantity:</span>
                              <span className="ml-2 font-medium">{item.min_quantity}</span>
                            </div>
                             <div>
      <span className="text-gray-500">Total Value:</span>
      <span className="ml-2 font-medium">${(item.quantity * item.cost_price).toFixed(2)}</span>
    </div>
                            {item.web_link && (
                              <div>
                                <a
                                  href={item.web_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  Product Link
                                  <Download className="w-4 h-4 ml-1" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <InventoryItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(undefined);
        }}
        onSave={fetchItems}
        item={selectedItem}
      />

      <SiteModal
        isOpen={isSiteModalOpen}
        onClose={() => {
          setIsSiteModalOpen(false);
          setSelectedSite(undefined);
        }}
        onSave={fetchSites}
        site={selectedSite}
      />

      <InventoryLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />

      <ImportInventoryModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={fetchItems}
      />

      {selectedItemForHistory && (
        <TransactionHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedItemForHistory(null);
          }}
          itemId={selectedItemForHistory.id}
          itemName={selectedItemForHistory.name}
        />
      )}

      {transferModal.isOpen && transferModal.item && transferModal.fromSite && (
        <TransferModal
          isOpen={true}
          onClose={() => setTransferModal({ isOpen: false, item: null, fromSite: null })}
          fromSite={transferModal.fromSite}
          itemName={transferModal.item.name}
          currentQuantity={transferModal.item.site_items?.find(si => si.site.id === transferModal.fromSite?.id)?.quantity || 0}
          availableSites={sites}
          onTransfer={handleTransfer}
        />
      )}
    </div>
  );
}

export default Inventory;