import { getDetailAktivitas, getDetailPegawaiDanEvaluasi } from "@/lib/actions/penilaian";
import { getDaftarAspek } from "@/lib/actions/aspek";
import Link from "next/link";
import FormDetailPenilaian from "@/components/admin/FormDetailPenilaian";

// Tipe Data
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

  // Tarik data paralel
  const [resAktivitas, resAspek, resDetail] = await Promise.all([getDetailAktivitas(user_id, numBulan, numTahun), getDaftarAspek(), getDetailPegawaiDanEvaluasi(user_id, numBulan, numTahun)]);

  const riwayatHarian = (resAktivitas.data as RiwayatAktivitasT[]) || [];
  const daftarRubrik = (resAspek.data as RubrikT[]) || [];
  const { pegawai, evaluasi } = resDetail.data || {};

  const evaluasiAman = (evaluasi || null) as EvaluasiLamaT;

  // 🔴 LOGIKA PENGHITUNG OTOMATIS (Diperbarui dengan penambahan 'Hadir')
  let hadir = 0, sakit = 0, izin = 0, terlambat = 0, alfa = 0;
  riwayatHarian.forEach((r: RiwayatAktivitasT) => {
    const status = r.status_kehadiran?.toLowerCase() || "hadir";
    if (status === "sakit") sakit++;
    else if (status === "izin") izin++;
    else if (status === "terlambat") terlambat++;
    else if (status === "alfa" || status.includes("mangkir")) alfa++;
    else hadir++;
  });

  // Gabungkan ke dalam satu objek untuk dikirim ke Form
  const rekapKehadiran = { hadir, sakit, izin, terlambat, alfa };

  if (!pegawai) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="bg-red-100 text-red-500 p-4 rounded-full mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
        <h3 className="text-xl font-bold text-gray-800">Data Pegawai Tidak Ditemukan</h3>
        <p className="text-gray-500 mt-2">Pastikan ID pegawai valid atau kembali ke halaman sebelumnya.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 animate-fade-in-up">
      
      {/* NAVIGASI & HEADER PROFIL */}
      <div className="bg-[#003366] rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 mb-[-50px] w-40 h-40 bg-blue-400 opacity-10 rounded-full blur-2xl"></div>

        <div className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <Link href="/admin/penilaian" className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors border border-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest border border-white/20 mb-2">
                  Periode: Bulan {numBulan} / {numTahun}
                </span>
                <h3 className="text-3xl font-black text-white tracking-tight">{pegawai.nama}</h3>
                <p className="text-blue-200 mt-1 font-medium">NIK: {pegawai.nik}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/10 text-left md:text-right w-full md:w-auto">
              <p className="text-xs text-blue-200 uppercase tracking-widest font-bold mb-1">Posisi / Jabatan</p>
              <p className="font-bold text-white text-lg">{pegawai.jabatan}</p>
              <p className="text-sm text-blue-100">{pegawai.bagian}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: LAPORAN (LEBIH COMPACT) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* 🔴 STATISTIK MINI KEHADIRAN */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-5 gap-2 text-center">
            <div className="bg-green-50 border border-green-100 p-2 rounded-xl">
              <p className="text-[10px] font-bold text-green-600 uppercase">Hadir</p>
              <p className="text-lg font-black text-green-800">{hadir}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 p-2 rounded-xl">
              <p className="text-[10px] font-bold text-yellow-600 uppercase">Telat</p>
              <p className="text-lg font-black text-yellow-800">{terlambat}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-2 rounded-xl">
              <p className="text-[10px] font-bold text-blue-600 uppercase">Izin</p>
              <p className="text-lg font-black text-blue-800">{izin}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-2 rounded-xl">
              <p className="text-[10px] font-bold text-blue-600 uppercase">Sakit</p>
              <p className="text-lg font-black text-blue-800">{sakit}</p>
            </div>
            <div className="bg-red-50 border border-red-100 p-2 rounded-xl">
              <p className="text-[10px] font-bold text-red-600 uppercase">Alfa</p>
              <p className="text-lg font-black text-red-800">{alfa}</p>
            </div>
          </div>

          {/* 🔴 TABEL COMPACT LAPORAN HARIAN (Maksimal Tinggi 600px + Scroll Internal) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50 rounded-t-2xl">
              <div className="bg-blue-100 text-[#003366] p-1.5 rounded-md"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
              <h4 className="font-bold text-[#003366] text-sm uppercase tracking-wider">Log Harian</h4>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {riwayatHarian.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 h-full">
                  <p className="text-gray-400 font-medium text-sm">Tidak ada aktivitas pada bulan ini.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-gray-100">
                    {riwayatHarian.map((item: RiwayatAktivitasT) => {
                      let urls: string[] = [];
                      try { urls = Array.isArray(item.lampiran) ? item.lampiran : typeof item.lampiran === "string" ? JSON.parse(item.lampiran) : []; } catch { urls = []; }
                      const tgl = new Date(item.tanggal);

                      return (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                          {/* Kolom Tanggal & Status */}
                          <td className="px-3 py-3 align-top w-24">
                            <p className="font-black text-gray-800">{tgl.getDate()}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{tgl.toLocaleDateString("id-ID", { month: "short" })}</p>
                            
                            <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              item.status_kehadiran?.toLowerCase() === 'hadir' ? 'bg-green-50 text-green-700 border-green-200' :
                              item.status_kehadiran?.toLowerCase() === 'terlambat' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              item.status_kehadiran?.toLowerCase() === 'sakit' || item.status_kehadiran?.toLowerCase() === 'izin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {item.status_kehadiran || "Hadir"}
                            </span>
                          </td>
                          
                          {/* Kolom Uraian & Lampiran */}
                          <td className="px-3 py-3 align-top">
                            <p className="text-gray-700 font-medium leading-relaxed mb-2 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer" title="Klik/Arahkan kursor untuk melihat teks penuh">
                              {item.uraian_aktivitas}
                            </p>
                            {urls.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {urls.map((url: string, i: number) => (
                                  <a key={i} href={`/api/berkas?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors">
                                    File {i + 1}
                                  </a>
                                ))}
                              </div>
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
        </div>

        {/* KOLOM KANAN: FORM EVALUASI */}
        <div className="lg:col-span-7">
          <FormDetailPenilaian userId={user_id} bulan={numBulan} tahun={numTahun} daftarRubrik={daftarRubrik} dataEvaluasiLama={evaluasiAman} rekapKehadiran={rekapKehadiran} />
        </div>
      </div>
    </div>
  );
}