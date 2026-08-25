-- Keep the approved admin identity in Supabase Auth and grant only its user id
-- the admin role. Passwords are never stored in this application schema.
DO $$
DECLARE
  approved_user_id uuid;
BEGIN
  SELECT id INTO approved_user_id
  FROM auth.users
  WHERE lower(email) = 'sureshptl2006@gmail.com'
  LIMIT 1;

  IF approved_user_id IS NULL THEN
    RAISE NOTICE 'Create and confirm the approved Supabase Auth user first.';
    RETURN;
  END IF;

  DELETE FROM public.user_roles
  WHERE role = 'admin' AND user_id <> approved_user_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (approved_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;