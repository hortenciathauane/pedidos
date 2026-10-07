import React from 'react';
import { X, Clock, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { DAYS_OF_WEEK_NAMES } from '../lib/kitchenSchedule';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSettings?: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onGoToSettings
}) => {
  const { kitchenSettings, kitchenStatus, isSistersLoggedIn } = useRestaurant();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-700 to-orange-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-amber-200 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Horários de Atendimento das Irmãs
          </div>
          <h2 className="text-2xl font-serif font-bold">Disponibilidade da Cozinha</h2>
          <p className="text-sm text-amber-100/90 mt-1">
            Preparamos cada prato com ingredientes frescos do dia nos nossos dois turnos diários.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Current Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              kitchenStatus.isOpen
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            {kitchenStatus.isOpen ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">
                Status Atual: {kitchenStatus.isOpen ? 'Cozinha Aberta' : 'Cozinha Fechada'}
              </p>
              <p className="text-xs mt-1 leading-relaxed">{kitchenStatus.reason}</p>
              {kitchenStatus.nextOpenTime && (
                <p className="text-xs font-bold text-amber-800 mt-2">
                  Previsão de Abertura: {kitchenStatus.nextOpenTime}
                </p>
              )}
            </div>
          </div>

          {/* Shifts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Nossos Turnos Diários
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-xs font-bold text-amber-700 block mb-1">
                  ☀️ Turno do Almoço
                </span>
                <span className="text-lg font-bold text-stone-900">
                  {kitchenSettings.lunch_start} às {kitchenSettings.lunch_end}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  Feijoadas, virados, moquecas e pratos executivos
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-xs font-bold text-indigo-700 block mb-1">
                  🌙 Turno do Jantar
                </span>
                <span className="text-lg font-bold text-stone-900">
                  {kitchenSettings.dinner_start} às {kitchenSettings.dinner_end}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  Parmegianas, escondidinhos, porções e sobremesas
                </span>
              </div>
            </div>
          </div>

          {/* Days open */}
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-stone-400" />
              Dias de Funcionamento
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK_NAMES.map((name, idx) => {
                const isOpen = kitchenSettings.days_open.includes(idx);
                return (
                  <span
                    key={name}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      isOpen
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-100 text-stone-400 line-through'
                    }`}
                  >
                    {name}
                  </span>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              * Às segundas-feiras realizamos a higienização completa e seleção de ingredientes da horta.
            </p>
          </div>

          {/* Mode tag */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>
              Modo de Operação:{' '}
              <strong className="text-stone-800">
                {kitchenSettings.mode === 'auto'
                  ? 'Automático (Horário Programado)'
                  : kitchenSettings.mode === 'force_open'
                  ? 'Forçado Aberto pelas Irmãs'
                  : 'Forçado Fechado (Pausa)'}
              </strong>
            </span>
            {isSistersLoggedIn && onGoToSettings && (
              <button
                onClick={() => {
                  onClose();
                  onGoToSettings();
                }}
                className="text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Alterar no Painel
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl transition shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
