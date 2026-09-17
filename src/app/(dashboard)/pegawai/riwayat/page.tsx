import { getRiwayatBulanan } from "@/lib/actions/presensi";
import { getWitaDate } from "@/lib/utils";

// 1. Tipe Data Diperbarui
type DataPresensi = {
  id: string;
  tanggal: string | Date;
  uraian_aktivitas: string;
  titik_koordinat: string;
  status_verifikasi: string;
  status_kehadiran?: string; // 🔴 Ditambahkan untuk melacak status
  lampiran: string | string[];
};

// 2. Mendukung Next.js 15+ (Asynchronous searchParams)
export default async function RiwayatPage({ searchParams }: { searchParams: Promise<{ bulan?: string; tahun?: string }> }) {
  const params = await searchParams;
  const today = getWitaDate();

  // 3. Logika Filter Default (Bulan Ini)
  const bulan = params.bulan ? parseInt(params.bulan) : today.getMonth() + 1;
  const tahun = params.tahun ? parseInt(params.tahun) : today.getFullYear();

  const response = await getRiwayatBulanan(bulan, tahun);
  const dataRiwayat = (response.data as DataPresensi[]) || [];

  // 🔴 4. MENGHITUNG STATISTIK KEHADIRAN BULAN INI
  let hadir = 0,
    sakit = 0,
    izin = 0,
    terlambat = 0,
    alfa = 0;
  dataRiwayat.forEach((item) => {
    const status = (item.status_kehadiran || "Hadir").toLowerCase();
    if (status === "sakit") sakit++;
    else if (status === "izin") izin++;
    else if (status === "terlambat") terlambat++;
    else if (status === "alfa" || status.includes("mangkir")) alfa++;
    else hadir++;
  });

  const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      {/* HEADER & FILTER BERSATU DALAM KARTU GLASSMORPHISM */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden">
        {/* Aksen Garis Biru */}
        <div className="absolute top-0 left-0 w-2 h-full bg-[#003366]"></div>

        <div className="pl-2">
          <h2 className="text-2xl font-black text-[#003366] tracking-tight">Riwayat Presensi Bulanan</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Rekapitulasi aktivitas dan kehadiran Anda.</p>
        </div>

        {/* Form Filter GET bawaan */}
        <form method="GET" className="flex flex-col sm:flex-row items-end gap-3 w-full xl:w-auto bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="w-full sm:w-40">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pilih Bulan</label>
            <select
              name="bulan"
              defaultValue={bulan}
              className="block w-full rounded-lg border-gray-300 bg-white shadow-sm px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-[#003366] focus:ring-[#003366] outline-none transition-all"
            >
              {namaBulan.map((nama, index) => (
                <option key={index + 1} value={index + 1}>
                  {nama}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tahun</label>
            <select
              name="tahun"
              defaultValue={tahun}
              className="block w-full rounded-lg border-gray-300 bg-white shadow-sm px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-[#003366] focus:ring-[#003366] outline-none transition-all"
            >
              {[2024, 2025, 2026, 2027].map((th) => (
                <option key={th} value={th}>
                  {th}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full sm:w-auto bg-[#003366] px-6 py-2.5 rounded-lg text-white text-sm font-bold shadow-md hover:bg-[#002244] active:scale-95 transition-all">
            Tampilkan
          </button>
        </form>
      </div>

      {/* KARTU STATISTIK (DASHBOARD MINI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-green-100 text-green-600 p-3 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Hadir</p>
            <p className="text-2xl font-black text-gray-800">
              {hadir} <span className="text-sm font-medium text-gray-500">hari</span>
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Terlambat</p>
            <p className="text-2xl font-black text-gray-800">
              {terlambat} <span className="text-sm font-medium text-gray-500">hari</span>
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Izin / Sakit</p>
            <p className="text-2xl font-black text-gray-800">
              {izin + sakit} <span className="text-sm font-medium text-gray-500">hari</span>
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-red-100 text-red-600 p-3 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Alfa (Mangkir)</p>
            <p className="text-2xl font-black text-gray-800">
              {alfa} <span className="text-sm font-medium text-gray-500">hari</span>
            </p>
          </div>
        </div>
      </div>

      {/* TABEL DATA ESTETIK */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-[#003366]/5 border-b border-gray-200 text-[#003366]">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Tanggal</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Kehadiran</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs w-1/3">Uraian Aktivitas</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Dokumentasi</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Status Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dataRiwayat.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-3 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium text-base">Belum ada data presensi pada bulan ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dataRiwayat.map((item) => {
                  let urls: string[] = [];
                  try {
                    urls = typeof item.lampiran === "string" ? JSON.parse(item.lampiran) : item.lampiran;
                  } catch (e) {
                    urls = [];
                  }

                  const stHadir = (item.status_kehadiran || "Hadir").toLowerCase();

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <p className="font-bold text-gray-900">{new Date(item.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</p>
                        <p className="text-xs text-gray-400">{new Date(item.tanggal).toLocaleDateString("id-ID", { weekday: "long" })}</p>
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                            stHadir === "hadir"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : stHadir === "terlambat"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : stHadir === "sakit" || stHadir === "izin"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {item.status_kehadiran || "Hadir"}
                        </span>
                      </td>

                      <td className="px-6 py-5 min-w-[250px]">
                        <p className="line-clamp-2 text-gray-700 font-medium group-hover:text-[#003366] transition-colors">{item.uraian_aktivitas}</p>
                      </td>

                      <td className="px-6 py-5">
                        {urls && urls.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {urls.map((url, i) => (
                              <a
                                key={i}
                                href={`/api/berkas?url=${encodeURIComponent(url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                File {i + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">Tidak ada file</span>
                        )}
                      </td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                            item.status_verifikasi === "PENDING"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : item.status_verifikasi === "DISETUJUI"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {item.status_verifikasi === "PENDING" && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                          {item.status_verifikasi === "DISETUJUI" && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                          {item.status_verifikasi === "DITOLAK" && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
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
