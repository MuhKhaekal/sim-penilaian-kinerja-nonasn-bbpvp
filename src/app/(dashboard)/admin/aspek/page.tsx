import { getDaftarAspek } from "@/lib/actions/aspek";
import ManajemenAspek from "@/components/admin/ManajemenAspek";

// Definisi tipe data agar TypeScript tidak protes (menghindari 'any')
// Definisi tipe data yang BENAR sesuai dengan struktur Rubrik 5 Tingkat
type AspekT = {
  id: number;
  nama_aspek: string;
  istimewa: string;
  memuaskan: string;
  cukup: string;
  buruk: string;
  sangat_buruk: string;
};

export default async function AdminAspekPage() {
  // Mengambil data langsung dari server saat halaman dimuat
  const res = await getDaftarAspek();
  const daftarAspek = (res.data as AspekT[]) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      
      {/* HEADER AREA DENGAN GLASSMORPHISM & AKSEN BIRU */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#003366]"></div>
        
        <div className="pl-2">
          <h2 className="text-2xl font-black text-[#003366] tracking-tight">Manajemen Aspek & Rubrik</h2>
          <p className="text-gray-500 text-sm mt-1.5 font-medium max-w-3xl leading-relaxed">
            Kelola kriteria dan parameter rubrik evaluasi. Setiap aspek di bawah ini akan digunakan sebagai indikator kualitatif (Istimewa hingga Buruk Sekali) untuk menilai kinerja pegawai Non-ASN di lingkungan BBPVP Makassar.
          </p>
        </div>
        
        {/* KARTU INDIKATOR TOTAL ASPEK */}
        <div className="flex items-center gap-4 bg-blue-50/50 px-6 py-4 rounded-xl border border-blue-100/50 shadow-inner w-full xl:w-auto">
          <div className="bg-white text-[#003366] p-2.5 rounded-lg shadow-sm border border-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Rubrik Aktif</p>
            <p className="text-2xl font-black text-[#003366]">{daftarAspek.length}</p>
          </div>
        </div>
      </div>

      {/* Komponen Form & Tabel Interaktif */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
        <ManajemenAspek initialData={daftarAspek} />
      </div>
      
    </div>
  );
}