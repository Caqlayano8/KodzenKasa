import { getAdminUsers } from "@/app/actions/admin";
import { UsersClient } from "./UsersClient";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Kullanıcı Yönetimi</h1>
      <UsersClient initialUsers={users} />
    </div>
  );
}
