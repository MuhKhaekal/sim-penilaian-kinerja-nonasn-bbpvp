import { getDetailAktivitas, getDetailPegawaiDanEvaluasi } from "@/lib/actions/penilaian";
import { getDaftarAspek } from "@/lib/actions/aspek";
import Link from "next/link";
import FormDetailPenilaian from "@/components/admin/FormDetailPenilaian";

type RubrikT = {
  id: number;
  nama_aspek: string;
  istimewa: string;
  memuaskan: string;
  cukup: string;
  buruk: string;
  sangat_buruk: string;
};

type RiwayatAktivitasT = {
  id: string | number;
  tanggal: string | Date;
  uraian_aktivitas: string;
  kendala?: string | null;
  titik_koordinat?: string;
  lampiran: string | string[];
  status_kehadiran?: string; 
};

type EvaluasiLamaT = {
  detail_nilai: Record<string, string>;
  status: string;
  ttd_admin: boolean;
} | null;

export default async function DetailPenilaianPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ bulan: string; tahun: string }> }) {
  const { id: user_id } = await params;
  const { bulan, tahun } = await searchParams;
  const numBulan = parseInt(bulan);
  const numTahun = parseInt(tahun);

  const [resAktivitas, resAspek, resDetail] = await Promise.all([
    getDetailAktivitas(user_id, numBulan, numTahun), 
    getDaftarAspek(), 
    getDetailPegawaiDanEvaluasi(user_id, numBulan, numTahun)
  ]);

  const riwayatHarian = (resAktivitas.data as RiwayatAktivitasT[]) || [];
  const daftarRubrik = (resAspek.data as RubrikT[]) || [];
  const { pegawai, evaluasi } = resDetail.data || {};
  const evaluasiAman = (evaluasi || null) as EvaluasiLamaT;

  let hadir = 0, sakit = 0, izin = 0, terlambat = 0, alfa = 0;
  riwayatHarian.forEach((r: RiwayatAktivitasT) => {
    const status = r.status_kehadiran?.toLowerCase() || "hadir";
    if (status === "sakit") sakit++;
    else if (status === "izin") izin++;
    else if (status === "terlambat") terlambat++;
    else if (status === "alfa" || status.includes("mangkir")) alfa++;
    else hadir++;
  });

  const rekapKehadiran = { hadir, sakit, izin, terlambat, alfa };

  if (!pegawai) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in-up">
        <div className="bg-red-100 text-red-500 p-4 rounded-full mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
        <h3 className="text-xl font-bold text-gray-800">Data Pegawai Tidak Ditemukan</h3>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      
      {/* HEADER PROFIL BERSIH & MINIMALIS */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-center gap-5">
          <Link href="/admin/penilaian" className="p-3 bg-gray-50 text-gray-500 hover:text-[#003366] hover:bg-blue-50 rounded-xl border border-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{pegawai.nama}</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">NIK: {pegawai.nik} <span className="mx-2">•</span> {pegawai.jabatan} ({pegawai.bagian})</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-blue-50 px-5 py-2.5 rounded-xl border border-blue-100 text-left md:text-right flex-1 sm:flex-none">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Periode Penilaian</p>
            <p className="text-lg font-black text-[#003366]">Bulan {numBulan} / {numTahun}</p>
          </div>
          
          {/* 🔴 TOMBOL CETAK PDF KEMBALI HADIR! */}
          {evaluasiAman && (
            <Link 
              href={`/admin/penilaian/${user_id}/cetak?bulan=${numBulan}&tahun=${numTahun}`} 
              target="_blank"
              className="flex items-center justify-center gap-2 bg-[#003366] text-white px-5 py-3.5 rounded-xl font-bold shadow-md hover:bg-[#002244] hover:shadow-lg transition-all flex-1 sm:flex-none border border-transparent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Cetak PDF
            </Link>
          )}
        </div>
      </div>

      {/* STATISTIK KEHADIRAN (1 BARIS) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Hadir</p>
          <p className="text-2xl font-black text-gray-800">{hadir}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Telat</p>
          <p className="text-2xl font-black text-gray-800">{terlambat}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Izin</p>
          <p className="text-2xl font-black text-gray-800">{izin}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Sakit</p>
          <p className="text-2xl font-black text-gray-800">{sakit}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Alfa</p>
          <p className="text-2xl font-black text-red-800">{alfa}</p>
        </div>
      </div>

      {/* LOG HARIAN (FULL WIDTH, MAX-HEIGHT 500px, STICKY HEADER) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
          <div className="bg-blue-100 text-[#003366] p-1.5 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="font-bold text-gray-800">Log Aktivitas Harian ({riwayatHarian.length} Hari)</h3>
        </div>

        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          {riwayatHarian.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-medium">Tidak ada aktivitas pada bulan ini.</div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 border-b border-gray-200">Tanggal</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 border-b border-gray-200">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Uraian & Kendala</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-48 border-b border-gray-200">Lampiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {riwayatHarian.map((item) => {
                  let urls: string[] = [];
                  try { urls = Array.isArray(item.lampiran) ? item.lampiran : typeof item.lampiran === "string" ? JSON.parse(item.lampiran) : []; } catch { urls = []; }
                  const tgl = new Date(item.tanggal);
                  const status = (item.status_kehadiran || "Hadir").toLowerCase();

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <p className="font-black text-gray-900 text-lg">{tgl.getDate()}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">{tgl.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}</p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-block px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          status === 'hadir' ? 'bg-green-50 text-green-700 border-green-200' :
                          status === 'terlambat' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          status === 'sakit' || status === 'izin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.status_kehadiran || "Hadir"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="text-gray-700 font-medium leading-relaxed mb-3">{item.uraian_aktivitas}</p>
                        {item.kendala && (
                          <div className="bg-red-50 border border-red-100 rounded-lg p-3 inline-block w-full">
                            <p className="text-xs font-black text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Kendala / Hambatan:
                            </p>
                            <p className="text-red-800 font-medium text-sm">{item.kendala}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {urls.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {urls.map((url: string, i: number) => (
                              <a key={i} href={`/api/berkas?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] font-bold bg-gray-50 text-gray-600 px-3 py-2 rounded-lg border border-gray-200 hover:bg-[#003366] hover:text-white transition-colors w-max">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                File {i + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Tidak ada file</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* FORM PENILAIAN FULL WIDTH DI BAWAH */}
      <div className="pt-4">
        <FormDetailPenilaian userId={user_id} bulan={numBulan} tahun={numTahun} daftarRubrik={daftarRubrik} dataEvaluasiLama={evaluasiAman} rekapKehadiran={rekapKehadiran} />
      </div>

    </div>
  );
}