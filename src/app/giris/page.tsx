import { LoginForm } from "./LoginForm";

export const metadata = { title: "Giriş Yap - KodzenKasa" };

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Hoş Geldiniz</h1>
          <p className="text-gray-500 mt-2">Hesabınıza giriş yapın</p>
        </div>

        <LoginForm />

        <p className="text-center text-gray-500 mt-6">
          Hesabınız yok mu?{" "}
          <a href="/kayit" className="text-blue-600 hover:text-blue-700 font-medium">
            Kayıt Ol
          </a>
        </p>
      </div>
    </div>
  );
}
