import React, { useState } from 'react';
import { ChefHat, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

interface KitchenLoginProps {
  onBackToMenu: () => void;
}

export const KitchenLogin: React.FC<KitchenLoginProps> = ({ onBackToMenu }) => {
  const { loginSisters } = useRestaurant();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = loginSisters(email, password);
    if (!success) {
      setError('Credenciais inválidas. Utilize irmãs@irmãs.com.br e senha 123456');
    }
  };

  const fillTestCredentials = () => {
    setEmail('irmãs@irmãs.com.br');
    setPassword('123456');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-linear-to-br from-amber-800 via-amber-900 to-stone-900 text-white p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ChefHat className="w-9 h-9 text-amber-300" />
          </div>

          <span className="text-amber-300 text-xs font-bold uppercase tracking-wider block mb-1">
            Acesso Restrito
          </span>
          <h2 className="text-2xl font-serif font-black">Restaurante das Irmãs</h2>
          <p className="text-xs text-amber-100/80 mt-1">
            Painel da Cozinha, Recepção de Pedidos e Controle de Estoque
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-xs">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              E-mail de Acesso
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="irmãs@irmãs.com.br"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-600 transition"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              Senha de Acesso
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-600 transition"
            />
          </div>

          {/* Quick test credentials button */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="text-[11px] text-amber-900">
              <strong className="block">Credenciais das Irmãs:</strong>
              <span>irmãs@irmãs.com.br • 123456</span>
            </div>
            <button
              type="button"
              onClick={fillTestCredentials}
              className="px-2.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-lg text-[10px] shadow-xs transition"
            >
              Preencher
            </button>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Entrar no Painel da Cozinha</span>
            </button>

            <button
              type="button"
              onClick={onBackToMenu}
              className="w-full py-2.5 text-stone-500 hover:text-stone-800 font-medium text-xs text-center block transition"
            >
              ← Voltar ao Cardápio do Cliente
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
