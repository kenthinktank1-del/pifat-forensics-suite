import { supabase } from '@/integrations/supabase/client';

// Cases API
export const casesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('cases')
      .select('*, profiles:created_by(full_name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('cases')
      .select('*, profiles:created_by(full_name, email)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (caseData: any) => {
    const { data, error } = await supabase
      .from('cases')
      .insert(caseData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Evidence API
export const evidenceApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('evidence')
      .select('*, cases(case_number, title), profiles:collected_by(full_name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getByCase: async (caseId: string) => {
    const { data, error } = await supabase
      .from('evidence')
      .select('*, profiles:collected_by(full_name)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (evidenceData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create initial chain of custody entry
    const initialCustodyEntry = {
      action: 'Evidence Collected',
      performed_by: user.id,
      timestamp: new Date().toISOString(),
      notes: 'Initial evidence collection',
    };

    const { data, error } = await supabase
      .from('evidence')
      .insert({
        ...evidenceData,
        chain_of_custody: [initialCustodyEntry],
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('evidence')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('evidence')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Notes API
export const notesApi = {
  getByCase: async (caseId: string) => {
    const { data, error } = await supabase
      .from('notes')
      .select('*, profiles:created_by(full_name)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (noteData: any) => {
    const { data, error } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, content: string) => {
    const { data, error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Attachments API
export const attachmentsApi = {
  getByCase: async (caseId: string) => {
    const { data, error } = await supabase
      .from('attachments')
      .select('*, profiles:uploaded_by(full_name)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  upload: async (file: File, caseId: string, userId: string) => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${caseId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('evidence-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('attachments')
      .insert({
        case_id: caseId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string, filePath: string) => {
    await supabase.storage
      .from('evidence-files')
      .remove([filePath]);

    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (email: string, password: string, fullName: string, role: 'admin' | 'user') => {
    // This would require admin endpoint - handled via edge function
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { email, password, full_name: fullName, role }
    });
    if (error) throw error;
    return data;
  },
};
