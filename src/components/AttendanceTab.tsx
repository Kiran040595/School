import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CalendarDays, Save, Loader2, RefreshCw } from "lucide-react";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface StudentInfo {
  StudentName: string;
  RollNumber: string;
}

type AttendanceStatus = "P" | "A" | "H" | "";

interface AttendanceRow {
  StudentName: string;
  RollNumber: string;
  Class: string;
  Month: string;
  YY: string;
  days: AttendanceStatus[]; // index 0 = day 1, length 31
}

const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

const isSunday = (year: number, month: number, day: number) => new Date(year, month, day).getDay() === 0;

const statusColors: Record<string, string> = {
  P: "bg-green-100 text-green-800 border-green-300",
  A: "bg-red-100 text-red-800 border-red-300",
  H: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "": "bg-muted text-muted-foreground",
};

const nextStatus = (current: AttendanceStatus): AttendanceStatus => {
  if (current === "P") return "A";
  if (current === "A") return "H";
  if (current === "H") return "P";
  return "P";
};

const AttendanceTab = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = [String(currentYear - 1), String(currentYear), String(currentYear + 1)];

  const monthIndex = MONTHS.indexOf(selectedMonth);
  const yearNum = parseInt(selectedYear);
  const daysCount = monthIndex >= 0 ? getDaysInMonth(monthIndex, yearNum) : 31;

  // Fetch students for selected class and initialize attendance
  const loadAttendance = useCallback(async () => {
    if (!selectedClass || !selectedMonth || !selectedYear) {
      toast({ title: "Please select class, month and year", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // First try to fetch existing attendance for this class/month/year
      const existingUrl = `${SCRIPT_URL}?action=getMonthAttendance&class=${encodeURIComponent(selectedClass)}&month=${encodeURIComponent(selectedMonth)}&year=${encodeURIComponent(selectedYear)}`;
      const existingRes = await fetch(existingUrl);
      const existingData = await existingRes.json();

      if (Array.isArray(existingData) && existingData.length > 0) {
        // Load existing attendance data
        const rows: AttendanceRow[] = existingData.map((row: Record<string, string>) => {
          const days: AttendanceStatus[] = [];
          for (let d = 1; d <= 31; d++) {
            const key = String(d).padStart(2, "0");
            const val = (row[key] || "").toString().trim().toUpperCase();
            days.push(val === "P" || val === "A" || val === "H" ? val : "");
          }
          return {
            StudentName: row.StudentName || "",
            RollNumber: row.RollNumber || "",
            Class: row.Class || selectedClass,
            Month: selectedMonth,
            YY: selectedYear,
            days,
          };
        });
        setAttendance(rows);
        setStudents(rows.map(r => ({ StudentName: r.StudentName, RollNumber: r.RollNumber })));
        setLoaded(true);
        toast({ title: `Loaded existing attendance for ${selectedMonth} ${selectedYear}` });
        return;
      }

      // No existing data — fetch student list from Sheet1 and create fresh attendance
      const studentsUrl = `${SCRIPT_URL}?sheet=Sheet1`;
      const studentsRes = await fetch(studentsUrl);
      const studentsData = await studentsRes.json();

      if (!Array.isArray(studentsData)) {
        toast({ title: "Failed to load student list", variant: "destructive" });
        return;
      }

      // Filter students by class
      const classStudents: StudentInfo[] = studentsData
        .filter((s: Record<string, string>) =>
          String(s.Class || s.class || "").trim() === selectedClass
        )
        .map((s: Record<string, string>) => ({
          StudentName: s.StudentName || s.Name || s.name || "",
          RollNumber: String(s.RollNumber || s.rollNumber || s.Roll || ""),
        }))
        .sort((a: StudentInfo, b: StudentInfo) => a.RollNumber.localeCompare(b.RollNumber, undefined, { numeric: true }));

      if (classStudents.length === 0) {
        toast({ title: `No students found for Class ${selectedClass}`, variant: "destructive" });
        return;
      }

      // Initialize: all days P, Sundays H, invalid days empty
      const mi = MONTHS.indexOf(selectedMonth);
      const yr = parseInt(selectedYear);
      const totalDays = getDaysInMonth(mi, yr);

      const rows: AttendanceRow[] = classStudents.map(s => {
        const days: AttendanceStatus[] = [];
        for (let d = 1; d <= 31; d++) {
          if (d > totalDays) {
            days.push("");
          } else if (isSunday(yr, mi, d)) {
            days.push("H");
          } else {
            days.push("P");
          }
        }
        return {
          StudentName: s.StudentName,
          RollNumber: s.RollNumber,
          Class: selectedClass,
          Month: selectedMonth,
          YY: selectedYear,
          days,
        };
      });

      setStudents(classStudents);
      setAttendance(rows);
      setLoaded(true);
      toast({ title: `Loaded ${classStudents.length} students. Sundays auto-marked as Holiday.` });
    } catch {
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedMonth, selectedYear]);

  const toggleDay = (studentIdx: number, dayIdx: number) => {
    if (dayIdx >= daysCount) return; // can't edit invalid days
    setAttendance(prev => {
      const updated = [...prev];
      const row = { ...updated[studentIdx] };
      const days = [...row.days];
      days[dayIdx] = nextStatus(days[dayIdx]);
      row.days = days;
      updated[studentIdx] = row;
      return updated;
    });
  };

  // Mark entire column (day) as a specific status
  const markDayForAll = (dayIdx: number, status: AttendanceStatus) => {
    if (dayIdx >= daysCount) return;
    setAttendance(prev =>
      prev.map(row => {
        const days = [...row.days];
        days[dayIdx] = status;
        return { ...row, days };
      })
    );
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const payload = attendance.map(row => ({
        StudentName: row.StudentName,
        RollNumber: row.RollNumber,
        Class: row.Class,
        Month: row.Month,
        YY: row.YY,
        ...Object.fromEntries(row.days.map((v, i) => [String(i + 1).padStart(2, "0"), v])),
      }));

      const formData = new URLSearchParams();
      formData.append("action", "saveAttendance");
      formData.append("class", selectedClass);
      formData.append("month", selectedMonth);
      formData.append("year", selectedYear);
      formData.append("data", JSON.stringify(payload));

      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: formData });
      toast({ title: "Attendance saved successfully!" });
    } catch {
      toast({ title: "Failed to save attendance", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Summary
  const summary = useMemo(() => {
    if (!loaded || attendance.length === 0) return null;
    let totalP = 0, totalA = 0, totalH = 0;
    attendance.forEach(row => {
      row.days.forEach(d => {
        if (d === "P") totalP++;
        if (d === "A") totalA++;
        if (d === "H") totalH++;
      });
    });
    return { totalP, totalA, totalH };
  }, [attendance, loaded]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays size={20} /> Post Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setLoaded(false); }}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map(c => (
                  <SelectItem key={c} value={c}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={v => { setSelectedMonth(v); setLoaded(false); }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={v => { setSelectedYear(v); setLoaded(false); }}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={loadAttendance} disabled={loading} className="gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {loading ? "Loading…" : "Load"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Click any cell to toggle: <span className="font-semibold text-green-700">P</span> (Present) →{" "}
            <span className="font-semibold text-red-700">A</span> (Absent) →{" "}
            <span className="font-semibold text-yellow-700">H</span> (Holiday)
          </p>
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center border-green-200 bg-green-50/50">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-green-600">{summary.totalP}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200 bg-red-50/50">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-red-600">{summary.totalA}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </CardContent>
          </Card>
          <Card className="text-center border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-yellow-600">{summary.totalH}</p>
              <p className="text-xs text-muted-foreground">Holidays</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Grid */}
      {loaded && attendance.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="sticky left-0 bg-muted/50 px-2 py-2 text-left font-medium text-foreground min-w-[120px] z-10">Student</th>
                    <th className="px-1 py-2 text-center font-medium text-foreground min-w-[40px]">Roll</th>
                    {Array.from({ length: daysCount }, (_, i) => {
                      const day = i + 1;
                      const sun = isSunday(yearNum, monthIndex, day);
                      return (
                        <th
                          key={day}
                          className={`px-0.5 py-2 text-center font-medium min-w-[28px] cursor-pointer hover:bg-accent ${sun ? "text-red-500" : "text-foreground"}`}
                          title={`Click to mark all as Holiday for day ${day}`}
                          onClick={() => markDayForAll(i, "H")}
                        >
                          {String(day).padStart(2, "0")}
                          {sun && <div className="text-[8px] leading-none">Sun</div>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row, si) => (
                    <tr key={si} className="border-b hover:bg-muted/30">
                      <td className="sticky left-0 bg-background px-2 py-1.5 font-medium text-foreground truncate max-w-[150px] z-10">
                        {row.StudentName}
                      </td>
                      <td className="px-1 py-1.5 text-center text-muted-foreground">{row.RollNumber}</td>
                      {row.days.slice(0, daysCount).map((status, di) => (
                        <td
                          key={di}
                          className={`px-0.5 py-1 text-center cursor-pointer select-none border ${statusColors[status] || statusColors[""]}`}
                          onClick={() => toggleDay(si, di)}
                          title={`${row.StudentName} - Day ${di + 1}: ${status || "N/A"}`}
                        >
                          {status}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {loaded && attendance.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={saveAttendance} disabled={saving} size="lg" className="gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving…" : "Save Attendance"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
