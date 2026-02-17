'use client';

import { settingsNav } from '@/lib/validations/SettingNav';
import SettingsSidebar from '@/components/settings/SettingSidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-[240px_1fr] gap-10">
        <aside className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            Settings
          </h2>

          {settingsNav.map((item) => (
            <SettingsSidebar
              key={item.href}
              href={item.href}
              title={item.title}
            />
          ))}
        </aside>

        <main className="bg-background border rounded-xl p-6">{children}</main>
      </div>
    </div>
  );
}
