import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Filter, ShoppingBag, Utensils, Coffee, CakeSlice, Check } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { ItemEstoque, CategoriaItem } from '../types/restaurant';
import { ProductCard } from './ProductCard';
import { formatCurrency } from '../lib/formatters';

interface CustomerMenuProps {
  onOpenDetails: (item: ItemEstoque) => void;
  onOpenCart: () => void;
  onOpenSchedule: () => void;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  onOpenDetails,
  onOpenCart,
  onOpenSchedule
}) => {
  const { items, cartCount, cartTotal, kitchenStatus } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoriaItem | 'todos'>('todos');
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'todos' && item.category !== selectedCategory) {
        return false;
      }
      // Out of stock filter
      if (hideOutOfStock && item.quantity <= 0) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [items, selectedCategory, hideOutOfStock, searchQuery]);

  const categoryCounts = useMemo(() => {
    return {
      todos: items.length,
      prato: items.filter((i) => i.category === 'prato').length,
      bebida: items.filter((i) => i.category === 'bebida').length,
      sobremesa: items.filter((i) => i.category === 'sobremesa').length
    };
  }, [items]);

  return (
    <div className="pb-28">
      {/* Hero Presentation */}
      <section className="relative overflow-hidden bg-linear-to-b from-amber-100/70 via-amber-50/40 to-transparent pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-amber-200/40">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Cardápio Digital em Tempo Real
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-stone-900 tracking-tight leading-tight">
              Sabor de casa, receita de família e ingredientes frescos.
            </h1>
            <p className="mt-3 text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
              Faça seu pedido diretamente, sem precisar de cadastro prévio. Nosso estoque atualiza
              a cada porção servida!
            </p>
          </div>

          {/* Search & Quick Controls Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prato, bebida ou sobremesa..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl shadow-xs text-sm font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded-lg"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Hide out of stock toggle */}
            <button
              onClick={() => setHideOutOfStock(!hideOutOfStock)}
              className={`px-4 py-3.5 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
                hideOutOfStock
                  ? 'bg-amber-900 text-amber-100 border-amber-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                  hideOutOfStock ? 'bg-amber-500 border-amber-500 text-white' : 'border-stone-400'
                }`}
              >
                {hideOutOfStock && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Apenas disponíveis</span>
            </button>
          </div>

          {/* Categories Tab Bar */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 ${
                selectedCategory === 'todos'
                  ? 'bg-stone-900 text-white shadow-stone-900/10'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>Todos os Itens</span>
              <span className="opacity-70 text-[10px] ml-1 bg-black/10 px-1.5 py-0.5 rounded-full">
                {categoryCounts.todos}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('prato')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 ${
                selectedCategory === 'prato'
                  ? 'bg-amber-800 text-white shadow-amber-900/20'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Pratos Principais</span>
              <span className="opacity-70 text-[10px] ml-1 bg-black/10 px-1.5 py-0.5 rounded-full">
                {categoryCounts.prato}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('bebida')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 ${
                selectedCategory === 'bebida'
                  ? 'bg-amber-800 text-white shadow-amber-900/20'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Bebidas Geladas</span>
              <span className="opacity-70 text-[10px] ml-1 bg-black/10 px-1.5 py-0.5 rounded-full">
                {categoryCounts.bebida}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('sobremesa')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 ${
                selectedCategory === 'sobremesa'
                  ? 'bg-amber-800 text-white shadow-amber-900/20'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <CakeSlice className="w-3.5 h-3.5" />
              <span>Sobremesas Artesanais</span>
              <span className="opacity-70 text-[10px] ml-1 bg-black/10 px-1.5 py-0.5 rounded-full">
                {categoryCounts.sobremesa}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid of Dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
            <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-stone-800">
              Nenhum item encontrado
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mt-1">
              Tente pesquisar com outro termo ou selecione outra categoria acima.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('todos');
                setHideOutOfStock(false);
              }}
              className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition"
            >
              Ver todos os itens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating Cart Bar on Mobile/Sticky Bottom */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 max-w-lg mx-auto sm:hidden animate-in slide-in-from-bottom duration-300">
          <button
            onClick={onOpenCart}
            className="w-full bg-amber-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-amber-600/50"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-1.5 -right-2 bg-white text-amber-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-amber-200 block">Ver Carrinho</span>
                <span className="font-extrabold text-sm">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
            <span className="text-xs font-bold bg-white text-amber-900 px-3.5 py-1.5 rounded-xl shadow-xs">
              Finalizar Pedido →
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
