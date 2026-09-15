"use client";

import { useState } from "react";
import { generateAkunPegawai } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

type PegawaiProps = {
  nik: string;
  nama: string;
  bagian: string;
  jabatan: string;
};

export default function BuatAkunButton({ pegawai }: { pegawai: PegawaiProps }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleBuatAkun = async () => {
    // 1. BERSIHKAN TEKS: Buang spasi, tab (\t), dan enter tersembunyi dari database SIM
    const cleanNama = pegawai.nama ? String(pegawai.nama).trim() : "Pegawai";
    const cleanNik = pegawai.nik ? String(pegawai.nik).trim() : "00000000";
    const cleanBagian = pegawai.bagian ? String(pegawai.bagian).trim() : "-";
    const cleanJabatan = pegawai.jabatan ? String(pegawai.jabatan).trim() : "-";

    console.log("Data setelah dibersihkan:", { cleanNama, cleanNik, cleanBagian, cleanJabatan });

    const isYakin = window.confirm(`Yakin ingin membuatkan akun untuk ${cleanNama}?`);
    if (!isYakin) {
      console.log("Pembuatan akun dibatalkan oleh pengguna.");
      return;
    }

    setIsLoading(true);
    try {
      const payloadAman = {
        nik: cleanNik,
        nama: cleanNama,
        bagian: cleanBagian,
        jabatan: cleanJabatan,
      };

      const res = await generateAkunPegawai(payloadAman);

      if (res.success) {
        setIsSuccess(true);
        window.alert(`SUKSES!\n\nAkun untuk ${payloadAman.nama} berhasil dibuat.\nEmail: ${res.email}\nPassword: bbpvp123`);
        router.refresh();
      } else {
        window.alert(`GAGAL DARI DATABASE: ${res.message}`);
      }
    } catch (error) {
      console.error("ERROR FATAL DI KLIEN:", error);
      window.alert(`Terjadi kesalahan koneksi klien: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-md border border-green-200">✔ Akun Dibuat</span>;
  }

  return (
    <button onClick={handleBuatAkun} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:bg-blue-300">
      {isLoading ? "Memproses..." : "Buat Akun"}
    </button>
  );
}
