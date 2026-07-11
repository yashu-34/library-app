import AuthGuard from "@/components/AuthGuard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <main className="p-10">
        <h1 className="text-3xl font-bold">
          ダッシュボード
        </h1>
      </main>
    </AuthGuard>
  );
}