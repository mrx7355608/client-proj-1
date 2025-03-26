import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteSaved: () => void;
  partnerId: string;
  note?: Note;
  documents: Document[];
}

export default function NoteModal({
  isOpen,
  onClose,
  onNoteSaved,
  partnerId,
  note,
  documents,
}: NoteModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    document_id: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        subject: note.subject,
        body: note.body,
        document_id: note.document_id || '',
      });
    } else {
      setFormData({
        subject: '',
        body: '',
        document_id: '',
      });
    }
    setFile(null);
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let documentId = formData.document_id;

      // Handle file upload if a new file is selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `partners/${partnerId}/${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('partner-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('partner-documents')
          .getPublicUrl(filePath);

        // Create document record
        const { data: documentData, error: documentError } = await supabase
          .from('partner_documents')
          .insert([{
            partner_id: partnerId,
            name: file.name,
            type: 'other',
            url: publicUrl,
          }])
          .select()
          .single();

        if (documentError) throw documentError;
        documentId = documentData.id;
      }

      const noteData = {
        ...formData,
        document_id: documentId || null,
        partner_id: partnerId,
      };

      if (note) {
        const { error } = await supabase
          .from('partner_notes')
          .update(noteData)
          .eq('id', note.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('partner_notes')
          .insert([noteData]);

        if (error) throw error;
      }

      onNoteSaved();
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] ml-64">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {note ? 'Edit Note' : 'Add New Note'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter note subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Content *
            </label>
            <textarea
              required
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Enter note content"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Attach Document
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Upload New Document
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                      setFormData({ ...formData, document_id: '' });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Or Select Existing Document
                </label>
                <select
                  value={formData.document_id}
                  onChange={(e) => {
                    setFormData({ ...formData, document_id: e.target.value });
                    setFile(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </span>
              ) : note ? (
                'Save Changes'
              ) : (
                'Add Note'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}