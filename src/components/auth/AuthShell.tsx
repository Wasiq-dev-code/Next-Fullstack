import Link from 'next/link';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.16),transparent_42%),#09090b] px-4 py-8 text-white sm:px-6">
      <section className="mx-auto grid min-h-[620px] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#101014]/95 shadow-[0_24px_100px_rgba(0,0,0,0.45)] md:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-[#121117] p-10 md:flex">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Echo home">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500 text-sm font-bold text-white shadow-lg shadow-violet-950/40">E</span>
              <span className="text-sm font-semibold text-white">ECHO</span>
            </Link>
            <div className="mt-28 max-w-sm">
              <p className="mb-3 text-xs font-semibold uppercase text-violet-300">Your creator space</p>
              <h2 className="text-3xl font-semibold leading-tight text-white">Share what moves you.</h2>
              <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-400">
                Find your voice, build your community, and keep the conversation going.
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            A place for every perspective
          </div>
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 rounded-full border border-violet-400/10" />
        </aside>
        <div className="flex items-center justify-center px-5 py-8 sm:px-10 md:py-12">
          <div className="w-full max-w-lg">
            <Link href="/" className="mb-8 inline-flex items-center gap-2.5 md:hidden" aria-label="Echo home">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500 text-sm font-bold text-white">E</span>
              <span className="text-sm font-semibold text-white">ECHO</span>
            </Link>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}