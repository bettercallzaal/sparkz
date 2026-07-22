import Flame from "@/app/_components/Flame";
import StartForm from "@/app/_components/StartForm";

export const dynamic = "force-static";

export const metadata = {
  title: "Light your spark",
  description: "Open a Capsule in under a minute. No wallet, no coin - just your project's home.",
  openGraph: {
    title: "Light your spark",
    description: "Open a Capsule in under a minute. No wallet, no coin.",
    images: [{ url: "/api/og?title=Light%20your%20spark&subtitle=Open%20a%20Capsule%20in%20under%20a%20minute.", width: 1200, height: 800 }],
  },
};

export default function StartPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <Flame className="h-9 w-9 flame-live" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Light your spark</h1>
          <p className="text-sm text-muted">A project home in under a minute. No wallet, no coin.</p>
        </div>
      </div>

      <div className="card-solid p-5">
        <StartForm />
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        This creates a real Capsule you can share right away. A token stays optional -
        later, if ever.
      </p>
    </main>
  );
}
