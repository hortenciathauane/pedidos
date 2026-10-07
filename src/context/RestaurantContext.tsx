import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ItemEstoque,
  Pedido,
  KitchenSettings,
  CartItem,
  PedidoStatus,
  KitchenStatusInfo,
  SupabaseConfig
} from '../types/restaurant';
import { INITIAL_ITEMS, INITIAL_ORDERS, INITIAL_KITCHEN_SETTINGS } from '../data/initialData';
import { checkKitchenStatus } from '../lib/kitchenSchedule';
import { soundEffects } from '../lib/audio';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  getSupabaseClient
} from '../lib/supabase';

interface RestaurantContextType {
  items: ItemEstoque[];
  orders: Pedido[];
  kitchenSettings: KitchenSettings;
  kitchenStatus: KitchenStatusInfo;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: ItemEstoque, quantity?: number) => { success: boolean; message?: string };
  updateCartQuantity: (itemId: string, newQty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (orderData: Omit<Pedido, 'id' | 'status' | 'created_at' | 'itens'>) => Promise<Pedido>;
  updateOrderStatus: (orderId: string, status: PedidoStatus) => void;
  updateItemStock: (itemId: string, newQuantity: number) => void;
  updateItem: (item: ItemEstoque) => void;
  addItem: (item: Omit<ItemEstoque, 'id'>) => void;
  deleteItem: (itemId: string) => void;
  updateKitchenSettings: (newSettings: Partial<KitchenSettings>) => void;
  isSistersLoggedIn: boolean;
  loginSisters: (email: string, pass: string) => boolean;
  logoutSisters: () => void;
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: SupabaseConfig) => void;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
  latestTrackedOrder: Pedido | null;
  setLatestTrackedOrder: (order: Pedido | null) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ITEMS: 'restaurante_irmas_items_v2',
  ORDERS: 'restaurante_irmas_orders_v2',
  SETTINGS: 'restaurante_irmas_settings_v2',
  AUTH: 'restaurante_irmas_auth_v2',
  TRACKED_ORDER: 'restaurante_irmas_tracked_order_v2'
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Items Stock state
  const [items, setItems] = useState<ItemEstoque[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_ITEMS;
  });

  // 2. Orders state
  const [orders, setOrders] = useState<Pedido[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });

  // 3. Kitchen settings
  const [kitchenSettings, setKitchenSettings] = useState<KitchenSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_KITCHEN_SETTINGS;
  });

  // 4. Cart state (in-memory per session)
  const [cart, setCart] = useState<CartItem[]>([]);

  // 5. Auth state for Sisters
  const [isSistersLoggedIn, setIsSistersLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch {
      return false;
    }
  });

  // 6. Supabase configuration state
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(() => getSavedSupabaseConfig());

  // 7. Customer latest order
  const [latestTrackedOrder, setLatestTrackedOrderState] = useState<Pedido | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRACKED_ORDER);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return null;
  });

  // Periodic kitchen status check
  const [kitchenStatus, setKitchenStatus] = useState<KitchenStatusInfo>(() => checkKitchenStatus(kitchenSettings));

  useEffect(() => {
    setKitchenStatus(checkKitchenStatus(kitchenSettings));
    const interval = setInterval(() => {
      setKitchenStatus(checkKitchenStatus(kitchenSettings));
    }, 15000);
    return () => clearInterval(interval);
  }, [kitchenSettings]);

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Persist orders
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(kitchenSettings));
    } catch {
      // ignore
    }
  }, [kitchenSettings]);

  // On mount or when supabaseConfig changes: fetch remote stock if configured
  useEffect(() => {
    if (supabaseConfig.isConnected && supabaseConfig.url && supabaseConfig.anonKey) {
      const client = getSupabaseClient(supabaseConfig);
      if (client) {
        Promise.resolve(client.from('itens_estoque').select('*')).then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setItems(data as ItemEstoque[]);
          }
        }).catch(() => {});
      }
    }
  }, [supabaseConfig.isConnected, supabaseConfig.url, supabaseConfig.anonKey]);

  const setLatestTrackedOrder = (order: Pedido | null) => {
    setLatestTrackedOrderState(order);
    try {
      if (order) {
        localStorage.setItem(STORAGE_KEYS.TRACKED_ORDER, JSON.stringify(order));
      } else {
        localStorage.removeItem(STORAGE_KEYS.TRACKED_ORDER);
      }
    } catch {
      // ignore
    }
  };

  // Cart calculations
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  }, [cart]);

  // Add to cart with strict stock limit
  const addToCart = useCallback((itemToAdd: ItemEstoque, quantity = 1) => {
    const currentItem = items.find((i) => i.id === itemToAdd.id) || itemToAdd;
    if (currentItem.quantity <= 0) {
      return { success: false, message: 'Item esgotado no momento.' };
    }

    let success = false;
    let message = '';

    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.item.id === currentItem.id);
      const currentInCart = existing ? existing.quantity : 0;
      const desiredTotal = currentInCart + quantity;

      if (desiredTotal > currentItem.quantity) {
        message = `Desculpe! Temos apenas ${currentItem.quantity} ${currentItem.unit} disponíveis.`;
        success = false;
        return prevCart;
      }

      soundEffects.playAddToCartSound();
      success = true;

      if (existing) {
        return prevCart.map((ci) =>
          ci.item.id === currentItem.id ? { ...ci, quantity: desiredTotal } : ci
        );
      } else {
        return [...prevCart, { item: currentItem, quantity }];
      }
    });

    return { success, message };
  }, [items]);

  const updateCartQuantity = useCallback((itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    const currentItem = items.find((i) => i.id === itemId);
    if (!currentItem) return;

    if (newQty > currentItem.quantity) {
      return; // cannot exceed stock
    }

    setCart((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, quantity: newQty } : ci))
    );
  }, [items]);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Place Order with automatic stock decrement
  const placeOrder = useCallback(
    async (orderData: Omit<Pedido, 'id' | 'status' | 'created_at' | 'itens'>): Promise<Pedido> => {
      // 1. Generate Order ID (e.g. #1004)
      const nextNum = 1000 + orders.length + 1;
      const orderId = `#${nextNum}`;

      // 2. Prepare items for the order
      const orderItems = cart.map((ci) => ({
        pedido_id: orderId,
        item_id: ci.item.id,
        item_nome: ci.item.name,
        quantidade: ci.quantity,
        preco_unitario: ci.item.price
      }));

      const newOrder: Pedido = {
        ...orderData,
        id: orderId,
        status: 'pendente',
        created_at: new Date().toISOString(),
        itens: orderItems
      };

      // 3. Automatically deduct from stock (quantity = quantity - quantidade_pedida)
      setItems((prevItems) => {
        return prevItems.map((item) => {
          const ordered = cart.find((ci) => ci.item.id === item.id);
          if (ordered) {
            const remaining = Math.max(0, item.quantity - ordered.quantity);
            return {
              ...item,
              quantity: remaining
            };
          }
          return item;
        });
      });

      // 4. Save order to list
      setOrders((prev) => [newOrder, ...prev]);

      // 5. Play kitchen bell sound
      soundEffects.playNewOrderSound();

      // 6. Set as client's latest tracked order
      setLatestTrackedOrder(newOrder);

      // 7. Clear cart
      setCart([]);

      // 8. If Supabase is connected, push order to remote tables
      const client = getSupabaseClient(supabaseConfig);
      if (client) {
        try {
          await client.from('pedidos').insert({
            id: newOrder.id,
            cliente_nome: newOrder.cliente_nome,
            cliente_telefone: newOrder.cliente_telefone,
            tipo_entrega: newOrder.tipo_entrega,
            endereco_entrega: newOrder.endereco_entrega || null,
            mesa_numero: newOrder.mesa_numero || null,
            status: newOrder.status,
            total: newOrder.total,
            forma_pagamento: newOrder.forma_pagamento,
            troco_para: newOrder.troco_para || null,
            observacoes: newOrder.observacoes || null,
            created_at: newOrder.created_at
          });

          await client.from('itens_pedido').insert(orderItems);

          // Update stock on Supabase
          for (const ci of cart) {
            const currentItem = items.find((i) => i.id === ci.item.id);
            if (currentItem) {
              const newQty = Math.max(0, currentItem.quantity - ci.quantity);
              await client
                .from('itens_estoque')
                .update({ quantity: newQty })
                .eq('id', ci.item.id);
            }
          }
        } catch {
          // silently handle sync error, local state is preserved
        }
      }

      return newOrder;
    },
    [cart, orders.length, items, supabaseConfig]
  );

  const updateOrderStatus = useCallback((orderId: string, status: PedidoStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

    // Also update tracked order if it matches
    setLatestTrackedOrderState((curr) => {
      if (curr && curr.id === orderId) {
        const updated = { ...curr, status };
        try {
          localStorage.setItem(STORAGE_KEYS.TRACKED_ORDER, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
      return curr;
    });

    const client = getSupabaseClient(supabaseConfig);
    if (client) {
      Promise.resolve(client.from('pedidos').update({ status }).eq('id', orderId)).catch(() => {});
    }
  }, [supabaseConfig]);

  const updateItemStock = useCallback((itemId: string, newQuantity: number) => {
    const validQty = Math.max(0, newQuantity);
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: validQty } : item))
    );

    const client = getSupabaseClient(supabaseConfig);
    if (client) {
      Promise.resolve(client.from('itens_estoque').update({ quantity: validQty }).eq('id', itemId)).catch(() => {});
    }
  }, [supabaseConfig]);

  const updateItem = useCallback((updatedItem: ItemEstoque) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );

    const client = getSupabaseClient(supabaseConfig);
    if (client) {
      Promise.resolve(client.from('itens_estoque').upsert(updatedItem)).catch(() => {});
    }
  }, [supabaseConfig]);

  const addItem = useCallback((newItemData: Omit<ItemEstoque, 'id'>) => {
    const prefix = newItemData.category === 'prato' ? 'prato' : newItemData.category === 'bebida' ? 'bebida' : 'sobremesa';
    const uniqueId = `${prefix}-${Date.now().toString(36)}`;
    const newItem: ItemEstoque = {
      ...newItemData,
      id: uniqueId
    };

    setItems((prev) => [newItem, ...prev]);

    const client = getSupabaseClient(supabaseConfig);
    if (client) {
      Promise.resolve(client.from('itens_estoque').insert(newItem)).catch(() => {});
    }
  }, [supabaseConfig]);

  const deleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    const client = getSupabaseClient(supabaseConfig);
    if (client) {
      Promise.resolve(client.from('itens_estoque').delete().eq('id', itemId)).catch(() => {});
    }
  }, [supabaseConfig]);

  const updateKitchenSettings = useCallback((newSettings: Partial<KitchenSettings>) => {
    setKitchenSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      return merged;
    });
  }, []);

  // Authentication for Restaurante das Irmãs
  const normalizeEmail = (email: string) => {
    return email
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const loginSisters = useCallback((email: string, pass: string): boolean => {
    const cleanEmail = normalizeEmail(email);
    const cleanPass = pass.trim();

    if ((cleanEmail === 'irmas@irmas.com.br' || cleanEmail === 'irmas@restaurante.com.br' || cleanEmail === 'admin@irmas.com.br') && cleanPass === '123456') {
      setIsSistersLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  }, []);

  const logoutSisters = useCallback(() => {
    setIsSistersLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch {
      // ignore
    }
  }, []);

  const updateSupabaseConfig = useCallback((newConfig: SupabaseConfig) => {
    setSupabaseConfigState(newConfig);
    saveSupabaseConfig(newConfig);
  }, []);

  const syncWithSupabase = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const client = getSupabaseClient(supabaseConfig);
    if (!client) {
      return { success: false, message: 'URL e Chave Anônima do Supabase não configuradas.' };
    }

    try {
      const { data, error } = await client.from('itens_estoque').select('*');
      if (error) {
        return { success: false, message: `Erro ao buscar itens do Supabase: ${error.message}` };
      }

      if (data && data.length > 0) {
        setItems(data as ItemEstoque[]);
        const updatedConfig = { ...supabaseConfig, isConnected: true, lastSync: new Date().toLocaleTimeString('pt-BR') };
        updateSupabaseConfig(updatedConfig);
        return { success: true, message: `Sincronizado com sucesso! ${data.length} itens recebidos do Supabase.` };
      } else {
        // Table is empty, push local items to populate it
        await client.from('itens_estoque').upsert(items);
        const updatedConfig = { ...supabaseConfig, isConnected: true, lastSync: new Date().toLocaleTimeString('pt-BR') };
        updateSupabaseConfig(updatedConfig);
        return { success: true, message: 'Tabela itens_estoque estava vazia. Pratos locais foram enviados com sucesso ao Supabase!' };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão';
      return { success: false, message: msg };
    }
  }, [supabaseConfig, items, updateSupabaseConfig]);

  return (
    <RestaurantContext.Provider
      value={{
        items,
        orders,
        kitchenSettings,
        kitchenStatus,
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        updateOrderStatus,
        updateItemStock,
        updateItem,
        addItem,
        deleteItem,
        updateKitchenSettings,
        isSistersLoggedIn,
        loginSisters,
        logoutSisters,
        supabaseConfig,
        updateSupabaseConfig,
        syncWithSupabase,
        latestTrackedOrder,
        setLatestTrackedOrder
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
