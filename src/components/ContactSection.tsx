import { MapPin, Phone, Mail, Clock } from "lucide-react";

const details = [
  { icon: MapPin, label: "Address", value: "123 Education Lane, Knowledge City, 560001" },
  { icon: Phone, label: "Phone / WhatsApp", value: "+91 70930 00983" },
  { icon: Mail, label: "Email", value: "info@brightfutureacademy.edu" },
  { icon: Clock, label: "Office Hours", value: "Mon – Fri: 8:00 AM – 4:00 PM" },
];

const ContactSection = () => (
  <section id="contact" className="py-20 bg-muted">
    <div className="container max-w-4xl">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-2">Get In Touch</p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          Contact Us
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
    </div>
  </section>
);

export default ContactSection;
