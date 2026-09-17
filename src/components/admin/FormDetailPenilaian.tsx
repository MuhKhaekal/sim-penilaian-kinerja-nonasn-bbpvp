"use client";

import { useState } from "react";
import { simpanPenilaian } from "@/lib/actions/penilaian";
import { useRouter } from "next/navigation";

type RubrikT = {
  id: number;
  nama_aspek: string;
  istimewa: string;
  memuaskan: string;
  cukup: string;
  buruk: string;
  sangat_buruk: string;
};

type EvaluasiLamaT = {
  detail_nilai: Record<string, string>;
  status: string;
  ttd_admin: boolean;
} | null;

export default function FormDetailPenilaian({
  userId,
  bulan,
  tahun,
  daftarRubrik,
  dataEvaluasiLama,
  rekapKehadiran,
}: {
  userId: string;
  bulan: number;
  tahun: number;
  daftarRubrik?: RubrikT[];
  dataEvaluasiLama: EvaluasiLamaT;
  // 🔴 1. Tambahkan tipe 'hadir'
  rekapKehadiran: { hadir: number; sakit: number; izin: number; terlambat: number; alfa: number };
}) {
  const rubrikAman = Array.isArray(daftarRubrik) ? daftarRubrik : [];
  const [nilaiEvaluasi, setNilaiEvaluasi] = useState<Record<string, string>>(dataEvaluasiLama?.detail_nilai || {});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 🔴 2. Logika Pengunci Tombol
  const totalPresensi = rekapKehadiran.hadir + rekapKehadiran.sakit + rekapKehadiran.izin + rekapKehadiran.terlambat + rekapKehadiran.alfa;
  const isPresensiKosong = totalPresensi === 0;
  
  // PDF hanya bisa dicetak jika data evaluasi pernah tersimpan ke Database
  const isBelumTersimpan = !dataEvaluasiLama;

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rubrikAman.length === 0) return alert("Rubrik penilaian belum tersedia.");
    if (isPresensiKosong) return alert("Gagal! Pegawai ini belum mengisi presensi sama sekali di bulan ini.");

    const aspekBelumDinilai = rubrikAman.find((r) => !nilaiEvaluasi[r.nama_aspek]);
    if (aspekBelumDinilai) return alert(`Harap berikan nilai untuk aspek: ${aspekBelumDinilai.nama_aspek}`);

    setIsLoading(true);
    try {
      const res = await simpanPenilaian({
        user_id: userId,
        bulan,
        tahun,
        detail_nilai: {
          ...nilaiEvaluasi,
          // 🔴 3. Kirim juga data 'hadir' agar aman di Database
          hadir: rekapKehadiran.hadir.toString(),
          sakit: rekapKehadiran.sakit.toString(),
          izin: rekapKehadiran.izin.toString(),
          terlambat: rekapKehadiran.terlambat.toString(),
          alfa: rekapKehadiran.alfa.toString(),
        },
      });

      if (res.success) {
        alert("Penilaian berhasil disimpan ke dalam Database!");
        router.refresh(); // Akan merefresh layar dan membuka kunci Cetak PDF
      } else {
        alert(res?.message || "Gagal menyimpan ke database.");
      }
    } catch (error) {
      alert("Terjadi kesalahan teknis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCetakPDF = () => {
    if (isBelumTersimpan) return; // Keamanan lapis kedua
    const timestamp = new Date().getTime();
    window.open(`/admin/penilaian/${userId}/cetak?bulan=${bulan}&tahun=${tahun}&_t=${timestamp}`, "_blank");
  };

  const getKriteriaStyle = (nilai: string) => {
    switch (nilai) {
      case "Istimewa": return "bg-green-50 border-green-200 text-green-800";
      case "Memuaskan": return "bg-blue-50 border-blue-200 text-blue-800";
      case "Cukup": return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "Buruk": return "bg-orange-50 border-orange-200 text-orange-800";
      case "Sangat Buruk": return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-gray-50 border-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full relative overflow-hidden">
      
      {/* Jika Presensi Kosong, Beri Watermark Overlay yang Jelas */}
      {isPresensiKosong && (
        <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4 shadow-sm"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
          <h3 className="text-xl font-black text-gray-800">Evaluasi Terkunci</h3>
          <p className="text-gray-500 font-medium mt-2 max-w-sm">Pegawai tidak memiliki catatan presensi bulan ini. Penilaian tidak dapat diproses.</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          </div>
          <h4 className="text-xl font-black text-[#003366] tracking-tight">Formulir Penilaian</h4>
        </div>
        
        {dataEvaluasiLama && (
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Status: {dataEvaluasiLama.status}
          </span>
        )}
      </div>

      <form onSubmit={handleSimpan} className="flex-1 space-y-6">
        {rubrikAman.map((rubrik) => {
          const nilaiAktif = nilaiEvaluasi[rubrik.nama_aspek];
          
          return (
            <div key={rubrik.id} className={`p-5 rounded-xl border transition-all duration-300 ${nilaiAktif ? "bg-white border-blue-100 shadow-sm ring-1 ring-blue-50" : "bg-gray-50/50 border-gray-200"}`}>
              <h4 className="font-bold text-gray-900 mb-3 text-sm">{rubrik.nama_aspek}</h4>
              
              <select
                value={nilaiAktif || ""}
                onChange={(e) => setNilaiEvaluasi({ ...nilaiEvaluasi, [rubrik.nama_aspek]: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-[#003366] focus:border-[#003366] font-bold text-gray-700 bg-white outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="" disabled>-- Tentukan Tingkat Kinerja --</option>
                <option value="Istimewa">Istimewa (90-100)</option>
                <option value="Memuaskan">Memuaskan (75-89.99)</option>
                <option value="Cukup">Cukup (60-74.99)</option>
                <option value="Buruk">Buruk (40-59.99)</option>
                <option value="Sangat Buruk">Buruk Sekali (&lt; 40)</option>
              </select>

              {nilaiAktif && (
                <div className={`mt-4 p-4 border rounded-lg text-xs leading-relaxed transition-all animate-fade-in-up ${getKriteriaStyle(nilaiAktif)}`}>
                  <span className="font-black uppercase tracking-wider block mb-1.5 opacity-80">Indikator Terpilih:</span>
                  <p className="font-medium">
                    {nilaiAktif === "Istimewa" && rubrik.istimewa}
                    {nilaiAktif === "Memuaskan" && rubrik.memuaskan}
                    {nilaiAktif === "Cukup" && rubrik.cukup}
                    {nilaiAktif === "Buruk" && rubrik.buruk}
                    {nilaiAktif === "Sangat Buruk" && rubrik.sangat_buruk}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* TOMBOL AKSI */}
        <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
          
          {/* 🔴 4. Tombol Simpan Terkunci Jika Presensi Kosong */}
          <button 
            type="submit" 
            disabled={isLoading || rubrikAman.length === 0 || isPresensiKosong} 
            className="flex-1 flex justify-center items-center gap-2 bg-[#003366] text-white px-5 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:bg-[#002244] transition-all disabled:bg-gray-400 disabled:shadow-none transform hover:-translate-y-0.5"
          >
            {isLoading ? "Memproses..." : "💾 Simpan Evaluasi Penilaian"}
          </button>

          {/* 🔴 5. Tombol PDF Terkunci Jika Belum Ada Data di Database */}
          <button 
            type="button" 
            onClick={handleCetakPDF}
            disabled={isBelumTersimpan} 
            className={`flex-1 flex justify-center items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold border transition-all ${
              isBelumTersimpan 
                ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed" 
                : "bg-gray-100 text-gray-800 border-gray-300 shadow-sm hover:bg-gray-200 hover:text-black transform hover:-translate-y-0.5"
            }`}
          >
            ✍️ Tanda Tangani & Cetak PDF
          </button>
        </div>
      </form>
    </div>
  );
}