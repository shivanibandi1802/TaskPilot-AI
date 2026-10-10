-- ==============================================================================
-- TaskPilot AI — Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up persistent cloud storage.
-- ==============================================================================

-- 1. Create Workflows Table
CREATE TABLE IF NOT EXISTS public.workflows (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  objective TEXT,
  summary TEXT,
  assumptions JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft',
  deadline TEXT,
  detail_level TEXT DEFAULT 'standard',
  team_size TEXT,
  budget TEXT,
  project_id TEXT,
  is_demo_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT DEFAULT 'proj-academic',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  quadrant TEXT DEFAULT 'q2',
  due_date TEXT,
  estimated_mins INTEGER DEFAULT 60,
  time_spent_mins INTEGER DEFAULT 0,
  subtasks JSONB DEFAULT '[]'::jsonb,
  workflow_id TEXT REFERENCES public.workflows(id) ON DELETE SET NULL,
  workflow_title TEXT,
  workflow_phase TEXT,
  dependencies JSONB DEFAULT '[]'::jsonb,
  suggested_role TEXT,
  completion_criteria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Public Anon Access (Hackathon & Single-User friendly)
-- For authenticated multi-tenant production, you can replace 'true' with 'auth.uid() = user_id'
DROP POLICY IF EXISTS "Allow anon all on workflows" ON public.workflows;
CREATE POLICY "Allow anon all on workflows" ON public.workflows
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on tasks" ON public.tasks;
CREATE POLICY "Allow anon all on tasks" ON public.tasks
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Realtime Publication (Optional - for live cross-tab/cross-device updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
