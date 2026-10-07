import React from 'react';
import { X, Printer, ChefHat } from 'lucide-react';
import { Pedido } from '../../types/restaurant';
import { formatCurrency, formatDateTime } from '../../lib/formatters';

interface OrderComandaModalProps {
  order: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderComandaModal: React.FC<OrderComandaModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-stone-300 overflow-hidden my-4 print:m-0 print:border-none print:shadow-none">
        
        {/* Header - Not printed */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <ChefHat className="w-4 h-4" /> Comanda da Cozinha
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Style */}
        <div className="p-6 font-mono text-xs text-stone-900 bg-amber-50/20 print:p-2 print:text-black">
          <div className="text-center pb-3 border-b-2 border-dashed border-stone-400">
            <h2 className="text-base font-black uppercase tracking-wider">RESTAURANTE DAS IRMÃS</h2>
            <p className="text-[10px] text-stone-600">Cozinha Afetiva & Sabor de Família</p>
            <p className="text-[10px] text-stone-600">WhatsApp: (11) 99999-8888</p>
            <div className="mt-2 py-1 bg-stone-100 rounded text-sm font-black border border-stone-300">
              COMANDA {order.id}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">{formatDateTime(order.created_at)}</p>
          </div>

          {/* Delivery & Client info */}
          <div className="py-3 border-b border-dashed border-stone-300 space-y-1">
            <p>
              <strong>CLIENTE:</strong> {order.cliente_nome.toUpperCase()}
            </p>
            <p>
              <strong>CONTATO:</strong> {order.cliente_telefone}
            </p>
            <p>
              <strong>TIPO:</strong>{' '}
              <span className="font-bold underline">
                {order.tipo_entrega === 'delivery'
                  ? 'DELIVERY'
                  : order.tipo_entrega === 'retirada_no_balcao'
                  ? 'RETIRADA NO BALCÃO'
                  : `MESA ${order.mesa_numero || 'S/N'}`}
              </span>
            </p>
            {order.endereco_entrega && (
              <p className="text-[11px] bg-stone-100 p-1 rounded">
                <strong>ENDEREÇO:</strong> {order.endereco_entrega}
              </p>
            )}
          </div>

          {/* Items */}
          <div className="py-3 border-b-2 border-dashed border-stone-400">
            <div className="font-bold mb-2 pb-1 border-b border-stone-300 flex justify-between">
              <span>QTD ITEM</span>
              <span>TOTAL</span>
            </div>
            <div className="space-y-2">
              {order.itens.map((it, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="pr-2">
                    <span className="font-black text-sm">{it.quantidade}x</span>{' '}
                    <span>{it.item_nome}</span>
                  </div>
                  <span className="shrink-0">{formatCurrency(it.preco_unitario * it.quantidade)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.observacoes && (
            <div className="py-2 border-b border-dashed border-stone-300 bg-amber-100/50 p-2 rounded my-2 text-[11px]">
              <strong>OBSERVAÇÕES DA COZINHA:</strong>
              <p className="font-bold text-stone-900 mt-0.5">{order.observacoes}</p>
            </div>
          )}

          {/* Payment */}
          <div className="py-3 border-b-2 border-dashed border-stone-400 space-y-1 text-right">
            <div className="flex justify-between font-black text-sm">
              <span>TOTAL DO PEDIDO:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-600">
              <span>FORMA DE PAGAMENTO:</span>
              <span className="uppercase font-bold">{order.forma_pagamento}</span>
            </div>
            {order.troco_para && (
              <div className="flex justify-between text-[11px] text-stone-600">
                <span>TROCO PARA:</span>
                <span>{formatCurrency(order.troco_para)}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-3 text-[10px] text-stone-500">
            *** BOM APETITE! FEITO COM AMOR ***
          </div>
        </div>

        {/* Actions - Not printed */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comanda</span>
          </button>
        </div>

      </div>
    </div>
  );
};
