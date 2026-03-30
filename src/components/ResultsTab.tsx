import { useMemo, useState } from "react";
import { Calculator, FileSpreadsheet, Loader2, RefreshCw, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec";

const CLASSES = ["PREKG", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SUBJECTS = ["Telugu", "Hindi", "English", "Maths", "Science", "Social"] as const;
const MAX_MARKS_PER_SUBJECT = 100;

type SubjectName = (typeof SUBJECTS)[number];

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

const getGrade = (percentage: number) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "D";
  return "F";
};

const getGradeColor = (grade: string) => {
  switch (grade?.toUpperCase()) {
    case "A+":
    case "A":
      return "text-green-700 bg-green-50 border-green-200";
    case "B+":
    case "B":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "C":
    case "D":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    default:
      return "text-red-700 bg-red-50 border-red-200";
  }
};

const buildInitialMarks = () =>
  SUBJECTS.reduce(
    (acc, subject) => ({ ...acc, [subject]: "" }),
    {} as Record<SubjectName, string>
  );

const getResultsSheetName = (studentClass: string) =>
  `Results_Class${studentClass}`;

const ResultsTab = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [examType, setExamType] = useState("Annual Exam");
  const [marks, setMarks] = useState<Record<SubjectName, string>>(buildInitialMarks);
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingResults, setExistingResults] = useState<ResultRow[]>([]);

  const computed = useMemo(() => {
    const numericMarks = SUBJECTS.map((subject) => Number(marks[subject] || 0));
    const total = numericMarks.reduce((sum, value) => sum + value, 0);
    const maxMarks = SUBJECTS.length * MAX_MARKS_PER_SUBJECT;
    const percentage = Number(((total / maxMarks) * 100).toFixed(2));
    const hasFailingSubject = numericMarks.some((value) => value < 35);
    const grade = getGrade(percentage);
    const result = hasFailingSubject ? "Fail" : "Pass";

    return { total, maxMarks, percentage, grade, result };
  }, [marks]);

  const resetForm = () => {
    setRollNumber("");
    setStudentName("");
    setStudentClass("");
    setExamType("Annual Exam");
    setMarks(buildInitialMarks());
  };

  const updateMark = (subject: SubjectName, value: string) => {
    if (value === "") {
      setMarks((prev) => ({ ...prev, [subject]: "" }));
      return;
    }

    if (!/^\d{0,3}$/.test(value)) return;
    const numericValue = Number(value);
    if (numericValue > MAX_MARKS_PER_SUBJECT) return;

    setMarks((prev) => ({ ...prev, [subject]: value }));
  };

  const loadExistingResults = async () => {
    const trimmedRoll = rollNumber.trim();

    if (!trimmedRoll || !studentClass) {
      toast({ title: "Enter roll number and class first", variant: "destructive" });
      return;
    }

    setLoadingExisting(true);
    try {
      const url = `${SCRIPT_URL}?action=getMarks&rollNumber=${encodeURIComponent(trimmedRoll)}&class=${encodeURIComponent(studentClass)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        toast({ title: "Could not load results", description: data.error, variant: "destructive" });
        setExistingResults([]);
        return;
      }

      if (!Array.isArray(data) || data.length === 0) {
        toast({ title: "No existing result found for this student" });
        setExistingResults([]);
        return;
      }

      setExistingResults(data);
      toast({ title: "Existing result loaded" });
    } catch {
      toast({ title: "Failed to load existing results", variant: "destructive" });
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedRoll = rollNumber.trim();
    const trimmedName = studentName.trim();

    if (!trimmedRoll || !trimmedName || !studentClass || !examType.trim()) {
      toast({ title: "Fill in student details first", variant: "destructive" });
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(trimmedRoll)) {
      toast({ title: "Roll number should contain only letters and numbers", variant: "destructive" });
      return;
    }

    const hasMissingMarks = SUBJECTS.some((subject) => marks[subject] === "");
    if (hasMissingMarks) {
      toast({ title: "Enter marks for all subjects", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.append("sheet", getResultsSheetName(studentClass));
      formData.append("RollNumber", trimmedRoll);
      formData.append("StudentName", trimmedName);
      formData.append("Class", studentClass);
      formData.append("ExamType", examType.trim());

      SUBJECTS.forEach((subject) => {
        formData.append(subject, String(Number(marks[subject])));
      });

      formData.append("Total", String(computed.total));
      formData.append("Percentage", String(computed.percentage));
      formData.append("Grade", computed.grade);
      formData.append("Result", computed.result);
      formData.append("Date", new Date().toLocaleDateString("en-IN"));

      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: formData });

      toast({ title: "Result posted successfully" });
      resetForm();
      setExistingResults([]);
    } catch {
      toast({ title: "Failed to post result", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="text-primary" size={20} />
            Post Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Student Name</Label>
                <Input
                  id="student-name"
                  placeholder="Enter student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll-number">Roll Number</Label>
                <Input
                  id="roll-number"
                  placeholder="Enter roll number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={studentClass} onValueChange={setStudentClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((classValue) => (
                      <SelectItem key={classValue} value={classValue}>
                        Class {classValue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-type">Exam Type</Label>
                <Input
                  id="exam-type"
                  placeholder="Quarterly / Half Yearly / Annual"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SUBJECTS.map((subject) => (
                <div key={subject} className="space-y-2">
                  <Label htmlFor={subject}>{subject}</Label>
                  <Input
                    id={subject}
                    inputMode="numeric"
                    placeholder="0 - 100"
                    value={marks[subject]}
                    onChange={(e) => updateMark(subject, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-dashed">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{computed.total}/{computed.maxMarks}</p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground">Percentage</p>
                  <p className="text-2xl font-bold">{computed.percentage}%</p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground">Grade</p>
                  <p className="text-2xl font-bold">{computed.grade}</p>
                </CardContent>
              </Card>
              <Card className={`border ${computed.result === "Pass" ? "border-green-200 bg-green-50/60" : "border-red-200 bg-red-50/60"}`}>
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground">Result</p>
                  <p className={`text-2xl font-bold ${computed.result === "Pass" ? "text-green-700" : "text-red-700"}`}>
                    {computed.result}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {submitting ? "Posting..." : "Post Result"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={loadExistingResults}
                disabled={loadingExisting}
                className="gap-2"
              >
                {loadingExisting ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                {loadingExisting ? "Loading..." : "Load Existing Result"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="text-primary" size={18} />
            Existing Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {existingResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Search by roll number and class to load already posted results for a student.
            </p>
          ) : (
            <div className="space-y-4">
              {existingResults.map((result, index) => (
                <div key={`${result.RollNumber}-${result.ExamType}-${index}`} className="rounded-xl border p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{result.StudentName}</p>
                      <p className="text-sm text-muted-foreground">
                        Roll No: {result.RollNumber} | Class: {result.Class}
                      </p>
                    </div>
                    <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-sm font-semibold ${getGradeColor(result.Grade)}`}>
                      {result.ExamType} - {result.Grade}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="rounded-lg bg-muted/40 p-3 text-center">
                        <p className="text-xs text-muted-foreground">{subject}</p>
                        <p className="text-lg font-bold">{result[subject]}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">{result.Total}</p>
                    </div>
                    <div className="rounded-lg border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Percentage</p>
                      <p className="text-lg font-bold">{result.Percentage}%</p>
                    </div>
                    <div className="rounded-lg border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Grade</p>
                      <p className="text-lg font-bold">{result.Grade}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        This tab posts results into class-specific result sheets, for example Results_Class1, Results_ClassLKG, and so on.
      </p>
    </div>
  );
};

export default ResultsTab;
