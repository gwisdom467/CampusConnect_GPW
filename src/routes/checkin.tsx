import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, XCircle, RotateCcw, FlaskConical } from "lucide-react";
import { AppShell, DemoBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { checkEligibility, checkFacilityAccess, FACILITIES, findStudent } from "@/lib/campus";
import { addLog, useStore } from "@/lib/store";

export const Route = createFileRoute("/checkin")({
  head: () => ({
    meta: [
      { title: "Facility Check-in · CampusConnect" },
      { name: "description", content: "Scan a campus facility QR code to check in." },
      { property: "og:title", content: "Facility Check-in · CampusConnect" },
      { property: "og:description", content: "Scan a campus facility QR code to check in." },
    ],
  }),
  component: () => <AppShell title="Facility Check-in">{() => <CheckIn />}</AppShell>,
});

type Step = { label: string; ok: boolean; detail: string };
type Outcome = { ok: boolean; facility: string; reason?: string | undefined; steps: Step[] };
type Detector = { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> };

function CheckIn() {
  const { username } = useStore();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setSupported("BarcodeDetector" in window && !!navigator.mediaDevices?.getUserMedia);
    return stop;
  }, []);

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  function handle(payload: string) {
    stop();
    // Re-verifies sign-in, eligibility and facility permission — the QR alone grants nothing.
    const r = checkFacilityAccess(username, payload);
    const facility = r.facility?.name ?? "Unknown facility";
    const reason = r.ok ? undefined : r.reason;
    if (username) addLog({ username, facility, approved: r.ok, reason });
    const student = findStudent(username);
    const elig = student ? checkEligibility(student) : null;
    const steps: Step[] = [
      { label: "Signed in", ok: !!student, detail: student ? `${student.name} (${student.studentId})` : "Not signed in" },
      { label: "Eligible for campus resources", ok: !!elig?.ok, detail: !elig ? "Skipped" : elig.ok ? "Enrolled, no holds on your account" : elig.reason },
      { label: "Facility access", ok: r.ok, detail: r.ok ? `Permitted at ${facility}` : !elig?.ok ? "Skipped" : r.reason ?? "" },
    ];
    setOutcome({ ok: r.ok, facility, reason, steps });
  }

  async function startCamera() {
    setCamError(null); setOutcome(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      const v = videoRef.current!;
      v.srcObject = stream; await v.play();
      const Ctor = (window as unknown as { BarcodeDetector: new (o: object) => Detector }).BarcodeDetector;
      const det = new Ctor({ formats: ["qr_code"] });
      const tick = async () => {
        if (!streamRef.current) return;
        try { const codes = await det.detect(v); if (codes[0]) return handle(codes[0].rawValue); } catch { /* keep trying */ }
        requestAnimationFrame(tick);
      };
      tick();
    } catch {
      stop();
      setCamError("We couldn't open your camera. Check camera permission, or use the demo scan below.");
    }
  }

  if (outcome) {
    return (
      <div className={`mx-auto max-w-md rounded-2xl border p-6 text-center shadow-card ${outcome.ok ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"}`}>
        {outcome.ok ? <CheckCircle2 className="mx-auto h-16 w-16 text-success" /> : <XCircle className="mx-auto h-16 w-16 text-destructive" />}
        <h2 className="mt-3 text-2xl font-bold">{outcome.ok ? "Access approved" : "Access denied"}</h2>
        <p className="mt-1 font-medium">{outcome.facility}</p>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
        {outcome.ok && <p className="mt-3 rounded-lg bg-success/10 p-3 text-sm font-medium text-success">You are eligible to access {outcome.facility}. Enjoy your visit!</p>}
        {outcome.reason && <p className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{outcome.reason}</p>}
        <ul className="mt-4 space-y-2 text-left">
          {outcome.steps.map((s) => (
            <li key={s.label} className="flex gap-2 rounded-lg bg-card p-3 text-sm">
              {s.ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <XCircle className="h-5 w-5 shrink-0 text-destructive" />}
              <div><p className="font-semibold">{s.label}</p><p className="text-muted-foreground">{s.detail}</p></div>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => setOutcome(null)}><RotateCcw className="h-4 w-4" /> {outcome.ok ? "Scan another" : "Try again"}</Button>
          <Button asChild variant="outline" className="flex-1"><Link to="/dashboard">View activity log</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <h2 className="font-semibold">Scan facility QR code</h2>
        <p className="mb-4 text-sm text-muted-foreground">Point your camera at the QR code posted at the facility entrance.</p>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-foreground/90">
          <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${scanning ? "" : "hidden"}`} />
          <div className="pointer-events-none absolute inset-10 rounded-xl border-4 border-dashed border-primary-foreground/70" />
          {!scanning && <Camera className="absolute inset-0 m-auto h-12 w-12 text-primary-foreground/60" />}
        </div>
        {camError && <p role="alert" className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{camError}</p>}
        {supported ? (
          scanning ? <Button variant="outline" className="mt-4 w-full" onClick={stop}>Stop camera</Button>
            : <Button className="mt-4 h-11 w-full" onClick={startCamera}><Camera className="h-4 w-4" /> Start camera scan</Button>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Camera QR scanning isn't supported in this browser. Use the demo scan below.</p>
        )}
      </div>
      <div className="rounded-2xl border border-dashed bg-secondary/60 p-5">
        <div className="mb-2 flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" /><h3 className="font-semibold">Simulate a scan</h3><DemoBadge>Demo</DemoBadge></div>
        <p className="mb-3 text-sm text-muted-foreground">Pretend you scanned one of these facility codes.</p>
        <div className="grid gap-2">
          {FACILITIES.map((f) => <Button key={f.code} variant="outline" className="justify-start bg-card" onClick={() => handle(f.qr)}>{f.name}</Button>)}
          <Button variant="outline" className="justify-start bg-card" onClick={() => handle("random-unknown-code")}>An unrecognized QR code</Button>
        </div>
      </div>
    </div>
  );
}
