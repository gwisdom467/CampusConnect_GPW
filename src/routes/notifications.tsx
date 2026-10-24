import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DemoBadge } from "@/components/AppShell";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · CampusConnect" },
      { name: "description", content: "Campus announcements and alerts." },
      { property: "og:title", content: "Notifications · CampusConnect" },
      { property: "og:description", content: "Campus announcements and alerts." },
    ],
  }),
  component: () => (
    <AppShell title="Notifications">
      {() => (
        <div className="space-y-3">
          <DemoBadge>Sample content</DemoBadge>
          {[
            ["Today", "Recreation Center closes early at 6pm for maintenance."],
            ["Yesterday", "Registration for spring term opens next Monday."],
            ["2 days ago", "New quiet study floor now open in the Main Library."],
          ].map(([w, t]) => (
            <div key={t} className="rounded-2xl border bg-card p-4"><p className="text-xs font-semibold text-primary">{w}</p><p>{t}</p></div>
          ))}
        </div>
      )}
    </AppShell>
  ),
});
