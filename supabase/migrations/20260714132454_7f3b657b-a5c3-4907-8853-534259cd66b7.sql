
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Form type enum + status enum
CREATE TYPE public.lead_form_type AS ENUM ('contact', 'free_audit', 'book_consultation');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost');

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  form_type public.lead_form_type NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  website text,
  requested_service text,
  budget text,
  message text,
  status public.lead_status NOT NULL DEFAULT 'new',
  source_page text,
  ip_address text,
  user_agent text,
  slot text,
  extra jsonb
);
CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX leads_form_type_idx ON public.leads (form_type);
CREATE INDEX leads_status_idx ON public.leads (status);
CREATE INDEX leads_email_idx ON public.leads (lower(email));

GRANT ALL ON public.leads TO service_role;
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
-- No anon/authenticated INSERT: inserts go through a service-role server function that runs spam checks first.

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read leads" ON public.leads
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update leads" ON public.leads
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete leads" ON public.leads
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER leads_set_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Rate-limit tracker (server-only)
CREATE TABLE public.lead_submission_log (
  id bigserial PRIMARY KEY,
  ip_address text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lead_submission_log_ip_idx ON public.lead_submission_log (ip_address, created_at DESC);
CREATE INDEX lead_submission_log_email_idx ON public.lead_submission_log (lower(email), created_at DESC);
GRANT ALL ON public.lead_submission_log TO service_role;
ALTER TABLE public.lead_submission_log ENABLE ROW LEVEL SECURITY;
-- No policies: only service role touches this table.
