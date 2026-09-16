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
  rekapKehadiran, // 🔴 Tambah di sini
}: {
  userId: string;
  bulan: number;
  tahun: number;
  daftarRubrik?: RubrikT[];
  dataEvaluasiLama: EvaluasiLamaT;
  rekapKehadiran: { sakit: number; izin: number; terlambat: number; alfa: number }; // 🔴 Tambah tipe di sini
}) {
  const rubrikAman = Array.isArray(daftarRubrik) ? daftarRubrik : [];

  const [nilaiEvaluasi, setNilaiEvaluasi] = useState<Record<string, string>>(dataEvaluasiLama?.detail_nilai || {});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rubrikAman.length === 0) {
      return alert("Rubrik penilaian belum tersedia. Silakan buat di menu Manajemen Aspek.");
    }

    const aspekBelumDinilai = rubrikAman.find((r) => !nilaiEvaluasi[r.nama_aspek]);
    if (aspekBelumDinilai) return alert(`Harap berikan nilai untuk aspek: ${aspekBelumDinilai.nama_aspek}`);

    setIsLoading(true);
    try {
      const res = await simpanPenilaian({
        user_id: userId,
        bulan,
        tahun,
        // 🔴 Menggabungkan nilai rubrik dengan total kehadiran agar terkunci di Database
        detail_nilai: {
          ...nilaiEvaluasi,
          sakit: rekapKehadiran.sakit.toString(),
          izin: rekapKehadiran.izin.toString(),
          terlambat: rekapKehadiran.terlambat.toString(),
          alfa: rekapKehadiran.alfa.toString(),
        },
      });

      if (res.success) {
        alert("Penilaian berhasil disimpan!");
        router.refresh();
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
    // 🔴 PERBAIKAN: Tambahkan timestamp agar URL selalu baru dan browser tidak menggunakan cache lama
    const timestamp = new Date().getTime();
    window.open(`/admin/penilaian/${userId}/cetak?bulan=${bulan}&tahun=${tahun}&_t=${timestamp}`, "_blank");
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h4 className="font-bold text-gray-800">Lembar Penilaian Kinerja</h4>
        {dataEvaluasiLama && <span className="text-xs font-bold px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">Status: {dataEvaluasiLama.status}</span>}
      </div>

      <form onSubmit={handleSimpan} className="flex-1 space-y-6">
        {rubrikAman.map((rubrik) => (
          <div key={rubrik.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-3">{rubrik.nama_aspek}</h4>
            <select
              value={nilaiEvaluasi[rubrik.nama_aspek] || ""}
              onChange={(e) => setNilaiEvaluasi({ ...nilaiEvaluasi, [rubrik.nama_aspek]: e.target.value })}
              className="w-full p-2 border border-blue-300 rounded-md text-sm focus:ring-blue-500 font-semibold bg-gray-50"
            >
              <option value="" disabled>
                -- Pilih Tingkat Kinerja --
              </option>
              <option value="Istimewa">Istimewa (90-100)</option>
              <option value="Memuaskan">Memuaskan (75-89.99)</option>
              <option value="Cukup">Cukup (60-74.99)</option>
              <option value="Buruk">Buruk (40-59.99)</option>
              <option value="Sangat Buruk">Buruk Sekali (&lt; 40)</option>
            </select>

            {nilaiEvaluasi[rubrik.nama_aspek] && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-gray-700 leading-relaxed">
                <span className="font-bold block mb-1">Panduan Kriteria:</span>
                {nilaiEvaluasi[rubrik.nama_aspek] === "Istimewa" && rubrik.istimewa}
                {nilaiEvaluasi[rubrik.nama_aspek] === "Memuaskan" && rubrik.memuaskan}
                {nilaiEvaluasi[rubrik.nama_aspek] === "Cukup" && rubrik.cukup}
                {nilaiEvaluasi[rubrik.nama_aspek] === "Buruk" && rubrik.buruk}
                {nilaiEvaluasi[rubrik.nama_aspek] === "Sangat Buruk" && rubrik.sangat_buruk}
              </div>
            )}
          </div>
        ))}

        {rubrikAman.length === 0 && <p className="text-red-500 text-sm py-4">Data rubrik belum ditarik sempurna atau kosong. Silakan atur di menu Manajemen Aspek.</p>}

        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={isLoading || rubrikAman.length === 0} className="flex-1 bg-blue-600 text-white px-5 py-3 rounded-md text-sm font-bold hover:bg-blue-700 transition disabled:bg-gray-400 shadow-sm">
            {isLoading ? "Menyimpan..." : "💾 Simpan Penilaian"}
          </button>

          <button type="button" onClick={handleCetakPDF} className="flex-1 bg-gray-800 text-white px-5 py-3 rounded-md text-sm font-bold hover:bg-gray-900 transition shadow-sm">
            ✍️ Tanda Tangani & Cetak PDF
          </button>
        </div>
      </form>
    </div>
  );
}
