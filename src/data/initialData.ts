import { ItemEstoque, Pedido, KitchenSettings } from '../types/restaurant';

// Itens limpos para cadastro manual ou sincronização via Supabase/outro sistema
export const INITIAL_ITEMS: ItemEstoque[] = [];

export const INITIAL_KITCHEN_SETTINGS: KitchenSettings = {
  lunch_start: '11:30',
  lunch_end: '15:30',
  dinner_start: '18:30',
  dinner_end: '23:00',
  days_open: [0, 2, 3, 4, 5, 6], // Terça a Domingo (1 = Segunda fechado)
  mode: 'auto'
};

export const INITIAL_ORDERS: Pedido[] = [];
