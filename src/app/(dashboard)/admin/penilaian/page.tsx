import { getRekapPegawaiBulanIni } from "@/lib/actions/penilaian";
import TabelPenilaian from "@/components/admin/TabelPenilaian";
import { getWitaDate } from "@/lib/utils";

// Hanya butuh tipe data Pegawai sekarang
type PegawaiT = {
  user_id: string;
  nama: string;
  nik: string;
  bagian: string;
  total_hadir: string | number;
  id_penilaian: number | null;
};

export default async function AdminPenilaianPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const params = await searchParams;
  const today = getWitaDate();
  
  const bulan = params.bulan ? parseInt(params.bulan) : today.getMonth() + 1;
  const tahun = params.tahun ? parseInt(params.tahun) : today.getFullYear();

  // Hanya memanggil data rekap pegawai
  const resPegawai = await getRekapPegawaiBulanIni(bulan, tahun);
  const daftarPegawai = (resPegawai.data as PegawaiT[]) || [];

  const namaBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Penilaian Kinerja Non-ASN</h2>
          <p className="text-gray-500 text-sm">Evaluasi kinerja pegawai berdasarkan kehadiran dan rubrik yang ditetapkan.</p>
        </div>
        
        <form method="GET" className="flex items-end gap-2 w-full md:w-auto">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Periode Bulan</label>
            <select name="bulan" defaultValue={bulan} className="block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-blue-500 bg-white">
              {namaBulan.map((nama, index) => (
                <option key={index + 1} value={index + 1}>{nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tahun</label>
            <select name="tahun" defaultValue={tahun} className="block w-full rounded-md border-gray-300 border p-2 text-sm focus:border-blue-500 bg-white">
              {[2024, 2025, 2026].map((th) => (
                <option key={th} value={th}>{th}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-gray-800 px-4 py-2 rounded-md text-white text-sm font-medium hover:bg-gray-900 transition-colors">
            Filter Data
          </button>
        </form>
      </div>

      {/* 🔴 daftarRubrik sudah dihapus dari sini */}
      <TabelPenilaian 
        daftarPegawai={daftarPegawai} 
        bulanAktif={bulan} 
        tahunAktif={tahun} 
      />
    </div>
  );
}