import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertTriangle, Power, Calendar, Save } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { DAYS_OF_WEEK_NAMES } from '../../lib/kitchenSchedule';

export const ScheduleManager: React.FC = () => {
  const { kitchenSettings, kitchenStatus, updateKitchenSettings } = useRestaurant();

  const [lunchStart, setLunchStart] = useState(kitchenSettings.lunch_start);
  const [lunchEnd, setLunchEnd] = useState(kitchenSettings.lunch_end);
  const [dinnerStart, setDinnerStart] = useState(kitchenSettings.dinner_start);
  const [dinnerEnd, setDinnerEnd] = useState(kitchenSettings.dinner_end);
  const [daysOpen, setDaysOpen] = useState<number[]>(kitchenSettings.days_open);
  const [mode, setMode] = useState(kitchenSettings.mode);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleDay = (dayIndex: number) => {
    if (daysOpen.includes(dayIndex)) {
      setDaysOpen(daysOpen.filter((d) => d !== dayIndex));
    } else {
      setDaysOpen([...daysOpen, dayIndex].sort());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateKitchenSettings({
      lunch_start: lunchStart,
      lunch_end: lunchEnd,
      dinner_start: dinnerStart,
      dinner_end: dinnerEnd,
      days_open: daysOpen,
      mode
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
            Gestão de Horários & Disponibilidade
          </span>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Controle de Turnos e Status da Cozinha
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Define quando os clientes podem enviar novos pedidos e exibe alertas no cardápio.
          </p>
        </div>

        {/* Live Status indicator */}
        <div
          className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold ${
            kitchenStatus.isOpen
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${
              kitchenStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span>{kitchenStatus.isOpen ? 'Cozinha Aberta Agora' : 'Cozinha Fechada Agora'}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Mode Selector */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Power className="w-4 h-4 text-amber-700" />
            Modo de Operação da Cozinha
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Auto Mode */}
            <div
              onClick={() => setMode('auto')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                mode === 'auto'
                  ? 'border-amber-700 bg-amber-50/60 ring-2 ring-amber-700/20'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-stone-900">⏰ Automático (Padrão)</span>
                {mode === 'auto' && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Segue automaticamente os horários de Almoço, Jantar e os Dias de Atendimento
                configurados abaixo.
              </p>
            </div>

            {/* Force Open Mode */}
            <div
              onClick={() => setMode('force_open')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                mode === 'force_open'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-emerald-900">🟢 Forçar Aberto</span>
                {mode === 'force_open' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Abre a cozinha imediatamente, mesmo fora do turno programado (ideal para eventos ou
                atendimento extra).
              </p>
            </div>

            {/* Force Closed Mode */}
            <div
              onClick={() => setMode('force_closed')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                mode === 'force_closed'
                  ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-600/20'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-rose-900">🔴 Forçar Fechado (Pausa)</span>
                {mode === 'force_closed' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Pausa novos pedidos imediatamente por imprevistos, falta de gás ou sobrecarga temporária da cozinha.
              </p>
            </div>
          </div>
        </div>

        {/* Shifts Configuration */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            Configuração dos Turnos de Atendimento
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lunch Shift */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                ☀️ Turno do Almoço
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Horário de Início</label>
                  <input
                    type="time"
                    value={lunchStart}
                    onChange={(e) => setLunchStart(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Horário de Término</label>
                  <input
                    type="time"
                    value={lunchEnd}
                    onChange={(e) => setLunchEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-800 outline-none"
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-400">
                Padrão recomendado: 11:30 às 15:30.
              </p>
            </div>

            {/* Dinner Shift */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
                🌙 Turno do Jantar
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Horário de Início</label>
                  <input
                    type="time"
                    value={dinnerStart}
                    onChange={(e) => setDinnerStart(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-medium">Horário de Término</label>
                  <input
                    type="time"
                    value={dinnerEnd}
                    onChange={(e) => setDinnerEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-bold text-stone-800 outline-none"
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-400">
                Padrão recomendado: 18:30 às 23:00.
              </p>
            </div>
          </div>
        </div>

        {/* Days of week */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            Dias da Semana Permitidos
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {DAYS_OF_WEEK_NAMES.map((name, idx) => {
              const isSelected = daysOpen.includes(idx);
              return (
                <button
                  type="button"
                  key={name}
                  onClick={() => toggleDay(idx)}
                  className={`p-3 rounded-2xl border text-center text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-100 border-amber-500 text-amber-950'
                      : 'bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100'
                  }`}
                >
                  <span>{name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {isSelected ? 'Aberto' : 'Fechado'}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-stone-500">
            Dica: Por padrão, o Restaurante das Irmãs atende de Terça a Domingo (Segunda-feira fechado para folga da equipe).
          </p>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Horários e turnos atualizados com sucesso!
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            className="px-6 py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-900/15 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configuração de Horários</span>
          </button>
        </div>
      </form>
    </div>
  );
};
