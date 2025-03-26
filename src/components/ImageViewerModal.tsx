import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    url: string;
    description: string | null;
  } | null;
}

export default function ImageViewerModal({
  isOpen,
  onClose,
  image,
}: ImageViewerModalProps) {
  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative w-full max-w-5xl mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Image container */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="relative">
            <img
              src={image.url}
              alt={image.description || 'Gallery image'}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            {/* Download button */}
            <a
              href={image.url}
              download
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-lg shadow-lg flex items-center gap-2 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </a>
          </div>

          {/* Description */}
          {image.description && (
            <div className="p-4 bg-white border-t">
              <p className="text-gray-700">{image.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}