import ViewerSidebar from '@/components/homeSidebar';

export default function ViewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-slate-950 text-slate-100">
      <ViewerSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}