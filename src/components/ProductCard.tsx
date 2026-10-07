import React from 'react';
import { Plus, Minus, Flame, AlertCircle, Eye } from 'lucide-react';
import { ItemEstoque } from '../types/restaurant';
import { formatCurrency } from '../lib/formatters';
import { useRestaurant } from '../context/RestaurantContext';

interface ProductCardProps {
  item: ItemEstoque;
  onOpenDetails: (item: ItemEstoque) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onOpenDetails }) => {
  const { cart, addToCart, updateCartQuantity } = useRestaurant();

  const isOutOfStock = item.quantity <= 0;
  const isLowStock = !isOutOfStock && item.quantity <= item.min_stock_alert;

  // Check if item is already in cart
  const cartItem = cart.find((ci) => ci.item.id === item.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
  const canAddMore = currentQuantityInCart < item.quantity;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || !canAddMore) return;
    addToCart(item, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAddMore) return;
    updateCartQuantity(item.id, currentQuantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentQuantityInCart <= 0) return;
    updateCartQuantity(item.id, currentQuantityInCart - 1);
  };

  return (
    <div
      onClick={() => onOpenDetails(item)}
      className={`group bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative ${
        isOutOfStock ? 'opacity-70 grayscale-30' : ''
      }`}
    >
      {/* Image container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            // fallback placeholder if image url is broken
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient shadow for badges */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Stock Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-900/90 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md backdrop-blur-xs">
              Esgotado
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              Últimas {item.quantity} {item.quantity === 1 ? 'porção' : 'porções'}!
            </span>
          ) : null}
        </div>

        {/* Category tag */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2.5 py-0.5 rounded-lg bg-white/90 backdrop-blur-xs text-[11px] font-bold text-stone-700 capitalize shadow-xs">
            {item.category === 'prato' ? 'Prato Principal' : item.category === 'bebida' ? 'Bebida' : 'Sobremesa'}
          </span>
        </div>

        {/* Quick view icon on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2 rounded-full text-stone-700 shadow-md">
          <Eye className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-serif font-bold text-stone-900 text-lg leading-snug group-hover:text-amber-800 transition-colors">
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          <span className="inline-block text-[11px] text-stone-400 font-medium">
            Servido em: <strong className="text-stone-600">{item.unit}</strong>
          </span>
        </div>

        {/* Price & Action */}
        <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-stone-500 block">Preço unitário</span>
            <span className="text-xl font-extrabold text-stone-900 tracking-tight">
              {formatCurrency(item.price)}
            </span>
          </div>

          {/* Action button */}
          {isOutOfStock ? (
            <span className="text-xs font-bold text-stone-400 bg-stone-100 px-3 py-2 rounded-xl">
              Indisponível
            </span>
          ) : currentQuantityInCart > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-amber-100 rounded-xl p-1 shadow-inner border border-amber-300"
            >
              <button
                onClick={handleDecrement}
                className="w-8 h-8 rounded-lg bg-white text-stone-900 font-bold hover:bg-stone-50 flex items-center justify-center shadow-xs active:scale-95 transition"
                aria-label="Diminuir quantidade"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-black text-amber-950">
                {currentQuantityInCart}
              </span>
              <button
                onClick={handleIncrement}
                disabled={!canAddMore}
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-xs active:scale-95 transition ${
                  canAddMore
                    ? 'bg-amber-700 text-white hover:bg-amber-800'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
                aria-label="Aumentar quantidade"
                title={!canAddMore ? 'Limite máximo de estoque atingido' : ''}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-900/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
