import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SyllabusSection from "@/components/SyllabusSection";
import FacultySection from "@/components/FacultySection";
import GallerySection from "@/components/GallerySection";
import AdmissionsSection from "@/components/AdmissionsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import StudentInquiryPopup from "@/components/StudentInquiryPopup";

const Index = () => (
  <>
    <Navbar />
    <HeroSection />
    <AboutSection />
    <SyllabusSection />
    <FacultySection />
    <GallerySection />
    <AdmissionsSection />
    <ContactSection />
    <Footer />
    <WhatsAppButton />
    <StudentInquiryPopup />
  </>
);

export default Index;
