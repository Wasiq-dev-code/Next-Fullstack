'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Ctx = {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  closeMobile: () => void;
};

const SidebarCtx = createContext<Ctx | null>(null);

// Set to true if you want the desktop sidebar to start as an icon rail
const DEFAULT_COLLAPSED = true;

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(DEFAULT_COLLAPSED);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setCollapsed((c) => !c);
    } else {
      setMobileOpen((o) => !o);
    }
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => mq.matches && setMobileOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);

    mq.addEventListener('change', onChange);
    window.addEventListener('keydown', onKey);
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <SidebarCtx.Provider value={{ collapsed, mobileOpen, toggle, closeMobile }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export const useSidebar = () => {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider');
  return ctx;
};