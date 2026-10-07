import React, { useState } from 'react';
import {
  X,
  Bike,
  Store,
  UtensilsCrossed,
  QrCode,
  CreditCard,
  Banknote,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  User,
  MapPin,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRestaurant } from '../context/RestaurantContext';
import { TipoEntrega, FormaPagamento, Pedido } from '../types/restaurant';
import { formatCurrency } from '../lib/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Pedido) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const { cart, cartTotal, placeOrder, kitchenStatus, kitchenSettings } = useRestaurant();

  // Form states
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('delivery');
  
  // Delivery address fields
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');

  // Table number
  const [mesaNumero, setMesaNumero] = useState('');

  // Payment
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [trocoPara, setTrocoPara] = useState('');

  // Notes
  const [observacoes, setObservacoes] = useState('');

  // Submitting state & errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If kitchen is closed, customer can acknowledge if they want to leave a pre-order
  const [confirmPreOrderClosedKitchen, setConfirmPreOrderClosedKitchen] = useState(false);

  if (!isOpen) return null;

  // Format phone as Brazilian mobile (XX) 9XXXX-XXXX
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) {
      setTelefone(raw ? `(${raw}` : '');
    } else if (raw.length <= 7) {
      setTelefone(`(${raw.slice(0, 2)}) ${raw.slice(2)}`);
    } else {
      setTelefone(`(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Check Kitchen Status rule:
    // "Antes de permitir que o cliente finalize o pedido, o app deve checar se a cozinha está aberta.
    // Se estiver fechada, o app deve exibir mensagem amigável informando o horário em que a cozinha abrirá."
    if (!kitchenStatus.isOpen && !confirmPreOrderClosedKitchen) {
      setErrorMessage(
        `A Cozinha das Irmãs está fechada no momento! ${kitchenStatus.reason} ${
          kitchenStatus.nextOpenTime ? `⏰ Previsão de abertura: ${kitchenStatus.nextOpenTime}.` : ''
        }`
      );
      return;
    }

    // 2. Form validations
    if (!nome.trim() || nome.trim().length < 3) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    const cleanPhone = telefone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Por favor, informe um telefone/WhatsApp válido com DDD.');
      return;
    }

    if (tipoEntrega === 'delivery') {
      if (!rua.trim() || !numero.trim() || !bairro.trim()) {
        setErrorMessage('Por favor, preencha a rua, número e bairro para a entrega.');
        return;
      }
    } else if (tipoEntrega === 'mesa') {
      if (!mesaNumero.trim()) {
        setErrorMessage('Por favor, informe o número da mesa em que está sentado.');
        return;
      }
    }

    if (formaPagamento === 'dinheiro' && precisaTroco) {
      const trocoNum = parseFloat(trocoPara.replace(',', '.'));
      if (isNaN(trocoNum) || trocoNum < cartTotal) {
        setErrorMessage(`O valor para troco deve ser maior que o total do pedido (${formatCurrency(cartTotal)}).`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let enderecoCompleto = '';
      if (tipoEntrega === 'delivery') {
        enderecoCompleto = `${rua.trim()}, ${numero.trim()} - ${bairro.trim()}${
          complemento.trim() ? ` (${complemento.trim()})` : ''
        }`;
      }

      const trocoNum = formaPagamento === 'dinheiro' && precisaTroco ? parseFloat(trocoPara.replace(',', '.')) : undefined;

      const createdOrder = await placeOrder({
        cliente_nome: nome.trim(),
        cliente_telefone: telefone.trim(),
        tipo_entrega: tipoEntrega,
        endereco_entrega: enderecoCompleto || undefined,
        mesa_numero: tipoEntrega === 'mesa' ? mesaNumero.trim() : undefined,
        total: cartTotal,
        forma_pagamento: formaPagamento,
        troco_para: trocoNum,
        observacoes: observacoes.trim() || undefined
      });

      // Launch Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      setIsSubmitting(false);
      onClose();
      onOrderSuccess(createdOrder);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Erro ao enviar pedido';
      setErrorMessage(`Ocorreu um erro ao enviar seu pedido: ${msg}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-linear-to-r from-amber-800 to-stone-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Finalizar sem cadastro
          </div>
          <h2 className="text-2xl font-serif font-bold">Confirmação do Pedido</h2>
          <p className="text-xs text-amber-100/90 mt-1">
            Informe onde você quer receber sua refeição e a forma de pagamento.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* Kitchen status alert */}
          {!kitchenStatus.isOpen && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Cozinha Fechada no Momento</h4>
                  <p className="text-xs leading-relaxed mt-0.5">{kitchenStatus.reason}</p>
                  {kitchenStatus.nextOpenTime && (
                    <p className="text-xs font-bold text-amber-900 mt-1">
                      ⏰ Horário previsto de reabertura: {kitchenStatus.nextOpenTime}
                    </p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2.5 pt-2 border-t border-amber-200/70 cursor-pointer text-xs font-bold text-amber-900">
                <input
                  type="checkbox"
                  checked={confirmPreOrderClosedKitchen}
                  onChange={(e) => setConfirmPreOrderClosedKitchen(e.target.checked)}
                  className="rounded text-amber-800 focus:ring-amber-700 w-4 h-4"
                />
                <span>
                  Desejo deixar o pedido agendado para preparo assim que a cozinha abrir.
                </span>
              </label>
            </div>
          )}

          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Atenção:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* Section 1: Customer Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-700" />
              1. Seus Dados de Contato
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Juliana Moreira"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  WhatsApp / Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-600 outline-none transition"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Usado para avisos do status do seu pedido
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Type */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-700" />
              2. Como deseja receber?
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTipoEntrega('delivery')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  tipoEntrega === 'delivery'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-2 ring-amber-600/30'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Bike className="w-5 h-5 text-amber-700" />
                <span className="text-xs">Entrega (Delivery)</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoEntrega('retirada_no_balcao')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  tipoEntrega === 'retirada_no_balcao'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-2 ring-amber-600/30'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Store className="w-5 h-5 text-amber-700" />
                <span className="text-xs">Retirar no Balcão</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoEntrega('mesa')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  tipoEntrega === 'mesa'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-2 ring-amber-600/30'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5 text-amber-700" />
                <span className="text-xs">Consumo na Mesa</span>
              </button>
            </div>

            {/* Address fields if delivery */}
            {tipoEntrega === 'delivery' && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">Rua / Avenida *</label>
                    <input
                      type="text"
                      required
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                      placeholder="Ex: Rua das Palmeiras"
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Número *</label>
                    <input
                      type="text"
                      required
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="Ex: 345"
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Bairro *</label>
                    <input
                      type="text"
                      required
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Ex: Centro"
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Complemento / Ref.</label>
                    <input
                      type="text"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Apto 42 / Bloco B / Casa dos fundos"
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Table number if mesa */}
            {tipoEntrega === 'mesa' && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 animate-in fade-in">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Número da Mesa no Restaurante *
                </label>
                <input
                  type="text"
                  required
                  value={mesaNumero}
                  onChange={(e) => setMesaNumero(e.target.value)}
                  placeholder="Ex: Mesa 05"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                />
              </div>
            )}

            {tipoEntrega === 'retirada_no_balcao' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                📍 <strong>Local de Retirada:</strong> Restaurante das Irmãs - Balcão Principal. Avisaremos no seu WhatsApp assim que o pedido estiver pronto!
              </div>
            )}
          </div>

          {/* Section 3: Payment */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-700" />
              3. Forma de Pagamento
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setFormaPagamento('pix')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  formaPagamento === 'pix'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-2 ring-amber-600/30'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Pix (Imediato)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormaPagamento('cartao')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  formaPagamento === 'cartao'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-2 ring-amber-600/30'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span className="text-xs">Cartão Maquininha</span>
              </button>

              <button
                type="button"
                onClick={() => setFormaPagamento('dinheiro')}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  formaPagamento === 'dinheiro'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold ring-2 ring-amber-600/30'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-amber-700" />
                <span className="text-xs">Dinheiro Físico</span>
              </button>
            </div>

            {formaPagamento === 'dinheiro' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 animate-in fade-in">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                  <input
                    type="checkbox"
                    checked={precisaTroco}
                    onChange={(e) => setPrecisaTroco(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-600 w-4 h-4"
                  />
                  <span>Precisa de troco?</span>
                </label>

                {precisaTroco && (
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">
                      Troco para quanto em R$? (Total: {formatCurrency(cartTotal)})
                    </label>
                    <input
                      type="text"
                      value={trocoPara}
                      onChange={(e) => setTrocoPara(e.target.value)}
                      placeholder="Ex: 100,00"
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Notes */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              Observações do Pedido (Opcional)
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Sem cebola no vinagrete, carne bem passada, enviar sachês extras..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-600 outline-none transition"
            />
          </div>

          {/* Order Summary & Total */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex justify-between text-xs text-stone-600">
              <span>{cart.length} itens no pedido</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Taxa de entrega / serviço</span>
              <span className="text-emerald-700 font-bold">Grátis</span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-amber-200">
              <span>Valor Total</span>
              <span className="text-amber-900">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl transition"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-amber-700 hover:bg-amber-800 active:scale-98 text-white font-bold text-sm rounded-xl shadow-xl shadow-amber-900/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirmando e enviando à cozinha...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar Pedido ({formatCurrency(cartTotal)})</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
