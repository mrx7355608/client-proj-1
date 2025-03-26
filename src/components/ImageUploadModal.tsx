import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  folderId: string;
  clientId: string;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  folderId,
  clientId,
}: ImageUploadModalProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(selectedFiles);
      // Initialize descriptions and generate previews for each file
      const newDescriptions: { [key: string]: string } = {};
      const newPreviews: { [key: string]: string } = {};
      
      Array.from(selectedFiles).forEach((file) => {
        newDescriptions[file.name] = '';
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newPreviews[file.name] = previewUrl;
      });
      
      setDescriptions(newDescriptions);
      setPreviews(newPreviews);
    }
  };

  const handleDescriptionChange = (fileName: string, description: string) => {
    setDescriptions((prev) => ({
      ...prev,
      [fileName]: description,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedImages = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `clients/${clientId}/${folderId}/${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        uploadedImages.push({
          folder_id: folderId,
          url: publicUrl,
          description: descriptions[file.name] || '',
        });

        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      // Save image records to database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .insert(uploadedImages);

      if (dbError) throw dbError;

      // Cleanup preview URLs
      Object.values(previews).forEach(URL.revokeObjectURL);

      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Cleanup preview URLs when modal closes
  const handleClose = () => {
    Object.values(previews).forEach(URL.revokeObjectURL);
    setPreviews({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Upload Images</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Images *
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {files && Array.from(files).map((file) => (
            <div key={file.name} className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex gap-4">
                {/* Image Preview */}
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={previews[file.name]}
                    alt={`Preview of ${file.name}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                {/* File Info and Description */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">{file.name}</p>
                  <textarea
                    placeholder="Add a description for this image..."
                    value={descriptions[file.name] || ''}
                    onChange={(e) => handleDescriptionChange(file.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={isUploading || !files}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}