export interface Barber {
  id: string;
  name: string;
  role: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  image: string;
  bio: string;
  specialties: string[];
  isFounder?: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: 'cabelo' | 'barba' | 'tratamentos';
  description: string;
  price: number;
  duration: number; // in minutes
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
}

export interface ShopConfig {
  name: string;
  logo: string;
  tagline: string;
  aboutText: string;
  phone: string;
  phoneRaw: string;
  instagram: string;
  instagramUrl: string;
  whatsappLink: string;
  address: string;
  addressMapLink: string;
  businessHours: { days: string; hours: string }[];
  membership: {
    name: string;
    price: number;
    period: string;
    ctaText: string;
    benefits: string[];
  };
  barbers: Barber[];
  services: Service[];
  gallery: GalleryItem[];
  reviews: Review[];
}

export const shop: ShopConfig = {
  name: 'Barbearia F Street',
  logo: 'F STREET',
  tagline: 'Muito mais que um corte. Uma experiência.',
  aboutText: 'A Barbearia F Street foi concebida sob uma estética urbana, moderna e minimalista, entregando autocuidado masculino de altíssimo padrão. Nosso espaço é dedicado aos homens que prezam pela excelência e precisão nos detalhes.',
  phone: '+55 19 99405-0238',
  phoneRaw: '5519994050238',
  instagram: '@barbeariafstreet',
  instagramUrl: 'https://instagram.com/barbeariafstreet',
  whatsappLink: 'https://wa.me/5519994050238?text=Ol%C3%A1%21+Gostaria+de+agendar+um+hor%C3%A1rio+na+Barbearia+F+Street.',
  address: 'Rua Floriano Peixoto, 488 - Centro, Espírito Santo do Pinhal - SP',
  addressMapLink: 'https://maps.google.com/?q=Rua+Floriano+Peixoto,+488+-+Centro,+Espirito+Santo+do+Pinhal+-+SP',
  
  businessHours: [
    { days: 'Segunda a Sexta', hours: '09h00 - 20h00' },
    { days: 'Sábado', hours: '09h00 - 18h00' },
    { days: 'Domingo & Feriados', hours: 'Fechado' }
  ],

  membership: {
    name: 'Clube F Street',
    price: 84.90,
    period: 'mês',
    ctaText: 'Quero fazer parte',
    benefits: [
      'Corte ilimitado por um preço único',
      'Economia mensal garantida',
      'Descontos exclusivos em produtos de styling',
      'Descontos exclusivos em serviços extras (barba, sobrancelha, etc.)',
      'Eventos e degustações exclusivas para membros'
    ]
  },

  barbers: [
    {
      id: 'felipe',
      name: 'Felipe',
      role: 'Fundador da Barbearia F Street',
      experience: 'Líder da equipe • Atendimento premium',
      rating: 4.9,
      reviewsCount: 2040,
      image: '/images/felipe.png',
      bio: 'Fundador e idealizador da F Street. Especialista em visagismo e cortes modernos sob medida.',
      specialties: ['Cortes Modernos', 'Visagismo', 'Estilo Urbano'],
      isFounder: true
    },
    {
      id: 'edmar',
      name: 'Edmar',
      role: 'Classic Barber Specialist',
      experience: 'Excelente acabamento • Precisão cirúrgica',
      rating: 4.8,
      reviewsCount: 1620,
      image: '/images/edmar.png',
      bio: 'Especialista em cortes clássicos britânicos e degradês limpos de alta definição. Mestre da simetria.',
      specialties: ['Cortes Clássicos', 'Pompadour', 'Acabamento Preciso']
    },
    {
      id: 'ingrid',
      name: 'Ingrid',
      role: 'Visagism & Hair Stylist',
      experience: 'Atendimento personalizado • Cortes modernos',
      rating: 4.9,
      reviewsCount: 1810,
      image: '/images/ingrid.png',
      bio: 'Focada em visagismo contemporâneo. Une o formato facial, personalidade e tendências modernas para criar o corte ideal.',
      specialties: ['Cortes Texturizados', 'Styling Feminino e Masculino', 'Visagismo']
    },
    {
      id: 'miranda',
      name: 'Miranda',
      role: 'Razor Master',
      experience: 'Navalhado premium • Barboterapia',
      rating: 4.9,
      reviewsCount: 1540,
      image: '/images/miranda.png',
      bio: 'Especialista na arte da lâmina tradicional. Mestre da barboterapia e acabamentos modernos desenhados à mão.',
      specialties: ['Barba de Navalha', 'Barboterapia Relaxante', 'Linhas de Alta Precisão']
    }
  ],

  services: [
    {
      id: 'corte',
      name: 'Corte',
      category: 'cabelo',
      description: 'Corte moderno ou clássico sob medida com lavagem, shampoo premium e finalização.',
      price: 50,
      duration: 40
    },
    {
      id: 'barba',
      name: 'Barba',
      category: 'barba',
      description: 'Design de barba alinhado com navalha, toalha quente e óleos hidratantes.',
      price: 60,
      duration: 30
    },
    {
      id: 'sobrancelha',
      name: 'Sobrancelha',
      category: 'cabelo',
      description: 'Alinhamento de sobrancelha na pinça ou navalha para um olhar limpo e marcante.',
      price: 30,
      duration: 15
    },
    {
      id: 'hidratacao',
      name: 'Hidratação',
      category: 'cabelo',
      description: 'Tratamento de reconstrução capilar profunda com vaporizador e cremes importados.',
      price: 50,
      duration: 25
    },
    {
      id: 'limpeza-de-pele',
      name: 'Limpeza de Pele',
      category: 'tratamentos',
      description: 'Remoção de cravos e impurezas com máscara facial de argila negra e vaporizador de ozônio.',
      price: 70,
      duration: 30
    },
    {
      id: 'barboterapia',
      name: 'Barboterapia',
      category: 'barba',
      description: 'O ritual completo de barba com esfoliação facial, óleos premium, massagem e toalha quente dupla.',
      price: 80,
      duration: 45
    },
    {
      id: 'alisamento',
      name: 'Alisamento',
      category: 'cabelo',
      description: 'Redução de volume e alinhamento capilar com ativos reconstrutores.',
      price: 110,
      duration: 50
    },
    {
      id: 'coloracao',
      name: 'Coloração',
      category: 'cabelo',
      description: 'Pintura capilar, cobertura de fios brancos ou reflexos alinhados com sua tonalidade.',
      price: 90,
      duration: 45
    },
    {
      id: 'depilacao-nariz',
      name: 'Depilação de Nariz',
      category: 'tratamentos',
      description: 'Remoção higiênica e indolor de pelos do nariz utilizando cera morna especial.',
      price: 30,
      duration: 10
    },
    {
      id: 'depilacao-orelha',
      name: 'Depilação de Orelha',
      category: 'tratamentos',
      description: 'Remoção higiênica de pelos da orelha utilizando cera morna ou técnicas com fogo.',
      price: 30,
      duration: 10
    }
  ],

  gallery: [
    {
      id: 'gal-1',
      url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop',
      caption: 'Estilo Urbano de Alta Precisão'
    },
    {
      id: 'gal-2',
      url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop',
      caption: 'Alinhamento Tradicional na Lâmina Reta'
    },
    {
      id: 'gal-3',
      url: 'https://images.unsplash.com/photo-1593702295094-aea22597af65?q=80&w=600&auto=format&fit=crop',
      caption: 'O Ritual Relaxante da Barboterapia'
    },
    {
      id: 'gal-4',
      url: 'https://images.unsplash.com/photo-1605497746444-ac9da58d7bfc?q=80&w=600&auto=format&fit=crop',
      caption: 'Ambiente Conceitual F Street'
    },
    {
      id: 'gal-5',
      url: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=600&auto=format&fit=crop',
      caption: 'Corte Clássico na Tesoura'
    },
    {
      id: 'gal-6',
      url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600&auto=format&fit=crop',
      caption: 'Acabamentos e Detalhes Cirúrgicos'
    }
  ],

  reviews: [
    {
      id: 'rev-1',
      name: 'Bruno Souza',
      rating: 5,
      text: 'Excelente atendimento. O Felipe é super atencioso e o corte moderno ficou exatamente do jeito que eu queria. O espaço da F Street tem uma pegada urbana muito bacana!',
      date: 'Há 2 dias',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 'rev-2',
      name: 'Rafael Lima',
      rating: 5,
      text: 'Fiz a barba e barboterapia com o Edmar, trabalho simplesmente cirúrgico. A toalha quente e massagem facial me desligaram da correria da semana. Recomendo muito!',
      date: 'Há 5 dias',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 'rev-3',
      name: 'Marcos Oliveira',
      rating: 5,
      text: 'Cortei com a Ingrid e ela mandou muito bem no visagismo. O plano do Clube F Street de corte ilimitado é o melhor negócio que já vi. Excelente economia mensal.',
      date: 'Há 1 semana',
      avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 'rev-4',
      name: 'André Costa',
      rating: 5,
      text: 'Lugar premium de verdade. Sem enrolação de atrasos, atendimento exatamente no horário agendado e o Omiranda na barba é mestre. O agendamento por aqui é rápido demais!',
      date: 'Há 2 semanas',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop'
    }
  ]
};

// Helper to generate dynamic slot availability based on date and barber
export const getAvailableTimeSlots = (barberId: string, dateStr: string): string[] => {
  const allSlots = [
    '09:00', '09:45', '10:30', '11:15', '12:00', 
    '13:30', '14:15', '15:00', '15:45', '16:30', 
    '17:15', '18:00', '18:45', '19:30'
  ];

  const seed = barberId.length + new Date(dateStr).getDate();
  return allSlots.filter((_, index) => {
    const pseudoRandomValue = (index * 7 + seed) % 10;
    return pseudoRandomValue > 3;
  });
};
