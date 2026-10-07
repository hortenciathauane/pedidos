import React, { useState } from 'react';
import {
  ChefHat,
  Volume2,
  VolumeX,
  Bell,
  Clock,
  Bike,
  Store,
  UtensilsCrossed,
  Printer,
  CheckCircle2,
  ArrowRight,
  XCircle,
  MessageCircle,
  LogOut,
  Utensils,
  Layers,
  Database,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Pedido, PedidoStatus } from '../../types/restaurant';
import { formatCurrency, formatDateTime, formatTimeAgo } from '../../lib/formatters';
import { soundEffects } from '../../lib/audio';
import { StockManager } from './StockManager';
import { ScheduleManager } from './ScheduleManager';
import { SupabaseConnection } from './SupabaseConnection';
import { OrderComandaModal } from './OrderComandaModal';

type KitchenTab = 'orders' | 'stock' | 'schedule' | 'supabase';

export const KitchenDashboard: React.FC = () => {
  const { orders, updateOrderStatus, logoutSisters, kitchenStatus, supabaseConfig } = useRestaurant();

  const [activeTab, setActiveTab] = useState<KitchenTab>('orders');
  const [statusFilter, setStatusFilter] = useState<PedidoStatus | 'todos'>('todos');
  const [selectedComandaOrder, setSelectedComandaOrder] = useState<Pedido | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const pendingOrders = orders.filter((o) => o.status === 'pendente');
  const inPreparationOrders = orders.filter((o) => o.status === 'em_preparo');
  const inDeliveryOrders = orders.filter((o) => o.status === 'saiu_para_entrega');
  const completedOrders = orders.filter((o) => o.status === 'concluido');

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'todos') return true;
    return order.status === statusFilter;
  });

  const handleTestSound = () => {
    soundEffects.playNewOrderSound();
  };

  const getStatusBadge = (status: PedidoStatus) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-xs flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            Novo Pedido (Pendente)
          </span>
        );
      case 'em_preparo':
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full font-bold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Em Preparo no Fogão
          </span>
        );
      case 'saiu_para_entrega':
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-full font-bold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            Pronto / Saiu p/ Entrega
          </span>
        );
      case 'concluido':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-900 border border-rose-300 rounded-full font-bold text-xs flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Bar for Back-Office */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-md">
            <ChefHat className="w-8 h-8 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                Painel da Cozinha & Recepção
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  kitchenStatus.isOpen ? 'bg-emerald-600/40 text-emerald-300' : 'bg-rose-600/40 text-rose-300'
                }`}
              >
                {kitchenStatus.isOpen ? 'Cozinha Aberta' : 'Cozinha Fechada'}
              </span>
            </div>
            <h1 className="text-2xl font-serif font-black">Restaurante das Irmãs</h1>
            <p className="text-xs text-stone-300">
              Acesso: irmãs@irmãs.com.br • Cozinha e Retaguarda
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound Alert Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              soundEnabled
                ? 'bg-stone-800 text-amber-300 border border-amber-400/30 hover:bg-stone-700'
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}
            title="Alerta sonoro ao receber novo pedido"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Sino Ligado' : 'Sino Mudo'}</span>
          </button>

          <button
            onClick={handleTestSound}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-600 text-white transition flex items-center gap-1.5 shadow-xs"
            title="Testar o som da campainha do pedido"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Testar Sino</span>
          </button>

          {/* Supabase Connection Quick Badge */}
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              supabaseConfig.isConnected
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
            title="Configurar chaves do Supabase"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{supabaseConfig.isConnected ? 'Supabase Conectado' : 'Conectar Supabase'}</span>
          </button>

          {/* Logout */}
          <button
            onClick={logoutSisters}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-rose-950 text-stone-300 hover:text-rose-200 border border-stone-700 transition flex items-center gap-1.5"
            title="Sair do painel administrativo"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-amber-800 text-white shadow-md shadow-amber-900/15'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Recepção de Pedidos (KDS)</span>
          {pendingOrders.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
              {pendingOrders.length} novos
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'bg-amber-800 text-white shadow-md shadow-amber-900/15'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Estoque de Pratos (`itens_estoque`)</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'schedule'
              ? 'bg-amber-800 text-white shadow-md shadow-amber-900/15'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Horários & Cozinha Aberta/Fechada</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'supabase'
              ? 'bg-amber-800 text-white shadow-md shadow-amber-900/15'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Conectar Supabase</span>
          {supabaseConfig.isConnected ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-md font-bold">
              Chaves
            </span>
          )}
        </button>
      </div>

      {/* Tab: KDS Orders View */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Status Filter Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === 'todos'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              Todos ({orders.length})
            </button>

            <button
              onClick={() => setStatusFilter('pendente')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition flex items-center gap-1.5 ${
                statusFilter === 'pendente'
                  ? 'bg-amber-800 text-white border-amber-800'
                  : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
              }`}
            >
              <span>Novos / Pendentes ({pendingOrders.length})</span>
              {pendingOrders.length > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
            </button>

            <button
              onClick={() => setStatusFilter('em_preparo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                statusFilter === 'em_preparo'
                  ? 'bg-blue-800 text-white border-blue-800'
                  : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50'
              }`}
            >
              Em Preparo ({inPreparationOrders.length})
            </button>

            <button
              onClick={() => setStatusFilter('saiu_para_entrega')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                statusFilter === 'saiu_para_entrega'
                  ? 'bg-purple-800 text-white border-purple-800'
                  : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
              }`}
            >
              Saiu / Pronto ({inDeliveryOrders.length})
            </button>

            <button
              onClick={() => setStatusFilter('concluido')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                statusFilter === 'concluido'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Concluídos ({completedOrders.length})
            </button>
          </div>

          {/* Orders Cards Grid */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-400">
              <ChefHat className="w-12 h-12 mx-auto mb-2 text-stone-300" />
              <h3 className="font-serif font-bold text-stone-700 text-base">
                Nenhum pedido nesta categoria no momento
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Os pedidos realizados pelos clientes aparecerão aqui automaticamente com alarme sonoro.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => {
                const whatsappClean = order.cliente_telefone.replace(/\D/g, '');
                const whatsappLink = `https://wa.me/55${whatsappClean}?text=${encodeURIComponent(
                  `Olá ${order.cliente_nome}! Aqui é do Restaurante das Irmãs sobre seu pedido ${order.id}.`
                )}`;

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                      order.status === 'pendente'
                        ? 'border-amber-400 ring-2 ring-amber-400/30'
                        : order.status === 'em_preparo'
                        ? 'border-blue-300'
                        : order.status === 'saiu_para_entrega'
                        ? 'border-purple-300'
                        : 'border-stone-200 opacity-90'
                    }`}
                  >
                    {/* Order Card Header */}
                    <div className="p-5 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-black text-xl text-stone-900">
                            {order.id}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            • {formatTimeAgo(order.created_at)}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-stone-700 block mt-0.5">
                          {order.cliente_nome}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Order Card Body */}
                    <div className="p-5 space-y-4 flex-1">
                      {/* Delivery type & address */}
                      <div className="flex items-start gap-2.5 text-xs text-stone-600 bg-stone-100/70 p-3 rounded-2xl">
                        {order.tipo_entrega === 'delivery' ? (
                          <Bike className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        ) : order.tipo_entrega === 'retirada_no_balcao' ? (
                          <Store className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        ) : (
                          <UtensilsCrossed className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-bold text-stone-800 block">
                            {order.tipo_entrega === 'delivery'
                              ? 'Entrega em Domicílio (Delivery)'
                              : order.tipo_entrega === 'retirada_no_balcao'
                              ? 'Retirada no Balcão'
                              : `Consumo na Mesa ${order.mesa_numero || ''}`}
                          </span>
                          {order.endereco_entrega && (
                            <span className="text-[11px] text-stone-500 block mt-0.5">
                              {order.endereco_entrega}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Pratos do Pedido:
                        </span>
                        <div className="divide-y divide-stone-100 text-xs">
                          {order.itens.map((it, idx) => (
                            <div key={idx} className="py-1.5 flex justify-between items-center">
                              <span className="font-bold text-stone-800">
                                <span className="text-amber-800 font-black mr-1">
                                  {it.quantidade}x
                                </span>{' '}
                                {it.item_nome}
                              </span>
                              <span className="font-mono text-stone-500 text-[11px]">
                                {formatCurrency(it.preco_unitario * it.quantidade)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes if any */}
                      {order.observacoes && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                          <strong className="block text-[11px] text-amber-800 uppercase">
                            Observações do Cliente:
                          </strong>
                          <p className="mt-0.5 font-medium">{order.observacoes}</p>
                        </div>
                      )}

                      {/* Payment info */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-stone-500">
                          Pagamento:{' '}
                          <strong className="uppercase text-stone-800">
                            {order.forma_pagamento}
                          </strong>
                          {order.troco_para ? ` (Troco p/ ${formatCurrency(order.troco_para)})` : ''}
                        </span>
                        <span className="text-base font-black text-stone-900">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order Card Actions */}
                    <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {/* WhatsApp Contact */}
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl transition flex items-center justify-center shrink-0"
                          title="Conversar no WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-700" />
                        </a>

                        {/* Print / View Comanda */}
                        <button
                          onClick={() => setSelectedComandaOrder(order)}
                          className="p-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl transition flex items-center justify-center shrink-0"
                          title="Imprimir comanda térmica"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Status Advancement Actions */}
                        {order.status === 'pendente' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'em_preparo')}
                            className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                          >
                            <span>Aceitar & Iniciar Preparo 🍳</span>
                          </button>
                        )}

                        {order.status === 'em_preparo' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'saiu_para_entrega')}
                            className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                          >
                            <span>
                              {order.tipo_entrega === 'delivery'
                                ? 'Saiu para Entrega 🛵'
                                : 'Pronto p/ Retirada 🛍️'}
                            </span>
                          </button>
                        )}

                        {order.status === 'saiu_para_entrega' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'concluido')}
                            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                          >
                            <span>Concluir Pedido ✅</span>
                          </button>
                        )}

                        {order.status === 'concluido' && (
                          <span className="flex-1 text-center text-xs font-bold text-emerald-700 py-2">
                            Pedido Entregue
                          </span>
                        )}
                      </div>

                      {order.status === 'pendente' && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente cancelar o pedido ${order.id}?`)) {
                              updateOrderStatus(order.id, 'cancelado');
                            }
                          }}
                          className="w-full text-center text-[11px] text-rose-600 hover:text-rose-800 font-bold py-1"
                        >
                          Recusar / Cancelar Pedido
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Stock Management */}
      {activeTab === 'stock' && <StockManager />}

      {/* Tab: Schedule Management */}
      {activeTab === 'schedule' && <ScheduleManager />}

      {/* Tab: Supabase Connection */}
      {activeTab === 'supabase' && <SupabaseConnection />}

      {/* Printable Comanda Modal */}
      <OrderComandaModal
        order={selectedComandaOrder}
        isOpen={Boolean(selectedComandaOrder)}
        onClose={() => setSelectedComandaOrder(null)}
      />
    </div>
  );
};
