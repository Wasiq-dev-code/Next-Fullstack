export default function DashboardPage() {
  const stats = [
    { label: 'Total Videos', value: '0' },
    { label: 'Total Views', value: '0' },
    { label: 'Subscribers', value: '0' },
  ];

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">Overview</h1>
      <p className="mt-1 text-sm text-slate-400">Your videos and activity.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}