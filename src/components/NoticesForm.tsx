import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Send, Megaphone, Plus, Trash2, RefreshCw, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec";

interface TimetableRow {
  subject: string;
  date: string;
  time: string;
  room: string;
}

interface Notice {
  title: string;
  description: string;
  postedBy: string;
  date: string;
  tag?: string;
}

const NoticesForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postedBy, setPostedBy] = useState("");
  const [tag, setTag] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [examDateOpen, setExamDateOpen] = useState(false);
  const [rowDateOpen, setRowDateOpen] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [importantNote, setImportantNote] = useState("");
  const [timetableRows, setTimetableRows] = useState<TimetableRow[]>([
    { subject: "", date: "", time: "", room: "" },
  ]);

  const classes = [
    "Nursery", "LKG", "UKG",
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11", "Class 12", "All Classes",
  ];

  const NOTICES_ADMIN_CACHE_KEY = "adminNoticesCache";
  const NOTICES_ADMIN_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

  const loadCachedNotices = (): Notice[] | null => {
    try {
      const raw = sessionStorage.getItem(NOTICES_ADMIN_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp > NOTICES_ADMIN_CACHE_EXPIRY) {
        sessionStorage.removeItem(NOTICES_ADMIN_CACHE_KEY);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  };

  const cached = loadCachedNotices();
  const [notices, setNotices] = useState<Notice[]>(cached ?? []);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [noticesLoaded, setNoticesLoaded] = useState(!!cached);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const fetchNotices = async () => {
    setLoadingNotices(true);
    try {
      const res = await fetch(`${SCRIPT_URL}?sheet=Sheet2`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotices(data);
        setNoticesLoaded(true);
        sessionStorage.setItem(NOTICES_ADMIN_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      }
    } catch {
      toast({ title: "Failed to load notices", variant: "destructive" });
    } finally {
      setLoadingNotices(false);
    }
  };

  const handleDeleteNotice = async (index: number) => {
    setDeletingIndex(index);
    try {
      const formData = new URLSearchParams();
      formData.append("sheet", "Sheet2");
      formData.append("action", "delete");
      // The row in Google Sheet is index + 2 (1-indexed header row + data offset)
      formData.append("row", String(index + 2));

      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: formData });
      toast({ title: "Notice deleted successfully" });
      setNotices((prev) => prev.filter((_, i) => i !== index));
      sessionStorage.removeItem("noticesCache");
      sessionStorage.removeItem("adminNoticesCache");
    } catch {
      toast({ title: "Failed to delete notice", variant: "destructive" });
    } finally {
      setDeletingIndex(null);
    }
  };

  const addRow = () =>
    setTimetableRows([...timetableRows, { subject: "", date: "", time: "", room: "" }]);

  const removeRow = (i: number) =>
    setTimetableRows(timetableRows.filter((_, idx) => idx !== i));

  const updateRow = (i: number, field: keyof TimetableRow, value: string) => {
    const updated = [...timetableRows];
    updated[i][field] = value;
    setTimetableRows(updated);
  };

  const buildTableDescription = () => {
    const header = "Subject | Date | Time | Room";
    const rows = timetableRows
      .filter((r) => r.subject.trim())
      .map((r) => `${r.subject} | ${r.date} | ${r.time} | ${r.room}`);
    return [header, ...rows].join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isTableTag = tag === "timetable" || tag === "exam";

    if (!title.trim()) {
      toast({ title: "Please fill in the title", variant: "destructive" });
      return;
    }
    if (!isTableTag && !description.trim()) {
      toast({ title: "Please fill in the description", variant: "destructive" });
      return;
    }
    if (isTableTag && timetableRows.every((r) => !r.subject.trim())) {
      toast({ title: "Please add at least one row", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let finalDescription = "";
      if (isTableTag) {
        const parts: string[] = [];
        if (selectedClass) parts.push(`📚 Class: ${selectedClass}`);
        if (examDate) parts.push(`📅 Date: ${format(examDate, "dd MMM yyyy")}`);
        if (importantNote.trim()) parts.push(`⚠️ Important: ${importantNote.trim()}`);
        if (description.trim()) parts.push(description.trim());
        const notesPart = parts.join("\n");
        finalDescription = `${notesPart ? notesPart + "\n---\n" : ""}${buildTableDescription()}`;
      } else {
        finalDescription = description.trim();
      }

      const formData = new URLSearchParams();
      formData.append("sheet", "Sheet2");
      formData.append("title", title.trim());
      formData.append("description", finalDescription);
      formData.append("postedBy", postedBy.trim() || "Admin");
      formData.append("date", new Date().toLocaleDateString("en-IN"));
      formData.append("tag", tag);
      if (examDate) formData.append("examDate", format(examDate, "yyyy-MM-dd"));

      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: formData });

      toast({ title: "Notice published successfully!" });
      setTitle("");
      setDescription("");
      setPostedBy("");
      setTag("general");
      setExamDate(undefined);
      setSelectedClass("");
      setImportantNote("");
      setTimetableRows([{ subject: "", date: "", time: "", room: "" }]);
      sessionStorage.removeItem("noticesCache");
      sessionStorage.removeItem("adminNoticesCache");
      fetchNotices();
    } catch {
      toast({ title: "Failed to publish notice", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const isTableTag = tag === "timetable" || tag === "exam";

  return (
    <div className="space-y-6">
      {/* Post form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Megaphone className="text-primary" size={20} />
            Post a Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Notice title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="flex-1"
              />
              <Select value={tag} onValueChange={setTag}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="timetable">Timetable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isTableTag && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Class Selection */}
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Calendar Date Picker */}
                <Popover open={examDateOpen} onOpenChange={setExamDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !examDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examDate ? format(examDate, "dd MMM yyyy") : "Pick exam/schedule date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={(d) => { setExamDate(d); setExamDateOpen(false); }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Important Note */}
            {isTableTag && (
              <Textarea
                placeholder="⚠️ Any important note (e.g. Bring admit card, No late entry...)"
                value={importantNote}
                onChange={(e) => setImportantNote(e.target.value)}
                rows={2}
                className="border-border focus-visible:ring-ring"
              />
            )}

            <Textarea
              placeholder={
                isTableTag
                  ? "Additional notes or instructions (optional)..."
                  : "Notice description..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={isTableTag ? 2 : 5}
              required={!isTableTag}
            />

            {isTableTag && (
              <div className="space-y-3 rounded-lg border border-border p-3 bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground">
                  {tag === "exam" ? "Exam Schedule" : "Timetable Entries"}
                </p>
                {/* Desktop header - hidden on mobile */}
                <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 text-xs font-medium text-muted-foreground">
                  <span>Subject</span><span>Date</span><span>Time</span><span>Room</span><span />
                </div>
                {timetableRows.map((row, i) => (
                  <div key={i} className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-stretch sm:items-center rounded-md border border-border/50 p-2 sm:p-0 sm:border-0 bg-background sm:bg-transparent">
                    <Input placeholder="Subject" value={row.subject} onChange={(e) => updateRow(i, "subject", e.target.value)} className="text-sm" />
                    <Popover open={rowDateOpen === i} onOpenChange={(open) => setRowDateOpen(open ? i : null)}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full sm:w-28 text-sm justify-start font-normal h-10 px-2", !row.date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {row.date || "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={row.date ? new Date(row.date + ", " + new Date().getFullYear()) : undefined}
                          onSelect={(d) => { if (d) { updateRow(i, "date", format(d, "dd MMM")); setRowDateOpen(null); } }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="flex gap-2">
                      <Select value={row.time} onValueChange={(v) => updateRow(i, "time", v)}>
                        <SelectTrigger className="flex-1 sm:w-28 text-sm">
                          <SelectValue placeholder="Time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, h) => {
                            const hour = h % 12 || 12;
                            const ampm = h < 12 ? "AM" : "PM";
                            return [`${hour}:00 ${ampm}`, `${hour}:30 ${ampm}`];
                          }).flat().map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Room" value={row.room} onChange={(e) => updateRow(i, "room", e.target.value)} className="flex-1 sm:w-20 text-sm" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(i)} disabled={timetableRows.length === 1} className="h-10 w-10 shrink-0">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addRow} className="mt-1 w-full sm:w-auto">
                  <Plus size={14} className="mr-1" /> Add Row
                </Button>
              </div>
            )}

            <Input
              placeholder="Posted by (optional, defaults to Admin)"
              value={postedBy}
              onChange={(e) => setPostedBy(e.target.value)}
            />
            <Button type="submit" disabled={submitting} className="w-full">
              <Send size={16} className="mr-2" />
              {submitting ? "Publishing..." : "Publish Notice"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing notices list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Megaphone className="text-primary" size={18} />
              Existing Notices ({notices.length})
            </CardTitle>
            <Button variant="outline" size="icon" onClick={fetchNotices} disabled={loadingNotices} title="Refresh notices">
              <RefreshCw size={16} className={loadingNotices ? "animate-spin" : ""} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!noticesLoaded ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Megaphone className="text-muted-foreground" size={36} />
              <p className="text-muted-foreground text-sm">Click below to load existing notices</p>
              <Button onClick={fetchNotices} disabled={loadingNotices} variant="outline">
                {loadingNotices ? (
                  <><RefreshCw size={16} className="mr-2 animate-spin" /> Loading...</>
                ) : (
                  <><Megaphone size={16} className="mr-2" /> Load Existing Notices</>
                )}
              </Button>
            </div>
          ) : loadingNotices && notices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Loading notices...</p>
          ) : notices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No notices found.</p>
          ) : (
            <div className="space-y-2">
              {notices.map((notice, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">{notice.title}</span>
                      {notice.tag && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">
                          {notice.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notice.date} · {notice.postedBy || "Admin"}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        disabled={deletingIndex === i}
                      >
                        {deletingIndex === i ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{notice.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteNotice(i)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticesForm;
