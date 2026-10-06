// app/dashboard/settings/layout.tsx
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="mb-8 border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your profile details, privacy preferences, and system configurations.
        </p>
      </div>

      <main className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-md text-slate-100">
        {children}
      </main>
    </div>
  );
}