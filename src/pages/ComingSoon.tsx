import { Wrench, FileText, CheckCircle, CreditCard, MessageSquare, BookOpen } from "lucide-react";

const upcomingFeatures = [
  { icon: FileText, title: "Progress Cards", description: "Automated generation of detailed student progress report cards with visual insights." },
  { icon: CheckCircle, title: "Marks Management", description: "Easy entry, secure updating, and tracking of student marks and academic grades." },
  { icon: CreditCard, title: "Online Fee Payment", description: "Secure and convenient online fee payment portal with instant receipt generation." },
  { icon: MessageSquare, title: "Parent-Teacher Portal", description: "Direct and secure communication channel between parents and teachers." },
  { icon: BookOpen, title: "Library Management", description: "Digital tracking of library books, issue/return logs, and student reading history." },
  { icon: Wrench, title: "Timetable Builder", description: "Dynamic timetable generation and conflict-free schedule management for classes." },
];

const ComingSoon = () => {
  return (
    <div className="pt-32 pb-20 min-h-[85vh] bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Wrench className="h-4 w-4" />
            Under Construction
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Coming Soon
          </h1>
          <p className="text-lg text-muted-foreground">
            We are constantly working to improve Bright Future Academy's digital ecosystem. Here are some exciting features we are currently developing to streamline school management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${(idx + 1) * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;