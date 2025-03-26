import React from 'react';
import { X, FileText, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  subject: string;
  body: string;
  created_at: string;
  document?: {
    id: string;
    name: string;
    url: string;
  } | null;
}

interface NoteViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function NoteViewerModal({
  isOpen,
  onClose,
  note,
  onEdit,
  onDelete,
}: NoteViewerModalProps) {
  if (!isOpen || !note) return null;

  const handleDelete = () => {
    onDelete(note.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 m-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{note.subject}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="whitespace-pre-wrap text-gray-700">{note.body}</p>
          </div>

          {note.document && (
            <div className="flex items-center justify-between bg-blue-50 text-blue-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                <span className="font-medium">{note.document.name}</span>
              </div>
              <a
                href={note.document.url}
                download
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Download className="w-5 h-5 mr-1" />
                Download
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-end items-center gap-3 mt-6">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:text-red-700 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Note
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Edit Note
          </button>
        </div>
      </div>
    </div>
  );
}