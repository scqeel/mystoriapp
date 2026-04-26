-- =========================================
-- WIPE MYSTORI
-- =========================================
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.gallery_images CASCADE;
DROP TABLE IF EXISTS public.galleries CASCADE;
DROP TABLE IF EXISTS public.portfolios CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- =========================================
-- ONEGIG SCHEMA
-- =========================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, email, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'username'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  logo_emoji TEXT NOT NULL DEFAULT '📶',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.networks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view networks" ON public.networks FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins manage networks" ON public.networks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id UUID NOT NULL REFERENCES public.networks(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  size_mb INT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER bundles_updated_at BEFORE UPDATE ON public.bundles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Public view bundles" ON public.bundles FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins manage bundles" ON public.bundles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL DEFAULT 'My OneGig Store',
  store_slug TEXT UNIQUE NOT NULL,
  store_logo_url TEXT,
  store_tagline TEXT DEFAULT 'Fast data. Better prices.',
  store_brand_color TEXT DEFAULT '#6366f1',
  activation_paid BOOLEAN NOT NULL DEFAULT false,
  activation_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER agent_profiles_updated_at BEFORE UPDATE ON public.agent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Public view active agent stores" ON public.agent_profiles FOR SELECT TO anon, authenticated
  USING (activation_paid = true);
CREATE POLICY "Agents view own profile" ON public.agent_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Agents update own profile" ON public.agent_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Agents insert own profile" ON public.agent_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage agent profiles" ON public.agent_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.agent_bundle_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agent_profiles(id) ON DELETE CASCADE,
  bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  sell_price NUMERIC(10,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_id, bundle_id)
);
ALTER TABLE public.agent_bundle_prices ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER abp_updated_at BEFORE UPDATE ON public.agent_bundle_prices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Public view agent prices" ON public.agent_bundle_prices FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Agents manage own prices" ON public.agent_bundle_prices FOR ALL TO authenticated
  USING (agent_id IN (SELECT id FROM public.agent_profiles WHERE user_id = auth.uid()))
  WITH CHECK (agent_id IN (SELECT id FROM public.agent_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage all prices" ON public.agent_bundle_prices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TYPE public.order_status AS ENUM ('pending','processing','delivered','failed','refunded');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE public.order_source AS ENUM ('direct','agent_store');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL DEFAULT 'OG-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  customer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_phone TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  network_id UUID NOT NULL REFERENCES public.networks(id),
  bundle_id UUID NOT NULL REFERENCES public.bundles(id),
  agent_id UUID REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
  source order_source NOT NULL DEFAULT 'direct',
  base_price NUMERIC(10,2) NOT NULL,
  sell_price NUMERIC(10,2) NOT NULL,
  agent_profit NUMERIC(10,2) NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX orders_customer_idx ON public.orders(customer_user_id);
CREATE INDEX orders_phone_idx ON public.orders(customer_phone);
CREATE INDEX orders_agent_idx ON public.orders(agent_id);
CREATE INDEX orders_status_idx ON public.orders(status);

CREATE POLICY "Anyone create orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated
  USING (customer_user_id = auth.uid());
CREATE POLICY "Public track orders" ON public.orders FOR SELECT TO anon USING (true);
CREATE POLICY "Agents view their store orders" ON public.orders FOR SELECT TO authenticated
  USING (agent_id IN (SELECT id FROM public.agent_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TYPE public.wallet_tx_type AS ENUM ('earning','withdrawal','refund','activation_fee','adjustment');
CREATE TYPE public.wallet_tx_status AS ENUM ('pending','completed','failed','reversed');

CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type wallet_tx_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status wallet_tx_status NOT NULL DEFAULT 'completed',
  related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE INDEX wt_user_idx ON public.wallet_transactions(user_id);

CREATE POLICY "Users view own tx" ON public.wallet_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Admins manage tx" ON public.wallet_transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TYPE public.withdrawal_status AS ENUM ('pending','approved','rejected','paid');

CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  momo_number TEXT NOT NULL,
  momo_name TEXT NOT NULL,
  momo_network TEXT NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER withdrawals_updated_at BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users view own withdrawals" ON public.withdrawals FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users create own withdrawals" ON public.withdrawals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage withdrawals" ON public.withdrawals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Public view settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_wallet_balance(_user_id UUID)
RETURNS NUMERIC LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(
    CASE
      WHEN type IN ('earning','refund','adjustment') AND status = 'completed' THEN amount
      WHEN type = 'withdrawal' AND status IN ('pending','completed') THEN -amount
      WHEN type = 'activation_fee' AND status = 'completed' THEN -amount
      ELSE 0
    END
  ), 0)
  FROM public.wallet_transactions
  WHERE user_id = _user_id;
$$;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('store-logos', 'store-logos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public view store logos" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'store-logos');
CREATE POLICY "Auth upload store logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth update own store logos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth delete own store logos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

INSERT INTO public.networks (name, code, color, logo_emoji, sort_order) VALUES
  ('MTN', 'MTN', '#FFCC00', '🟡', 1),
  ('Telecel', 'TELECEL', '#E60000', '🔴', 2),
  ('AirtelTigo', 'AT', '#0066CC', '🔵', 3);

INSERT INTO public.bundles (network_id, size_label, size_mb, base_price, sort_order)
SELECT n.id, b.label, b.mb, b.price, b.so
FROM public.networks n
CROSS JOIN (VALUES
  ('1GB', 1024, 5.00, 1),
  ('2GB', 2048, 10.00, 2),
  ('3GB', 3072, 14.00, 3),
  ('5GB', 5120, 22.00, 4),
  ('10GB', 10240, 42.00, 5),
  ('20GB', 20480, 80.00, 6)
) AS b(label, mb, price, so);

INSERT INTO public.app_settings (key, value) VALUES
  ('agent_activation_fee', '50'::jsonb),
  ('min_withdrawal', '50'::jsonb),
  ('support_phone', '"+233000000000"'::jsonb),
  ('support_email', '"hello@onegig.app"'::jsonb),
  ('platform_name', '"OneGig"'::jsonb),
  ('platform_tagline', '"Buy data in seconds ⚡"'::jsonb);