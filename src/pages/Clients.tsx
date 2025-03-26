import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import ClientModal from '../components/ClientModal';

interface Client {
  id: string;
  name: string;
  company_name: string | null;
  mrr: number;
  status: 'active' | 'disconnected' | 'suspended';
  client_type: 'msp' | 'unm';
  contacts: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    phone_ext: string | null;
    is_primary: boolean;
  }[];
}

function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(client => {
        const primaryContact = client.contacts.find(c => c.is_primary);
        return (
          client.name.toLowerCase().includes(query) ||
          (client.company_name && client.company_name.toLowerCase().includes(query)) ||
          (primaryContact?.email && primaryContact.email.toLowerCase().includes(query))
        );
      });
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          contacts (*)
        `)
        .order('company_name', { nullsLast: true });

      if (error) throw error;
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client. Please try again.');
    }
  };

  const handleView = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientTypeColor = (type: Client['client_type']) => {
    switch (type) {
      case 'msp':
        return 'bg-blue-100 text-blue-800';
      case 'unm':
        return 'bg-purple-100 text-purple-800';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Clients</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Client
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRR
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-center text-gray-500">
                    {searchQuery ? 'No clients found matching your search' : 'No clients yet'}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const primaryContact = client.contacts.find(c => c.is_primary);
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {client.company_name || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {primaryContact?.name || '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {primaryContact?.email || '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {formatPhoneNumber(primaryContact?.phone || null)}
                        {primaryContact?.phone_ext && ` ext. ${primaryContact.phone_ext}`}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getClientTypeColor(client.client_type)}`}>
                          {client.client_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.status)}`}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        ${client.mrr.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right space-x-3">
                        <button 
                          onClick={() => handleView(client.id)}
                          className="text-gray-500 hover:text-gray-700 inline-block"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(client)}
                          className="text-blue-500 hover:text-blue-700 inline-block"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="text-red-500 hover:text-red-700 inline-block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onClientSaved={fetchClients}
        client={selectedClient}
      />
    </div>
  );
}

export default Clients;