
-- 1) Rewrite RLS policies on leads to not depend on has_role() executable by authenticated
DROP POLICY IF EXISTS "admins read leads" ON public.leads;
DROP POLICY IF EXISTS "admins update leads" ON public.leads;
DROP POLICY IF EXISTS "admins delete leads" ON public.leads;

CREATE POLICY "admins read leads" ON public.leads
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "admins update leads" ON public.leads
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

CREATE POLICY "admins delete leads" ON public.leads
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- 2) Revoke EXECUTE on has_role from anon/authenticated; only service_role may call directly
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- 3) Add admin-only SELECT policy for lead_submission_log
CREATE POLICY "admins read submission log" ON public.lead_submission_log
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));

-- 4) Explicit INSERT policy for leads. Inserts run via service_role (bypasses RLS),
--    but we add explicit anon/authenticated INSERT with basic validation to make the
--    intent explicit and satisfy least-privilege reviews. No SELECT/UPDATE/DELETE granted.
CREATE POLICY "public can submit leads" ON public.leads
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(full_name) BETWEEN 2 AND 120
  AND char_length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND status = 'new'
);
GRANT INSERT ON public.leads TO anon;
