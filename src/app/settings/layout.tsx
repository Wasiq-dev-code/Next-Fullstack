'use client';

import { settingsNav } from '@/lib/validations/SettingNav';
import SettingsSidebar from '@/components/settings/SettingSidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Page Header */}
        <div className="mb-8 border-b border-slate-800 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your profile details, privacy preferences, and system configurations.
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Sidebar Container */}
          <aside className="sticky top-20 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
              Navigation
            </h2>

            <nav className="space-y-1">
              {settingsNav.map((item) => (
                <SettingsSidebar
                  key={item.href}
                  href={item.href}
                  title={item.title}
                />
              ))}
            </nav>
          </aside>

          {/* Content Card */}
          <main className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-md text-slate-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}