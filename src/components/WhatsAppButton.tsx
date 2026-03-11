import { MessageCircle } from "lucide-react";

const whatsappUrl = `https://wa.me/917093000983?text=${encodeURIComponent("Hello! I'd like to know more about Bright Future Academy.")}`;

const WhatsAppButton = () => (
  <a
    href={whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-elevated hover:scale-105 transition-transform"
  >
    <MessageCircle size={22} />
    <span className="hidden sm:inline text-sm font-semibold">Chat with us</span>
  </a>
);

export default WhatsAppButton;
