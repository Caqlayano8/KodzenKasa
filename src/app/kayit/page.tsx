import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Kayıt Ol - KodzenKasa" };

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Hesap Oluştur</h1>
          <p className="text-gray-500 mt-2">Hemen ücretsiz üye olun</p>
        </div>

        <RegisterForm />

        <p className="text-center text-gray-500 mt-6">
          Zaten hesabınız var mı?{" "}
          <a href="/giris" className="text-blue-600 hover:text-blue-700 font-medium">
            Giriş Yap
          </a>
        </p>
      </div>
    </div>
  );
}
