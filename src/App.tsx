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
import { useBooking } from './hooks/useBooking';

function App() {
  const booking = useBooking();

  return (
    <div className="bg-bg-dark text-text-primary min-h-screen font-sans antialiased">
      {/* Header navigation */}
      <Navbar onOpenBooking={() => booking.openBooking()} />

      {/* Premium Sections */}
      <main>
        <Hero onOpenBooking={() => booking.openBooking()} />
        <About />
        
        {/* Selecting a barber pre-loads them and skips to step 2 (service selection) */}
        <Barbers onSelectBarber={(barber) => booking.openBooking(barber)} />
        
        {/* Selecting a service pre-loads it and skips to step 3 (date selection) */}
        <Services onSelectService={(service) => booking.openBooking('first-available', service)} />
        
        <Reviews />
        <Location />
        
        <CTASection onOpenBooking={() => booking.openBooking()} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal centralizado premium */}
      <BookingModal
        isOpen={booking.isOpen}
        onClose={booking.closeBooking}
        step={booking.step}
        barber={booking.barber}
        service={booking.service}
        date={booking.date}
        time={booking.time}
        name={booking.name}
        phone={booking.phone}
        notes={booking.notes}
        agreedToTerms={booking.agreedToTerms}
        isSubmitting={booking.isSubmitting}
        selectBarber={booking.selectBarber}
        selectService={booking.selectService}
        selectDate={booking.selectDate}
        selectTime={booking.selectTime}
        setCustomerDetails={booking.setCustomerDetails}
        prevStep={booking.prevStep}
        nextStep={booking.nextStep}
        submitBooking={booking.submitBooking}
      />
    </div>
  );
}

export default App;
