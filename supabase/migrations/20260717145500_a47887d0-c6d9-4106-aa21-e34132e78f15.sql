-- Document intent: lead_submission_log is written only by trusted server context (service_role, which bypasses RLS).
-- Add an explicit INSERT policy so scanners and reviewers can see writes are intentionally restricted from client roles.
CREATE POLICY "service role only inserts submission log"
ON public.lead_submission_log
FOR INSERT
TO anon, authenticated
WITH CHECK (false);