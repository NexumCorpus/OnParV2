-- Migration 004: Fix infinite recursion in org_members RLS policies
--
-- The org_members policies from migration 002 subquery org_members inside
-- their own USING/WITH CHECK clauses. Any query touching org_members (directly
-- or via another table's org-scoped policy) recursed infinitely (SQLSTATE 42P17),
-- which broke every org-scoped read: inventory, recipes, waste, purchasing.
--
-- Fix: SECURITY DEFINER helper functions bypass RLS when reading org_members,
-- so the policies terminate. Only org_members' own four policies change; the
-- other org-scoped policies keep their subqueries, which now evaluate against
-- these non-recursive policies.

CREATE OR REPLACE FUNCTION public.user_org_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT org_id FROM org_members WHERE user_id = uid $$;

CREATE OR REPLACE FUNCTION public.user_admin_org_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT org_id FROM org_members WHERE user_id = uid AND role IN ('owner', 'manager') $$;

CREATE OR REPLACE FUNCTION public.user_owner_org_ids(uid uuid)
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$ SELECT org_id FROM org_members WHERE user_id = uid AND role = 'owner' $$;

REVOKE ALL ON FUNCTION public.user_org_ids(uuid), public.user_admin_org_ids(uuid), public.user_owner_org_ids(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.user_org_ids(uuid), public.user_admin_org_ids(uuid), public.user_owner_org_ids(uuid) TO authenticated;

DROP POLICY IF EXISTS "members_select" ON org_members;
DROP POLICY IF EXISTS "members_insert" ON org_members;
DROP POLICY IF EXISTS "members_update" ON org_members;
DROP POLICY IF EXISTS "members_delete" ON org_members;

CREATE POLICY "members_select" ON org_members
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT public.user_org_ids(auth.uid())));

CREATE POLICY "members_insert" ON org_members
  FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT public.user_admin_org_ids(auth.uid())));

CREATE POLICY "members_update" ON org_members
  FOR UPDATE TO authenticated
  USING (org_id IN (SELECT public.user_owner_org_ids(auth.uid())));

CREATE POLICY "members_delete" ON org_members
  FOR DELETE TO authenticated
  USING (org_id IN (SELECT public.user_admin_org_ids(auth.uid())));
