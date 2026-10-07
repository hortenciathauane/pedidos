import React, { useState } from 'react';
import {
  Plus,
  Search,
  Flame,
  Edit2,
  Trash2,
  Check,
  X,
  PackagePlus,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ItemEstoque, CategoriaItem } from '../../types/restaurant';
import { formatCurrency } from '../../lib/formatters';

export const StockManager: React.FC = () => {
  const { items, updateItemStock, updateItem, addItem, deleteItem } = useRestaurant();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoriaItem | 'todos'>('todos');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<ItemEstoque | null>(null);

  // New Item Modal State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemData, setNewItemData] = useState<Omit<ItemEstoque, 'id'>>({
    name: '',
    category: 'prato',
    quantity: 10,
    unit: 'porção individual',
    price: 35.0,
    min_stock_alert: 3,
    description: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  });

  const filteredItems = items.filter((item) => {
    if (filterCategory !== 'todos' && item.category !== filterCategory) return false;
    if (filterLowStockOnly && item.quantity > item.min_stock_alert) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const lowStockCount = items.filter((i) => i.quantity <= i.min_stock_alert).length;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateItem(editingItem);
    setEditingItem(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.name.trim()) return;
    addItem(newItemData);
    setIsAddingNew(false);
    setNewItemData({
      name: '',
      category: 'prato',
      quantity: 10,
      unit: 'porção individual',
      price: 35.0,
      min_stock_alert: 3,
      description: '',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Stats */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
            Tabela de Estoque em Tempo Real (itens_estoque)
          </span>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Controle de Pratos & Ingredientes
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Qualquer alteração na quantidade reflete imediatamente no cardápio online do cliente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Prato / Bebida</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar prato no estoque..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterCategory('todos')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterCategory === 'todos'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            onClick={() => setFilterCategory('prato')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterCategory === 'prato'
                ? 'bg-amber-800 text-white'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Pratos
          </button>
          <button
            onClick={() => setFilterCategory('bebida')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterCategory === 'bebida'
                ? 'bg-amber-800 text-white'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Bebidas
          </button>
          <button
            onClick={() => setFilterCategory('sobremesa')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterCategory === 'sobremesa'
                ? 'bg-amber-800 text-white'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Sobremesas
          </button>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border flex items-center gap-1.5 transition ${
              filterLowStockOnly
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Estoque Baixo ({lowStockCount})</span>
          </button>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-4">Item & Categoria</th>
                <th className="py-4 px-4">Preço (R$)</th>
                <th className="py-4 px-4">Unidade</th>
                <th className="py-4 px-4">Estoque Atual</th>
                <th className="py-4 px-4">Alerta Mín.</th>
                <th className="py-4 px-4">Status no Cardápio</th>
                <th className="py-4 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => {
                const isOutOfStock = item.quantity === 0;
                const isLowStock = !isOutOfStock && item.quantity <= item.min_stock_alert;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                        />
                        <div>
                          <span className="font-bold text-stone-900 block text-sm">
                            {item.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-stone-400 capitalize">
                            {item.category} • ID: {item.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                      {formatCurrency(item.price)}
                    </td>

                    <td className="py-3 px-4 text-stone-600 font-medium">
                      {item.unit}
                    </td>

                    {/* Quick Adjuster Column */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center bg-stone-100 border border-stone-300 rounded-xl p-1 shadow-inner">
                        <button
                          onClick={() => updateItemStock(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 0}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition"
                          title="Subtrair 1 porção do estoque"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-black text-sm text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemStock(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center font-bold text-stone-700 shadow-xs transition"
                          title="Adicionar 1 porção ao estoque"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-stone-500 font-mono">
                      {item.min_stock_alert} un.
                    </td>

                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full font-bold text-[11px] border border-stone-300">
                          🔴 Esgotado
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-[11px] border border-amber-300 flex items-center gap-1 w-max">
                          <Flame className="w-3 h-3 text-amber-700" />
                          Últimas porções ({item.quantity})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] border border-emerald-300">
                          🟢 Normal ({item.quantity})
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingItem({ ...item })}
                          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                          title="Editar prato"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o item "${item.name}" do cardápio?`)) {
                              deleteItem(item.id);
                            }
                          }}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Excluir do cardápio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg">Editar Prato / Item</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nome do Item *</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Categoria *</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category: e.target.value as CategoriaItem })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  >
                    <option value="prato">Prato Principal</option>
                    <option value="bebida">Bebida</option>
                    <option value="sobremesa">Sobremesa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Quantidade Estoque *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantity: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Alerta Mínimo *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingItem.min_stock_alert}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        min_stock_alert: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Unidade *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    placeholder="porção individual"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL da Imagem *</label>
                <input
                  type="url"
                  required
                  value={editingItem.image_url}
                  onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Item Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="p-6 bg-amber-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg">Novo Item para o Cardápio</h3>
                <p className="text-[11px] text-amber-200">
                  Adicione pratos, bebidas ou sobremesas com controle de estoque
                </p>
              </div>
              <button
                onClick={() => setIsAddingNew(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nome do Item *</label>
                <input
                  type="text"
                  required
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  placeholder="Ex: Baião de Dois Especial das Irmãs"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Categoria *</label>
                  <select
                    value={newItemData.category}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, category: e.target.value as CategoriaItem })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  >
                    <option value="prato">Prato Principal</option>
                    <option value="bebida">Bebida</option>
                    <option value="sobremesa">Sobremesa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Preço em R$ *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newItemData.price}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Qtd Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemData.quantity}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        quantity: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Alerta Mínimo *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemData.min_stock_alert}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        min_stock_alert: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Unidade *</label>
                  <input
                    type="text"
                    required
                    value={newItemData.unit}
                    onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })}
                    placeholder="porção individual"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL da Imagem *</label>
                <input
                  type="url"
                  required
                  value={newItemData.image_url}
                  onChange={(e) => setNewItemData({ ...newItemData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Descrição e Ingredientes</label>
                <textarea
                  rows={3}
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                  placeholder="Descreva os ingredientes frescos, modo de preparo e acompanhamentos..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2.5 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Cadastrar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
