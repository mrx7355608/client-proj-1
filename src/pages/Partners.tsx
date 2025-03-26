import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Search, ExternalLink, Mail, Phone, Eye, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import PartnerModal from '../components/PartnerModal';

interface Partner {
  id: string;
  name: string;
  type: 'vendor' | 'distributor' | 'manufacturer' | 'service_provider' | 'partner';
  website: string | null;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_phone_ext: string | null;
  status: 'active' | 'inactive';
  notes: string | null;
  created_at: string;
  partner_revenue_shares: {
    id: string;
    client_id: string;
    percentage: number | null;
    flat_rate: number | null;
    client: {
      name: string;
      company_name: string | null;
      mrr: number;
      expenses: {
        amount: number;
        interval: 'monthly' | 'quarterly' | 'yearly';
      }[];
    };
  }[];
}

function Partners() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPartners(partners);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = partners.filter(partner => 
        partner.name.toLowerCase().includes(query) ||
        partner.type.toLowerCase().includes(query) ||
        partner.contact_name.toLowerCase().includes(query) ||
        (partner.contact_email && partner.contact_email.toLowerCase().includes(query))
      );
      setFilteredPartners(filtered);
    }
  }, [searchQuery, partners]);

  async function fetchPartners() {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          partner_revenue_shares (
            id,
            client_id,
            percentage,
            flat_rate,
            client:clients (
              name,
              company_name,
              mrr,
              expenses:client_expenses(amount, interval)
            )
          )
        `)
        .order('name');

      if (error) throw error;
      setPartners(data || []);
      setFilteredPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setError('Failed to load partners. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }

  const calculateMonthlyExpenses = (expenses: { amount: number; interval: string }[] = []) => {
    return expenses.reduce((total, expense) => {
      let monthlyAmount = expense.amount || 0;
      switch (expense.interval) {
        case 'quarterly':
          monthlyAmount = monthlyAmount / 3;
          break;
        case 'yearly':
          monthlyAmount = monthlyAmount / 12;
          break;
      }
      return total + monthlyAmount;
    }, 0);
  };

  const calculateTotalRevenue = (partner: Partner) => {
    return (partner.partner_revenue_shares || []).reduce((total, share) => {
      if (!share.client) return total;
      
      const monthlyExpenses = calculateMonthlyExpenses(share.client.expenses);
      const netProfit = (share.client.mrr || 0) - monthlyExpenses;

      if (share.flat_rate !== null) {
        return total + (share.flat_rate || 0);
      }
      if (share.percentage !== null) {
        return total + ((netProfit * (share.percentage || 0)) / 100);
      }
      return total;
    }, 0);
  };

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      alert('Error deleting partner. Please try again.');
    }
  };

  const handleView = (partnerId: string) => {
    navigate(`/partners/${partnerId}`);
  };

  const getStatusColor = (status: Partner['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Partner['type']) => {
    switch (type) {
      case 'vendor':
        return 'bg-blue-100 text-blue-800';
      case 'distributor':
        return 'bg-purple-100 text-purple-800';
      case 'manufacturer':
        return 'bg-orange-100 text-orange-800';
      case 'service_provider':
        return 'bg-teal-100 text-teal-800';
      case 'partner':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return '-';
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getTypeLabel = (type: Partner['type']) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Partners</h1>
        <button 
          onClick={() => {
            setSelectedPartner(undefined);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Partner
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Revenue
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                    {searchQuery ? 'No partners found matching your search' : 'No partners yet'}
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {partner.name}
                      </div>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 inline-flex items-center text-xs mt-1"
                        >
                          Visit Website
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(partner.type)}`}>
                        {getTypeLabel(partner.type)}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{partner.contact_name}</div>
                      <div className="flex items-center space-x-4 mt-1">
                        {partner.contact_email && (
                          <a 
                            href={`mailto:${partner.contact_email}`}
                            className="text-gray-500 hover:text-gray-700 flex items-center text-xs"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            {partner.contact_email}
                          </a>
                        )}
                        {partner.contact_phone && (
                          <a 
                            href={`tel:${partner.contact_phone}`}
                            className="text-gray-500 hover:text-gray-700 flex items-center text-xs"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            {formatPhoneNumber(partner.contact_phone)}
                            {partner.contact_phone_ext && ` ext. ${partner.contact_phone_ext}`}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ${calculateTotalRevenue(partner).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(partner.status)}`}>
                        {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right space-x-3">
                      <button 
                        onClick={() => handleView(partner.id)}
                        className="text-gray-500 hover:text-gray-700 inline-block"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(partner)}
                        className="text-blue-500 hover:text-blue-700 inline-block"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(partner.id)}
                        className="text-red-500 hover:text-red-700 inline-block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <PartnerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPartner(undefined);
        }}
        onPartnerSaved={fetchPartners}
        partner={selectedPartner}
      />
    </div>
  );
}

export default Partners;