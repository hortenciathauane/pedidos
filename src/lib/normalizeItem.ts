import { ItemEstoque, CategoriaItem } from '../types/restaurant';

const DEFAULT_IMAGES: Record<CategoriaItem, string> = {
  prato: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  bebida: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
  sobremesa: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'
};

export function normalizeCategory(rawCat: unknown): CategoriaItem {
  if (typeof rawCat !== 'string') return 'prato';
  const clean = rawCat.trim().toLowerCase();

  if (clean.includes('beb') || clean === 'drink' || clean === 'suco') {
    return 'bebida';
  }
  if (clean.includes('sobre') || clean.includes('doce') || clean === 'dessert') {
    return 'sobremesa';
  }
  return 'prato';
}

/**
 * Normalizes raw records coming from Postgres / Supabase / n8n
 * into a typed, safe ItemEstoque structure.
 */
export function normalizeItemEstoque(raw: Record<string, unknown>): ItemEstoque {
  const category = normalizeCategory(raw.category);

  // Price parsing (handles numeric string, null, undefined)
  let price = 0;
  if (typeof raw.price === 'number') {
    price = raw.price;
  } else if (typeof raw.price === 'string') {
    price = parseFloat(raw.price.replace(',', '.')) || 0;
  }

  // Quantity parsing
  let quantity = 0;
  if (typeof raw.quantity === 'number') {
    quantity = Math.max(0, Math.floor(raw.quantity));
  } else if (typeof raw.quantity === 'string') {
    quantity = Math.max(0, parseInt(raw.quantity, 10) || 0);
  }

  // Min stock alert
  let minStockAlert = 3;
  if (typeof raw.min_stock_alert === 'number') {
    minStockAlert = Math.max(0, Math.floor(raw.min_stock_alert));
  } else if (typeof raw.min_stock_alert === 'string') {
    minStockAlert = parseInt(raw.min_stock_alert, 10) || 3;
  }

  // Image url fallback
  let imageUrl = '';
  if (typeof raw.image_url === 'string' && raw.image_url.trim().length > 5) {
    imageUrl = raw.image_url.trim();
  } else {
    imageUrl = DEFAULT_IMAGES[category];
  }

  return {
    id: String(raw.id || `item-${Date.now()}`),
    name: String(raw.name || 'Prato da Casa'),
    category,
    quantity,
    unit: String(raw.unit || 'porção').trim(),
    price: Math.max(0, price),
    min_stock_alert: minStockAlert,
    description: String(raw.description || '').trim(),
    image_url: imageUrl,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : undefined
  };
}
