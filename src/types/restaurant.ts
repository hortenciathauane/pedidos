export type CategoriaItem = 'prato' | 'bebida' | 'sobremesa';

export interface ItemEstoque {
  id: string;
  name: string;
  category: CategoriaItem;
  quantity: number;
  unit: string;
  price: number;
  min_stock_alert: number;
  description: string;
  image_url: string;
}

export type PedidoStatus = 'pendente' | 'em_preparo' | 'saiu_para_entrega' | 'concluido' | 'cancelado';
export type TipoEntrega = 'delivery' | 'retirada_no_balcao' | 'mesa';
export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro';

export interface ItemPedido {
  pedido_id: string;
  item_id: string;
  item_nome: string;
  quantidade: number;
  preco_unitario: number;
}

export interface Pedido {
  id: string; // Ex: '#1001'
  cliente_nome: string;
  cliente_telefone: string; // WhatsApp
  tipo_entrega: TipoEntrega;
  endereco_entrega?: string;
  mesa_numero?: string;
  status: PedidoStatus;
  total: number;
  forma_pagamento: FormaPagamento;
  troco_para?: number;
  observacoes?: string;
  created_at: string;
  itens: ItemPedido[];
}

export interface KitchenSettings {
  lunch_start: string; // "11:30"
  lunch_end: string;   // "15:30"
  dinner_start: string;// "18:30"
  dinner_end: string;  // "23:00"
  days_open: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  mode: 'auto' | 'force_open' | 'force_closed';
}

export interface KitchenStatusInfo {
  isOpen: boolean;
  reason: string;
  nextOpenTime?: string;
  currentShift?: 'Almoço' | 'Jantar' | null;
}

export interface CartItem {
  item: ItemEstoque;
  quantity: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSync?: string;
}
