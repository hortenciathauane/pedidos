import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Code2,
  Layers,
  KeyRound,
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  testSupabaseConnection,
  generateSupabaseSQLScript
} from '../../lib/supabase';

export const SupabaseConnection: React.FC = () => {
  const { supabaseConfig, updateSupabaseConfig, syncWithSupabase } = useRestaurant();

  const [url, setUrl] = useState(supabaseConfig.url);
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableFound: boolean } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const sqlScript = generateSupabaseSQLScript();

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTesting(false);
    setTestResult(result);

    const isConnected = result.success;
    updateSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected,
      lastSync: isConnected ? new Date().toLocaleTimeString('pt-BR') : undefined
    });
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncWithSupabase();
    setSyncing(false);
    setSyncResult(res);
  };

  const handleDisconnect = () => {
    if (confirm('Deseja desconectar as chaves do Supabase? O sistema voltará a utilizar apenas o armazenamento interno.')) {
      setUrl('');
      setAnonKey('');
      setTestResult(null);
      setSyncResult(null);
      updateSupabaseConfig({
        url: '',
        anonKey: '',
        isConnected: false,
        lastSync: undefined
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Conexão Supabase
          </span>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Conectar Chaves do Banco de Dados
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Insira suas chaves para sincronizar o cardápio e receber pedidos diretamente na sua nuvem.
          </p>
        </div>

        <div
          className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold ${
            supabaseConfig.isConnected
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-700" />
          <span>
            {supabaseConfig.isConnected
              ? 'Conectado ao Supabase'
              : 'Modo Interno (Sem Chaves Ativas)'}
          </span>
        </div>
      </div>

      {/* Connection Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <KeyRound className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Credenciais de Acesso da API (Project Settings ➔ API)
              </h3>
              <p className="text-xs text-stone-500">
                Localizadas no painel do Supabase em <em>Settings ➔ Data API</em>
              </p>
            </div>
          </div>

          {supabaseConfig.isConnected && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Desconectar</span>
            </button>
          )}
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              Project URL (URL do Projeto) *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Exemplo: https://xxxxxxxxxxxx.supabase.co
            </span>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              Anon Public Key (Chave Anônima Pública) *
            </label>
            <textarea
              rows={3}
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6..."
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition text-[11px]"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Chave pública segura para clientes do navegador (anon/public).
            </span>
          </div>

          {/* Test results banner */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs animate-in fade-in ${
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
                <strong>{testResult.success ? 'Conexão Estabelecida!' : 'Erro na Conexão'}</strong>
                <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Sync results banner */}
          {syncResult && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs animate-in fade-in ${
                syncResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {syncResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong>{syncResult.success ? 'Sincronização Concluída' : 'Falha na Sincronização'}</strong>
                <p className="mt-0.5 leading-relaxed">{syncResult.message}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500">
              {supabaseConfig.lastSync
                ? `Última sincronização ativa: ${supabaseConfig.lastSync}`
                : 'Insira suas credenciais e clique em Testar & Conectar.'}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {supabaseConfig.isConnected && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center justify-center gap-2 transition text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Sincronizando...' : 'Sincronizar Dados'}</span>
                </button>
              )}

              <button
                type="submit"
                disabled={testing}
                className="flex-1 sm:flex-none px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition text-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{testing ? 'Verificando...' : 'Salvar & Conectar Supabase'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SQL Script Accordion */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-700" />
              Script SQL de Criação das Tabelas & Políticas
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Caso ainda não tenha criado as tabelas no Supabase, copie o código abaixo e execute no <strong>SQL Editor</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSql(!showSql)}
              className="px-3 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
            >
              {showSql ? 'Ocultar SQL' : 'Visualizar SQL'}
            </button>

            <button
              onClick={handleCopySql}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showSql && (
          <div className="relative animate-in fade-in">
            <pre className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-72 border border-stone-800 scrollbar-thin">
              {sqlScript}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
