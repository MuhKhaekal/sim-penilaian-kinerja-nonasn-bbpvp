import { getRiwayatBulanan } from "@/lib/actions/presensi";
import { getWitaDate } from "@/lib/utils";

// 1. Tambahkan tipe "lampiran" di sini
type DataPresensi = {
  id: string;
  tanggal: string | Date;
  uraian_aktivitas: string;
  titik_koordinat: string;
  status_verifikasi: string;
  lampiran: string | string[]; 
};

// 2. Next.js 15+ mendeteksi searchParams secara Asynchronous (Promise)
export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const params = await searchParams;
  const today = getWitaDate();
  
  // 3. Logika Filter: Jika ada parameter di URL, gunakan itu. Jika tidak, gunakan bulan saat ini.
  const bulan = params.bulan ? parseInt(params.bulan) : today.getMonth() + 1;
  const tahun = params.tahun ? parseInt(params.tahun) : today.getFullYear();

  const response = await getRiwayatBulanan(bulan, tahun);
  const dataRiwayat = (response.data as DataPresensi[]) || [];

  // Daftar nama bulan untuk dropdown
  const namaBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER & FILTER */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Riwayat Presensi</h2>
          <p className="text-gray-500 text-sm">Menampilkan data bulan terpilih.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-4 w-full md:w-auto">
          {/* Form Filter Menggunakan Method GET Bawaan HTML */}
          <form method="GET" className="flex items-end gap-2 w-full md:w-auto">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bulan</label>
              <select name="bulan" defaultValue={bulan} className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm focus:border-blue-500 focus:ring-blue-500">
                {namaBulan.map((nama, index) => (
                  <option key={index + 1} value={index + 1}>{nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tahun</label>
              <select name="tahun" defaultValue={tahun} className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm focus:border-blue-500 focus:ring-blue-500">
                {[2024, 2025, 2026].map((th) => (
                  <option key={th} value={th}>{th}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-blue-600 px-4 py-2 rounded-md text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Filter
            </button>
          </form>

          <div className="text-right border-l pl-4 hidden md:block">
            <p className="text-sm text-gray-500">Total Kehadiran</p>
            <p className="text-2xl font-bold text-blue-600">{dataRiwayat.length} Hari</p>
          </div>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Aktivitas</th>
                <th className="px-6 py-4 font-semibold">Dokumentasi</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dataRiwayat.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data presensi di bulan/tahun terpilih.
                  </td>
                </tr>
              ) : (
                dataRiwayat.map((item) => {
                  // Parsing JSON string dari Vercel Postgres menjadi Array yang bisa dibaca
                  let urls: string[] = [];
                  try {
                    urls = typeof item.lampiran === 'string' ? JSON.parse(item.lampiran) : item.lampiran;
                  } catch (e) {
                    console.error("Gagal parsing lampiran");
                  }

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-6 py-4 line-clamp-2 min-w-[200px]">{item.uraian_aktivitas}</td>
                      <td className="px-6 py-4">
                        {/* Menampilkan indikator Dokumentasi */}
                        {urls && urls.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {urls.map((url, i) => (
                              <a 
                                key={i} 
                                href={`/api/berkas?url=${encodeURIComponent(url)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded inline-block w-max"
                              >
                                📄 Bukti {i + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Tidak ada file</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          item.status_verifikasi === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          item.status_verifikasi === 'DISETUJUI' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.status_verifikasi}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}