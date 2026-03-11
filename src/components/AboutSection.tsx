import { BookOpen, Users, Award, GraduationCap } from "lucide-react";

const stats = [
  { icon: Users, value: "1,200+", label: "Students Enrolled" },
  { icon: BookOpen, value: "45+", label: "Courses Offered" },
  { icon: Award, value: "98%", label: "Pass Rate" },
  { icon: GraduationCap, value: "35+", label: "Years of Excellence" },
];

const AboutSection = () => (
  <section id="about" className="py-20 bg-background">
    <div className="container">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-2">About Us</p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          A Tradition of Academic Excellence
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Bright Future Academy is committed to providing a holistic education that prepares students
          for success in higher education and beyond. Our dedicated faculty and state-of-the-art facilities
          create an environment where every student can thrive.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-6 text-center shadow-card hover:shadow-elevated transition-shadow">
            <s.icon className="mx-auto mb-3 text-primary" size={32} />
            <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
