// SIWF/AuthKit is provided app-wide (src/app/_components/Providers.tsx); this route
// just opts out of static prerender since it reads client auth state.
export const dynamic = "force-dynamic";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
