import { ItemEstoque, Pedido, KitchenSettings } from '../types/restaurant';

export const INITIAL_ITEMS: ItemEstoque[] = [
  {
    id: 'prato-1',
    name: 'Feijoada Completa das Irmãs',
    category: 'prato',
    quantity: 8,
    unit: 'porção individual',
    price: 49.90,
    min_stock_alert: 5,
    description: 'Nossa famosa receita de família com carnes nobres selecionadas, acompanha arroz branco soltinho, couve refogada no alho, farofa crocante da casa, vinagrete e laranja fatiada.',
    image_url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prato-2',
    name: 'Filé à Parmegiana com Fritas',
    category: 'prato',
    quantity: 14,
    unit: 'porção individual',
    price: 46.50,
    min_stock_alert: 4,
    description: 'Filé bovino empanado na farinha panko artesanal, coberto com molho de tomate rústico das irmãs e muçarela gratinada ao forno a lenha. Acompanha arroz e batatas fritas crocantes.',
    image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prato-3',
    name: 'Moqueca Baiana de Peixe com Camarão',
    category: 'prato',
    quantity: 4,
    unit: 'porção individual',
    price: 58.00,
    min_stock_alert: 5, // Quantity 4 <= min_stock_alert 5 -> shows "Últimas porções!"
    description: 'Filé de pescada amarela fresca com camarões médios, cozidos no azeite de dendê da Bahia, leite de coco artesanal, pimentões e coentro fresco. Acompanha arroz e pirão da casa.',
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prato-4',
    name: 'Escondidinho de Carne Seca com Mandioca',
    category: 'prato',
    quantity: 12,
    unit: 'porção individual',
    price: 39.90,
    min_stock_alert: 4,
    description: 'Purê cremoso de mandioca na manteiga de garrafa recheado com carne seca desfiada bem temperada, requeijão cremoso e gratinado com queijo coalho.',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prato-5',
    name: 'Galinhada Especial com Pequi e Cheiro Verde',
    category: 'prato',
    quantity: 3,
    unit: 'porção individual',
    price: 38.50,
    min_stock_alert: 4, // 3 <= 4 -> "Últimas porções!"
    description: 'Arroz caldoso e aromatizado com açafrão da terra, pedaços de frango caipira dourados, milho verde fresco, lascas de pequi e finalizado com cheiro-verde farto.',
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prato-6',
    name: 'Virado à Paulista Tradicional',
    category: 'prato',
    quantity: 0, // Esgotado for demo
    unit: 'porção individual',
    price: 42.00,
    min_stock_alert: 3,
    description: 'Tutu de feijão aveludado, bisteca suína grelhada na chapa, couve na manteiga, ovo frito com gema mole, banana empanada e torresmo pururuca crocante.',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bebida-1',
    name: 'Suco Natural de Laranja com Acerola (500ml)',
    category: 'bebida',
    quantity: 25,
    unit: 'garrafa 500ml',
    price: 12.00,
    min_stock_alert: 5,
    description: 'Frutas frescas espremidas na hora, sem conservantes. Super refrescante e rica em vitamina C.',
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bebida-2',
    name: 'Suco de Maracujá Fresco com Hortelã (500ml)',
    category: 'bebida',
    quantity: 18,
    unit: 'garrafa 500ml',
    price: 13.50,
    min_stock_alert: 5,
    description: 'Polpa da fruta natural batida com folhas frescas de hortelã colhidas na nossa horta.',
    image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bebida-3',
    name: 'Guaraná Antarctica Lata (350ml)',
    category: 'bebida',
    quantity: 32,
    unit: 'lata 350ml',
    price: 7.00,
    min_stock_alert: 10,
    description: 'Refrigerante gelado servido com rodela de limão e gelo a pedido.',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bebida-4',
    name: 'Coca-Cola Zero Lata (350ml)',
    category: 'bebida',
    quantity: 28,
    unit: 'lata 350ml',
    price: 7.50,
    min_stock_alert: 8,
    description: 'Lata bem gelada, perfeita para acompanhar sua refeição.',
    image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bebida-5',
    name: 'Água Mineral com Gás (500ml)',
    category: 'bebida',
    quantity: 40,
    unit: 'garrafa 500ml',
    price: 5.00,
    min_stock_alert: 10,
    description: 'Água mineral límpida e gasosa com fatia de limão.',
    image_url: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sobremesa-1',
    name: 'Pudim de Leite Condensado das Irmãs',
    category: 'sobremesa',
    quantity: 9,
    unit: 'fatia generosa',
    price: 15.00,
    min_stock_alert: 4,
    description: 'Textura aveludada sem furinhos, calda generosa de caramelo dourado brilhante.',
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sobremesa-2',
    name: 'Cocada Cremosa de Colher com Queijo',
    category: 'sobremesa',
    quantity: 2,
    unit: 'taça 180g',
    price: 16.50,
    min_stock_alert: 3, // 2 <= 3 -> "Últimas porções!"
    description: 'Coco fresco ralado cozido lentamente, servido morno com lascas de queijo meia cura.',
    image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sobremesa-3',
    name: 'Bolo Caseiro de Cenoura com Calda Vulcão',
    category: 'sobremesa',
    quantity: 7,
    unit: 'fatia 150g',
    price: 14.00,
    min_stock_alert: 3,
    description: 'Massa fofinha de cenoura com cobertura cremosa e farta de brigadeiro belga 50% cacau.',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
  }
];

