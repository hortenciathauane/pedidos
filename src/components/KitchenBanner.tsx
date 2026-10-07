import React from 'react';
import { Clock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface KitchenBannerProps {
  onOpenScheduleModal: () => void;
}

export const KitchenBanner: React.FC<KitchenBannerProps> = ({ onOpenScheduleModal }) => {
  const { kitchenStatus, kitchenSettings } = useRestaurant();

  if (kitchenStatus.isOpen) {
    return (
      <div className="bg-linear-to-r from-emerald-600 to-teal-700 text-white px-4 py-2.5 shadow-sm text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>
              <strong>Cozinha Aberta!</strong> Aceitando pedidos em tempo real.{' '}
              <span className="hidden sm:inline opacity-90">{kitchenStatus.reason}</span>
            </span>
          </div>
          <button
            onClick={onOpenScheduleModal}
            className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg font-semibold transition shrink-0 underline sm:no-underline"
          >
            Ver Turnos
          </button>
        </div>
      </div>
    );
  }

  // Kitchen is closed
  return (
    <div className="bg-linear-to-r from-amber-700 via-orange-800 to-amber-900 text-white px-4 py-3 shadow-md border-b border-amber-600/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/30 rounded-lg shrink-0 mt-0.5 sm:mt-0">
            <Clock className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight flex items-center gap-2">
              <span>Cozinha Fechada no Momento</span>
              <span className="bg-amber-500/40 text-amber-100 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                {kitchenSettings.mode === 'force_closed' ? 'Pausa Manual' : 'Fora de Turno'}
              </span>
            </p>
            <p className="text-xs text-amber-100/90 font-medium mt-0.5">
              {kitchenStatus.reason}{' '}
              {kitchenStatus.nextOpenTime && (
                <strong className="text-amber-200 font-bold ml-1">
                  ⏰ {kitchenStatus.nextOpenTime}
                </strong>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[11px] text-amber-200 hidden lg:inline">
            Você pode navegar e salvar itens no carrinho
          </span>
          <button
            onClick={onOpenScheduleModal}
            className="text-xs font-bold bg-white text-stone-900 hover:bg-amber-50 px-3 py-1.5 rounded-xl shadow-xs transition"
          >
            Horários de Atendimento
          </button>
        </div>
      </div>
    </div>
  );
};
