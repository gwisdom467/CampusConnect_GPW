import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Home, QrCode, BookOpen, Bell, CalendarDays, LogOut, GraduationCap } from "lucide-react";
import { useStore, signOut } from "@/lib/store";
import { findStudent, type Student } from "@/lib/campus";

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/checkin", label: "Check In", icon: QrCode },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/sessions", label: "Sessions", icon: CalendarDays },
] as const;

export function AppShell({ title, children }: { title: string; children: (s: Student) => ReactNode }) {
  const { username } = useStore();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const student = findStudent(username);
  useEffect(() => {
    if (mounted && !student) navigate({ to: "/", replace: true });
  }, [mounted, student, navigate]);
  if (!mounted || !student) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="bg-gradient-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-bold"><GraduationCap className="h-6 w-6" /> CampusConnect</div>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-lg px-3 py-2 text-sm font-medium opacity-85 hover:bg-primary-foreground/15" activeProps={{ className: "bg-primary-foreground/20 opacity-100" }}>{n.label}</Link>
            ))}
          </nav>
          <button onClick={() => { signOut(); navigate({ to: "/", replace: true }); }} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary-foreground/15">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-6">
          <p className="text-sm opacity-80">{student.name} · {student.studentId}</p>
          <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children(student)}</main>
      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t bg-card md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground" activeProps={{ className: "text-primary font-semibold" }}>
            <n.icon className="h-5 w-5" />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function DemoBadge({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">{children}</span>;
}
