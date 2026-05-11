"use client";

import { useState } from "react";
import { sendMessageAction } from "@/app/actions/message";

interface ContactFormProps {
  receiverId: string;
  propertyId: string;
  propertyTitle: string;
}

export function ContactForm({ receiverId, propertyId, propertyTitle }: ContactFormProps) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    formData.set("receiverId", receiverId);
    formData.set("propertyId", propertyId);
    const result = await sendMessageAction(formData);
    if ("error" in result) {
      setError(result.error || "Bir hata oluştu");
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-center">
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="font-medium">Mesajınız gönderildi!</p>
        <button onClick={() => setSent(false)} className="text-sm underline mt-2">
          Yeni mesaj gönder
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-3 mt-3">
      {error && (
        <div className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm">{error}</div>
      )}
      <textarea
        name="content"
        required
        rows={3}
        defaultValue={`Merhaba, "${propertyTitle}" ilanınız hakkında bilgi almak istiyorum.`}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none text-gray-900"
      />
      <button
        type="submit"
        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Mesaj Gönder
      </button>
    </form>
  );
}
