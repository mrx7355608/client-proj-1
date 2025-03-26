import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Upload, Download, Trash2, Plus, Pencil, Phone, Mail, ExternalLink, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import PartnerModal from '../components/PartnerModal';
import PartnerDocumentUploadModal from '../components/PartnerDocumentUploadModal';
import NoteModal from '../components/NoteModal';
import NoteViewerModal from '../components/NoteViewerModal';

interface Contact {
  id: string;
  role: 'Owner' | 'Manager' | 'Agent' | 'Finance';
  name: string;
  email: string | null;
  phone: string | null;
  phone_ext: string | null;
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
  created_at: string;
  contacts?: Contact[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
}

interface Note {
  id: string;
  subject: string;
  body: string;
  document_id: string | null;
  created_at: string;
  document?: {
    id: string;
    name: string;
    url: string;
  } | null;
}

interface RevenueShare {
  id: string;
  partner_id: string;
  percentage: number | null;
  flat_rate: number | null;
  start_date: string;
  end_date: string | null;
  priority_order: number;
  client: {
    id: string;
    name: string;
    company_name: string | null;
    mrr: number;
    expenses: {
      amount: number;
      interval: 'monthly' | 'quarterly' | 'yearly';
    }[];
  };
}

export default function PartnerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [revenueShares, setRevenueShares] = useState<RevenueShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [selectedViewNote, setSelectedViewNote] = useState<Note | null>(null);

  useEffect(() => {
    if (id) {
      fetchPartnerDetails();
    }
  }, [id]);

  useEffect(() => {
    if (partner?.contacts) {
      const primaryContact = partner.contacts.find(c => c.is_primary);
      setSelectedContact(primaryContact || partner.contacts[0] || null);
    }
  }, [partner?.contacts]);

