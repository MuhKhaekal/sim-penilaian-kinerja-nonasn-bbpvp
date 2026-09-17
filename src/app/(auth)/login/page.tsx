  "use client";

  import { useState } from "react";
  import { signIn } from "next-auth/react";
  import { useRouter } from "next/navigation";

  export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email/NIK atau password yang Anda masukkan salah.");
        setIsLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    };

    return (
      // 1. Latar Belakang Gambar Full Screen
      // Ganti URL gambar di bawah ini dengan path gambar lokal Anda (misal: "url('/gedung-bbpvp.jpg')") jika sudah punya foto aslinya.
      <div 
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/gedung-bbpvp.png')" }}
      >
        {/* 2. Overlay Transparan (Warna Primary #003366 dengan opasitas 60%) */}
        <div className="absolute inset-0 bg-[#003366]/20 backdrop-blur-sm mix-blend-multiply"></div>

        {/* 3. Injeksi Animasi CSS Ringan */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />

        {/* 4. Kartu Form Glassmorphism */}
        <div className="relative z-10 w-full max-w-md space-y-8 rounded-2xl bg-white/75 p-10 shadow-2xl backdrop-blur-xs border border-white/40 animate-fade-in-up mx-4">
          
          <div className="text-center">
            {/* Jika ada Logo BBPVP, bisa dimasukkan tag <img src="/logo.png" className="h-16 mx-auto mb-4" /> di sini */}
            <h2 className="text-3xl font-extrabold tracking-tight text-[#003366]">Login</h2>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              Sistem Informasi Penilaian Kinerja Pegawai Non-ASN <br />
              <span className="font-black text-[#003366] text-base uppercase tracking-wider">BBPVP Makassar</span>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50/90 p-4 text-sm text-red-600 border border-red-200 shadow-sm animate-pulse">
                <span className="font-bold">Gagal:</span> {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="email">
                  Email / NIK
                </label>
                <input
                  id="email"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white/60 px-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366] sm:text-sm transition-all shadow-sm"
                  placeholder="Masukkan Email atau NIK"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white/60 px-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366] sm:text-sm transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg border border-transparent bg-[#003366] py-3 px-4 text-sm font-bold text-white shadow-lg hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Masuk ke Dasbor"
                )}
              </button>
            </div>
          </form>

          {/* Footer Kecil di dalam Kartu */}
          <p className="text-center text-xs text-gray-500 mt-6 font-medium">
            &copy; {new Date().getFullYear()} BBPVP Makassar
          </p>
        </div>
      </div>
    );
  }