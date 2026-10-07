import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ItemEstoque, Pedido, SupabaseConfig } from '../types/restaurant';

const STORAGE_KEY_CONFIG = 'restaurante_irmas_supabase_config_v1';

export function getSavedSupabaseConfig(): SupabaseConfig {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.url === 'string') {
          return {
            url: parsed.url || '',
            anonKey: parsed.anonKey || '',
            isConnected: Boolean(parsed.isConnected),
            lastSync: parsed.lastSync
          };
        }
      }
    } catch {
      // fallback
    }
  }

  // Fallback to Vite environment variables if defined
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: Boolean(envUrl && envKey),
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
        message: 'URL do projeto e Chave Anônima (anon key) são obrigatórias.',
        tableFound: false
      };
    }

    const client = createClient(url.trim(), anonKey.trim());

    // Query itens_estoque
    const { data, error } = await client.from('itens_estoque').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "itens_estoque" does not exist')) {
        return {
          success: true,
          message:
            'Conectado com sucesso ao Supabase! A tabela "itens_estoque" ainda não existe. Execute o script SQL fornecido na aba para criá-la.',
          tableFound: false
        };
      }
      return {
        success: false,
        message: `Falha ao consultar tabela: ${error.message} (Código: ${error.code || 'N/A'})`,
        tableFound: false
      };
    }

    return {
      success: true,
      message: `Conectado com sucesso! Tabela "itens_estoque" verificada e ativa no Supabase.`,
      tableFound: true
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return {
      success: false,
      message: `Não foi possível conectar: ${msg}`,
      tableFound: false
    };
  }
}

export function generateSupabaseSQLScript(): string {
  return `-- ==============================================================
-- RESTAURANTE DAS IRMÃS - SUPABASE SCHEMA & POLICIES
-- ==============================================================

-- 1. TABELA DE ITENS DE ESTOQUE (itens_estoque)
CREATE TABLE IF NOT EXISTS public.itens_estoque (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('prato', 'bebida', 'sobremesa')),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT NOT NULL DEFAULT 'porção',
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    min_stock_alert INTEGER NOT NULL DEFAULT 3,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PEDIDOS (pedidos)
CREATE TABLE IF NOT EXISTS public.pedidos (
    id TEXT PRIMARY KEY,
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT NOT NULL,
    tipo_entrega TEXT NOT NULL CHECK (tipo_entrega IN ('delivery', 'retirada_no_balcao', 'mesa')),
    endereco_entrega TEXT,
    mesa_numero TEXT,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_preparo', 'saiu_para_entrega', 'concluido', 'cancelado')),
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('pix', 'cartao', 'dinheiro')),
    troco_para NUMERIC(10,2),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE ITENS DO PEDIDO (itens_pedido)
CREATE TABLE IF NOT EXISTS public.itens_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id TEXT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES public.itens_estoque(id),
    item_nome TEXT NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10,2) NOT NULL
);

-- 4. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
ALTER TABLE public.itens_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Leitura pública de pratos
CREATE POLICY "Leitura pública do cardápio e estoque" 
ON public.itens_estoque FOR SELECT 
USING (true);

-- Permite gravação e atualização de pratos
CREATE POLICY "Gestão de itens de estoque" 
ON public.itens_estoque FOR ALL 
USING (true)
WITH CHECK (true);

-- Permite clientes enviarem pedidos sem login
CREATE POLICY "Clientes podem criar pedidos sem login" 
ON public.pedidos FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Leitura e atualização de pedidos" 
ON public.pedidos FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Criação de itens do pedido" 
ON public.itens_pedido FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Leitura de itens do pedido" 
ON public.itens_pedido FOR SELECT 
USING (true);

-- 5. BUCKET DE FOTOS (pratos-restaurante)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pratos-restaurante', 'pratos-restaurante', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Fotos de pratos publicamente acessíveis"
ON storage.objects FOR SELECT
USING (bucket_id = 'pratos-restaurante');
`;
}
