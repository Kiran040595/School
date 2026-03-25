import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Users, GraduationCap, Search, Trash2 } from "lucide-react";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec";

interface StudentRow {
  [key: string]: string | number;
}

const CACHE_KEY = "studentDataCache";
const CACHE_EXPIRY = 60 * 60 * 1000;

const loadCache = (): { data: StudentRow[]; timestamp: number } | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const StudentDataTab = () => {
  const cached = loadCache();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>(cached?.data ?? []);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [loaded, setLoaded] = useState(!!cached);
  const [lastFetched, setLastFetched] = useState<Date | null>(cached ? new Date(cached.timestamp) : null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(SCRIPT_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setStudents(data);
        setLoaded(true);
        const now = Date.now();
        setLastFetched(new Date(now));
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: now }));
      } else if (data.error) {
        toast({ title: "Error from script", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to fetch data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (originalIndex: number) => {
    setDeletingIndex(originalIndex);
    try {
      const formData = new URLSearchParams();
      formData.append("sheet", "Sheet1");
      formData.append("action", "delete");
      formData.append("row", String(originalIndex + 2));

      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: formData });
      toast({ title: "Student record deleted" });
      setStudents((prev) => prev.filter((_, i) => i !== originalIndex));
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      toast({ title: "Failed to delete record", variant: "destructive" });
    } finally {
      setDeletingIndex(null);
    }
  };

  const allClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      const cls = String(s.Class || s.class || "").trim();
      if (cls) set.add(cls);
    });
    return Array.from(set).sort();
  }, [students]);

  const classCounts = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((s) => {
      const cls = String(s.Class || s.class || "Unknown").trim();
      map[cls] = (map[cls] || 0) + 1;
    });
    return map;
  }, [students]);

  // Keep original indices for delete mapping
  const filtered = useMemo(() => {
    return students
      .map((s, originalIndex) => ({ ...s, _originalIndex: originalIndex } as StudentRow & { _originalIndex: number }))
      .filter((s) => {
        const matchesClass =
          classFilter === "all" ||
          String(s.Class || s.class || "").trim() === classFilter;
        const matchesSearch =
          !search ||
          Object.entries(s)
            .filter(([key]) => key !== "_originalIndex")
            .some(([, val]) => String(val).toLowerCase().includes(search.toLowerCase()));
        return matchesClass && matchesSearch;
      });
  }, [students, classFilter, search]);

  const headers = useMemo(() => {
    if (students.length === 0) return [];
    return Object.keys(students[0]);
  }, [students]);

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <GraduationCap className="text-muted-foreground" size={48} />
        <p className="text-muted-foreground">Click below to load student data</p>
        <Button onClick={fetchStudents} disabled={loading}>
          {loading ? (
            <><RefreshCw size={16} className="mr-2 animate-spin" /> Loading...</>
          ) : (
            <><Users size={16} className="mr-2" /> Load Student Data</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        {allClasses.slice(0, 7).map((cls) => (
          <Card key={cls}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <GraduationCap className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Class {cls}</p>
                <p className="text-2xl font-bold text-foreground">{classCounts[cls]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search by name, phone, class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {allClasses.map((cls) => (
              <SelectItem key={cls} value={cls}>
                Class {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="icon" onClick={fetchStudents} disabled={loading} title="Refresh data">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              Loading data...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              No records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {headers.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                    <TableHead className="w-12">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row, i) => {
                    const origIdx = row._originalIndex;
                    return (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        {headers.map((h) => (
                          <TableCell key={h}>{String(row[h] ?? "")}</TableCell>
                        ))}
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={deletingIndex === origIdx}
                              >
                                {deletingIndex === origIdx ? (
                                  <RefreshCw size={13} className="animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this student record? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStudent(origIdx)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {students.length} records
      </p>
    </div>
  );
};

export default StudentDataTab;
