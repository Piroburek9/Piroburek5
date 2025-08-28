/* Lightweight KV wrapper for Supabase with lazy import.
 * Avoids pulling npm dependencies at module load time in Deno.
 */

const getSupabase = async () => {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    throw new Error('Supabase env not configured');
  }
  // Use esm.sh to avoid npm resolution issues in Deno
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.8');
  return createClient(url, key);
};

export const set = async (key: string, value: any): Promise<void> => {
  const supabase = await getSupabase();
  const { error } = await supabase.from('kv_store_140ef36f').upsert({ key, value });
  if (error) throw new Error(error.message);
};

export const get = async (key: string): Promise<any> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('kv_store_140ef36f')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.value;
};

export const del = async (key: string): Promise<void> => {
  const supabase = await getSupabase();
  const { error } = await supabase.from('kv_store_140ef36f').delete().eq('key', key);
  if (error) throw new Error(error.message);
};

export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = await getSupabase();
  const rows = keys.map((k, i) => ({ key: k, value: values[i] }));
  const { error } = await supabase.from('kv_store_140ef36f').upsert(rows);
  if (error) throw new Error(error.message);
};

export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('kv_store_140ef36f').select('value').in('key', keys);
  if (error) throw new Error(error.message);
  return data?.map((d: any) => d.value) ?? [];
};

export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = await getSupabase();
  const { error } = await supabase.from('kv_store_140ef36f').delete().in('key', keys);
  if (error) throw new Error(error.message);
};

export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('kv_store_140ef36f')
    .select('key, value')
    .like('key', prefix + '%');
  if (error) throw new Error(error.message);
  return data?.map((d: any) => d.value) ?? [];
};