  async function fetchPartnerDetails() {
    try {
      const [partnerResponse, contactsResponse, documentsResponse, notesResponse, revenueSharesResponse] = await Promise.all([
        supabase
          .from('partners')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('partner_contacts')
          .select('*')
          .eq('partner_id', id)
          .order('is_primary', { ascending: false }),
        supabase
          .from('partner_documents')
          .select('*')
          .eq('partner_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('partner_notes')
          .select(`
            *,
            document:partner_documents(id, name, url)
          `)
          .eq('partner_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('partner_revenue_shares')
          .select(`
            *,
            client:clients (
              id,
              name,
              company_name,
              mrr,
              expenses:client_expenses(amount, interval)
            )
          `)
          .eq('partner_id', id)
          .order('priority_order', { ascending: true })
      ]);

      if (partnerResponse.error) throw partnerResponse.error;
      if (contactsResponse.error) throw contactsResponse.error;
      if (documentsResponse.error) throw documentsResponse.error;
      if (notesResponse.error) throw notesResponse.error;
      if (revenueSharesResponse.error) throw revenueSharesResponse.error;

      setPartner({
        ...partnerResponse.data,
        contacts: contactsResponse.data || []
      });
      setDocuments(documentsResponse.data || []);
      setNotes(notesResponse.data || []);
      setRevenueShares(revenueSharesResponse.data || []);
    } catch (error) {
      console.error('Error fetching partner details:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const calculateMonthlyExpenses = (expenses: { amount: number; interval: string }[]) => {
    return expenses.reduce((total, expense) => {
      let monthlyAmount = expense.amount;
      switch (expense.interval) {
        case 'quarterly':
          monthlyAmount = expense.amount / 3;
          break;
        case 'yearly':
          monthlyAmount = expense.amount / 12;
          break;
      }
      return total + monthlyAmount;
    }, 0);
  };

  const calculateShareAmount = (share: RevenueShare) => {
    const monthlyExpenses = calculateMonthlyExpenses(share.client.expenses);
    const netProfit = share.client.mrr - monthlyExpenses;

    if (share.flat_rate !== null) {
      return share.flat_rate;
    }
    if (share.percentage !== null) {
      return (netProfit * share.percentage) / 100;
    }
    return 0;
  };

  const totalMonthlyRevenue = revenueShares.reduce((total, share) => {
    return total + calculateShareAmount(share);
  }, 0);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const document = documents.find(d => d.id === documentId);
      if (!document || !partner) return;

      const filePath = `partners/${partner.id}/${documentId}${document.url.substring(document.url.lastIndexOf('.'))}`;
      await supabase.storage
        .from('partner-documents')
        .remove([filePath]);

      const { error } = await supabase
        .from('partner_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      fetchPartnerDetails();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('partner_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      fetchPartnerDetails();
      setSelectedViewNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      window.open(document.url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
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

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return null;
    
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

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!partner) {
    return <div className="text-center py-8">Partner not found</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/partners')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{partner.name}</h1>
          <p className="text-sm text-gray-600">
            Added on {format(new Date(partner.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Partner Information */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Partner Information</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(partner.type)}`}>
                  {getTypeLabel(partner.type)}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(partner.status)}`}>
                  {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-500 hover:text-blue-700"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Contacts */}
            <div>
              <div className="flex space-x-2 mb-3">
                {partner.contacts?.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      selectedContact?.id === contact.id
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {contact.role}
                  </button>
                ))}
              </div>

              {selectedContact && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-2.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">{selectedContact.name}</h3>
                        {selectedContact.is_primary && (
                          <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{selectedContact.role}</p>
                      <div className="mt-1 space-y-1">
                        {selectedContact.email && (
                          <a 
                            href={`mailto:${selectedContact.email}`}
                            className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                          >
                            <Mail className="w-3.5 h-3.5 mr-1.5" />
                            {selectedContact.email}
                          </a>
                        )}
                        {selectedContact.phone && (
                          <a 
                            href={`tel:${selectedContact.phone}`}
                            className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1.5" />
                            {formatPhoneNumber(selectedContact.phone)}
                            {selectedContact.phone_ext && ` ext. ${selectedContact.phone_ext}`}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Website */}
            {partner.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Website</h3>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
                >
                  {partner.website}
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </div>
            )}

            {/* Notes */}
            {partner.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                  {partner.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Client Revenue Shares</h2>
              <p className="text-sm text-gray-500">
                Total Monthly Revenue: <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">${totalMonthlyRevenue.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {revenueShares.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No revenue shares configured
              </p>
            ) : (
              revenueShares.map((share, index) => {
                const monthlyExpenses = calculateMonthlyExpenses(share.client.expenses);
                const netProfit = share.client.mrr - monthlyExpenses;
                const amount = calculateShareAmount(share);
                const remainingProfit = netProfit - (index > 0 ? 
                  revenueShares
                    .slice(0, index)
                    .reduce((sum, prevShare) => sum + calculateShareAmount(prevShare), 0) 
                  : 0);

                return (
                  <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">
                        {share.client.company_name || share.client.name}
                      </h3>
                      <div className="mt-1 space-y-1 text-xs text-gray-500">
                        <p>
                          MRR: ${share.client.mrr.toLocaleString()} • 
                          Expenses: ${monthlyExpenses.toLocaleString()} • 
                          Net Profit: ${netProfit.toLocaleString()}
                        </p>
                        <p>
                          Revenue Share: {share.percentage !== null
                            ? `${share.percentage}% of remaining profit ($${remainingProfit.toLocaleString()})`
                            : `$${share.flat_rate?.toLocaleString()} flat rate`}
                        </p>
                        <p>
                          Monthly Payout: <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">${amount.toLocaleString()}</span>
                        </p>
                        <p>
                          From: {format(new Date(share.start_date), 'MMM d, yyyy')}
                          {share.end_date && ` to ${format(new Date(share.end_date), 'MMM d, yyyy')}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/clients/${share.client.id}`)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      View Client
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
            <button
              onClick={() => {
                setSelectedNote(undefined);
                setIsNoteModalOpen(true);
              }}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center text-sm hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Note
            </button>
          </div>
          
          <div className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedViewNote(note)}
                  className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{note.subject}</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(note.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {note.document && (
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center text-sm hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Upload
            </button>
          </div>
          
          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No documents yet</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{doc.name}</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(doc.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <PartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPartnerSaved={fetchPartnerDetails}
        partner={partner}
      />

      {partner && (
        <>
          <PartnerDocumentUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadComplete={fetchPartnerDetails}
            partnerId={partner.id}
          />
          <NoteModal
            isOpen={isNoteModalOpen}
            onClose={() => {
              setIsNoteModalOpen(false);
              setSelectedNote(undefined);
            }}
            onNoteSaved={fetchPartnerDetails}
            partnerId={partner.id}
            note={selectedNote}
            documents={documents}
          />
          <NoteViewerModal
            isOpen={!!selectedViewNote}
            onClose={() => setSelectedViewNote(null)}
            note={selectedViewNote}
            onEdit={() => {
              setSelectedNote(selectedViewNote);
              setSelectedViewNote(null);
              setIsNoteModalOpen(true);
            }}
            onDelete={handleDeleteNote}
          />
        </>
      )}
    </div>
  );
}