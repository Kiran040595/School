import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { CalendarDays, Save, Loader2, RefreshCw, UserPlus } from "lucide-react";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec";

const CLASSES = ["PREKG", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
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

const normalizeAttendanceStatus = (value: unknown): AttendanceStatus => {
  const normalized = String(value || "").trim().toUpperCase();
  return normalized === "P" || normalized === "A" || normalized === "H" ? normalized : "";
};

const buildDefaultDays = (monthName: string, yearValue: string) => {
  const mi = MONTHS.indexOf(monthName);
  const yr = parseInt(yearValue) || new Date().getFullYear();
  const totalDays = mi >= 0 ? getDaysInMonth(mi, yr) : 31;
  const days: AttendanceStatus[] = [];

  for (let d = 1; d <= 31; d++) {
    if (d > totalDays) {
      days.push("");
    } else if (mi >= 0 && isSunday(yr, mi, d)) {
      days.push("H");
    } else {
      days.push("P");
    }
  }

  return days;
};

const normalizeClassValue = (value: unknown) =>
  String(value || "")
    .replace(/class/gi, "")
    .trim();

const parseStudentList = (rows: unknown, selectedClass: string): StudentInfo[] => {
  if (!Array.isArray(rows)) return [];

  const normalizedSelectedClass = normalizeClassValue(selectedClass).toUpperCase();
  const uniqueStudents = new Map<string, StudentInfo>();

  rows.forEach((row) => {
      const student = row as Record<string, string>;
      const parsedStudent = {
        StudentName: String(
          student.StudentName ||
          student.studentName ||
          student["Student Name"] ||
          student.Name ||
          student.name ||
          ""
        ).trim(),
        RollNumber: String(
          student.RollNumber ||
          student.rollNumber ||
          student["Roll Number"] ||
          student["Roll No"] ||
          student.rollNo ||
          student.Roll ||
          student.phone ||
          student.Phone ||
          student.rowNumber ||
          ""
        ).trim(),
        Class: normalizeClassValue(
          student.Class ||
          student.class ||
          student["Student Class"] ||
          student["Class Name"] ||
          ""
        ).toUpperCase(),
      };

      if (!parsedStudent.StudentName || parsedStudent.Class !== normalizedSelectedClass) return;

      const dedupeKey = parsedStudent.RollNumber || parsedStudent.StudentName.toLowerCase();
      if (!uniqueStudents.has(dedupeKey)) {
        uniqueStudents.set(dedupeKey, {
          StudentName: parsedStudent.StudentName,
          RollNumber: parsedStudent.RollNumber,
        });
      }
    });

  return Array.from(uniqueStudents.values())
    .sort((a, b) => a.RollNumber.localeCompare(b.RollNumber, undefined, { numeric: true }));
};

const getStudentKey = (row: Pick<AttendanceRow, "RollNumber" | "StudentName">) =>
  row.RollNumber || row.StudentName;

const AttendanceTab = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [gridMonth, setGridMonth] = useState(MONTHS[new Date().getMonth()]);
  const [gridYear, setGridYear] = useState(new Date().getFullYear().toString());
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedStudentKeys, setSelectedStudentKeys] = useState<string[]>([]);
  const [activeStudentKey, setActiveStudentKey] = useState("");
  const [filledStudentKeysForMonth, setFilledStudentKeysForMonth] = useState<string[]>([]);

  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newRollNumber, setNewRollNumber] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);


  const currentYear = new Date().getFullYear();
  const years = [String(currentYear - 1), String(currentYear), String(currentYear + 1)];

  const monthIndex = MONTHS.indexOf(gridMonth);
  const yearNum = parseInt(gridYear);
  const daysCount = monthIndex >= 0 ? getDaysInMonth(monthIndex, yearNum) : 31;

  const handleAddStudent = async () => {
    if (!newStudentName || !newRollNumber) {
      toast({ title: "Please enter student name and roll number", variant: "destructive" });
      return;
    }
    if (!selectedClass) {
      toast({ title: "Please select a class first", variant: "destructive" });
      return;
    }

    setIsAddingStudent(true);
    try {
      // 1. Add student to the master list in Google Sheet
      const formData = new URLSearchParams();
      formData.append("action", "addStudent");
      formData.append("StudentName", newStudentName);
      formData.append("RollNumber", newRollNumber);
      formData.append("Class", selectedClass);

      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      // 2. Add student to the local attendance state
      const mi = MONTHS.indexOf(selectedMonth);
      const yr = parseInt(selectedYear);
      const totalDays = getDaysInMonth(mi, yr);
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

      const newStudentRow: AttendanceRow = {
        StudentName: newStudentName,
        RollNumber: newRollNumber,
        Class: selectedClass,
        Month: selectedMonth,
        YY: selectedYear,
        days,
      };

      setAttendance(prev => [...prev, newStudentRow].sort((a, b) => a.RollNumber.localeCompare(b.RollNumber, undefined, { numeric: true })));
      
      toast({ title: "Student added successfully!" });
      setNewStudentName("");
      setNewRollNumber("");
      setIsAddStudentDialogOpen(false);

    } catch (err) {
      toast({ title: "Failed to add student", description: "Please ensure you have the latest Google Apps Script.", variant: "destructive" });
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Fetch the class roster, then merge in any saved attendance for the selected month/year.
  const loadAttendance = useCallback(async () => {
    if (!selectedClass) {
      toast({ title: "Please select class", variant: "destructive" });
      return;
    }

    setLoading(true);
    setLoaded(false);
    try {
      let classStudents: StudentInfo[] = [];

      try {
        const studentsUrl = `${SCRIPT_URL}?sheet=Attendance_Class${encodeURIComponent(selectedClass)}`;
        const studentsRes = await fetch(studentsUrl);
        const studentsData = await studentsRes.json();
        if (Array.isArray(studentsData)) {
          classStudents = parseStudentList(studentsData, selectedClass);
        }
      } catch {
        classStudents = [];
      }

      // No existing data — fetch student list from Sheet1 and create fresh attendance
      if (classStudents.length === 0) {
        toast({
          title: `No students found for Class ${selectedClass}`,
          description: `Check that Attendance_Class${selectedClass} contains saved student rows.`,
          variant: "destructive",
        });
        setAttendance([]);
        setLoaded(true);
        return;
      }

      const monthForGrid = selectedMonth || MONTHS[new Date().getMonth()];
      const yearForGrid = selectedYear || new Date().getFullYear().toString();
      const defaultDays = buildDefaultDays(monthForGrid, yearForGrid);
      const existingByRoll = new Map<string, Record<string, string>>();

      if (selectedMonth && selectedYear) {
        try {
          const existingUrl = `${SCRIPT_URL}?action=getMonthAttendance&class=${encodeURIComponent(selectedClass)}&month=${encodeURIComponent(selectedMonth)}&year=${encodeURIComponent(selectedYear)}`;
          const existingRes = await fetch(existingUrl);
          const existingData = await existingRes.json();

          if (Array.isArray(existingData)) {
            existingData.forEach((row: Record<string, string>) => {
              const roll = String(row.RollNumber || "").trim();
              if (roll) existingByRoll.set(roll, row);
            });
          }
        } catch {
          // Roster loading should still work even if month attendance fetch fails.
        }
      }

      const rows: AttendanceRow[] = classStudents.map((s) => {
        const savedRow = existingByRoll.get(s.RollNumber);
        const days = [...defaultDays];

        if (savedRow) {
          for (let d = 1; d <= 31; d++) {
            const dayKey = String(d);
            const savedValue = savedRow[dayKey] ?? savedRow[dayKey.padStart(2, "0")];
            const normalizedValue = normalizeAttendanceStatus(savedValue);
            days[d - 1] = normalizedValue || days[d - 1];
          }
        }

        return {
          StudentName: savedRow?.StudentName || s.StudentName,
          RollNumber: s.RollNumber,
          Class: selectedClass,
          Month: monthForGrid,
          YY: yearForGrid,
          days,
        };
      });

      setAttendance(rows);
      setGridMonth(monthForGrid);
      setGridYear(yearForGrid);
      setSelectedStudentKeys([]);
      setActiveStudentKey(rows[0] ? getStudentKey(rows[0]) : "");
      setLoaded(true);
      toast({
        title:
          selectedMonth && selectedYear && existingByRoll.size > 0
            ? `Loaded ${classStudents.length} students with saved attendance for ${selectedMonth} ${selectedYear}`
            : `Loaded ${classStudents.length} students for Class ${selectedClass}`,
      });
    } catch {
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedMonth, selectedYear]);

  const toggleDay = (studentIdx: number, dayIdx: number) => {
    if (dayIdx >= daysCount) return; // can't edit invalid days
    const student = attendance[studentIdx];
    if (student) setActiveStudentKey(getStudentKey(student));
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
    const selectedSet = new Set(selectedStudentKeys);
    setAttendance(prev =>
      prev.map(row => {
        if (selectedSet.size > 0 && !selectedSet.has(getStudentKey(row))) {
          return row;
        }
        const days = [...row.days];
        days[dayIdx] = status;
        return { ...row, days };
      })
    );
  };

  const toggleStudentSelection = (studentKey: string, checked: boolean) => {
    setSelectedStudentKeys((prev) =>
      checked ? Array.from(new Set([...prev, studentKey])) : prev.filter((key) => key !== studentKey)
    );
    if (checked) setActiveStudentKey(studentKey);
  };

  const toggleAllStudents = (checked: boolean) => {
    const allKeys = attendance.map((row) => getStudentKey(row));
    setSelectedStudentKeys(checked ? allKeys : []);
    if (checked && allKeys[0]) setActiveStudentKey(allKeys[0]);
  };

  useEffect(() => {
    if (!loaded || !selectedClass || !selectedMonth || !selectedYear) {
      setFilledStudentKeysForMonth([]);
      return;
    }

    let cancelled = false;

    const loadFilledStudentsForMonth = async () => {
      try {
        const existingUrl = `${SCRIPT_URL}?action=getMonthAttendance&class=${encodeURIComponent(selectedClass)}&month=${encodeURIComponent(selectedMonth)}&year=${encodeURIComponent(selectedYear)}`;
        const existingRes = await fetch(existingUrl);
        const existingData = await existingRes.json();

        if (cancelled || !Array.isArray(existingData)) {
          if (!cancelled) setFilledStudentKeysForMonth([]);
          return;
        }

        const keys = existingData
          .map((row: Record<string, string>) => getStudentKey({
            StudentName: String(row.StudentName || "").trim(),
            RollNumber: String(row.RollNumber || "").trim(),
          }))
          .filter(Boolean);

        setFilledStudentKeysForMonth(Array.from(new Set(keys)));
      } catch {
        if (!cancelled) setFilledStudentKeysForMonth([]);
      }
    };

    void loadFilledStudentsForMonth();

    return () => {
      cancelled = true;
    };
  }, [loaded, selectedClass, selectedMonth, selectedYear]);

  const saveAttendance = async () => {
    if (!selectedClass || !selectedMonth || !selectedYear) {
      toast({ title: "Please select class, month and year before saving", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const selectedSet = new Set(selectedStudentKeys);
      const rowsToSave = selectedSet.size > 0
        ? attendance.filter((row) => selectedSet.has(getStudentKey(row)))
        : attendance;

      if (rowsToSave.length === 0) {
        toast({ title: "No students selected to save", variant: "destructive" });
        return;
      }

      const payload = rowsToSave.map(row => ({
        StudentName: row.StudentName,
        RollNumber: row.RollNumber,
        Class: row.Class,
        Month: selectedMonth,
        YY: selectedYear,
        ...Object.fromEntries(row.days.map((v, i) => [String(i + 1), v])),
      }));

      const formData = new URLSearchParams();
      formData.append("action", "saveAttendance");
      formData.append("class", selectedClass);
      formData.append("month", selectedMonth);
      formData.append("year", selectedYear);
      formData.append("data", JSON.stringify(payload));

      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: formData });
      const savedKeys = rowsToSave.map((row) => getStudentKey(row));
      setFilledStudentKeysForMonth((prev) => Array.from(new Set([...prev, ...savedKeys])));
      toast({ title: `Attendance saved for ${rowsToSave.length} student${rowsToSave.length === 1 ? "" : "s"}!` });
    } catch {
      toast({ title: "Failed to save attendance", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Summary
  const summary = useMemo(() => {
    if (!loaded || attendance.length === 0) return null;
    const activeRow =
      attendance.find((row) => getStudentKey(row) === activeStudentKey) ||
      attendance[0];

    if (!activeRow) return null;

    let totalP = 0, totalA = 0, totalH = 0;
    activeRow.days.forEach((d) => {
      if (d === "P") totalP++;
      if (d === "A") totalA++;
      if (d === "H") totalH++;
    });

    return {
      studentName: activeRow.StudentName,
      rollNumber: activeRow.RollNumber,
      totalP,
      totalA,
      totalH,
    };
  }, [activeStudentKey, attendance, loaded]);

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
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setLoaded(false); }}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map(c => (
                  <SelectItem key={c} value={c}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={loadAttendance} disabled={loading} className="gap-2 shrink-0">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {loading ? "Loading…" : "Load"}
            </Button>
            
            <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 shrink-0" disabled={!selectedClass || !selectedMonth || !selectedYear}>
                  <UserPlus size={16} /> Add New Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Add a new student to Class {selectedClass}. They will be added to the attendance sheet for {selectedMonth} {selectedYear}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="col-span-3" placeholder="Student's full name" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="roll" className="text-right">
                      Roll No.
                    </Label>
                    <Input id="roll" value={newRollNumber} onChange={e => setNewRollNumber(e.target.value)} className="col-span-3" placeholder="Roll Number" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddStudent} disabled={isAddingStudent}>
                    {isAddingStudent ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    Save Student
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Load uses class only. Select month and year before saving attendance.
          </p>

          <p className="text-xs text-muted-foreground">
            Click any cell to toggle: <span className="font-semibold text-green-700">P</span> (Present) →{" "}
            <span className="font-semibold text-red-700">A</span> (Absent) →{" "}
            <span className="font-semibold text-yellow-700">H</span> (Holiday)
          </p>
          {selectedMonth && selectedYear && loaded && (
            <p className="text-xs text-muted-foreground">
              Month status for {selectedMonth} {selectedYear}: filled students are shown in green, pending students in amber.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {summary && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Showing counts for: <span className="font-medium text-foreground">{summary.studentName}</span>
            {summary.rollNumber ? ` (${summary.rollNumber})` : ""}
          </p>
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
                    <th className="px-2 py-2 text-center font-medium text-foreground min-w-[44px]">
                      <Checkbox
                        checked={attendance.length > 0 && selectedStudentKeys.length === attendance.length}
                        onCheckedChange={(checked) => toggleAllStudents(Boolean(checked))}
                        aria-label="Select all students"
                      />
                    </th>
                    <th className="sticky left-0 bg-muted/50 px-2 py-2 text-left font-medium text-foreground min-w-[120px] z-10">Student</th>
                    <th className="px-1 py-2 text-center font-medium text-foreground min-w-[40px]">Roll</th>
                    <th className="px-2 py-2 text-center font-medium text-foreground min-w-[90px]">Status</th>
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
                          {String(day)}
                          {sun && <div className="text-[8px] leading-none">Sun</div>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row, si) => (
                    <tr
                      key={si}
                      className={`border-b hover:bg-muted/30 ${getStudentKey(row) === activeStudentKey ? "bg-accent/30" : ""}`}
                    >
                      <td className="px-2 py-1.5 text-center">
                        <Checkbox
                          checked={selectedStudentKeys.includes(getStudentKey(row))}
                          onCheckedChange={(checked) => toggleStudentSelection(getStudentKey(row), Boolean(checked))}
                          aria-label={`Select ${row.StudentName}`}
                        />
                      </td>
                      <td
                        className="sticky left-0 bg-background px-2 py-1.5 font-medium text-foreground truncate max-w-[150px] z-10 cursor-pointer"
                        onClick={() => setActiveStudentKey(getStudentKey(row))}
                      >
                        {row.StudentName}
                      </td>
                      <td className="px-1 py-1.5 text-center text-muted-foreground">{row.RollNumber}</td>
                      <td className="px-2 py-1.5 text-center">
                        {selectedMonth && selectedYear ? (
                          filledStudentKeysForMonth.includes(getStudentKey(row)) ? (
                            <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                              Filled
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                              Pending
                            </span>
                          )
                        ) : (
                          <span className="inline-flex rounded-full border border-muted-foreground/20 bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            Select month
                          </span>
                        )}
                      </td>
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
          <Button onClick={saveAttendance} disabled={saving || !selectedMonth || !selectedYear} size="lg" className="gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving…" : "Save Attendance"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
