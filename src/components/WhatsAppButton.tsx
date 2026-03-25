import { MessageCircle, Phone, MapPin } from "lucide-react";

const whatsappUrl = `https://wa.me/917093000983?text=${encodeURIComponent("Hello! I'd like to know more about Bright Future Academy.")}`;
const phoneNumber = "tel:+917093000983";
const mapsUrl = "https://www.google.com/maps/dir/?api=1&destination=17.385044,78.486671&destination_place_id=ChIJx9Lr6tqZyzsR1KHhIvQ1WVE";

const WhatsAppButton = () => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
    {/* Maps Button */}
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get directions"
      className="flex items-center gap-2 rounded-full bg-[#4285F4] px-5 py-3 text-white shadow-elevated hover:scale-105 active:scale-95 transition-transform"
    >
      <MapPin size={22} />
      <span className="hidden sm:inline text-sm font-semibold">Directions</span>
    </a>

    {/* Call Button */}
    <a
      href={phoneNumber}
      aria-label="Call us"
      className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-elevated hover:scale-105 active:scale-95 transition-transform"
    >
      <Phone size={22} />
      <span className="hidden sm:inline text-sm font-semibold">Call us</span>
    </a>

    {/* WhatsApp Button */}
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-elevated hover:scale-105 active:scale-95 transition-transform"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline text-sm font-semibold">Chat with us</span>
    </a>
  </div>
);

export default WhatsAppButton;
