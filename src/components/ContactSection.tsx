import { MapPin, Phone, Mail, Clock } from "lucide-react";

const details = [
  { icon: MapPin, label: "Address", value: "D.No 10-5-1, MVP Colony, Visakhapatnam, 530017" },
  { icon: Phone, label: "Phone / WhatsApp", value: "+91 70930 00983" },
  { icon: Mail, label: "Email", value: "info@brightfutureacademy.edu" },
  { icon: Clock, label: "Office Hours", value: "Mon – Fri: 8:00 AM – 4:00 PM" },
];

const ContactSection = () => (
  <section id="contact" className="py-20 bg-muted">
    <div className="container max-w-5xl">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-2">Get In Touch</p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          Contact Us
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {details.map((d) => (
          <div key={d.label} className="bg-card rounded-xl p-6 flex items-start gap-4 shadow-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <d.icon className="text-primary" size={22} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{d.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{d.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Google Maps Embed - School in Visakhapatnam */}
      <div className="rounded-2xl overflow-hidden shadow-card border border-border">
        <iframe
          title="School Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3800.391!2d83.3186!3d17.7231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a39431389e6973f%3A0x92d9c20395f44c0!2sTimpany%20Senior%20Secondary%20School!5e0!3m2!1sen!2sin!4v1700000000000"
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
      </div>
    </div>
  </section>
);

export default ContactSection;
