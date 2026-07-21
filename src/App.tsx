import { useEffect, useState, useRef } from 'react';
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
import { PlatformLanding } from './components/PlatformLanding';
import { LogoSplash } from './components/LogoSplash';
import { useBooking } from './hooks/useBooking';
import { useCurrentShop } from './hooks/useCurrentShop';
import { usePublicBarbers } from './hooks/useBarbers';
import { usePublicServices } from './hooks/useServices';
import React, { Suspense } from 'react';

const AdminApp = React.lazy(() => import('./admin/AdminApp').then(module => ({ default: module.AdminApp })));

// Prefixes that belong to the admin panel — never treated as shop slugs
const ADMIN_PREFIXES = ['/admin', '/dashboard', '/settings'];

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

  // ── 1. Detect admin route BEFORE deriving any slug ────────────────────────
  //    Guarantees '/admin' is never parsed as slug='admin'
  const isAdminRoute = ADMIN_PREFIXES.some(prefix => path.startsWith(prefix));

  // ── 2. Derive slug only when NOT an admin route ───────────────────────────
  //    Priority: path segment (/fstreet) → legacy query param (?loja=fstreet)
  const pathSegment = !isAdminRoute
    ? path.split('/').filter(Boolean)[0]  // '/fstreet' → 'fstreet', '/' → undefined
    : undefined;                           // '/admin'   → undefined (never a slug)
  const querySlug = new URLSearchParams(search).get('loja') ?? undefined;
  const slug = pathSegment || querySlug;  // retrocompat: ?loja= still works

  // ── 3. Hooks — always called unconditionally (React rules) ────────────────
  //    When isAdminRoute=true, slug=undefined so useCurrentShop fires no query
  const { data: shop, isLoading: shopLoading } = useCurrentShop(slug);
  const shopId = shop?.id;
  const { data: barbers = [] } = usePublicBarbers(shopId ?? '');
  const booking = useBooking(shopId);

  // Resolve the selected barberId for price resolution (null = "first available" or nothing selected)
  const selectedBarberId = booking.barber && booking.barber !== 'first-available'
    ? (booking.barber as any).id as string
    : null;

  // Re-fetches automatically when barberId changes (RPC resolves prices with overrides)
  const { data: services = [] } = usePublicServices(shopId ?? '', selectedBarberId);

  // ── Splash logic — public shop pages only, once per page load ─────────────
  // splashShownRef becomes true after MIN_DISPLAY ms → gates the exit condition
  const MIN_DISPLAY_MS = 600;
  const isPublicShop = !!slug && !isAdminRoute;
  const minTimePassedRef = useRef(false);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (!isPublicShop) return;
    const t = setTimeout(() => {
      minTimePassedRef.current = true;
      setMinTimePassed(true);
    }, MIN_DISPLAY_MS);
    return () => clearTimeout(t);
    // Only run once on mount — intentionally no deps array change
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Splash exits when BOTH conditions are met: min time passed AND shop data loaded (or confirmed missing)
  const splashShouldExit = minTimePassed && !shopLoading;
  const showSplash = isPublicShop && !splashDone;

  // ── 4. Conditional rendering (JSX only — no hooks below this line) ────────

  // 4a. Admin routes — absolute priority
  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#090909] flex items-center justify-center text-gold uppercase tracking-widest font-bold text-sm">Carregando painel...</div>}>
        <AdminApp initialPath={path} />
      </Suspense>
    );
  }

  // 4b. Root with no slug — platform landing
  if (!slug) {
    return <PlatformLanding />;
  }

  // 4c. Splash — shown on initial public shop load while data fetches
  //     Remains until: shopLoading resolved AND minimum 600ms elapsed
  //     Goes away via fade-out (onComplete sets splashDone)
  if (showSplash) {
    return (
      <>
        <LogoSplash
          shop={shop}
          visible={!splashShouldExit}
          onComplete={() => setSplashDone(true)}
        />
        {/* Slug found but not found — render error behind splash so it shows after fade-out */}
        {!shopLoading && !shop && (
          <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-white mb-4 uppercase tracking-wider">Barbearia não encontrada</h1>
            <p className="text-text-secondary text-sm sm:text-base font-light max-w-md">
              Nenhuma barbearia encontrada para <span className="text-gold font-mono">/{slug}</span>.
              Verifique o link fornecido pelo seu barbeiro.
            </p>
          </div>
        )}
      </>
    );
  }

  // 4d. Slug exists but shop not found in DB (after splash completed)
  if (!shop) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-white mb-4 uppercase tracking-wider">Barbearia não encontrada</h1>
        <p className="text-text-secondary text-sm sm:text-base font-light max-w-md">
          Nenhuma barbearia encontrada para <span className="text-gold font-mono">/{slug}</span>.
          Verifique o link fornecido pelo seu barbeiro.
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
        <Services services={services} onSelectService={(s: any) => booking.openBooking('first-available', s)} />
        
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
        services={services}
        shopName={shop?.name || 'Barbearia Premium'}
        shopId={shopId || ''}
        businessHours={shop?.business_hours}
      />
    </div>
  );
}

export default App;
