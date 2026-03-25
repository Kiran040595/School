const faculty = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Principal",
    initials: "SM",
    experience: "22 Years",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face",
    qualifications: "Ph.D. in Education, M.Ed.",
  },
  {
    name: "Mr. James Parker",
    role: "Head of Sciences",
    initials: "JP",
    experience: "15 Years",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face",
    qualifications: "M.Sc. Physics, B.Ed.",
  },
  {
    name: "Ms. Priya Sharma",
    role: "Head of Mathematics",
    initials: "PS",
    experience: "18 Years",
    photo: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&h=300&fit=crop&crop=face",
    qualifications: "M.Sc. Mathematics, M.Ed.",
  },
  {
    name: "Mrs. Elena Rodriguez",
    role: "Head of Languages",
    initials: "ER",
    experience: "12 Years",
    photo: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&h=300&fit=crop&crop=face",
    qualifications: "M.A. English Literature, B.Ed.",
  },
  {
    name: "Mr. Rajesh Kumar",
    role: "Head of Computer Science",
    initials: "RK",
    experience: "10 Years",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    qualifications: "M.Tech. CS, B.Ed.",
  },
  {
    name: "Mrs. Anjali Desai",
    role: "Head of Arts & Culture",
    initials: "AD",
    experience: "14 Years",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=300&h=300&fit=crop&crop=face",
    qualifications: "M.A. Fine Arts, Diploma in Education",
  },
];

const FacultySection = () => (
  <section id="faculty" className="py-20 bg-background">
    <div className="container">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-2">Our Team</p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          Meet Our Faculty
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Dedicated educators with decades of combined experience shaping young minds
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {faculty.map((f) => (
          <div
            key={f.name}
            className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 group"
          >
            {/* Photo */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={f.photo}
                alt={f.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Experience badge */}
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                {f.experience}
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <h3 className="font-heading font-semibold text-foreground text-lg leading-tight">
                {f.name}
              </h3>
              <p className="text-sm font-medium text-primary mt-1">{f.role}</p>
              <p className="text-xs text-muted-foreground mt-2">{f.qualifications}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FacultySection;
