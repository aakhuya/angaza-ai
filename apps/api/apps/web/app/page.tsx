import { apiGet } from "@/lib/api";

type Health = { status: string; env: string; ai_provider: string };

export default async function Home() {
  let health: Health | null = null;
  try {
    health = await apiGet<Health>("/health");
  } catch {
    health = null;
  }

  return (
    <main className="min-h-screen bg-[#0B0D0F] text-[#F2F3F4]">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E8A33D]">
          Angaza AI
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          Illuminate Every Moment.
        </h1>
        <p className="mt-4 max-w-xl text-[#9BA1A6]">
          Explainable football match intelligence. Foundation build.
        </p>

        <div className="mt-12 rounded-lg border border-[#22262B] bg-[#14171A] p-5 font-mono text-sm">
          <div className="text-[#9BA1A6]">API status</div>
          <div className="mt-1">
            {health ? (
              <span className="text-[#3FB6A8]">
                {health.status} · {health.env} · {health.ai_provider}
              </span>
            ) : (
              <span className="text-[#E8A33D]">unreachable — start the API</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
