import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Lock, ArrowLeft, GraduationCap, Megaphone, CalendarDays } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NoticesForm from "@/components/NoticesForm";
import StudentDataTab from "@/components/StudentDataTab";
import AttendanceTab from "@/components/AttendanceTab";

const HARDCODED_PASSWORD = "12345";

const StudentData = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === HARDCODED_PASSWORD) {
      setAuthenticated(true);
      toast({ title: "Access granted" });
    } else {
      toast({ title: "Incorrect password", variant: "destructive" });
    }
  };

  if (!authenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Lock className="text-primary" size={24} />
              </div>
              <CardTitle className="font-heading">Admin Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Unlock
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft size={16} className="mr-2" /> Back to Home
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Admin Dashboard
            </h1>
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft size={16} className="mr-2" /> Home
            </Button>
          </div>

          <Tabs defaultValue="notices">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="notices" className="gap-2">
                <Megaphone size={16} /> Post a Notice
              </TabsTrigger>
              <TabsTrigger value="students" className="gap-2">
                <GraduationCap size={16} /> Student Data
              </TabsTrigger>
              <TabsTrigger value="attendance" className="gap-2">
                <CalendarDays size={16} /> Attendance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notices">
              <NoticesForm />
            </TabsContent>

            <TabsContent value="students">
              <StudentDataTab />
            </TabsContent>

            <TabsContent value="attendance">
              <AttendanceTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentData;
