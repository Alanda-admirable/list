import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://lygsmthmtaqchldoiovu.supabase.co';

const SUPABASE_API_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Z3NtdGhtdGFxY2hsZG9pb3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjkzODMsImV4cCI6MjEwMzgwNTM4M30.XgTtKbn4nl_EYVD-x6QQiwrznnh3VNl8ESkafIdBd60';

export const isSupabaseConfigured = Boolean(SUPABASE_PROJECT_URL && SUPABASE_API_KEY);

export function getSupabaseClient() {
  return createClient(SUPABASE_PROJECT_URL, SUPABASE_API_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

export const SUPABASE_BUCKET_NAME = 'avatars';

/**
 * Upload an image buffer/blob to Supabase Public Storage and return the permanent public URL
 */
export async function uploadAvatarToSupabase(
  buffer: Buffer | Uint8Array,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = getSupabaseClient();

  try {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniquePath = `executives/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(uniquePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error('Failed to upload to Supabase storage:', err);
    return { success: false, error: err.message || 'Upload exception' };
  }
}
