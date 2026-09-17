import { getRekapPegawaiBulanIni } from "@/lib/actions/penilaian";
import TabelPenilaian from "@/components/admin/TabelPenilaian";
import { getWitaDate } from "@/lib/utils";
// 🔴 1. Impor komponen Filter Otomatis
import FilterPeriode from "@/components/admin/FilterPeriode";

type PegawaiT = {
  user_id: string;
  nama: string;
  nik: string;
  bagian: string;
  total_hadir: string | number;
  id_penilaian: number | null;
};

export default async function AdminPenilaianPage({ searchParams }: { searchParams: Promise<{ bulan?: string; tahun?: string }> }) {
  const params = await searchParams;
  const today = getWitaDate();

  const bulan = params.bulan ? parseInt(params.bulan) : today.getMonth() + 1;
  const tahun = params.tahun ? parseInt(params.tahun) : today.getFullYear();

  const resPegawai = await getRekapPegawaiBulanIni(bulan, tahun);
  const daftarPegawai = (resPegawai.data as PegawaiT[]) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* 🔴 HEADER YANG LEBIH CLEAN & MINIMALIS */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#003366]"></div>

        <div className="pl-2">
          <h2 className="text-2xl font-black text-[#003366] tracking-tight">Penilaian Kinerja Non-ASN</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Evaluasi kinerja pegawai berdasarkan kehadiran dan rubrik kualitatif.</p>
        </div>

        {/* 🔴 2. Panggil Komponen Filter Di Sini (Bebas Tombol, Bebas Kotak Abu-abu!) */}
        <FilterPeriode defaultBulan={bulan} defaultTahun={tahun} />
      </div>

      <TabelPenilaian daftarPegawai={daftarPegawai} bulanAktif={bulan} tahunAktif={tahun} />
    </div>
  );
}
