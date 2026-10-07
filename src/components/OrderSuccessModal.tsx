import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  QrCode,
  Copy,
  Check,
  Bike,
  MessageCircle,
  Sparkles,
  Receipt,
  Utensils
} from 'lucide-react';
import { Pedido } from '../types/restaurant';
import { formatCurrency, formatDateTime } from '../lib/formatters';

interface OrderSuccessModalProps {
  order: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (order: Pedido) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder
}) => {
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen || !order) return null;

  const pixKey = `00020126580014BR.GOV.BCB.PIX0136irmas@restaurante.com.br520400005303986540${order.total.toFixed(2)}5802BR5920Restaurante das Irmas6009Sao Paulo62070503***6304`;

  const copyPixToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Olá Restaurante das Irmãs! Acabei de fazer o pedido *${order.id}* no valor de ${formatCurrency(
      order.total
    )}. Meu nome é *${order.cliente_nome}*.`
  );
  const whatsappUrl = `https://wa.me/5511999998888?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        
        {/* Success Banner */}
        <div className="bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <span className="text-emerald-200 text-xs font-black uppercase tracking-wider block mb-1">
            Pedido Recebido pela Cozinha!
          </span>
          <h2 className="text-3xl font-serif font-black">{order.id}</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-md mx-auto">
            Obrigado, <strong>{order.cliente_nome}</strong>! Nossa cozinha já foi notificada e o estoque foi abatido automaticamente.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Status Tracker */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-3">
              Status do Pedido
            </span>

            <div className="flex items-center justify-between text-xs relative">
              <div className="flex flex-col items-center z-10">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                  1
                </div>
                <span className="mt-1.5 font-bold text-amber-900 text-[11px] text-center">
                  Recebido
                </span>
              </div>

              <div className="flex-1 h-1 bg-stone-200 -mt-4 mx-2" />

              <div className="flex flex-col items-center z-10">
                <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <span className="mt-1.5 font-medium text-stone-400 text-[11px] text-center">
                  Em Preparo
                </span>
              </div>

              <div className="flex-1 h-1 bg-stone-200 -mt-4 mx-2" />

              <div className="flex flex-col items-center z-10">
                <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <span className="mt-1.5 font-medium text-stone-400 text-[11px] text-center">
                  {order.tipo_entrega === 'delivery' ? 'Em Rota' : 'Pronto'}
                </span>
              </div>

              <div className="flex-1 h-1 bg-stone-200 -mt-4 mx-2" />

              <div className="flex flex-col items-center z-10">
                <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 font-bold flex items-center justify-center text-xs">
                  4
                </div>
                <span className="mt-1.5 font-medium text-stone-400 text-[11px] text-center">
                  Entregue
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Tempo estimado: <strong>35 a 45 minutos</strong>
              </span>
              <span>{formatDateTime(order.created_at)}</span>
            </div>
          </div>

          {/* Pix Payment Box if chosen */}
          {order.forma_pagamento === 'pix' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  Pagamento via Pix
                </div>
                <span className="text-xs font-black text-emerald-900">
                  {formatCurrency(order.total)}
                </span>
              </div>

              <p className="text-xs text-emerald-800">
                Abra seu aplicativo de banco e utilize o Pix Copia e Cola para pagar:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixKey}
                  className="flex-1 px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-stone-600 select-all"
                />
                <button
                  onClick={copyPixToClipboard}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition shrink-0"
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Pix</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Order items recap */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Resumo dos Itens
            </span>
            <div className="divide-y divide-stone-100 bg-stone-50 rounded-2xl p-3 border border-stone-200 text-xs">
              {order.itens.map((it, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-800">
                      {it.quantidade}x {it.item_nome}
                    </span>
                  </div>
                  <span className="font-mono text-stone-700">
                    {formatCurrency(it.preco_unitario * it.quantidade)}
                  </span>
                </div>
              ))}
              <div className="pt-2 flex justify-between font-bold text-sm text-stone-900">
                <span>Total</span>
                <span className="text-amber-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Contact with restaurant via WhatsApp */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar no WhatsApp das Irmãs</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onTrackOrder(order);
              }}
              className="w-full sm:w-auto px-5 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition"
            >
              Acompanhar Pedido
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
