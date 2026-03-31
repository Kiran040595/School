import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import LocalSeoSection from "@/components/LocalSeoSection";
import SyllabusSection from "@/components/SyllabusSection";
import FacultySection from "@/components/FacultySection";
import GallerySection from "@/components/GallerySection";
import AdmissionsSection from "@/components/AdmissionsSection";
import ContactSection from "@/components/ContactSection";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

import StudentInfoPopup from "@/components/StudentInfoPopup";
import ToppersSection from "@/components/ToppersSection";
import AnimatedSection from "@/components/AnimatedSection";

const Index = () => (
  <>
    <StudentInfoPopup />
    <Navbar />
    <HeroSection />
    <AnimatedSection>
      <AboutSection />
    </AnimatedSection>
    <AnimatedSection delay={0.05}>
      <LocalSeoSection />
    </AnimatedSection>
    <AnimatedSection delay={0.1}>
      <ToppersSection />
    </AnimatedSection>
    <AnimatedSection delay={0.1}>
      <GallerySection />
    </AnimatedSection>
    <AnimatedSection>
      <FacultySection />
    </AnimatedSection>
    <AnimatedSection delay={0.1}>
      <SyllabusSection />
    </AnimatedSection>
    <AnimatedSection>
      <AdmissionsSection />
    </AnimatedSection>
    <AnimatedSection delay={0.1}>
      <AnnouncementsSection />
    </AnimatedSection>
    <AnimatedSection>
      <ContactSection />
    </AnimatedSection>
    <Footer />
    <WhatsAppButton />
  </>
);

export default Index;
