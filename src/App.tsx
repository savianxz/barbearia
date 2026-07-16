import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Barbers } from './components/Barbers';
import { Services } from './components/Services';
import { Reviews } from './components/Reviews';
import { Location } from './components/Location';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/booking/BookingModal';
import { AdminApp } from './admin/AdminApp';
import { useBooking } from './hooks/useBooking';
import { useCurrentShop } from './hooks/useCurrentShop';
import { usePublicBarbers } from './hooks/useBarbers';
import { usePublicServices } from './hooks/useServices';

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);
  const [search, setSearch] = useState(window.location.search);
  useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(window.location.pathname);
    setSearch(window.location.search);
  };
  return { path, search, navigate };
}

function App() {
  const { path, search, navigate } = useRoute();
  
  const slug = new URLSearchParams(search).get('loja') || undefined;

  // Real data
  const { data: shop, isLoading: shopLoading } = useCurrentShop(slug);
  const shopId = shop?.id;
  const { data: barbers = [] } = usePublicBarbers(shopId ?? '');
  const { data: services = [] } = usePublicServices(shopId ?? '');

  const booking = useBooking(shopId);

  console.log('[Audit] App renderizado');
  console.log('[Audit] Path:', path);
  console.log('[Audit] Shop:', shop);

  // Admin Panel Route
  if (path.startsWith('/admin') || path.startsWith('/dashboard') || path.startsWith('/settings')) {
    return <AdminApp initialPath={path} />;
  }

  // Shop Not Found logic
  if (!shopLoading && !shop) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-white mb-4 uppercase tracking-wider">Barbearia não encontrada</h1>
        <p className="text-text-secondary text-sm sm:text-base font-light max-w-md">
          Acesse a URL correta fornecida pela sua barbearia (ex: <span className="text-gold font-mono">/?loja=nome-da-barbearia</span>).
        </p>
      </div>
    );
  }

  // Landing Page
  return (
    <div className="bg-bg-dark text-text-primary min-h-screen font-sans antialiased">
      <Navbar shop={shop} onOpenBooking={() => booking.openBooking()} onOpenAdmin={() => navigate('/admin')} />

      <main>
        <Hero onOpenBooking={() => booking.openBooking()} />
        <About />
        
        {/* We can pass real data to these components later, for now we keep them to maintain design */}
        <Barbers barbers={barbers} onSelectBarber={(b: any) => booking.openBooking(b)} />
        <Services onSelectService={(s: any) => booking.openBooking('first-available', s)} />
        
        <Reviews />
        <Location />
        
        <CTASection onOpenBooking={() => booking.openBooking()} />
      </main>

      <Footer />

      <BookingModal
        isOpen={booking.isOpen}
        onClose={booking.closeBooking}
        step={booking.step}
        barber={booking.barber}
        service={booking.service}
        date={booking.date}
        time={booking.time}
        name={booking.name}
        whatsapp={booking.whatsapp}
        email={booking.email}
        notes={booking.notes}
        wantsReminders={booking.wantsReminders}
        wantsPromotions={booking.wantsPromotions}
        confirmationCode={booking.confirmationCode}
        isSubmitting={booking.isSubmitting}
        submitError={booking.submitError}
        selectBarber={booking.selectBarber}
        selectService={booking.selectService}
        selectDate={booking.selectDate}
        selectTime={booking.selectTime}
        setCustomerDetails={booking.setCustomerDetails}
        prevStep={booking.prevStep}
        nextStep={booking.nextStep}
        submitBooking={booking.submitBooking}
        validateCustomTime={booking.validateCustomTime}
        validationReason={booking.validationReason}
        suggestions={booking.suggestions}
        // Novas props reais:
        barbers={barbers.filter(b => b.is_active)}
        services={services.filter(s => s.is_active)}
        shopName={shop?.name || 'Barbearia Premium'}
        shopId={shopId || ''}
        businessHours={shop?.business_hours}
      />
    </div>
  );
}

export default App;
