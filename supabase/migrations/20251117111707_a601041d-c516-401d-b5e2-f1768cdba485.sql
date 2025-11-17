-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create cases table
CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Create evidence table
CREATE TABLE public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
    evidence_number TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    collected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    collected_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    location TEXT,
    hash_sha256 TEXT,
    chain_of_custody JSONB DEFAULT '[]'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,
    status TEXT DEFAULT 'collected',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (case_id, evidence_number)
);

ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

-- Create attachments table
CREATE TABLE public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES public.evidence(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Create notes table
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES public.evidence(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles (admins only)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- RLS Policies for cases
CREATE POLICY "Users can view all cases"
ON public.cases FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create cases"
ON public.cases FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update all cases"
ON public.cases FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own cases"
ON public.cases FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Admins can delete cases"
ON public.cases FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for evidence
CREATE POLICY "Users can view all evidence"
ON public.evidence FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create evidence"
ON public.evidence FOR INSERT
TO authenticated
WITH CHECK (collected_by = auth.uid());

CREATE POLICY "Admins can update all evidence"
ON public.evidence FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own evidence"
ON public.evidence FOR UPDATE
TO authenticated
USING (collected_by = auth.uid());

CREATE POLICY "Admins can delete evidence"
ON public.evidence FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for attachments
CREATE POLICY "Users can view all attachments"
ON public.attachments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can upload attachments"
ON public.attachments FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can delete attachments"
ON public.attachments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own attachments"
ON public.attachments FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

-- RLS Policies for notes
CREATE POLICY "Users can view all notes"
ON public.notes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create notes"
ON public.notes FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update all notes"
ON public.notes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own notes"
ON public.notes FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Admins can delete notes"
ON public.notes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own notes"
ON public.notes FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-files', 'evidence-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for evidence files
CREATE POLICY "Users can view evidence files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence-files');

CREATE POLICY "Users can upload evidence files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence-files');

CREATE POLICY "Admins can delete evidence files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'evidence-files' AND public.has_role(auth.uid(), 'admin'));

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at
BEFORE UPDATE ON public.evidence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();