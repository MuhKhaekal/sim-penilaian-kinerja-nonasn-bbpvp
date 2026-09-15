import { getMergedPegawai } from "@/lib/actions/admin";
import BuatAkunButton from "@/components/admin/BuatAkunButton";

// 🔴 1. Tambahkan Tipe Data agar TypeScript aman
type PegawaiMerged = {
  nik: string; // Tadi asalnya nip, sudah kita ubah jadi nik via SQL
  nama: string;
  bagian: string;
  jabatan: string;
  hasAccount: boolean;
  email: string | null;
};

export default async function AdminPegawaiPage() {
  const response = await getMergedPegawai();

  // 🔴 2. Beri tahu TypeScript bahwa data ini bentuknya PegawaiMerged
  const daftarPegawai = (response.data as PegawaiMerged[]) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Pegawai</h2>
          <p className="text-gray-500 text-sm">Sinkronisasi data dari SIM Eksternal BBPVP.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Data SIM</p>
          <p className="text-2xl font-bold text-blue-600">{daftarPegawai.length} Pegawai</p>
        </div>
      </div>

      {/* Tabel Pegawai */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama / NIK</th>
                <th className="px-6 py-4 font-semibold">Bagian & Jabatan</th>
                <th className="px-6 py-4 font-semibold">Status Akun</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {daftarPegawai.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Gagal menarik data dari SIM Eksternal atau data kosong.
                  </td>
                </tr>
              ) : (
                daftarPegawai.map((pegawai, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{pegawai.nama}</p>
                      {/* 🔴 3. Ubah nip kembali ke nik karena sudah diconvert */}
                      <p className="text-xs text-gray-500">{pegawai.nik}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{pegawai.bagian}</p>
                      <p className="text-xs text-gray-500">{pegawai.jabatan}</p>
                    </td>
                    <td className="px-6 py-4">
                      {pegawai.hasAccount ? (
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Aktif</span>
                          <p className="text-xs text-gray-400 mt-1">{pegawai.email}</p>
                        </div>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">Belum Ada Akun</span>
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
                        <span className="text-xs text-gray-400 italic">Siap Dinilai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
