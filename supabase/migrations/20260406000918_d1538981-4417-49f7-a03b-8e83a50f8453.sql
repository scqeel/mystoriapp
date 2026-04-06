
-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);

-- Allow authenticated users to upload to gallery-images
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'gallery-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update own gallery images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'gallery-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete own gallery images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'gallery-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to gallery images
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'gallery-images');
