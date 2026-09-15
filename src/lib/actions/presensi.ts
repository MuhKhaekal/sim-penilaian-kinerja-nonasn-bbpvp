"use server";

import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWitaDate } from "@/lib/utils";
import { put } from "@vercel/blob"; // Tambahan Vercel Blob

export async function simpanDataPresensi(formData: FormData) {
  // 1. Pastikan yang mengakses adalah Pegawai yang sudah login
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PEGAWAI") {
    return { success: false, message: "Akses ditolak." };
  }

  try {
    // 2. Ekstrak data dari FormData
    const koordinat = formData.get("koordinat") as string;
    const uraian = formData.get("uraian") as string;
    const kendala = formData.get("kendala") as string;
    const files = formData.getAll("lampiran") as File[];

    const lampiranUrls: string[] = [];

    // 3. Upload file satu per satu langsung dari Server ke Vercel Blob
// 3. Upload file satu per satu langsung dari Server ke Vercel Blob
    for (const file of files) {
      const fileName = `presensi-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      // Menggunakan method 'put' (Server-side upload)
      const blob = await put(fileName, file, { 
        access: 'private', // <--- UBAH KATA INI MENJADI "private"
        multipart: true 
      });
      
      lampiranUrls.push(blob.url);
    }

    // 4. Ambil tanggal hari ini dan format ke YYYY-MM-DD
    const today = getWitaDate();
    const tanggalStr = today.toISOString().split("T")[0];

    // 5. Simpan link Vercel Blob dan teks ke Vercel Postgres
    await sql`
      INSERT INTO presensi (user_id, tanggal, titik_koordinat, uraian_aktivitas, kendala, lampiran)
      VALUES (
        ${session.user.id},
        ${tanggalStr},
        ${koordinat},
        ${uraian},
        ${kendala},
        ${JSON.stringify(lampiranUrls)}
      )
    `;

    return { success: true };
  } catch (error) {
    console.error("Gagal simpan presensi ke DB atau Blob:", error);
    return { success: false, message: "Terjadi kesalahan sistem saat memproses data." };
  }
}

// ... (kode simpanDataPresensi yang sudah ada di atasnya) ...

// Fungsi untuk mengambil data presensi pada 1 hari spesifik
export async function getPresensiByDate(tanggalStr: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PEGAWAI") return { success: false, data: null };

  try {
    const { rows } = await sql`
      SELECT * FROM presensi 
      WHERE user_id = ${session.user.id} AND tanggal = ${tanggalStr}
    `;
    return { success: true, data: rows[0] || null };
  } catch (error) {
    console.error("Gagal mengambil data harian:", error);
    return { success: false, data: null };
  }
}

// Fungsi untuk mengambil rekap presensi dalam 1 bulan penuh
export async function getRiwayatBulanan(bulan: number, tahun: number) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PEGAWAI") return { success: false, data: [] };

  try {
    const { rows } = await sql`
      SELECT * FROM presensi 
      WHERE user_id = ${session.user.id} 
        AND EXTRACT(MONTH FROM tanggal) = ${bulan} 
        AND EXTRACT(YEAR FROM tanggal) = ${tahun}
      ORDER BY tanggal DESC
    `;
    return { success: true, data: rows };
  } catch (error) {
    console.error("Gagal mengambil riwayat bulanan:", error);
    return { success: false, data: [] };
  }
}
