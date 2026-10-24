import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DemoBadge } from "@/components/AppShell";

export const Route = createFileRoute("/sessions")({
  head: () => ({
    meta: [
      { title: "Upcoming Sessions · CampusConnect" },
      { name: "description", content: "Your upcoming classes and sessions." },
      { property: "og:title", content: "Upcoming Sessions · CampusConnect" },
      { property: "og:description", content: "Your upcoming classes and sessions." },
    ],
  }),
  component: () => (
    <AppShell title="Upcoming Sessions">
      {() => (
        <div className="space-y-3">
          <DemoBadge>Sample schedule</DemoBadge>
          {[
            ["Mon 9:00 AM", "Intro to Psychology", "Hall B, Room 102"],
            ["Mon 1:30 PM", "Calculus I", "Science Building 210"],
            ["Tue 11:00 AM", "Engineering Lab Section", "Engineering Lab"],
            ["Wed 3:00 PM", "Study Group: Calculus", "Main Library, Room 4"],
          ].map(([w, t, p]) => (
            <div key={t} className="flex gap-4 rounded-2xl border bg-card p-4">
              <p className="w-24 shrink-0 text-sm font-semibold text-primary">{w}</p>
              <div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{p}</p></div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  ),
});
