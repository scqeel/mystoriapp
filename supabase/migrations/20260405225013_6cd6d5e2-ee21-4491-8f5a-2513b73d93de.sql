
-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  studio_name TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  brand_color TEXT DEFAULT '#F4A261',
  subdomain TEXT UNIQUE,
  onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Galleries
CREATE TABLE public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  welcome_message TEXT DEFAULT '',
  note TEXT DEFAULT '',
  password_hash TEXT,
  hero_banner_url TEXT DEFAULT '',
  brand_color TEXT DEFAULT '#F4A261',
  download_enabled BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photographers can manage own galleries" ON public.galleries
  FOR ALL TO authenticated USING (photographer_id = auth.uid()) WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "Public can view galleries" ON public.galleries
  FOR SELECT TO anon USING (true);

-- Gallery Images
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photographers can manage gallery images" ON public.gallery_images
  FOR ALL TO authenticated USING (
    gallery_id IN (SELECT id FROM public.galleries WHERE photographer_id = auth.uid())
  ) WITH CHECK (
    gallery_id IN (SELECT id FROM public.galleries WHERE photographer_id = auth.uid())
  );

CREATE POLICY "Public can view gallery images" ON public.gallery_images
  FOR SELECT TO anon USING (true);

-- Favorites
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL REFERENCES public.gallery_images(id) ON DELETE CASCADE,
  client_session TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(image_id, client_session)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage favorites" ON public.favorites
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  image_id UUID REFERENCES public.gallery_images(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT 'Client',
  message TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can add comments" ON public.comments
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Photographers can delete comments" ON public.comments
  FOR DELETE TO authenticated USING (
    gallery_id IN (SELECT id FROM public.galleries WHERE photographer_id = auth.uid())
  );

-- Portfolios
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Portfolio',
  tagline TEXT DEFAULT '',
  about TEXT DEFAULT '',
  sections JSONB DEFAULT '[]'::jsonb,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photographers can manage own portfolios" ON public.portfolios
  FOR ALL TO authenticated USING (photographer_id = auth.uid()) WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "Public can view published portfolios" ON public.portfolios
  FOR SELECT TO anon USING (published = true);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT DEFAULT '',
  client_phone TEXT DEFAULT '',
  service_type TEXT DEFAULT '',
  booking_date DATE,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photographers can manage own bookings" ON public.bookings
  FOR ALL TO authenticated USING (photographer_id = auth.uid()) WITH CHECK (photographer_id = auth.uid());

CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT TO anon WITH CHECK (true);

-- Activity Logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photographers can view own activity" ON public.activity_logs
  FOR SELECT TO authenticated USING (photographer_id = auth.uid());

CREATE POLICY "Anyone can create activity logs" ON public.activity_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);
