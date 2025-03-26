import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Upload, Download, Trash2, Plus, Pencil, Phone, Mail, Building2, Calendar, FileText } from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';
import DocumentUploadModal from '../components/DocumentUploadModal';
import DocumentViewerModal from '../components/DocumentViewerModal';
import ExpenseModal from '../components/ExpenseModal';
import NoteModal from '../components/NoteModal';
import NoteViewerModal from '../components/NoteViewerModal';
import ImageGallery from '../components/ImageGallery';
import RevenueShareList from '../components/RevenueShareList';

interface Client {
  id: string;
  name: string;
  company_name: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  mrr: number;
  status: 'active' | 'disconnected' | 'suspended';
  client_type: 'msp' | 'unm';
  start_date: string;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  phone_ext: string | null;
  is_primary: boolean;
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
  partner: {
    name: string;
    type: string;
  };
}

function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedViewNote, setSelectedViewNote] = useState<Note | null>(null);
  const [revenueShares, setRevenueShares] = useState<RevenueShare[]>([]);
  const notesPerPage = 4;

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  useEffect(() => {
    const primaryContact = contacts.find(c => c.is_primary);
    setSelectedContact(primaryContact || contacts[0] || null);
  }, [contacts]);

  async function fetchClientDetails() {
    if (!id) return;

    try {
      const [
        clientResponse,
        contactsResponse,
        documentsResponse,
        expensesResponse,
        notesResponse,
        revenueSharesResponse
      ] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('contacts').select('*').eq('client_id', id).order('is_primary', { ascending: false }),
        supabase.from('documents').select('*').eq('client_id', id).order('created_at', { ascending: false }),
        supabase.from('client_expenses').select('*').eq('client_id', id).order('created_at', { ascending: false }),
        supabase.from('client_notes')
          .select(`
            *,
            document:documents(id, name, url)
          `)
          .eq('client_id', id)
          .order('created_at', { ascending: false }),
        supabase
          .from('partner_revenue_shares')
          .select(`
            *,
            partner:partners(name, type)
          `)
          .eq('client_id', id)
          .order('priority_order', { ascending: true })
      ]);

      if (clientResponse.error) throw clientResponse.error;
      if (contactsResponse.error) throw contactsResponse.error;
      if (documentsResponse.error) throw documentsResponse.error;
      if (expensesResponse.error) throw expensesResponse.error;
      if (notesResponse.error) throw notesResponse.error;
      if (revenueSharesResponse.error) throw revenueSharesResponse.error;

      setClient(clientResponse.data);
      setContacts(contactsResponse.data || []);
      setDocuments(documentsResponse.data || []);
      setExpenses(expensesResponse.data || []);
      setNotes(notesResponse.data || []);
      setRevenueShares(revenueSharesResponse.data || []);

      if (clientResponse.data) {
        const monthsActive = differenceInMonths(
          new Date(),
          new Date(clientResponse.data.start_date)
        );
        const total = clientResponse.data.mrr * monthsActive;
        setTotalRevenue(total);
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const calculateMonthlyExpenses = () => {
    return expenses.reduce((total, expense) => {
      if (expense.amount !== null) {
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
      } else if (expense.percentage !== null && client) {
        // Calculate percentage of MRR
        const monthlyAmount = (client.mrr * expense.percentage) / 100;
        return total + monthlyAmount;
      }
      return total;
    }, 0);
  };

  const calculateNetMonthlyProfit = () => {
    if (!client) return 0;
    const monthlyExpenses = calculateMonthlyExpenses();
    return client.mrr - monthlyExpenses;
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return null;
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const document = documents.find(d => d.id === documentId);
      if (!document || !client) return;

      const filePath = `clients/${client.id}/${documentId}${document.url.substring(document.url.lastIndexOf('.'))}`;
      await supabase.storage
        .from('documents')
        .remove([filePath]);

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      fetchClientDetails();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
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

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('client_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      fetchClientDetails();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      fetchClientDetails();
      setSelectedViewNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseModalOpen(true);
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

  const getIntervalLabel = (interval: Expense['interval']) => {
    switch (interval) {
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'yearly':
        return 'Yearly';
      default:
        return interval;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!client) {
    return <div className="text-center py-8">Client not found</div>;
  }

  const monthlyExpenses = calculateMonthlyExpenses();
  const netMonthlyProfit = calculateNetMonthlyProfit();
  const paginatedNotes = notes.slice(
    currentPage * notesPerPage,
    (currentPage + 1) * notesPerPage
  );
  const totalPages = Math.ceil(notes.length / notesPerPage);

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/clients')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {client.company_name || client.name}
          </h1>
          {client.company_name && (
            <p className="text-sm text-gray-600">{client.name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Client Information</h2>
              <div className="mt-1 space-y-0.5">
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Client since {format(new Date(client.start_date), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-gray-500">
                  Total revenue collected: <span className="font-medium text-gray-700">${totalRevenue.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex space-x-2 mb-3">
              {contacts.map((contact) => (
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
              <div className="space-y-3 bg-gray-50 rounded-lg p-3">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-2.5">
                    <h3 className="text-sm font-medium text-gray-900">{selectedContact.name}</h3>
                    <p className="text-xs text-gray-500">{selectedContact.role}</p>
                  </div>
                </div>

                {selectedContact.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    <a href={`mailto:${selectedContact.email}`} className="hover:text-blue-600">
                      {selectedContact.email}
                    </a>
                  </div>
                )}

                {selectedContact.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                    <span>
                      {formatPhoneNumber(selectedContact.phone)}
                      {selectedContact.phone_ext && ` ext. ${selectedContact.phone_ext}`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {(client.street_address || client.city || client.state || client.postal_code || client.country) && (
            <div className="border-t pt-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                <span className="font-medium">Address</span>
              </div>
              <div className="text-sm text-gray-600">
                {client.street_address && <p>{client.street_address}</p>}
                <p>
                  {[
                    client.city,
                    client.state,
                    client.postal_code
                  ].filter(Boolean).join(', ')}
                </p>
                {client.country && <p>{client.country}</p>}
              </div>
            </div>
          )}

          <div className="border-t mt-4 pt-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">Monthly Recurring Revenue</label>
                <p className="mt-0.5 text-base font-semibold text-green-600">${client.mrr.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Monthly Recurring Expenses</label>
                <p className="mt-0.5 text-base font-semibold text-red-600">${monthlyExpenses.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Net Monthly Profit</label>
                <p className={`mt-0.5 text-base font-semibold ${netMonthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netMonthlyProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recurring Expenses</h2>
            <button
              onClick={() => {
                setSelectedExpense(undefined);
                setIsExpenseModalOpen(true);
              }}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center text-sm hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Expense
            </button>
          </div>
          
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recurring expenses</p>
            ) : (
              expenses.map((expense) => {
                let monthlyAmount = 0;
                
                if (expense.amount !== null) {
                  monthlyAmount = expense.amount;
                  switch (expense.interval) {
                    case 'quarterly':
                      monthlyAmount = expense.amount / 3;
                      break;
                    case 'yearly':
                      monthlyAmount = expense.amount / 12;
                      break;
                  }
                } else if (expense.percentage !== null && client) {
                  monthlyAmount = (client.mrr * expense.percentage) / 100;
                }

                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{expense.description}</h3>
                      <div className="space-y-0.5 mt-1">
                        <p className="text-xs text-gray-500">
                          {expense.amount !== null ? (
                            `$${expense.amount.toLocaleString()}`
                          ) : expense.percentage !== null ? (
                            `${expense.percentage}% of revenue`
                          ) : (
                            'No amount specified'
                          )} • {getIntervalLabel(expense.interval)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Monthly Amount: ${monthlyAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Starting {format(new Date(expense.start_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <RevenueShareList
            clientId={client.id}
            revenueShares={revenueShares}
            netProfit={netMonthlyProfit}
            onUpdate={fetchClientDetails}
          />
        </div>

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
          
          <div className="space-y-2">
            {notes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
            ) : (
              <>
                {paginatedNotes.map((note) => (
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
                ))}

                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 pt-3">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    <span className="text-xs text-gray-600">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

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

        <div className="lg:col-span-2">
          <ImageGallery clientId={client.id} />
        </div>
      </div>

      {client && (
        <>
          <DocumentUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadComplete={fetchClientDetails}
            clientId={client.id}
          />
          <ExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={() => {
              setIsExpenseModalOpen(false);
              setSelectedExpense(undefined);
            }}
            onExpenseSaved={fetchClientDetails}
            clientId={client.id}
            expense={selectedExpense}
          />
          <NoteModal
            isOpen={isNoteModalOpen}
            onClose={() => {
              setIsNoteModalOpen(false);
              setSelectedNote(undefined);
            }}
            onNoteSaved={fetchClientDetails}
            clientId={client.id}
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

export default ClientDetails;