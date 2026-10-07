import React from 'react';
import { ShoppingBag, Utensils, ChefHat, Clock, Search, ShieldCheck } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency } from '../lib/formatters';

interface HeaderProps {
  currentView: 'menu' | 'kitchen';
  onNavigate: (view: 'menu' | 'kitchen') => void;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  onOpenScheduleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenCart,
  onOpenTracking,
  onOpenScheduleModal
}) => {
  const { cartCount, cartTotal, kitchenStatus, isSistersLoggedIn, orders } = useRestaurant();

  const pendingOrdersCount = orders.filter((o) => o.status === 'pendente').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('menu')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-600 via-amber-700 to-orange-800 text-white flex items-center justify-center shadow-md shadow-amber-900/10 group-hover:scale-105 transition-transform">
                <ChefHat className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight block leading-tight">
                  Restaurante das Irmãs
                </span>
                <span className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Cozinha Afetiva & Sabor de Família
                </span>
              </div>
            </button>
          </div>

          {/* Central: Kitchen Status Badge */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onOpenScheduleModal}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                kitchenStatus.isOpen
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
              }`}
              title="Clique para ver os turnos e horários de funcionamento"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${
                kitchenStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`} />
              <span>{kitchenStatus.isOpen ? 'Cozinha Aberta' : 'Cozinha Fechada'}</span>
              <Clock className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>
          </div>

          {/* Actions on right */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Customer Tracking button */}
            {currentView === 'menu' && (
              <button
                onClick={onOpenTracking}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                title="Consulte o andamento do seu pedido"
              >
                <Search className="w-3.5 h-3.5 text-stone-500" />
                <span>Acompanhar Pedido</span>
              </button>
            )}

            {/* View Switcher: Customer vs Kitchen */}
            {currentView === 'kitchen' ? (
              <button
                onClick={() => onNavigate('menu')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition"
              >
                <Utensils className="w-4 h-4" />
                <span>Ver Cardápio do Cliente</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('kitchen')}
                className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition shadow-xs ${
                  isSistersLoggedIn
                    ? 'bg-stone-900 text-amber-300 hover:bg-stone-800'
                    : 'bg-amber-100/90 text-amber-950 hover:bg-amber-200 border border-amber-300/50'
                }`}
                title="Acesso privativo das proprietárias e cozinha"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{isSistersLoggedIn ? 'Painel da Cozinha' : 'Área das Irmãs'}</span>
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Button (Always visible on menu) */}
            {currentView === 'menu' && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2.5 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-md shadow-amber-900/15 font-semibold text-sm transition-all transform active:scale-95"
                aria-label="Abrir carrinho de compras"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">
                  {cartTotal > 0 ? formatCurrency(cartTotal) : 'Carrinho'}
                </span>
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 bg-white text-amber-900 text-xs font-black rounded-full shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
