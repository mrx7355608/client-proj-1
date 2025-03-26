import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Contact {
  id?: string;
  role: 'Owner' | 'Manager' | 'Agent' | 'Finance';
  name: string;
  email: string;
  phone: string;
  phone_ext: string;
  is_primary: boolean;
}

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
  contacts?: Contact[];
}

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPartnerSaved: () => void;
  partner?: Partner;
}

const INITIAL_FORM_DATA = {
  name: '',
  type: 'vendor' as const,
  website: '',
  status: 'active' as const,
  notes: '',
};

const CONTACT_ROLES = ['Owner', 'Manager', 'Agent', 'Finance'] as const;

const INITIAL_CONTACT: Contact = {
  role: 'Owner',
  name: '',
  email: '',
  phone: '',
  phone_ext: '',
  is_primary: true,
};

export default function PartnerModal({
  isOpen,
  onClose,
  onPartnerSaved,
  partner,
}: PartnerModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [contacts, setContacts] = useState<Contact[]>([{ ...INITIAL_CONTACT }]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        type: partner.type,
        website: partner.website || '',
        status: partner.status,
        notes: partner.notes || '',
      });

      // Set contacts if available, otherwise use primary contact info
      if (partner.contacts && partner.contacts.length > 0) {
        setContacts(partner.contacts);
      } else {
        setContacts([{
          role: 'Owner',
          name: partner.contact_name,
          email: partner.contact_email || '',
          phone: partner.contact_phone || '',
          phone_ext: partner.contact_phone_ext || '',
          is_primary: true,
        }]);
      }
    } else {
      setFormData(INITIAL_FORM_DATA);
      setContacts([{ ...INITIAL_CONTACT }]);
    }
    setFiles(null);
  }, [partner]);

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

  const handleContactChange = (index: number, field: keyof Contact, value: string | boolean) => {
    const newContacts = [...contacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: field === 'phone' ? formatPhoneNumber(value as string) : value,
    };
    
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
    setContacts([...contacts, { ...INITIAL_CONTACT, is_primary: false }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let partnerId = partner?.id;

      // Handle partner data
      const partnerData = {
        ...formData,
        // Use primary contact for backward compatibility
        contact_name: contacts.find(c => c.is_primary)?.name || contacts[0].name,
        contact_email: contacts.find(c => c.is_primary)?.email || contacts[0].email || null,
        contact_phone: contacts.find(c => c.is_primary)?.phone || contacts[0].phone || null,
        contact_phone_ext: contacts.find(c => c.is_primary)?.phone_ext || contacts[0].phone_ext || null,
      };

      if (partner) {
        const { error } = await supabase
          .from('partners')
          .update(partnerData)
          .eq('id', partner.id);

        if (error) throw error;
        partnerId = partner.id;
      } else {
        const { data, error } = await supabase
          .from('partners')
          .insert([partnerData])
          .select()
          .single();

        if (error) throw error;
        partnerId = data.id;
      }

      // Delete existing contacts if updating
      if (partner) {
        const { error: deleteError } = await supabase
          .from('partner_contacts')
          .delete()
          .eq('partner_id', partnerId);

        if (deleteError) throw deleteError;
      }

      // Insert all contacts
      const { error: contactsError } = await supabase
        .from('partner_contacts')
        .insert(
          contacts.map(contact => ({
            partner_id: partnerId,
            role: contact.role,
            name: contact.name,
            email: contact.email || null,
            phone: contact.phone || null,
            phone_ext: contact.phone_ext || null,
            is_primary: contact.is_primary,
          }))
        );

      if (contactsError) throw contactsError;

      // Handle document uploads
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `partners/${partnerId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('partner-documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('partner-documents')
            .getPublicUrl(filePath);

          const { error: docError } = await supabase
            .from('partner_documents')
            .insert([{
              partner_id: partnerId,
              name: file.name,
              type: 'other',
              url: publicUrl,
            }]);

          if (docError) throw docError;
        }
      }

      onPartnerSaved();
      onClose();
    } catch (error) {
      console.error('Error saving partner:', error);
      alert('Error saving partner. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ml-64">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {partner ? 'Edit Partner' : 'Add New Partner'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Organization Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Partner['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="partner">Partner</option>
                  <option value="vendor">Vendor</option>
                  <option value="distributor">Distributor</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="service_provider">Service Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
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
                <Plus className="w-4 h-4 mr-1" />
                Add Contact
              </button>
            </div>

            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <select
                        value={contact.role}
                        onChange={(e) => handleContactChange(index, 'role', e.target.value as Contact['role'])}
                        className="text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CONTACT_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={contact.is_primary}
                          onChange={() => handleContactChange(index, 'is_primary', true)}
                          className="text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Primary Contact</span>
                      </label>
                    </div>
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
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
                          onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
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

          {/* Documents */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Documents</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Documents
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload contracts, agreements, or other relevant documents
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional notes about this partner..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Upload className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : partner ? (
                'Save Changes'
              ) : (
                'Add Partner'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}