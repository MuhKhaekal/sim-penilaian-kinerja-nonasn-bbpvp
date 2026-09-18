"use client";

import { useState } from "react";
import { simpanPenilaian } from "@/lib/actions/penilaian";
import { useRouter } from "next/navigation";

// Tipe Data
type RubrikT = {
  id: number;
  nama_aspek: string;
  istimewa: string;
  memuaskan: string;
  cukup: string;
  buruk: string;
  sangat_buruk: string; // pastikan nama kolom DB Anda "buruk_sekali" atau "sangat_buruk"
};

type FormProps = {
  userId: string;
  bulan: number;
  tahun: number;
  daftarRubrik: RubrikT[];
  dataEvaluasiLama: { detail_nilai: Record<string, string>; status: string; ttd_admin: boolean } | null;
  rekapKehadiran: { hadir: number; sakit: number; izin: number; terlambat: number; alfa: number };
};

export default function FormDetailPenilaian({ userId, bulan, tahun, daftarRubrik, dataEvaluasiLama }: FormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk menyimpan nilai inputan admin
  const [nilai, setNilai] = useState<Record<string, string>>(
    dataEvaluasiLama ? dataEvaluasiLama.detail_nilai : {}
  );

  // Fungsi Logika Penentuan Kategori
  const getKategori = (angka: number) => {
    if (angka >= 91 && angka <= 100) return "istimewa";
    if (angka >= 76 && angka <= 90) return "memuaskan";
    if (angka >= 61 && angka <= 75) return "cukup";
    if (angka >= 51 && angka <= 60) return "buruk";
    if (angka <= 50) return "sangat_buruk";
    return null;
  };

  const handleInputChange = (aspek: string, value: string) => {
    let numValue = parseInt(value);
    // Batasi angka 0-100
    if (numValue > 100) numValue = 100;
    if (numValue < 0) numValue = 0;
    
    setNilai(prev => ({ ...prev, [aspek]: isNaN(numValue) ? "" : numValue.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const respons = await simpanPenilaian({ user_id: userId, bulan, tahun, detail_nilai: nilai });
    if (respons.success) {
      alert("Penilaian berhasil disimpan!");
      router.refresh();
    } else {
      alert("Gagal menyimpan: " + respons.message);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
        <h3 className="text-xl font-bold text-[#003366]">Lembar Evaluasi Kinerja</h3>
        {dataEvaluasiLama?.status === "VERIFIED" && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-200">
            Telah Diverifikasi
          </span>
        )}
      </div>

      <div className="space-y-8">
        {daftarRubrik.map((rubrik) => {
          const skorString = nilai[rubrik.nama_aspek] || "";
          const skorAngka = parseInt(skorString);
          const kategoriAktif = !isNaN(skorAngka) ? getKategori(skorAngka) : null;

          return (
            <div key={rubrik.id} className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {rubrik.nama_aspek}
              </label>
              
              <div className="flex items-start gap-4">
                {/* Kotak Input Angka */}
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={skorString}
                  onChange={(e) => handleInputChange(rubrik.nama_aspek, e.target.value)}
                  placeholder="0-100"
                  className={`w-24 text-center font-black text-xl rounded-xl border-2 py-3 px-2 outline-none transition-all ${
                    kategoriAktif === "istimewa" ? "border-blue-400 bg-blue-50 text-blue-800" :
                    kategoriAktif === "memuaskan" ? "border-green-400 bg-green-50 text-green-800" :
                    kategoriAktif === "cukup" ? "border-yellow-400 bg-yellow-50 text-yellow-800" :
                    kategoriAktif === "buruk" || kategoriAktif === "sangat_buruk" ? "border-red-400 bg-red-50 text-red-800" :
                    "border-gray-200 bg-gray-50 focus:border-[#003366]"
                  }`}
                />

                {/* Indikator Pintar Muncul di Sebelahnya */}
                <div className={`flex-1 rounded-xl p-4 border transition-all ${kategoriAktif ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none hidden'}`}>
                  {kategoriAktif && (
                    <div className={`
                      ${kategoriAktif === "istimewa" ? "bg-blue-50/50 border-blue-200" : ""}
                      ${kategoriAktif === "memuaskan" ? "bg-green-50/50 border-green-200" : ""}
                      ${kategoriAktif === "cukup" ? "bg-yellow-50/50 border-yellow-200" : ""}
                      ${kategoriAktif === "buruk" || kategoriAktif === "sangat_buruk" ? "bg-red-50/50 border-red-200" : ""}
                    `}>
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider mb-2 ${
                        kategoriAktif === "istimewa" ? "bg-blue-100 text-blue-700" :
                        kategoriAktif === "memuaskan" ? "bg-green-100 text-green-700" :
                        kategoriAktif === "cukup" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        Predikat: {kategoriAktif.replace("_", " ")}
                      </span>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">
                        {/* 🔴 Mengambil teks deskripsi langsung dari database berdasarkan kategori */}
                        {rubrik[kategoriAktif as keyof RubrikT]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#003366] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#002244] hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? "Menyimpan Evaluasi..." : "Simpan Penilaian Bulan Ini"}
          {!isLoading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
        </button>
      </div>
    </form>
  );
}