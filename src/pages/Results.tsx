import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Loader2, GraduationCap, BookOpen, Download } from "lucide-react";
import { generateProgressCardPDF } from "@/utils/generateProgressCardPDF";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec";

const CLASSES = ["PREKG", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const SUBJECTS = ["Telugu", "Hindi", "English", "Maths", "Science", "Social"] as const;

interface ResultRow {
  RollNumber: string;
  StudentName: string;
  Class: string;
  ExamType: string;
  Telugu: number;
  Hindi: number;
  English: number;
  Maths: number;
  Science: number;
  Social: number;
  Total: number;
  Percentage: number;
  Grade: string;
}

const getGradeColor = (grade: string) => {
  switch (grade?.toUpperCase()) {
    case "A+": case "A": return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "B+": case "B": return "text-sky-700 bg-sky-50 border-sky-200";
    case "C+": case "C": return "text-amber-700 bg-amber-50 border-amber-200";
    default: return "text-rose-700 bg-rose-50 border-rose-200";
  }
};

const getSubjectColor = (marks: number) => {
  if (marks >= 90) return "text-green-700";
  if (marks >= 75) return "text-blue-700";
  if (marks >= 60) return "text-yellow-700";
  if (marks >= 35) return "text-orange-600";
  return "text-red-600";
};

const Results = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    const trimmedRoll = rollNumber.trim();
    if (!trimmedRoll || !studentClass) {
      toast({ title: "Please enter both Roll Number and Class", variant: "destructive" });
      return;
    }
    if (trimmedRoll.length > 20 || !/^[a-zA-Z0-9]+$/.test(trimmedRoll)) {
      toast({ title: "Invalid roll number", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResults(null);
    try {
      const url = `${SCRIPT_URL}?action=getMarks&rollNumber=${encodeURIComponent(trimmedRoll)}&class=${encodeURIComponent(studentClass)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        toast({ title: "Error fetching results", description: data.error, variant: "destructive" });
        return;
      }
      if (!Array.isArray(data) || data.length === 0) {
        toast({ title: "No results found", description: "Please check your roll number and class.", variant: "destructive" });
        return;
      }
      setResults(data);
    } catch {
      toast({ title: "Failed to fetch results. Try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <GraduationCap size={36} />
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold">Student Results</h1>
              <p className="text-primary-foreground/80 mt-1">Enter your roll number and class to view your exam results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="container py-10">
        <Card className="max-w-xl mx-auto shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search size={20} /> Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Roll Number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                maxLength={20}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Select value={studentClass} onValueChange={setStudentClass}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                {loading ? "Searching…" : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && results.length > 0 && (
          <div className="mt-10 max-w-4xl mx-auto space-y-8">
            {/* Student Info */}
            <div className="text-center">
              <h2 className="text-2xl font-heading font-bold text-foreground">{results[0].StudentName}</h2>
              <p className="text-muted-foreground">Roll No: {results[0].RollNumber} | Class: {results[0].Class}</p>
            </div>

            {results.map((r, idx) => (
              <Card key={idx} className="overflow-hidden border-border/80 shadow-card">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 via-white to-emerald-50/70">
                  <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center gap-2">
                      <BookOpen size={18} /> {r.ExamType || "Exam"}
                    </span>
                    <span className={`text-sm px-3 py-1 rounded-full border font-semibold ${getGradeColor(r.Grade)}`}>
                      Grade: {r.Grade}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Subject marks grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                    {SUBJECTS.map((sub) => (
                      <div key={sub} className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">{sub}</p>
                        <p className={`text-xl font-bold ${getSubjectColor(Number(r[sub]))}`}>
                          {r[sub]}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="flex flex-wrap justify-center gap-6 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-foreground">{r.Total}<span className="text-sm text-muted-foreground">/600</span></p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Percentage</p>
                      <p className="text-2xl font-bold text-foreground">{r.Percentage}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Grade</p>
                      <p className={`text-2xl font-bold ${getGradeColor(r.Grade).split(" ")[0]}`}>{r.Grade}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Download Button */}
            <div className="flex justify-center pt-4 pb-8">
              <Button
                size="lg"
                className="gap-2 text-base px-8"
                onClick={() => generateProgressCardPDF(results)}
              >
                <Download size={18} />
                Download Progress Card (PDF)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
