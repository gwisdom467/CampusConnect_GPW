import { createFileRoute, Link } from "@tanstack/react-router";
import { QrCode, BookOpen, Bell, CalendarDays, CheckCircle2, XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { FACILITIES } from "@/lib/campus";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · CampusConnect" },
      { name: "description", content: "Your CampusConnect student dashboard." },
      { property: "og:title", content: "Dashboard · CampusConnect" },
      { property: "og:description", content: "Your CampusConnect student dashboard." },
    ],
  }),
  component: () => <AppShell title="Student Dashboard">{(s) => <Dash username={s.username} access={s.facilityAccess} />}</AppShell>,
});

const TILES = [
  { to: "/checkin", label: "Check In", desc: "Scan a facility QR code", icon: QrCode },
  { to: "/resources", label: "Resources", desc: "Campus services & links", icon: BookOpen },
  { to: "/notifications", label: "Notifications", desc: "Campus announcements", icon: Bell },
  { to: "/sessions", label: "Upcoming Sessions", desc: "Your classes this week", icon: CalendarDays },
] as const;

function Dash({ username, access }: { username: string; access: string[] }) {
  const { log } = useStore();
  const mine = log.filter((l) => l.username === username);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {TILES.map((t) => (
          <Link key={t.to} to={t.to} className="rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary">
            <t.icon className="mb-3 h-7 w-7 text-primary" />
            <p className="font-semibold">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-2 font-semibold">Your facility access</h2>
        <div className="flex flex-wrap gap-2">
          {FACILITIES.map((f) => (
            <span key={f.code} className={`rounded-full px-3 py-1 text-sm ${access.includes(f.code) ? "bg-success/15 text-success" : "bg-muted text-muted-foreground line-through"}`}>{f.name}</span>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-1 font-semibold">Check-in activity log <span className="text-xs font-normal text-muted-foreground">(demo, saved in this browser)</span></h2>
        {mine.length === 0 ? <p className="text-sm text-muted-foreground">No check-ins yet. Try <Link to="/checkin" className="text-primary underline">Check In</Link>.</p> : (
          <ul className="divide-y">
            {mine.map((l) => (
              <li key={l.id} className="flex items-start gap-3 py-3 text-sm">
                {l.approved ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <XCircle className="h-5 w-5 shrink-0 text-destructive" />}
                <div className="flex-1">
                  <p className="font-medium">{l.facility} — {l.approved ? "Approved" : "Denied"}</p>
                  {l.reason && <p className="text-muted-foreground">{l.reason}</p>}
                </div>
                <time className="text-right text-xs text-muted-foreground">{new Date(l.at).toLocaleDateString()}<br />{new Date(l.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
