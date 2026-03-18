import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const POPUP_DISMISSED_KEY = "student-inquiry-dismissed";

const StudentInquiryPopup = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    studentName: "",
    studentAge: "",
    gradeApplying: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });

  useEffect(() => {
    const dismissed = sessionStorage.getItem(POPUP_DISMISSED_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = (value: boolean) => {
    setOpen(value);
    if (!value) {
      sessionStorage.setItem(POPUP_DISMISSED_KEY, "true");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = new URLSearchParams({
        "form-name": "student-inquiry",
        ...formData,
      });

      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      toast({
        title: "Inquiry Submitted!",
        description:
          "Thank you for your interest. We will get back to you shortly.",
      });

      setFormData({
        studentName: "",
        studentAge: "",
        gradeApplying: "",
        parentName: "",
        parentEmail: "",
        parentPhone: "",
      });

      handleClose(false);
    } catch {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            Welcome to Bright Future Academy
          </DialogTitle>
          <DialogDescription>
            Interested in enrolling? Fill out this quick inquiry form and we'll
            be in touch.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden form for Netlify Forms detection at build time */}
        <form
          name="student-inquiry"
          data-netlify="true"
          netlify-honeypot="bot-field"
          hidden
        >
          <input type="text" name="studentName" />
          <input type="text" name="studentAge" />
          <input type="text" name="gradeApplying" />
          <input type="text" name="parentName" />
          <input type="email" name="parentEmail" />
          <input type="tel" name="parentPhone" />
        </form>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="form-name" value="student-inquiry" />
          <p className="hidden">
            <label>
              Don't fill this out: <input name="bot-field" />
            </label>
          </p>

          {/* Student Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Student Information
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="studentName">Student Full Name *</Label>
              <Input
                id="studentName"
                name="studentName"
                placeholder="Enter student's full name"
                value={formData.studentName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="studentAge">Age *</Label>
                <Input
                  id="studentAge"
                  name="studentAge"
                  type="number"
                  min="3"
                  max="18"
                  placeholder="Age"
                  value={formData.studentAge}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gradeApplying">Grade Applying For *</Label>
                <Select
                  value={formData.gradeApplying}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gradeApplying: value }))
                  }
                  required
                >
                  <SelectTrigger id="gradeApplying">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-K">Pre-K</SelectItem>
                    <SelectItem value="Kindergarten">Kindergarten</SelectItem>
                    <SelectItem value="Grade 1">Grade 1</SelectItem>
                    <SelectItem value="Grade 2">Grade 2</SelectItem>
                    <SelectItem value="Grade 3">Grade 3</SelectItem>
                    <SelectItem value="Grade 4">Grade 4</SelectItem>
                    <SelectItem value="Grade 5">Grade 5</SelectItem>
                    <SelectItem value="Grade 6">Grade 6</SelectItem>
                    <SelectItem value="Grade 7">Grade 7</SelectItem>
                    <SelectItem value="Grade 8">Grade 8</SelectItem>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Parent / Guardian Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Parent / Guardian Information
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="parentName">Full Name *</Label>
              <Input
                id="parentName"
                name="parentName"
                placeholder="Enter parent/guardian's full name"
                value={formData.parentName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentEmail">Email Address *</Label>
              <Input
                id="parentEmail"
                name="parentEmail"
                type="email"
                placeholder="parent@example.com"
                value={formData.parentEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentPhone">Phone Number *</Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.parentPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Inquiry"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your information is safe with us and will only be used for admission
            inquiries.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentInquiryPopup;
