import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FolderPlus, Upload, Pencil, Trash2, Image as ImageIcon, Calendar } from 'lucide-react';
import ImageFolderModal from './ImageFolderModal';
import ImageUploadModal from './ImageUploadModal';
import ImageViewerModal from './ImageViewerModal';
import { format } from 'date-fns';

interface ImageFolder {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface GalleryImage {
  id: string;
  url: string;
  description: string | null;
  created_at: string;
}

interface ImageGalleryProps {
  clientId: string;
}

export default function ImageGallery({ clientId }: ImageGalleryProps) {
  const [folders, setFolders] = useState<ImageFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<ImageFolder | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<ImageFolder | undefined>();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchFolders();
  }, [clientId]);

  useEffect(() => {
    if (selectedFolder) {
      fetchImages(selectedFolder.id);
    } else {
      setImages([]);
    }
  }, [selectedFolder]);

  async function fetchFolders() {
    try {
      const { data, error } = await supabase
        .from('image_folders')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }

  async function fetchImages(folderId: string) {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and all its images?')) return;

    try {
      const { error } = await supabase
        .from('image_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null);
      }
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Error deleting folder. Please try again.');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      if (selectedFolder) {
        fetchImages(selectedFolder.id);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  const getFirstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/);
    return match ? match[0] : text;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Image Gallery</h2>
        <button
          onClick={() => {
            setEditingFolder(undefined);
            setIsFolderModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
        >
          <FolderPlus className="w-5 h-5 mr-2" />
          New Folder
        </button>
      </div>

      {/* Folders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedFolder?.id === folder.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div
                className="flex-1"
                onClick={() => setSelectedFolder(selectedFolder?.id === folder.id ? null : folder)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-800">{folder.name}</h3>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(folder.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                {folder.description && (
                  <p className="text-sm text-gray-500">
                    {getFirstSentence(folder.description)}
                  </p>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFolder(folder);
                    setIsFolderModalOpen(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Folder Content */}
      {selectedFolder && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-medium text-gray-800">
                {selectedFolder.name}
              </h3>
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(selectedFolder.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            {selectedFolder.description && (
              <p className="text-sm text-gray-500 mb-4">
                {selectedFolder.description}
              </p>
            )}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Images
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative">
                <div 
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.url}
                    alt={image.description || 'Gallery image'}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
                {image.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {image.description}
                  </p>
                )}
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No images in this folder</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ImageFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(undefined);
        }}
        onFolderSaved={fetchFolders}
        clientId={clientId}
        folder={editingFolder}
      />

      {selectedFolder && (
        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={() => {
            fetchImages(selectedFolder.id);
          }}
          folderId={selectedFolder.id}
          clientId={clientId}
        />
      )}

      <ImageViewerModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage}
      />
    </div>
  );
}