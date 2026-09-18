import { getRekapPegawaiBulanIni } from "@/lib/actions/penilaian";
import TabelPenilaian from "@/components/admin/TabelPenilaian";
import { getWitaDate } from "@/lib/utils";
import FilterPeriode from "@/components/admin/FilterPeriode";
// 🔴 1. Impor komponen Pencarian & Link Next.js
import SearchPegawai from "@/components/admin/SearchPegawai";
import Link from "next/link";

type PegawaiT = {
  user_id: string;
  nama: string;
  nik: string;
  bagian: string;
  total_hadir: string | number;
  id_penilaian: number | null;
};

export default async function AdminPenilaianPage({ searchParams }: { searchParams: Promise<{ bulan?: string; tahun?: string; query?: string; page?: string }> }) {
  const params = await searchParams;
  const today = getWitaDate();

  // 🔴 2. Tangkap semua parameter URL
  const bulan = params.bulan ? parseInt(params.bulan) : today.getMonth() + 1;
  const tahun = params.tahun ? parseInt(params.tahun) : today.getFullYear();
  const searchQuery = params.query?.toLowerCase() || "";
  const currentPage = params.page ? parseInt(params.page) : 1;
  const itemsPerPage = 10;

  const resPegawai = await getRekapPegawaiBulanIni(bulan, tahun);
  const allPegawai = (resPegawai.data as PegawaiT[]) || [];

  // 🔴 3. Logika Filter Pencarian
  const filteredPegawai = allPegawai.filter((pegawai) => {
    return pegawai.nama.toLowerCase().includes(searchQuery) || pegawai.nik.toLowerCase().includes(searchQuery) || pegawai.bagian.toLowerCase().includes(searchQuery);
  });

  // 🔴 4. Logika Pagination
  const totalItems = filteredPegawai.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safePage = currentPage > totalPages ? totalPages : currentPage < 1 ? 1 : currentPage;
  const startIndex = (safePage - 1) * itemsPerPage;

  // Data yang akan dipotong dan dikirim ke tabel
  const paginatedPegawai = filteredPegawai.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* HEADER & FILTER AREA */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#003366]"></div>

        <div className="pl-2">
          <h2 className="text-2xl font-black text-[#003366] tracking-tight">Penilaian Kinerja Non-ASN</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Evaluasi kinerja pegawai berdasarkan kehadiran dan rubrik kualitatif.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          {/* 🔴 Komponen Pencarian Pintar */}
          <SearchPegawai placeholder="Cari Nama, NIK, atau Bagian..." />

          {/* Garis pembatas elegan untuk layar besar */}
          <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

          <FilterPeriode defaultBulan={bulan} defaultTahun={tahun} />
        </div>
      </div>

      {/* KONTEN TABEL & PAGINATION */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 🔴 5. Kirim data yang sudah di-slice (paginated) ke tabel */}
        <TabelPenilaian daftarPegawai={paginatedPegawai} bulanAktif={bulan} tahunAktif={tahun} />

        {/* 🔴 6. UI Pagination (Hanya muncul jika lebih dari 1 halaman) */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-900">{totalItems === 0 ? 0 : startIndex + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, totalItems)}</span> dari{" "}
              <span className="font-bold text-gray-900">{totalItems}</span> pegawai
            </p>

            <div className="flex items-center gap-2">
              {safePage > 1 ? (
                <Link
                  /* Parameter bulan & tahun tetap dipertahankan saat berpindah halaman */
                  href={`?bulan=${bulan}&tahun=${tahun}&query=${searchQuery}&page=${safePage - 1}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                >
                  &larr; Sebelumnya
                </Link>
              ) : (
                <button disabled className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 bg-gray-50 cursor-not-allowed">
                  &larr; Sebelumnya
                </button>
              )}

              <div className="px-4 py-2 text-sm font-bold text-[#003366] bg-blue-50 rounded-lg border border-blue-100">
                {safePage} / {totalPages}
              </div>

              {safePage < totalPages ? (
                <Link
                  href={`?bulan=${bulan}&tahun=${tahun}&query=${searchQuery}&page=${safePage + 1}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Selanjutnya &rarr;
                </Link>
              ) : (
                <button disabled className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 bg-gray-50 cursor-not-allowed">
                  Selanjutnya &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
