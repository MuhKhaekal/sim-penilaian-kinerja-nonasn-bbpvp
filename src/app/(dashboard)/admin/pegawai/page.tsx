import { getMergedPegawai } from "@/lib/actions/admin";
import BuatAkunButton from "@/components/admin/BuatAkunButton";
import Link from "next/link";
// 🔴 1. Impor komponen pencarian pintar kita
import SearchPegawai from "@/components/admin/SearchPegawai";

type PegawaiMerged = {
  nik: string;
  nama: string;
  bagian: string;
  jabatan: string;
  hasAccount: boolean;
  email: string | null;
};

export default async function AdminPegawaiPage({ searchParams }: { searchParams: Promise<{ query?: string; page?: string }> }) {
  const params = await searchParams;

  const searchQuery = params.query?.toLowerCase() || "";
  const currentPage = params.page ? parseInt(params.page) : 1;
  const itemsPerPage = 10;

  const response = await getMergedPegawai();
  const allPegawai = (response.data as PegawaiMerged[]) || [];

  const filteredPegawai = allPegawai.filter((pegawai) => {
    return pegawai.nama.toLowerCase().includes(searchQuery) || pegawai.nik.toLowerCase().includes(searchQuery) || pegawai.jabatan.toLowerCase().includes(searchQuery);
  });

  const totalItems = filteredPegawai.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const safePage = currentPage > totalPages ? totalPages : currentPage < 1 ? 1 : currentPage;

  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedPegawai = filteredPegawai.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* HEADER & FILTER AREA */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#003366]"></div>

        <div className="pl-2">
          <h2 className="text-2xl font-black text-[#003366] tracking-tight">Manajemen Pegawai</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Sinkronisasi & Pembuatan Akun SIM Kinerja.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          {/* 🔴 2. Sisipkan komponen Client di sini. Bebas tombol Cari! */}
          <SearchPegawai placeholder="Cari Nama, NIK, atau Jabatan..." />

          <div className="text-right border-l border-gray-200 pl-4 hidden sm:block">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Ditemukan</p>
            <p className="text-2xl font-black text-[#003366]">{totalItems}</p>
          </div>
        </div>
      </div>

      {/* TABEL PEGAWAI */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-[#003366]/5 border-b border-gray-200 text-[#003366]">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">No</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Nama / NIK</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Bagian & Jabatan</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-center">Status Akun</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPegawai.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-3 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-bold text-base">Tidak ada data pegawai yang cocok.</p>
                      <p className="text-gray-400 text-sm mt-1">Coba gunakan kata kunci lain.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPegawai.map((pegawai, index) => (
                  <tr key={pegawai.nik} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">{startIndex + index + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{pegawai.nama}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">{pegawai.nik}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold mb-1 border border-gray-200">{pegawai.bagian}</span>
                      <p className="text-sm font-semibold text-[#003366]">{pegawai.jabatan}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {pegawai.hasAccount ? (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Aktif
                          </span>
                          <p className="text-[10px] font-bold text-gray-400 mt-1.5">{pegawai.email}</p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          Belum Ada Akun
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!pegawai.hasAccount ? (
                        <BuatAkunButton
                          pegawai={{
                            nik: pegawai.nik,
                            nama: pegawai.nama,
                            bagian: pegawai.bagian,
                            jabatan: pegawai.jabatan,
                          }}
                        />
                      ) : (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">Siap Dinilai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* AREA PAGINATION */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-900">{totalItems === 0 ? 0 : startIndex + 1}</span> hingga <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, totalItems)}</span> dari{" "}
              <span className="font-bold text-gray-900">{totalItems}</span> pegawai
            </p>

            <div className="flex items-center gap-2">
              {safePage > 1 ? (
                <Link href={`?query=${searchQuery}&page=${safePage - 1}`} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
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
                <Link href={`?query=${searchQuery}&page=${safePage + 1}`} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
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
