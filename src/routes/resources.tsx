import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DemoBadge } from "@/components/AppShell";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources · CampusConnect" },
      { name: "description", content: "Campus services and student resources." },
      { property: "og:title", content: "Resources · CampusConnect" },
      { property: "og:description", content: "Campus services and student resources." },
    ],
  }),
  component: () => (
    <AppShell title="Resources">
      {() => (
        <div className="space-y-3">
          <DemoBadge>Sample content</DemoBadge>
          {[
            ["Library", "Hours: 7am – midnight · Study room booking"],
            ["Tutoring Center", "Free drop-in tutoring, Mon–Thu 2–8pm"],
            ["Counseling Services", "Confidential support, call ext. 4000"],
            ["IT Help Desk", "Wi-Fi, accounts and device help"],
            ["Bursar's Office", "Tuition payments and holds"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border bg-card p-4"><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
      )}
    </AppShell>
  ),
});
