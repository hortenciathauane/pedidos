import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Code2,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { generateSupabaseSQLScript, testSupabaseConnection } from '../lib/supabase';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose
}) => {
  const { supabaseConfig, updateSupabaseConfig, syncWithSupabase } = useRestaurant();

  const [url, setUrl] = useState(supabaseConfig.url);
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');

  if (!isOpen) return null;

  const sqlScript = generateSupabaseSQLScript();

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleConnectAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTesting(false);
    setTestResult(result);

    updateSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: result.success,
      lastSync: result.success ? new Date().toLocaleTimeString('pt-BR') : undefined
    });

    if (result.success) {
      syncWithSupabase();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-800 via-teal-900 to-stone-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" /> Integração Direta
          </div>
          <h2 className="text-2xl font-serif font-bold">Conectar ao seu Supabase</h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Conecte o banco de dados para sincronizar o cardápio (<code>itens_estoque</code>) e receber os pedidos online (<code>pedidos</code>).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'credentials'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>1. Credenciais (URL & Chave Anon)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Script SQL das Tabelas</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {activeTab === 'credentials' ? (
            <form onSubmit={handleConnectAndTest} className="space-y-5 text-xs">
              
              {/* How to get credentials helper */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
                <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Onde encontrar suas credenciais no painel do Supabase:
                </span>
                <p className="text-[11px] leading-relaxed text-emerald-900/90 pl-5">
                  1. Acesse o painel do seu projeto no <strong>Supabase</strong>.<br />
                  2. Vá em <strong>Project Settings</strong> (ícone de engrenagem) ➔ <strong>API</strong>.<br />
                  3. Copie o <strong>Project URL</strong> e a <strong>Project API key (anon / public)</strong>.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Project URL (SUPABASE_URL) *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplo-seu-projeto.supabase.co"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Project API Key (anon / public) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px] focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none resize-none"
                />
              </div>

              {testResult && (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-2.5 text-xs ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong>{testResult.success ? 'Sucesso!' : 'Falha na Conexão:'}</strong>{' '}
                    {testResult.message}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('sql')}
                  className="text-emerald-800 hover:text-emerald-950 font-bold underline flex items-center gap-1"
                >
                  <span>Ver código SQL das tabelas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="submit"
                  disabled={testing || !url.trim() || !anonKey.trim()}
                  className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/15 flex items-center gap-2 transition disabled:opacity-40"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Testando Conexão...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Conectar e Sincronizar</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Script SQL para o SQL Editor do Supabase
                  </h3>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Copie e execute no menu <strong>SQL Editor</strong> no painel Supabase para criar as tabelas com as políticas de acesso.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 border border-stone-800">
                {sqlScript}
              </pre>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                💡 <strong>Dica:</strong> Se você já tem a tabela <code>itens_estoque</code> criada pelo outro sistema, certifique-se apenas de rodar a parte das tabelas <code>pedidos</code> e <code>itens_pedido</code> para que as irmãs recebam os pedidos com sucesso.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
