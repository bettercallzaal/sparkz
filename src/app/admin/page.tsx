import Link from "next/link";

export const dynamic = "force-dynamic";

// Admin hub: links only. Every page below checks the admin session itself.
const LINKS = [
  { href: "/admin/pending", label: "Review queue", desc: "Approve or reject self-serve sparks." },
  { href: "/admin/team", label: "Team applications", desc: "Review applications to join the team." },
  { href: "/admin/hearths", label: "All Hearths", desc: "Every Hearth, with its status." },
  { href: "/admin/new", label: "New Hearth", desc: "Open a Hearth as an operator." },
  { href: "/admin/add-repo", label: "Add a repo Hearth", desc: "Open a Hearth for an open-source repo." },
  { href: "/admin/empire", label: "Deploy Empire", desc: "Deploy an Empire token for a Hearth." },
];

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          &larr; Hearths
        </Link>
      </div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Admin</h1>
      <ul className="space-y-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="glass glass-hover block p-4">
              <div className="text-sm font-medium">{l.label}</div>
              <div className="text-xs text-muted">{l.desc}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