export const INITIAL_KITCHEN_SETTINGS: KitchenSettings = {
  lunch_start: '11:30',
  lunch_end: '15:30',
  dinner_start: '18:30',
  dinner_end: '23:00',
  days_open: [0, 2, 3, 4, 5, 6], // Terça a Domingo (1 = Segunda fechado)
  mode: 'auto'
};

export const INITIAL_ORDERS: Pedido[] = [
  {
    id: '#1001',
    cliente_nome: 'Marcos Vinicius Ribeiro',
    cliente_telefone: '(11) 98765-4321',
    tipo_entrega: 'delivery',
    endereco_entrega: 'Rua das Flores, 142 - Apto 32B, Jardim Paulista',
    status: 'em_preparo',
    total: 96.40,
    forma_pagamento: 'pix',
    observacoes: 'Por favor, caprichar na farofa! Entregar na portaria.',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    itens: [
      {
        pedido_id: '#1001',
        item_id: 'prato-1',
        item_nome: 'Feijoada Completa das Irmãs',
        quantidade: 1,
        preco_unitario: 49.90
      },
      {
        pedido_id: '#1001',
        item_id: 'prato-2',
        item_nome: 'Filé à Parmegiana com Fritas',
        quantidade: 1,
        preco_unitario: 46.50
      }
    ]
  },
  {
    id: '#1002',
    cliente_nome: 'Camila Duarte',
    cliente_telefone: '(11) 99123-8877',
    tipo_entrega: 'retirada_no_balcao',
    status: 'pendente',
    total: 73.00,
    forma_pagamento: 'cartao',
    observacoes: 'Vou passar para retirar de carro em 20 minutos.',
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    itens: [
      {
        pedido_id: '#1002',
        item_id: 'prato-3',
        item_nome: 'Moqueca Baiana de Peixe com Camarão',
        quantidade: 1,
        preco_unitario: 58.00
      },
      {
        pedido_id: '#1002',
        item_id: 'sobremesa-1',
        item_nome: 'Pudim de Leite Condensado das Irmãs',
        quantidade: 1,
        preco_unitario: 15.00
      }
    ]
  },
  {
    id: '#1003',
    cliente_nome: 'Roberto e Família',
    cliente_telefone: '(11) 97321-4455',
    tipo_entrega: 'mesa',
    mesa_numero: '04',
    status: 'saiu_para_entrega', // pronto / servindo na mesa
    total: 51.90,
    forma_pagamento: 'pix',
    observacoes: 'Sem gelo no suco.',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    itens: [
      {
        pedido_id: '#1003',
        item_id: 'prato-4',
        item_nome: 'Escondidinho de Carne Seca com Mandioca',
        quantidade: 1,
        preco_unitario: 39.90
      },
      {
        pedido_id: '#1003',
        item_id: 'bebida-1',
        item_nome: 'Suco Natural de Laranja com Acerola (500ml)',
        quantidade: 1,
        preco_unitario: 12.00
      }
    ]
  }
];
