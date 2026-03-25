import { Trophy, Star, Medal } from "lucide-react";

const toppers = [
  {
    rank: 1,
    name: "Aarav Sharma",
    grade: "Class 10",
    marks: "498/500",
    percentage: "99.6%",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    subject: "Science Topper",
  },
  {
    rank: 2,
    name: "Priya Patel",
    grade: "Class 10",
    marks: "495/500",
    percentage: "99.0%",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    subject: "Mathematics Topper",
  },
  {
    rank: 3,
    name: "Rohan Verma",
    grade: "Class 10",
    marks: "491/500",
    percentage: "98.2%",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    subject: "English Topper",
  },
  {
    rank: 4,
    name: "Sneha Gupta",
    grade: "Class 12",
    marks: "489/500",
    percentage: "97.8%",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    subject: "Commerce Topper",
  },
  {
    rank: 5,
    name: "Arjun Reddy",
    grade: "Class 12",
    marks: "486/500",
    percentage: "97.2%",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    subject: "Physics Topper",
  },
  {
    rank: 6,
    name: "Kavya Nair",
    grade: "Class 12",
    marks: "483/500",
    percentage: "96.6%",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    subject: "Biology Topper",
  },
];

const rankStyles: Record<number, { border: string; bg: string; icon: React.ReactNode; badge: string }> = {
  1: {
    border: "border-yellow-400 ring-4 ring-yellow-200/60",
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
    icon: <Trophy className="h-6 w-6 text-yellow-500" />,
    badge: "bg-yellow-400 text-yellow-900",
  },
  2: {
    border: "border-slate-300 ring-4 ring-slate-200/60",
    bg: "bg-gradient-to-br from-slate-50 to-gray-50",
    icon: <Medal className="h-6 w-6 text-slate-400" />,
    badge: "bg-slate-300 text-slate-800",
  },
  3: {
    border: "border-orange-400 ring-4 ring-orange-200/60",
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
    icon: <Medal className="h-6 w-6 text-orange-500" />,
    badge: "bg-orange-300 text-orange-900",
  },
};

const ToppersSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-primary/5 via-background to-background" id="toppers">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold mb-4">
            <Trophy className="h-4 w-4" />
            Pride of Our School
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            🏆 2026 Toppers of Our School
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Celebrating the outstanding achievements of our brilliant students who made us proud.
          </p>
        </div>

        {/* Top 3 - Featured Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
          {toppers.slice(0, 3).map((student) => {
            const style = rankStyles[student.rank];
            return (
              <div
                key={student.rank}
                className={`relative rounded-2xl ${style.bg} ${style.border} border-2 p-6 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow duration-300 ${student.rank === 1 ? "sm:-mt-4 sm:scale-105" : ""}`}
              >
                {/* Rank badge */}
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 ${style.badge} px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1`}>
                  {style.icon}
                  Rank #{student.rank}
                </span>
                {/* Photo */}
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md mt-3"
                />
                <h3 className="mt-4 text-lg font-bold text-foreground">{student.name}</h3>
                <span className="text-xs text-muted-foreground">{student.grade}</span>
                <div className="mt-3 flex flex-col items-center gap-1">
                  <span className="text-2xl font-extrabold text-primary">{student.percentage}</span>
                  <span className="text-sm text-muted-foreground">{student.marks}</span>
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                  <Star className="h-3 w-3" /> {student.subject}
                </span>
              </div>
            );
          })}
        </div>

        {/* Remaining toppers - horizontal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {toppers.slice(3).map((student) => (
            <div
              key={student.rank}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={student.photo}
                alt={student.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-muted shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">#{student.rank}</span>
                  <h4 className="font-semibold text-foreground text-sm truncate">{student.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{student.grade} · {student.subject}</p>
                <p className="text-sm font-bold text-primary mt-0.5">{student.percentage} <span className="text-xs font-normal text-muted-foreground">({student.marks})</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Result Board */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              📋 Complete Result Board 2026
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Detailed scorecards of all our high-achieving students
            </p>
          </div>
          <div className="rounded-2xl border-2 border-primary/20 overflow-hidden shadow-lg bg-card">
            <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">Annual Examination Results — 2025-26</span>
              <span className="text-xs text-muted-foreground">All Classes</span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1588072432836-e10032774350?w=1200&h=600&fit=crop"
              alt="School result board showing student scores"
              className="w-full object-cover"
            />
            <div className="px-4 py-3 bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground">
                * This is the official result board displayed at the school campus. For individual results, check the Student Portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToppersSection;
