import { getAdminProperties } from "@/app/actions/admin";
import { PropertiesClient } from "./PropertiesClient";

export default async function AdminPropertiesPage() {
  const properties = await getAdminProperties();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">İlan Yönetimi</h1>
      <PropertiesClient initialProperties={properties} />
    </div>
  );
}
