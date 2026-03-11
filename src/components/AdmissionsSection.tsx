import { GraduationCap, Phone, Mail, MapPin } from "lucide-react";

const AdmissionsSection = () => {
  return (
    <section id="admissions" className="py-20 bg-background">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase text-secondary mb-2">
            Enroll Now
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Admissions
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Admissions are open for the new academic session. Contact us to learn more about the enrollment process.
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-10 shadow-card">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="text-primary" size={20} />
            </div>
            <h3 className="font-heading font-semibold text-foreground text-lg">How to Apply</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Visit the School Office</p>
                  <p className="text-sm text-muted-foreground">Collect the admission form from our front office during school hours.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Submit Required Documents</p>
                  <p className="text-sm text-muted-foreground">Birth certificate, previous school records, passport-size photographs, and parent ID proof.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Entrance Assessment</p>
                  <p className="text-sm text-muted-foreground">Students may be required to take an entrance assessment based on the grade applied for.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="font-semibold text-foreground text-sm">Contact Admissions Office:</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Phone size={14} className="text-primary" /> +91 98765 43210</span>
                <span className="flex items-center gap-1.5"><Mail size={14} className="text-primary" /> admissions@brightfuture.edu</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> Main Campus, Front Office</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionsSection;
