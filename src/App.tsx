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
import { useBarbers } from './hooks/useBarbers';
import { useServices } from './hooks/useServices';

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
  };
  return { path, navigate };
}

function App() {
  const { path, navigate } = useRoute();
  
  // Real data
  const { data: shop } = useCurrentShop();
  const shopId = shop?.id;
  const { data: barbers = [] } = useBarbers(shopId ?? '');
  const { data: services = [] } = useServices(shopId ?? '');

  const booking = useBooking(shopId);

  console.log('[Audit] App renderizado');
  console.log('[Audit] Path:', path);
  console.log('[Audit] Shop:', shop);

  // Admin Panel Route
  if (path.startsWith('/admin') || path.startsWith('/dashboard') || path.startsWith('/settings')) {
    return <AdminApp initialPath={path} />;
  }

  // Landing Page
  return (
    <div className="bg-bg-dark text-text-primary min-h-screen font-sans antialiased">
      <Navbar onOpenBooking={() => booking.openBooking()} onOpenAdmin={() => navigate('/admin')} />

      <main>
        <Hero onOpenBooking={() => booking.openBooking()} />
        <About />
        
        {/* We can pass real data to these components later, for now we keep them to maintain design */}
        <Barbers onSelectBarber={(b: any) => booking.openBooking(b)} />
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
      />
    </div>
  );
}

export default App;
