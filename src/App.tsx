import React, { useState } from 'react';
import { RestaurantProvider } from './context/RestaurantContext';
import { Header } from './components/Header';
import { KitchenBanner } from './components/KitchenBanner';
import { CustomerMenu } from './components/CustomerMenu';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ScheduleModal } from './components/ScheduleModal';
import { SupabaseModal } from './components/SupabaseModal';
import { ItemEstoque, Pedido } from './types/restaurant';
import { ChefHat, Phone, Clock, Heart, Sparkles, Bike, Database } from 'lucide-react';

function RestaurantAppContent() {
  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Pedido | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ItemEstoque | null>(null);

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Pedido) => {
    setSuccessOrder(order);
  };

  const handleTrackFromSuccess = (order: Pedido) => {
    setSuccessOrder(null);
    setIsTrackingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-stone-900 selection:bg-amber-200 selection:text-amber-900">
      
      {/* Top Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => setIsTrackingModalOpen(true)}
        onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
      />

      {/* Main Content Area - Exclusively Customer Ordering */}
      <main className="flex-1">
        <KitchenBanner onOpenScheduleModal={() => setIsScheduleModalOpen(true)} />
        <CustomerMenu
          onOpenDetails={(item) => setSelectedProduct(item)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSchedule={() => setIsScheduleModalOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
      </main>

      {/* Customer Footer */}
      <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-amber-200" />
                </div>
                <span className="font-serif font-black text-xl text-white">
                  Restaurante das Irmãs
                </span>
              </div>
              <p className="text-stone-400 text-xs max-w-sm leading-relaxed">
                Tradição culinária, carinho de família e receitas preparadas diariamente no fogão
                a lenha com ingredientes selecionados.
              </p>
              <div className="pt-2 text-[11px] text-stone-500 flex items-center gap-1.5">
                <span>Feito com</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>para nossos clientes e amigos</span>
              </div>
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2">
                Horários de Atendimento
              </h4>
              <p className="flex items-center gap-2 text-stone-400">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Almoço: 11:30 às 15:30</span>
              </p>
              <p className="flex items-center gap-2 text-stone-400">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Jantar: 18:30 às 23:00</span>
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                Atendimento de Terça a Domingo.
              </p>
            </div>

            {/* How to Order / Contact */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2">
                Como Funciona o Pedido
              </h4>
              <p className="flex items-center gap-2 text-stone-400">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sem necessidade de cadastro prévio</span>
              </p>
              <p className="flex items-center gap-2 text-stone-400">
                <Bike className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Delivery, Balcão ou Mesa</span>
              </p>
              <p className="flex items-center gap-2 text-stone-400 pt-1">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>WhatsApp: (11) 99999-8888</span>
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
            <span>
              © {new Date().getFullYear()} Restaurante das Irmãs. Todos os direitos reservados.
            </span>
            <div className="flex items-center gap-4">
              <span>Cardápio Digital & Registro de Pedidos</span>
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-stone-400 hover:text-emerald-400 transition cursor-pointer font-medium"
                title="Conectar ou verificar banco Supabase (itens_estoque)"
              >
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Conexão Supabase</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Drawers and Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleOpenCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderSuccessModal
        order={successOrder}
        isOpen={Boolean(successOrder)}
        onClose={() => setSuccessOrder(null)}
        onTrackOrder={handleTrackFromSuccess}
      />

      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />

      <ProductDetailModal
        item={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <RestaurantAppContent />
    </RestaurantProvider>
  );
}
