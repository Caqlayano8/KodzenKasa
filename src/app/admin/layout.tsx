import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/giris");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <AdminSidebar currentUser={session.name} />
        <main className="flex-1 p-6 md:ml-64">{children}</main>
      </div>
    </div>
  );
}
