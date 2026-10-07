import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle, AlertCircle } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency } from '../lib/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const { cart, cartTotal, updateCartQuantity, removeFromCart, clearCart, kitchenStatus } = useRestaurant();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-linear-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-600 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold">Seu Carrinho</h2>
                <span className="text-xs text-stone-300">
                  {cart.length} {cart.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Warning if kitchen is closed */}
          {!kitchenStatus.isOpen && (
            <div className="bg-amber-50 border-b border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Atenção:</strong> A cozinha está fechada no momento.{' '}
                {kitchenStatus.nextOpenTime && <span>({kitchenStatus.nextOpenTime})</span>}
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-serif font-bold text-stone-700">Seu carrinho está vazio</h3>
                <p className="text-xs text-stone-400 max-w-xs mt-1">
                  Explore nosso cardápio de receitas caseiras e adicione seus pratos favoritos!
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Itens do Pedido
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Esvaziar carrinho
                  </button>
                </div>

                {cart.map(({ item, quantity }) => {
                  const maxAvailable = item.quantity;
                  const canIncrease = quantity < maxAvailable;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-3.5 transition"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-sm text-stone-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-stone-500 block">
                          {formatCurrency(item.price)} cada • {item.unit}
                        </span>
                        <span className="text-xs font-bold text-amber-900 block mt-0.5">
                          Subtotal: {formatCurrency(item.price * quantity)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-xs">
                          <button
                            onClick={() => updateCartQuantity(item.id, quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-stone-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, quantity + 1)}
                            disabled={!canIncrease}
                            className={`w-6 h-6 flex items-center justify-center rounded ${
                              canIncrease
                                ? 'text-stone-600 hover:bg-stone-100'
                                : 'text-stone-300 cursor-not-allowed'
                            }`}
                            title={!canIncrease ? 'Estoque máximo atingido' : ''}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center gap-1 mt-1 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between font-black text-lg text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total do Pedido</span>
                  <span className="text-amber-900">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-4 bg-amber-700 hover:bg-amber-800 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-xl shadow-amber-900/20 flex items-center justify-center gap-2 transition"
              >
                <span>Avançar para Dados de Entrega</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
