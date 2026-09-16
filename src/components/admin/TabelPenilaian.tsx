"use client";

import Link from "next/link";

type PegawaiT = {
  user_id: string;
  nama: string;
  nik: string;
  bagian: string;
  total_hadir: string | number;
  id_penilaian: number | null;
};

export default function TabelPenilaian({ daftarPegawai, bulanAktif, tahunAktif }: { daftarPegawai: PegawaiT[]; bulanAktif: number; tahunAktif: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama / NIK</th>
              <th className="px-6 py-4 font-semibold">Bagian</th>
              <th className="px-6 py-4 font-semibold text-center">Kehadiran</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {daftarPegawai.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Belum ada pegawai.
                </td>
              </tr>
            ) : (
              daftarPegawai.map((pegawai) => (
                <tr key={pegawai.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{pegawai.nama}</p>
                    <p className="text-xs text-gray-500">{pegawai.nik}</p>
                  </td>
                  <td className="px-6 py-4">{pegawai.bagian}</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">{pegawai.total_hadir} Hari</td>
                  <td className="px-6 py-4 text-center">
                    {pegawai.id_penilaian ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">✔ Dinilai</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">⏳ Menunggu</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* 🔴 PERBAIKAN: Menggunakan Link menuju halaman detail spesifik */}
                    <Link
                      href={`/admin/penilaian/${pegawai.user_id}?bulan=${bulanAktif}&tahun=${tahunAktif}`}
                      className={`${pegawai.id_penilaian ? "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100" : "bg-blue-600 text-white hover:bg-blue-700"} px-4 py-1.5 rounded-md text-xs font-bold transition inline-block`}
                    >
                      {pegawai.id_penilaian ? "Lihat Detail" : "Beri Nilai"}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
