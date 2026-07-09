import React from 'react';
import { Phone } from 'lucide-react';
import { shop } from '../data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-dark border-t border-border-premium/50 text-text-secondary py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <span className="font-display text-xl tracking-widest text-white block mb-4">{shop.name}</span>
            <p className="text-xs font-light leading-relaxed max-w-sm mb-6">
              {shop.aboutText}
            </p>
            <div className="flex gap-4">
              <a href={shop.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 border border-border-premium hover:border-gold hover:text-gold transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
              <a href={shop.whatsappLink} target="_blank" rel="noopener noreferrer" className="p-2 border border-border-premium hover:border-gold hover:text-gold transition-colors duration-300">
                <span className="text-[10px] uppercase tracking-widest font-bold">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Navegação</h4>
            <div className="flex flex-col gap-2.5 text-xs font-light">
              <a href="#sobre" className="hover:text-gold transition-colors duration-300">A Barbearia</a>
              <a href="#barbeiros" className="hover:text-gold transition-colors duration-300">Barbeiros</a>
              <a href="#servicos" className="hover:text-gold transition-colors duration-300">Serviços</a>
              <a href="#avaliacoes" className="hover:text-gold transition-colors duration-300">Avaliações</a>
            </div>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Contato</h4>
            <div className="flex flex-col gap-2.5 text-xs font-light">
              <a href={`tel:${shop.phoneRaw}`} className="hover:text-gold transition-colors duration-300 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> {shop.phone}
              </a>
              <a href={shop.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors duration-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                {shop.instagram}
              </a>
              <span className="text-[10px] text-neutral-600 block mt-2">© {new Date().getFullYear()} {shop.name}. Todos os direitos reservados.</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border-premium/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-neutral-600">
          <div>Desenvolvido com sofisticação</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-secondary transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Políticas de Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
