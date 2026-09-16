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
  status_kehadiran?: string; // 🔴 Tambahan baru
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

  // 🔴 LOGIKA PENGHITUNG OTOMATIS
  let sakit = 0,
    izin = 0,
    terlambat = 0,
    alfa = 0;
  riwayatHarian.forEach((r: RiwayatAktivitasT) => {
    const status = r.status_kehadiran?.toLowerCase() || "hadir";
    if (status === "sakit") sakit++;
    else if (status === "izin") izin++;
    else if (status === "terlambat") terlambat++;
    else if (status === "alfa" || status === "alfa / mangkir") alfa++;
  });

  const rekapKehadiran = { sakit, izin, terlambat, alfa };

  if (!pegawai) {
    return <div className="p-10 text-center text-red-500 font-semibold">Data Pegawai tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/penilaian" className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm font-medium transition">
            &larr; Kembali
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Formulir Penilaian & Evaluasi Kinerja</h2>
            <p className="text-sm text-gray-500">
              Bulan {numBulan} / Tahun {numTahun}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-900 text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">{pegawai.nama}</h3>
          <p className="text-blue-200 mt-1">NIK: {pegawai.nik}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="font-medium text-blue-100">{pegawai.bagian}</p>
          <p className="text-sm text-blue-200">{pegawai.jabatan}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Riwayat Pekerjaan */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Riwayat Laporan Pekerjaan Harian</h4>

          {riwayatHarian.length === 0 ? (
            <p className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">Belum ada riwayat aktivitas di bulan ini.</p>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {riwayatHarian.map((item: RiwayatAktivitasT) => {
                let urls: string[] = [];
                try {
                  urls = Array.isArray(item.lampiran) ? item.lampiran : typeof item.lampiran === "string" ? JSON.parse(item.lampiran) : [];
                } catch {
                  urls = [];
                }

                return (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                    <span className="absolute top-4 right-4 text-xs font-bold text-gray-400">{new Date(item.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</span>
                    <p className="text-sm text-gray-800 pr-12">{item.uraian_aktivitas}</p>

                    {urls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {urls.map((url: string, i: number) => (
                          <a
                            key={i}
                            href={`/api/berkas?url=${encodeURIComponent(url)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition flex items-center gap-1"
                          >
                            📄 Lihat Dokumen {urls.length > 1 ? i + 1 : ""}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Memanggil Komponen Client */}
        <FormDetailPenilaian userId={user_id} bulan={numBulan} tahun={numTahun} daftarRubrik={daftarRubrik} dataEvaluasiLama={evaluasiAman} rekapKehadiran={rekapKehadiran} />
      </div>
    </div>
  );
}
