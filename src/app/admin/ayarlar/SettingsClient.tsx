"use client";

import { useState, useRef } from "react";
import { updateSiteSettingsAction } from "@/app/actions/site-settings";

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBg: string;
  footerBg: string;
  fontFamily: string;
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappEnabled: boolean;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  footerText: string;
  metaKeywords: string;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
}

type TabId = "genel" | "gorunum" | "iletisim" | "sosyal" | "seo";

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "genel", label: "Genel", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  { id: "gorunum", label: "Goruntu & Renkler", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" },
  { id: "iletisim", label: "Iletisim & Destek", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
  { id: "sosyal", label: "Sosyal Medya", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  { id: "seo", label: "SEO & Meta", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
];

export function SettingsClient({ settings }: { settings: SiteSettings }) {
  const [activeTab, setActiveTab] = useState<TabId>("genel");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(settings.faviconUrl);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "logo") setLogoPreview(reader.result as string);
        else setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData(formRef.current);
      const result = await updateSiteSettingsAction(formData);
      if ("success" in result && result.success) {
        setMessage({ type: "success", text: result.success });
      } else if ("error" in result) {
        setMessage({ type: "error", text: result.error as string });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata olustu" });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Ayarlari</h1>
        <p className="text-gray-500 mt-1">Sitenizin genel ayarlarini, gorunumunu ve iletisim bilgilerini yonetin</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        {/* Genel Tab */}
        {activeTab === "genel" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Genel Ayarlar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Adi</label>
                <input type="text" name="siteName" defaultValue={settings.siteName}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Ailesi</label>
                <select name="fontFamily" defaultValue={settings.fontFamily}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="Geist">Geist</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Aciklamasi</label>
              <textarea name="siteDescription" rows={3} defaultValue={settings.siteDescription}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            {/* Logo Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Logosu</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {logoPreview && (
                    <div className="mb-3">
                      <img src={logoPreview} alt="Logo" className="h-16 mx-auto object-contain" />
                    </div>
                  )}
                  <input type="file" name="logo" accept="image/*" onChange={(e) => handleFileChange(e, "logo")}
                    className="hidden" id="logo-upload" />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="text-blue-600 font-medium">Logo yukle</div>
                    <div className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (maks. 2MB)</div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {faviconPreview && (
                    <div className="mb-3">
                      <img src={faviconPreview} alt="Favicon" className="h-10 mx-auto object-contain" />
                    </div>
                  )}
                  <input type="file" name="favicon" accept="image/*" onChange={(e) => handleFileChange(e, "favicon")}
                    className="hidden" id="favicon-upload" />
                  <label htmlFor="favicon-upload" className="cursor-pointer">
                    <div className="text-blue-600 font-medium">Favicon yukle</div>
                    <div className="text-xs text-gray-400 mt-1">ICO, PNG (32x32 veya 64x64)</div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Bilgi Metni (Footer)</label>
              <input type="text" name="footerText" defaultValue={settings.footerText}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        )}

        {/* Gorunum Tab */}
        {activeTab === "gorunum" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Goruntu & Renk Ayarlari</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ColorPicker label="Ana Renk (Primary)" name="primaryColor" defaultValue={settings.primaryColor} />
              <ColorPicker label="Ikincil Renk (Secondary)" name="secondaryColor" defaultValue={settings.secondaryColor} />
              <ColorPicker label="Vurgu Rengi (Accent)" name="accentColor" defaultValue={settings.accentColor} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ColorPicker label="Header Arka Plan" name="headerBg" defaultValue={settings.headerBg} />
              <ColorPicker label="Footer Arka Plan" name="footerBg" defaultValue={settings.footerBg} />
            </div>

            {/* Preview */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Onizleme</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="h-12 flex items-center px-4" style={{ backgroundColor: settings.headerBg }}>
                  <span className="font-bold" style={{ color: settings.primaryColor }}>{settings.siteName}</span>
                </div>
                <div className="p-6 bg-gray-50">
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: settings.primaryColor }}>Ana Buton</button>
                    <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: settings.secondaryColor }}>Ikincil Buton</button>
                    <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: settings.accentColor }}>Vurgu Buton</button>
                  </div>
                </div>
                <div className="h-10 flex items-center px-4" style={{ backgroundColor: settings.footerBg }}>
                  <span className="text-xs text-gray-400">{settings.footerText}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Iletisim Tab */}
        {activeTab === "iletisim" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Iletisim & Canli Destek</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Iletisim E-posta</label>
                <input type="email" name="contactEmail" defaultValue={settings.contactEmail}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Iletisim Telefon</label>
                <input type="text" name="contactPhone" defaultValue={settings.contactPhone}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
              <textarea name="contactAddress" rows={2} defaultValue={settings.contactAddress}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            {/* WhatsApp Section */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">WhatsApp Canli Destek</h3>
                    <p className="text-sm text-green-600">Ziyaretciler size WhatsApp uzerinden ulasabilir</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="whatsappEnabled" value={settings.whatsappEnabled ? "true" : "false"} />
                  <input type="checkbox" defaultChecked={settings.whatsappEnabled}
                    onChange={(e) => {
                      const hidden = e.target.previousElementSibling as HTMLInputElement;
                      hidden.value = e.target.checked ? "true" : "false";
                    }}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">WhatsApp Numarasi</label>
                  <input type="text" name="whatsappNumber" defaultValue={settings.whatsappNumber}
                    className="w-full px-4 py-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white" placeholder="905XXXXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">Oto Mesaj</label>
                  <input type="text" name="whatsappMessage" defaultValue={settings.whatsappMessage}
                    className="w-full px-4 py-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sosyal Medya Tab */}
        {activeTab === "sosyal" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">Sosyal Medya Linkleri</h2>

            <div className="space-y-4">
              <SocialInput name="socialFacebook" label="Facebook" defaultValue={settings.socialFacebook || ""} color="#1877F2" icon="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              <SocialInput name="socialTwitter" label="Twitter / X" defaultValue={settings.socialTwitter || ""} color="#1DA1F2" icon="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              <SocialInput name="socialInstagram" label="Instagram" defaultValue={settings.socialInstagram || ""} color="#E4405F" icon="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
              <SocialInput name="socialYoutube" label="YouTube" defaultValue={settings.socialYoutube || ""} color="#FF0000" icon="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold border-b pb-3">SEO & Meta Ayarlari</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Anahtar Kelimeler</label>
              <textarea name="metaKeywords" rows={3} defaultValue={settings.metaKeywords}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="kripto, altin, gumus, doviz, yatirim, borsa" />
              <p className="text-xs text-gray-400 mt-1">Virgul ile ayirarak yazin</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Ayarlari Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}

function ColorPicker({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  const [color, setColor] = useState(defaultValue);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" name={name} value={color} onChange={(e) => setColor(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200" />
        <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm" />
        <div className="w-10 h-10 rounded-lg border border-gray-200" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

function SocialInput({ name, label, defaultValue, color, icon }: { name: string; label: string; defaultValue: string; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d={icon} />
        </svg>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type="text" name={name} defaultValue={defaultValue} placeholder={`${label} URL'nizi girin`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1" />
      </div>
    </div>
  );
}
