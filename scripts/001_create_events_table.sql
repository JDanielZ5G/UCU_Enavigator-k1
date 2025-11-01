-- Create events table with all required fields
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('Computing and Technology', 'Visual Art and Design', 'Engineering')),
  date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_form_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved events
CREATE POLICY "events_select_approved"
  ON public.events FOR SELECT
  USING (status = 'approved');

-- Policy: Authenticated users can view their own pending/rejected events
CREATE POLICY "events_select_own"
  ON public.events FOR SELECT
  USING (auth.uid() = created_by);

-- Policy: Authenticated users can insert events (will be pending by default)
CREATE POLICY "events_insert_authenticated"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = created_by AND status = 'pending');

-- Policy: Users can update their own pending events
CREATE POLICY "events_update_own_pending"
  ON public.events FOR UPDATE
  USING (auth.uid() = created_by AND status = 'pending');

-- Policy: Users can delete their own pending events
CREATE POLICY "events_delete_own_pending"
  ON public.events FOR DELETE
  USING (auth.uid() = created_by AND status = 'pending');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS events_department_idx ON public.events(department);
CREATE INDEX IF NOT EXISTS events_date_idx ON public.events(date);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);
CREATE INDEX IF NOT EXISTS events_created_by_idx ON public.events(created_by);
