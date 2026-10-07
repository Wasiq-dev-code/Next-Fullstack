import DashboardStats from "@/components/dashboard/DashboardStats"; // adjust path

export default function DashboardPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">Overview</h1>
      <p className="mt-1 text-sm text-slate-400">Your videos and activity.</p>

      <DashboardStats />
    </main>
  );
}
