import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, GraduationCap, CheckCircle2, ShieldX, AlertCircle } from "lucide-react";
import { authenticate, checkEligibility, DEMO_STUDENTS, type Student } from "@/lib/campus";
import { signIn } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Login · CampusConnect" },
      { name: "description", content: "Sign in to CampusConnect to check into campus facilities." },
      { property: "og:title", content: "Student Login · CampusConnect" },
      { property: "og:description", content: "Sign in to CampusConnect to check into campus facilities." },
    ],
  }),
  component: Login,
});

type Stage = { kind: "form" } | { kind: "denied"; student: Student; reason: string } | { kind: "success"; student: Student };

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>({ kind: "form" });

  useEffect(() => {
    if (stage.kind !== "success") return;
    const t = setTimeout(() => navigate({ to: "/dashboard" }), 1800);
    return () => clearTimeout(t);
  }, [stage, navigate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const auth = authenticate(username, password);
    if (!auth.ok) return setError(auth.reason);
    setError(null);
    const elig = checkEligibility(auth.student);
    if (!elig.ok) return setStage({ kind: "denied", student: auth.student, reason: elig.reason });
    signIn(auth.student.username);
    setStage({ kind: "success", student: auth.student });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-primary">
          <GraduationCap className="h-8 w-8" /><span className="text-2xl font-bold">CampusConnect</span>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          {stage.kind === "form" && (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <h1 className="text-xl font-bold">Student Login</h1>
                <p className="text-sm text-muted-foreground">Sign in with your student account.</p>
              </div>
              {error && (
                <div role="alert" className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="u">Username</Label>
                <Input id="u" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. alex.demo" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p">Password</Label>
                <div className="relative">
                  <Input id="p" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pr-11" />
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-primary">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="h-11 w-full text-base">Sign in</Button>
            </form>
          )}

          {stage.kind === "denied" && (
            <div className="space-y-4 text-center">
              <ShieldX className="mx-auto h-14 w-14 text-destructive" />
              <h1 className="text-xl font-bold">Resource access denied</h1>
              <p className="text-sm text-muted-foreground">Your login was correct, {stage.student.name.split(" ")[0]}, but you can't access campus resources right now.</p>
              <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{stage.reason}</p>
              <Button variant="outline" className="w-full" onClick={() => { setStage({ kind: "form" }); setPassword(""); }}>Back to login</Button>
            </div>
          )}

          {stage.kind === "success" && (
            <div className="space-y-3 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
              <h1 className="text-xl font-bold">You're signed in!</h1>
              <p className="text-sm text-muted-foreground">Welcome, {stage.student.name}. Eligibility confirmed. Taking you to your dashboard…</p>
              <Button className="w-full" onClick={() => navigate({ to: "/dashboard" })}>Go to dashboard</Button>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed bg-secondary/60 p-4 text-sm">
          <p className="mb-2 font-semibold text-secondary-foreground">Demo accounts (fictional, password: demo123)</p>
          <ul className="space-y-1">
            {DEMO_STUDENTS.map((s) => (
              <li key={s.username}>
                <button type="button" className="text-left hover:underline" onClick={() => { setUsername(s.username); setPassword(s.password); setStage({ kind: "form" }); setError(null); }}>
                  <span className="font-mono font-semibold text-primary">{s.username}</span> <span className="text-muted-foreground">— {s.note}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
