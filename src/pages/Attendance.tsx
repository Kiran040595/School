import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Loader2, CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec";

const CLASSES = ["PREKG", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

interface MonthRecord {
  Month: string;
  YY: string;
  days: { day: number; status: string }[];
  present: number;
  absent: number;
  holiday: number;
  total: number;
}

const getStatusIcon = (status: string) => {
  const s = status?.toUpperCase();
  if (s === "P") return <CheckCircle2 size={14} className="text-emerald-600" />;
  if (s === "A") return <XCircle size={14} className="text-rose-600" />;
  if (s === "H") return <Clock size={14} className="text-amber-600" />;
  return null;
};

const getStatusBadge = (status: string) => {
  const s = status?.toUpperCase();
  if (s === "P") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "A") return "bg-rose-50 text-rose-700 border-rose-200";
  if (s === "H") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground";
};

const statusLabel: Record<string, string> = { P: "Present", A: "Absent", H: "Holiday" };

const Attendance = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [monthRecords, setMonthRecords] = useState<MonthRecord[] | null>(null);
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
    setMonthRecords(null);
    try {
      const url = `${SCRIPT_URL}?action=getStudentAttendance&rollNumber=${encodeURIComponent(trimmedRoll)}&class=${encodeURIComponent(studentClass)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }
      if (!Array.isArray(data) || data.length === 0) {
        toast({ title: "No attendance records found", variant: "destructive" });
        return;
      }

      setStudentName(data[0].StudentName || "");

      // Each row is a month's attendance
      const records: MonthRecord[] = data.map((row: Record<string, string>) => {
        const days: { day: number; status: string }[] = [];
        let present = 0, absent = 0, holiday = 0, total = 0;
        for (let d = 1; d <= 31; d++) {
          const key = String(d);
          const val = (row[key] || "").toString().trim().toUpperCase();
          if (val === "P" || val === "A" || val === "H") {
            days.push({ day: d, status: val });
            total++;
            if (val === "P") present++;
            if (val === "A") absent++;
            if (val === "H") holiday++;
          }
        }
        return {
          Month: row.Month || "",
          YY: row.YY || "",
          days,
          present,
          absent,
          holiday,
          total,
        };
      });

      setMonthRecords(records);
    } catch {
      toast({ title: "Failed to fetch attendance", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Overall summary
  const overall = monthRecords
    ? monthRecords.reduce(
        (acc, m) => ({
          present: acc.present + m.present,
          absent: acc.absent + m.absent,
          holiday: acc.holiday + m.holiday,
          total: acc.total + m.total,
        }),
        { present: 0, absent: 0, holiday: 0, total: 0 }
      )
    : null;

  const workingDays = overall ? overall.total - overall.holiday : 0;
  const percentage = workingDays > 0 ? Math.round((overall!.present / workingDays) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <CalendarDays size={36} />
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold">Student Attendance</h1>
              <p className="text-primary-foreground/80 mt-1">Enter roll number and class to view attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="container py-10">
        <Card className="max-w-xl mx-auto shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search size={20} /> Search Attendance
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
        {monthRecords && overall && (
          <div className="mt-10 max-w-4xl mx-auto space-y-8">
            {/* Student Info */}
            <div className="text-center">
              <h2 className="text-2xl font-heading font-bold text-foreground">{studentName}</h2>
              <p className="text-muted-foreground">Roll No: {rollNumber.trim()} | Class: {studentClass}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-foreground">{workingDays}</p>
                  <p className="text-sm text-muted-foreground">Working Days</p>
                </CardContent>
              </Card>
              <Card className="text-center border-emerald-200 bg-emerald-50/60 shadow-card">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-emerald-600">{overall.present}</p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </CardContent>
              </Card>
              <Card className="text-center border-rose-200 bg-rose-50/60 shadow-card">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-rose-600">{overall.absent}</p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </CardContent>
              </Card>
              <Card className="text-center border-sky-200 bg-sky-50/60 shadow-card">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-sky-600">{percentage}%</p>
                  <p className="text-sm text-muted-foreground">Attendance %</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Attendance</span>
                  <span className={`text-sm font-bold ${percentage >= 75 ? "text-emerald-600" : percentage >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                    {percentage}%
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${percentage >= 75 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {percentage < 75 && (
                  <p className="text-xs text-red-600 mt-2">⚠ Attendance is below 75%. Please ensure regular attendance.</p>
                )}
              </CardContent>
            </Card>

            {/* Monthly breakdown */}
            {monthRecords.map((month) => {
              const mWorkingDays = month.total - month.holiday;
              const mPct = mWorkingDays > 0 ? Math.round((month.present / mWorkingDays) * 100) : 0;
              return (
                <Card key={`${month.Month}-${month.YY}`} className="overflow-hidden border-border/80 shadow-card">
                  <CardHeader className="border-b bg-gradient-to-r from-slate-50 via-white to-sky-50/70">
                    <CardTitle className="flex items-center justify-between flex-wrap gap-2 text-lg">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={18} /> {month.Month} {month.YY}
                      </span>
                      <Badge variant="outline" className={mPct >= 75 ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-700"}>
                        {month.present}/{mWorkingDays} working days — {mPct}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
                      {month.days.map((d) => (
                        <div
                          key={d.day}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-md border text-xs font-medium ${getStatusBadge(d.status)}`}
                        >
                          {getStatusIcon(d.status)}
                          <span>{String(d.day)}</span>
                          <span className="text-[10px] opacity-70">{statusLabel[d.status] || ""}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
