const faculty = [
  { name: "Dr. Sarah Mitchell", role: "Principal", initials: "SM" },
  { name: "Mr. James Parker", role: "Head of Sciences", initials: "JP" },
  { name: "Ms. Priya Sharma", role: "Head of Mathematics", initials: "PS" },
  { name: "Mrs. Elena Rodriguez", role: "Head of Languages", initials: "ER" },
];

const FacultySection = () => (
  <section id="faculty" className="py-20 bg-background">
    <div className="container">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-2">Our Team</p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          Meet Our Faculty
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {faculty.map((f) => (
          <div key={f.name} className="bg-card rounded-xl p-8 text-center shadow-card hover:shadow-elevated transition-shadow group">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <span className="text-xl font-heading font-bold text-primary-foreground">{f.initials}</span>
            </div>
            <p className="font-heading font-semibold text-foreground text-lg">{f.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{f.role}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FacultySection;
