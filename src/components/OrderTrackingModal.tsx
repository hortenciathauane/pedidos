import React, { useState } from 'react';
import {
  X,
  Search,
  Clock,
  CheckCircle2,
  Bike,
  Store,
  UtensilsCrossed,
  MessageCircle,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { Pedido, PedidoStatus } from '../types/restaurant';
import { formatCurrency, formatDateTime, formatTimeAgo } from '../lib/formatters';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId
}) => {
  const { orders, latestTrackedOrder } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState(initialOrderId || latestTrackedOrder?.id || '');

  if (!isOpen) return null;

  // Search by order ID or phone
  const cleanSearch = searchTerm.trim().toLowerCase();
  const matchedOrder = orders.find(
    (o) =>
      o.id.toLowerCase() === cleanSearch ||
      o.cliente_telefone.replace(/\D/g, '').includes(cleanSearch.replace(/\D/g, ''))
  ) || (latestTrackedOrder && latestTrackedOrder.id.toLowerCase() === cleanSearch ? latestTrackedOrder : null);

  const getStatusStep = (status: PedidoStatus): number => {
    switch (status) {
      case 'pendente':
        return 1;
      case 'em_preparo':
        return 2;
      case 'saiu_para_entrega':
        return 3;
      case 'concluido':
        return 4;
      case 'cancelado':
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = matchedOrder ? getStatusStep(matchedOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold">Acompanhar Pedido</h2>
            <p className="text-xs text-stone-300 mt-0.5">
              Consulte em tempo real o status de preparo da sua refeição
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o código (ex: #1002) ou telefone..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-600 outline-none"
              />
            </div>
          </div>

          {matchedOrder ? (
            <div className="space-y-5 animate-in fade-in">
              {/* Card info */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Pedido Encontrado
                  </span>
                  <span className="text-xl font-serif font-black text-amber-950">
                    {matchedOrder.id}
                  </span>
                  <span className="text-xs text-stone-600 block mt-0.5">
                    Cliente: <strong>{matchedOrder.cliente_nome}</strong>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-500 block">
                    {formatTimeAgo(matchedOrder.created_at)}
                  </span>
                  <span className="text-base font-black text-amber-900">
                    {formatCurrency(matchedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Status Stepper */}
              {matchedOrder.status === 'cancelado' ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Este pedido foi cancelado pela cozinha ou a pedido do cliente.</span>
                </div>
              ) : (
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          currentStep >= 1
                            ? 'bg-amber-700 text-white shadow-md'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        1
                      </div>
                      <span className="text-[10px] font-bold mt-1 text-center">Recebido</span>
                    </div>

                    <div
                      className={`flex-1 h-1 mx-1 ${
                        currentStep >= 2 ? 'bg-amber-600' : 'bg-stone-200'
                      }`}
                    />

                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          currentStep >= 2
                            ? 'bg-amber-700 text-white shadow-md animate-pulse'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        2
                      </div>
                      <span className="text-[10px] font-bold mt-1 text-center">Em Preparo</span>
                    </div>

                    <div
                      className={`flex-1 h-1 mx-1 ${
                        currentStep >= 3 ? 'bg-amber-600' : 'bg-stone-200'
                      }`}
                    />

                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          currentStep >= 3
                            ? 'bg-amber-700 text-white shadow-md'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        3
                      </div>
                      <span className="text-[10px] font-bold mt-1 text-center">
                        {matchedOrder.tipo_entrega === 'delivery' ? 'Em Rota' : 'Pronto'}
                      </span>
                    </div>

                    <div
                      className={`flex-1 h-1 mx-1 ${
                        currentStep >= 4 ? 'bg-emerald-600' : 'bg-stone-200'
                      }`}
                    />

                    {/* Step 4 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          currentStep >= 4
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        4
                      </div>
                      <span className="text-[10px] font-bold mt-1 text-center">Entregue</span>
                    </div>
                  </div>

                  <div className="text-center text-xs font-semibold text-stone-700 pt-2">
                    {matchedOrder.status === 'pendente' &&
                      '🟡 Pedido aguardando início do preparo na cozinha.'}
                    {matchedOrder.status === 'em_preparo' &&
                      '🍳 Nossas irmãs estão preparando seu pedido com todo o carinho agora!'}
                    {matchedOrder.status === 'saiu_para_entrega' &&
                      (matchedOrder.tipo_entrega === 'delivery'
                        ? '🛵 Seu pedido saiu para entrega com o entregador!'
                        : matchedOrder.tipo_entrega === 'retirada_no_balcao'
                        ? '🛍️ Seu pedido está pronto para ser retirado no balcão!'
                        : '🍽️ Prato pronto! Sendo servido na sua mesa.')}
                    {matchedOrder.status === 'concluido' &&
                      '✅ Pedido finalizado com sucesso! Bom apetite!'}
                  </div>
                </div>
              )}

              {/* Items detail */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Itens Selecionados
                </span>
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 divide-y divide-stone-100 text-xs">
                  {matchedOrder.itens.map((it, idx) => (
                    <div key={idx} className="py-2 flex justify-between">
                      <span>
                        {it.quantidade}x {it.item_nome}
                      </span>
                      <span className="font-mono text-stone-600">
                        {formatCurrency(it.preco_unitario * it.quantidade)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details of delivery & whatsapp */}
              <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-600 space-y-1">
                <div>
                  <strong>Forma de Entrega:</strong>{' '}
                  {matchedOrder.tipo_entrega === 'delivery'
                    ? `Delivery (${matchedOrder.endereco_entrega})`
                    : matchedOrder.tipo_entrega === 'retirada_no_balcao'
                    ? 'Retirada no Balcão'
                    : `Mesa ${matchedOrder.mesa_numero}`}
                </div>
                <div>
                  <strong>Pagamento:</strong> {matchedOrder.forma_pagamento.toUpperCase()}
                </div>
                {matchedOrder.observacoes && (
                  <div>
                    <strong>Observações:</strong> {matchedOrder.observacoes}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-stone-400">
              <PackageCheck className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-600">
                Nenhum pedido encontrado com esta informação
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Digite o número do seu pedido (ex: #1001) ou o telefone com DDD utilizado no pedido.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
