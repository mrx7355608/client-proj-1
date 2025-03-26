import React, { useState, useEffect } from 'react';
import { X, Search, ArrowDown, ArrowUp, History, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

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
    id: string;
    name: string;
  };
}

interface InventoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryLogModal({ isOpen, onClose }: InventoryLogModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all' as 'all' | 'check_in' | 'check_out',
    itemId: '',
    userId: '',
  });
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchUsers();
      fetchTransactions();
    }
  }, [isOpen, filters, currentPage]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name');

      if (error) throw error;
      setUsers(data?.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
      })) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from('inventory_transactions')
        .select(`
          *,
          user:user_profiles (
            first_name,
            last_name
          ),
          item:inventory_items (
            id,
            name
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.itemId) {
        query = query.eq('item_id', filters.itemId);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      // Add pagination
      const start = currentPage * itemsPerPage;
      const end = start + itemsPerPage - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;

      setTransactions(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: 'all',
      itemId: '',
      userId: '',
    });
    setCurrentPage(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Transaction Log</h2>
            <p className="text-sm text-gray-500">View and filter all inventory transactions</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="check_in">Check In</option>
                <option value="check_out">Check Out</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item
              </label>
              <select
                value={filters.itemId}
                onChange={(e) => handleFilterChange('itemId', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="">All Items</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User
              </label>
              <select
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions found</div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
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
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4 pt-4 border-t">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}