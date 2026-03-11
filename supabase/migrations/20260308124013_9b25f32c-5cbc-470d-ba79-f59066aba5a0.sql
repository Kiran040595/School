
-- Create resources table
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Anyone can view resources
CREATE POLICY "Anyone can view resources" ON public.resources
  FOR SELECT USING (true);

-- Admins can insert resources
CREATE POLICY "Admins can insert resources" ON public.resources
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete resources
CREATE POLICY "Admins can delete resources" ON public.resources
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update resources
CREATE POLICY "Admins can update resources" ON public.resources
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Storage RLS: anyone can read
CREATE POLICY "Anyone can read resources" ON storage.objects
  FOR SELECT USING (bucket_id = 'resources');

-- Storage RLS: admins can upload
CREATE POLICY "Admins can upload resources" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage RLS: admins can delete
CREATE POLICY "Admins can delete resource files" ON storage.objects
  FOR DELETE USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role));
