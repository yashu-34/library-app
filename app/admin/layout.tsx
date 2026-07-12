import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">

      <AdminSidebar />

      <div className="flex-1">

        <AdminHeader />

        <main className="p-8 bg-gray-100 min-h-screen">
          {children}
        </main>

      </div>

    </div>
  );
}