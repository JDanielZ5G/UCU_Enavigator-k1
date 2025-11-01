-- Additional policies for admin users to manage all events

-- Policy: Admins can view all events
CREATE POLICY "events_select_admin"
  ON public.events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update any event (including status changes)
CREATE POLICY "events_update_admin"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete any event
CREATE POLICY "events_delete_admin"
  ON public.events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can view all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
