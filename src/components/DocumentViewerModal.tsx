import React from 'react';
import { X, Download } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  documentUrl,
  documentName,
}: DocumentViewerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 truncate">
            {documentName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            This document can be viewed in a new tab or downloaded to your device.
          </p>
          <div className="space-x-4">
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              View in New Tab
            </a>
            <a
              href={documentUrl}
              download={documentName}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}