-- Create storage bucket for inventory images
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory', 'inventory', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for inventory images
CREATE POLICY "Allow authenticated users to manage inventory images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'inventory')
  WITH CHECK (bucket_id = 'inventory');