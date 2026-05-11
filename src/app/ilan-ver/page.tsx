import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PropertyForm } from "@/components/PropertyForm";

export const metadata = { title: "İlan Ver - KodzenKasa" };

export default async function CreatePropertyPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Yeni İlan Oluştur</h1>
        <p className="text-gray-500 mt-1">İlanınızı kolayca yayınlayın</p>
      </div>
      <PropertyForm />
    </div>
  );
}
