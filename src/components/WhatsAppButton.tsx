"use client";

export function WhatsAppButton({ phoneNumber, message, enabled }: { phoneNumber: string; message: string; enabled: boolean }) {
  if (!enabled) return null;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Canli Destek"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
    >
      <span className="hidden group-hover:flex items-center bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap transition-all duration-300">
        Canli Destek
      </span>

      <span className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="white" className="w-8 h-8">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.378L1.054 31.29l6.118-1.962A15.91 15.91 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.31 22.598c-.39 1.1-1.932 2.014-3.164 2.28-.844.18-1.946.322-5.66-1.216-4.752-1.966-7.808-6.79-8.044-7.104-.228-.314-1.906-2.54-1.906-4.844s1.206-3.436 1.634-3.906c.39-.428.918-.622 1.222-.622.152 0 .29.008.414.014.428.018.642.044.924.714.352.836 1.21 2.95 1.316 3.164.108.214.214.498.072.79-.134.3-.252.432-.466.682-.214.25-.418.44-.632.71-.196.236-.418.488-.176.916.242.428 1.076 1.776 2.312 2.876 1.59 1.416 2.93 1.854 3.348 2.06.428.214.682.18.932-.108.258-.3 1.1-1.28 1.392-1.72.286-.44.578-.368.968-.22.396.148 2.504 1.18 2.932 1.396.428.214.714.322.82.498.104.18.104 1.022-.286 2.12z" />
        </svg>
      </span>

      <span className="absolute bottom-0 right-0 w-14 h-14 bg-[#25D366] rounded-full animate-ping opacity-20 pointer-events-none" />
    </a>
  );
}
