import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function CustomPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await prisma.customPage.findUnique({
    where: { slug, isPublished: true },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{page.title}</h1>
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </div>
    </div>
  );
}
