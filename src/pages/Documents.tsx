import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
  client: {
    id: string;
    name: string;
  };
}

function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          client:clients(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      // Delete from storage
      const filePath = `clients/${document.client.id}/${documentId}.${document.url.split('.').pop()}`;
      await supabase.storage
        .from('documents')
        .remove([filePath]);

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const filePath = `clients/${document.client.id}/${document.id}.${document.url.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60); // 60 seconds expiry

      if (error) throw error;

      // Create a download link
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Documents</h1>
        <button className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors">
          <Upload className="w-4 h-4 mr-1.5" />
          Upload Document
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{document.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {document.client.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {document.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {format(new Date(document.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDownload(document)}
                      className="text-blue-500 hover:text-blue-700 mr-3 inline-block"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(document.id)}
                      className="text-red-500 hover:text-red-700 inline-block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Documents;