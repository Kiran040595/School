import heroImg from "@/assets/hero-school.jpg";

const HeroSection = () => (
  <section id="home" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
    <img
      src={heroImg}
      alt="School campus aerial view"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
    <div className="relative z-10 container text-center py-24">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-800 text-primary-foreground mb-6 animate-fade-in-up">
        Bright Future Academy
      </h1>
      <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
        Nurturing excellence, inspiring minds, and building tomorrow's leaders since 1985.
      </p>
      <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <a href="#syllabus" className="inline-flex items-center px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:brightness-110 transition-all shadow-elevated">
          View Syllabus
        </a>
        <a href="#contact" className="inline-flex items-center px-8 py-3 rounded-lg border-2 border-primary-foreground/40 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-all">
          Contact Us
        </a>
      </div>
    </div>
  </section>
);

export default HeroSection;
