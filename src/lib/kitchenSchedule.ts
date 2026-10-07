import { KitchenSettings, KitchenStatusInfo } from '../types/restaurant';

export const DAYS_OF_WEEK_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function checkKitchenStatus(settings: KitchenSettings, now: Date = new Date()): KitchenStatusInfo {
  // If force_open
  if (settings.mode === 'force_open') {
    return {
      isOpen: true,
      reason: 'Aberto manualmente pelas irmãs para atendimento especial.',
      currentShift: null
    };
  }

  // If force_closed
  if (settings.mode === 'force_closed') {
    return {
      isOpen: false,
      reason: 'Cozinha temporariamente fechada para novos pedidos no momento (pausa na operação).',
      nextOpenTime: 'Retornaremos em breve! Acompanhe nosso cardápio.'
    };
  }

  // Auto mode
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isTodayOpen = settings.days_open.includes(currentDay);

  const lunchStart = parseTimeToMinutes(settings.lunch_start);
  const lunchEnd = parseTimeToMinutes(settings.lunch_end);
  const dinnerStart = parseTimeToMinutes(settings.dinner_start);
  const dinnerEnd = parseTimeToMinutes(settings.dinner_end);

  if (!isTodayOpen) {
    // Find next open day
    let nextDayName = '';
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDay + i) % 7;
      if (settings.days_open.includes(nextDayIndex)) {
        nextDayName = DAYS_OF_WEEK_NAMES[nextDayIndex];
        break;
      }
    }
    return {
      isOpen: false,
      reason: `Hoje (${DAYS_OF_WEEK_NAMES[currentDay]}) nossa cozinha está descansando para preparar novos pratos frescos.`,
      nextOpenTime: `Abriremos ${nextDayName} às ${settings.lunch_start}`
    };
  }

  // Check lunch shift
  if (currentMinutes >= lunchStart && currentMinutes <= lunchEnd) {
    return {
      isOpen: true,
      reason: `Estamos abertos no Turno do Almoço! (Até ${settings.lunch_end})`,
      currentShift: 'Almoço'
    };
  }

  // Check dinner shift
  if (currentMinutes >= dinnerStart && currentMinutes <= dinnerEnd) {
    return {
      isOpen: true,
      reason: `Estamos abertos no Turno do Jantar! (Até ${settings.dinner_end})`,
      currentShift: 'Jantar'
    };
  }

  // Not in shift
  if (currentMinutes < lunchStart) {
    return {
      isOpen: false,
      reason: 'Cozinha em preparação para o Almoço.',
      nextOpenTime: `Hoje às ${settings.lunch_start} (Turno do Almoço)`
    };
  }

  if (currentMinutes > lunchEnd && currentMinutes < dinnerStart) {
    return {
      isOpen: false,
      reason: 'Intervalo entre o Almoço e o Jantar. Nossa equipe está preparando os ingredientes frescos!',
      nextOpenTime: `Hoje às ${settings.dinner_start} (Turno do Jantar)`
    };
  }

  // After dinner
  // Check tomorrow
  const tomorrowIndex = (currentDay + 1) % 7;
  const isTomorrowOpen = settings.days_open.includes(tomorrowIndex);
  if (isTomorrowOpen) {
    return {
      isOpen: false,
      reason: 'Encerramos os pedidos de hoje! Nosso descanso começou.',
      nextOpenTime: `Amanhã às ${settings.lunch_start} para o Almoço`
    };
  } else {
    return {
      isOpen: false,
      reason: 'Encerramos os pedidos de hoje! Amanhã a cozinha estará em pausa.',
      nextOpenTime: `Retornamos no próximo dia útil às ${settings.lunch_start}`
    };
  }
}
