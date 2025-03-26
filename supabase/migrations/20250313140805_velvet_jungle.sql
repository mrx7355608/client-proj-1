/*
  # Add Image Galleries for Clients

  1. New Tables
    - `image_folders`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `gallery_images`
      - `id` (uuid, primary key)
      - `folder_id` (uuid, references image_folders)
      - `url` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create image_folders table
CREATE TABLE IF NOT EXISTS image_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid REFERENCES image_folders(id) ON DELETE CASCADE,
  url text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE image_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for image_folders
CREATE POLICY "Users can view image folders"
  ON image_folders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create image folders"
  ON image_folders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update image folders"
  ON image_folders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete image folders"
  ON image_folders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for gallery_images
CREATE POLICY "Users can view gallery images"
  ON gallery_images
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create gallery images"
  ON gallery_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update gallery images"
  ON gallery_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete gallery images"
  ON gallery_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_image_folders_updated_at
    BEFORE UPDATE ON image_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_images_updated_at
    BEFORE UPDATE ON gallery_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gallery bucket
CREATE POLICY "Allow authenticated users to manage gallery images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'gallery')
  WITH CHECK (bucket_id = 'gallery');