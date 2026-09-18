"use server";

import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWitaDate } from "@/lib/utils";
import { put } from "@vercel/blob"; 

export async function simpanDataPresensi(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PEGAWAI") {
    return { success: false, message: "Akses ditolak." };
  }

  // 🔴 1. SISTEM PENDETEKSI: Cegat di awal jika token benar-benar kosong di Vercel
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("FATAL ERROR: BLOB_READ_WRITE_TOKEN kosong atau tidak terbaca oleh server!");
    return { success: false, message: "Sistem gagal mengautentikasi penyimpanan berkas. Hubungi Admin." };
  }

  try {
    const koordinat = formData.get("koordinat") as string;
    const status_kehadiran = (formData.get("status_kehadiran") as string) || "Hadir";
    const uraian = formData.get("uraian") as string;
    const kendala = formData.get("kendala") as string;
    const files = formData.getAll("lampiran") as File[];

    const lampiranUrls: string[] = [];

    for (const file of files) {
      const fileName = `presensi-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      // 🔴 2. SUNTIKAN EKSPLISIT: Paksa Vercel Blob menggunakan token dari Environment
      const blob = await put(fileName, file, { 
        access: 'private',
        token: process.env.BLOB_READ_WRITE_TOKEN // Injeksi manual di sini
      });
      
      lampiranUrls.push(blob.url);
    }

    const today = getWitaDate();
    const tanggalStr = today.toISOString().split("T")[0];

    // Simpan ke database
    await sql`
      INSERT INTO presensi (user_id, tanggal, titik_koordinat, status_kehadiran, uraian_aktivitas, kendala, lampiran)
      VALUES (
        ${session.user.id},
        ${tanggalStr},
        ${koordinat},
        ${status_kehadiran},
        ${uraian},
        ${kendala},
        ${JSON.stringify(lampiranUrls)}
      )
    `;

    return { success: true };
  } catch (error) {
    console.error("Gagal simpan presensi ke DB atau Blob:", error);
    return { success: false, message: "Terjadi kesalahan sistem saat mengunggah berkas." };
  }
}

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