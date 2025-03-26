import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, differenceInMonths } from 'date-fns';

interface Contact {
  id?: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  phone_ext: string | null;
  is_primary: boolean;
}

interface Client {
  id: string;
  name: string;
  company_name: string | null;
  mrr: number;
  status: 'active' | 'disconnected' | 'suspended';
  client_type: 'msp' | 'unm';
  contacts?: Contact[];
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientSaved: () => void;
  client?: Client;
}

const DEFAULT_CONTACT: Contact = {
  name: '',
  role: 'Primary Contact',
  email: '',
  phone: '',
  phone_ext: '',
  is_primary: true,
};

const ROLE_OPTIONS = [
  'Primary Contact',
  'Billing Contact',
  'IT Contact',
  'Office Admin',
  'Owner',
  'Other'
];

const INITIAL_FORM_DATA = {
  name: '',
  company_name: '',
  street_address: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  mrr: '',
  status: 'active' as const,
  client_type: 'msp' as const,
  start_date: new Date().toISOString().split('T')[0],
};

export default function ClientModal({ isOpen, onClose, onClientSaved, client }: ClientModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [contacts, setContacts] = useState<Contact[]>([{ ...DEFAULT_CONTACT }]);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        company_name: client.company_name || '',
        street_address: client.street_address || '',
        city: client.city || '',
        state: client.state || '',
        postal_code: client.postal_code || '',
        country: client.country || '',
        mrr: client.mrr.toString(),
        status: client.status,
        client_type: client.client_type,
        start_date: client.start_date.split('T')[0],
      });

      // Load contacts
      fetchContacts(client.id);
      
      // Calculate total revenue since client start
      calculateTotalRevenue(client.id, client.start_date);
    } else {
      setFormData(INITIAL_FORM_DATA);
      setContacts([{ ...DEFAULT_CONTACT }]);
      setTotalRevenue(null);
    }
  }, [client]);

  const fetchContacts = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('client_id', clientId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setContacts(data?.map(contact => ({
        ...contact,
        email: contact.email || '',
        phone: contact.phone || '',
        phone_ext: contact.phone_ext || '',
      })) || [{ ...DEFAULT_CONTACT }]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const calculateTotalRevenue = async (clientId: string, startDate: string) => {
    const monthsActive = Math.floor(
      (new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    const { data: clientData } = await supabase
      .from('clients')
      .select('mrr')
      .eq('id', clientId)
      .single();

    if (clientData) {
      const total = clientData.mrr * monthsActive;
      setTotalRevenue(total);
    }
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string | boolean) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    
    // If this contact is being set as primary, update other contacts
    if (field === 'is_primary' && value === true) {
      newContacts.forEach((contact, i) => {
        if (i !== index) {
          contact.is_primary = false;
        }
      });
    }
    
    setContacts(newContacts);
  };

  const addContact = () => {
    setContacts([...contacts, { ...DEFAULT_CONTACT, is_primary: false }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length === 1) return;
    const newContacts = contacts.filter((_, i) => i !== index);
    
    // Ensure there's always a primary contact
    if (!newContacts.some(c => c.is_primary)) {
      newContacts[0].is_primary = true;
    }
    
    setContacts(newContacts);
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      let formatted = cleaned;
      if (cleaned.length > 3) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      }
      if (cleaned.length > 6) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return formatted;
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let clientId = client?.id;

      const submitData = {
        ...formData,
        mrr: parseFloat(formData.mrr) || 0
      };

      if (client) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(submitData)
          .eq('id', client.id);

        if (error) throw error;
      } else {
        // Add new client
        const { data, error } = await supabase
          .from('clients')
          .insert([submitData])
          .select()
          .single();

        if (error) throw error;
        clientId = data.id;
      }

      // Handle contacts
      for (const contact of contacts) {
        if (contact.id) {
          // Update existing contact
          const { error } = await supabase
            .from('contacts')
            .update({
              name: contact.name,
              role: contact.role,
              email: contact.email || null,
              phone: contact.phone || null,
              phone_ext: contact.phone_ext || null,
              is_primary: contact.is_primary,
            })
            .eq('id', contact.id);

          if (error) throw error;
        } else {
          // Add new contact
          const { error } = await supabase
            .from('contacts')
            .insert([{
              ...contact,
              email: contact.email || null,
              phone: contact.phone || null,
              phone_ext: contact.phone_ext || null,
              client_id: clientId,
            }]);

          if (error) throw error;
        }
      }

      onClientSaved();
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error saving client. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {client ? 'Edit Client' : 'Add New Client'}
            </h2>
            {client && (
              <div className="mt-1 space-y-1">
                <p className="text-sm text-gray-500">
                  Client since {format(new Date(client.start_date), 'MMM d, yyyy')}
                </p>
                {totalRevenue !== null && (
                  <p className="text-sm text-gray-500">
                    Total revenue to date: <span className="font-medium text-gray-700">${totalRevenue.toLocaleString()}</span>
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Client Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Type *
                </label>
                <select
                  required
                  value={formData.client_type}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value as 'msp' | 'unm' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="msp">MSP</option>
                  <option value="unm">UNM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Contacts</h3>
              <button
                type="button"
                onClick={addContact}
                className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Contact
              </button>
            </div>
            
            <div className="space-y-6">
              {contacts.map((contact, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={contact.is_primary}
                        onChange={() => handleContactChange(index, 'is_primary', true)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-600">
                        Primary Contact
                      </label>
                    </div>
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        required
                        value={contact.role}
                        onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => handleContactChange(index, 'phone', formatPhoneNumber(e.target.value))}
                          placeholder="(555) 555-5555"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ext.
                        </label>
                        <input
                          type="text"
                          value={contact.phone_ext}
                          onChange={(e) => handleContactChange(index, 'phone_ext', e.target.value)}
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status and MRR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'disconnected' | 'suspended' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="disconnected">Disconnected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Recurring Revenue ($)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*\.?[0-9]*"
                value={formData.mrr}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFormData({ ...formData, mrr: value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              {client ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}