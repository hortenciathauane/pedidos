import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Flame, ShoppingBag, Check, AlertTriangle } from 'lucide-react';
import { ItemEstoque } from '../types/restaurant';
import { formatCurrency } from '../lib/formatters';
import { useRestaurant } from '../context/RestaurantContext';

interface ProductDetailModalProps {
  item: ItemEstoque | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenCart
}) => {
  const { cart, addToCart } = useRestaurant();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setJustAdded(false);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const cartItem = cart.find((ci) => ci.item.id === item.id);
  const alreadyInCart = cartItem ? cartItem.quantity : 0;
  const availableLeft = Math.max(0, item.quantity - alreadyInCart);
  const isOutOfStock = item.quantity <= 0;
  const isLowStock = !isOutOfStock && item.quantity <= item.min_stock_alert;

  const handleAdd = () => {
    if (quantity <= 0 || availableLeft <= 0) return;
    const res = addToCart(item, quantity);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Image & Close Header */}
        <div className="relative h-64 sm:h-72 w-full bg-stone-100 shrink-0">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition shadow-md z-10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Badges on modal image */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-600 text-white text-xs font-bold capitalize shadow-sm">
              {item.category === 'prato' ? 'Prato Principal' : item.category === 'bebida' ? 'Bebida' : 'Sobremesa'}
            </span>
            {isOutOfStock ? (
              <span className="px-3 py-1 rounded-xl bg-stone-900 text-white text-xs font-black uppercase">
                Esgotado
              </span>
            ) : isLowStock ? (
              <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5" />
                Últimas {item.quantity} {item.quantity === 1 ? 'porção' : 'porções'}!
              </span>
            ) : null}
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {item.name}
              </h2>
              <span className="text-2xl font-black text-amber-900">
                {formatCurrency(item.price)}
              </span>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed mt-3">
              {item.description}
            </p>
          </div>

          {/* Portion and stock info */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-400 block font-medium">Formato / Porção</span>
              <span className="font-bold text-stone-800 text-sm mt-0.5 block">{item.unit}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Estoque em Tempo Real</span>
              <span
                className={`font-bold text-sm mt-0.5 block ${
                  item.quantity === 0
                    ? 'text-rose-600'
                    : item.quantity <= item.min_stock_alert
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {item.quantity === 0 ? 'Indisponível hoje' : `${item.quantity} disponíveis`}
              </span>
            </div>
          </div>

          {alreadyInCart > 0 && (
            <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
              <span>Você já tem <strong>{alreadyInCart}</strong> no seu carrinho.</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="underline font-bold hover:text-amber-950"
              >
                Ver carrinho
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quantity Selector */}
          {!isOutOfStock && availableLeft > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Quantidade:
              </span>
              <div className="flex items-center bg-white border border-stone-300 rounded-xl p-1 shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 rounded-lg hover:bg-stone-100 flex items-center justify-center font-bold text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-extrabold text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(availableLeft, q + 1))}
                  disabled={quantity >= availableLeft}
                  className="w-9 h-9 rounded-lg hover:bg-stone-100 flex items-center justify-center font-bold text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Add CTA */}
          <div className="w-full sm:w-auto flex-1 flex justify-end">
            {isOutOfStock || availableLeft <= 0 ? (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-3.5 bg-stone-200 text-stone-500 font-bold rounded-2xl cursor-not-allowed text-center"
              >
                {isOutOfStock ? 'Prato Esgotado' : 'Limite de Estoque Atingido'}
              </button>
            ) : (
              <button
                onClick={handleAdd}
                className={`w-full sm:w-auto px-8 py-3.5 font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-900/20 active:scale-95'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Adicionado ao Pedido!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>
                      Adicionar {quantity > 1 ? `(${quantity})` : ''} •{' '}
                      {formatCurrency(item.price * quantity)}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
