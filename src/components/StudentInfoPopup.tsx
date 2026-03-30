import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec";

const formatInquiryTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const StudentInfoPopup = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentName: "",
    fatherName: "",
    phone: "",
    class: "",
  });

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("student_popup_shown");
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("student_popup_shown", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.studentName || !form.fatherName || !form.phone || !form.class) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("action", "studentInquiry");
      params.append("studentName", form.studentName);
      params.append("fatherName", form.fatherName);
      params.append("phone", form.phone);
      params.append("class", form.class);
      params.append("timestamp", formatInquiryTimestamp());

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      toast({ title: "Thank you!", description: "Your information has been submitted successfully." });
      setOpen(false);
      setForm({ studentName: "", fatherName: "", phone: "", class: "" });
    } catch {
      toast({ title: "Submission failed", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="text-primary" size={18} />
            </div>
            <DialogTitle className="text-lg font-heading">Student Inquiry</DialogTitle>
          </div>
          <DialogDescription>
            Fill in your details and we'll get back to you shortly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="studentName">Student Name *</Label>
            <Input id="studentName" value={form.studentName} onChange={(e) => handleChange("studentName", e.target.value)} placeholder="Student name" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="fatherName">Father Name *</Label>
            <Input id="fatherName" value={form.fatherName} onChange={(e) => handleChange("fatherName", e.target.value)} placeholder="Father name" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="Phone number" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="class">Class *</Label>
            <Select value={form.class} onValueChange={(v) => handleChange("class", v)}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {["PREKG", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Maybe Later
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentInfoPopup;
