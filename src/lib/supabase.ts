import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types/restaurant';

// Credenciais configuradas internamente nos bastidores para conexão direta com o Supabase
export const DEFAULT_SUPABASE_URL = 'https://kqficacuktdptmeesies.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZmljYWN1a3RkcHRtZWVzaWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNDQ3MTAsImV4cCI6MjEwNTkyMDcxMH0.ZC98owI8AC6PRSKh7b90GCDRPTR00IgccJ1KbTZ3S8Q';

const STORAGE_KEY_CONFIG = 'restaurante_irmas_supabase_config_v2';

export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_URL;
  const envKey = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY;

  let storedUrl = '';
  let storedKey = '';

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.url) storedUrl = parsed.url;
        if (parsed?.anonKey) storedKey = parsed.anonKey;
      }
    } catch {
      // ignore
    }
  }

  const url = (envUrl && envUrl.trim()) || storedUrl || DEFAULT_SUPABASE_URL;
  const anonKey = (envKey && envKey.trim()) || storedKey || DEFAULT_SUPABASE_ANON_KEY;

  return {
    url,
    anonKey,
    isConnected: Boolean(url && anonKey),
    lastSync: undefined
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const cfg = config || getSavedSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) {
    return null;
  }

  if (cachedClient && lastUsedUrl === cfg.url && lastUsedKey === cfg.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(cfg.url.trim(), cfg.anonKey.trim());
    lastUsedUrl = cfg.url;
    lastUsedKey = cfg.anonKey;
    return cachedClient;
  } catch {
    return null;
  }
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; tableFound: boolean }> {
  try {
    if (!url.trim() || !anonKey.trim()) {
      return {
        success: false,
        message: 'URL e Chave Anônima são obrigatórias.',
        tableFound: false
      };
    }

    const client = createClient(url.trim(), anonKey.trim());
    const { data, error } = await client.from('itens_estoque').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "itens_estoque" does not exist')) {
        return {
          success: true,
          message: 'Conectado ao Supabase, mas a tabela itens_estoque ainda precisa ser criada.',
          tableFound: false
        };
      }
      return {
        success: false,
        message: `Erro na consulta: ${error.message}`,
        tableFound: false
      };
    }

    return {
      success: true,
      message: `Conectado com sucesso à tabela itens_estoque!`,
      tableFound: true
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro na conexão';
    return {
      success: false,
      message: msg,
      tableFound: false
    };
  }
}
