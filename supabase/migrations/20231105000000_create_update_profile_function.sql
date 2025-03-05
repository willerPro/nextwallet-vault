
-- Create a function to update user profiles while bypassing RLS
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_full_name TEXT,
  p_phone_number TEXT,
  p_country TEXT,
  p_city TEXT,
  p_gender TEXT,
  p_date_of_birth TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    full_name = p_full_name,
    phone_number = p_phone_number,
    country = p_country,
    city = p_city,
    gender = p_gender,
    date_of_birth = p_date_of_birth::date
  WHERE id = auth.uid();
  
  RETURN TRUE;
END;
$$;
