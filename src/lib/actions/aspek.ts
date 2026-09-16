"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

// 1. Buat tabel Rubrik Penilaian dengan kolom-kolom baru
async function initTableRubrik() {
  await sql`
    CREATE TABLE IF NOT EXISTS rubrik_penilaian (
      id SERIAL PRIMARY KEY,
      nama_aspek VARCHAR(255) NOT NULL,
      istimewa TEXT,
      memuaskan TEXT,
      cukup TEXT,
      buruk TEXT,
      sangat_buruk TEXT
    )
  `;
}

export async function getDaftarAspek() {
  try {
    await initTableRubrik();
    const { rows } = await sql`SELECT * FROM rubrik_penilaian ORDER BY id ASC`;
    return { success: true, data: rows };
  } catch (error) {
    console.error("Gagal mengambil rubrik:", error);
    return { success: false, data: [] };
  }
}

// 2. Fungsi Tambah yang sudah menerima 5 kriteria nilai
export async function tambahAspek(payload: { nama_aspek: string; istimewa: string; memuaskan: string; cukup: string; buruk: string; sangat_buruk: string }) {
  try {
    await sql`
      INSERT INTO rubrik_penilaian (nama_aspek, istimewa, memuaskan, cukup, buruk, sangat_buruk)
      VALUES (${payload.nama_aspek}, ${payload.istimewa}, ${payload.memuaskan}, ${payload.cukup}, ${payload.buruk}, ${payload.sangat_buruk})
    `;
    revalidatePath("/admin/aspek");
    return { success: true };
  } catch (error) {
    console.error("Gagal tambah aspek:", error);
    return { success: false, message: "Gagal menyimpan ke database." };
  }
}

export async function hapusAspek(id: number) {
  try {
    await sql`DELETE FROM rubrik_penilaian WHERE id = ${id}`;
    revalidatePath("/admin/aspek");
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus aspek:", error);
    return { success: false, message: "Gagal menghapus data." };
  }
}

// 5. Fungsi untuk Mengubah (Update) Data Rubrik
export async function updateAspek(
  id: number,
  payload: {
    nama_aspek: string;
    istimewa: string;
    memuaskan: string;
    cukup: string;
    buruk: string;
    sangat_buruk: string;
  },
) {
  try {
    await sql`
      UPDATE rubrik_penilaian
      SET 
        nama_aspek = ${payload.nama_aspek},
        istimewa = ${payload.istimewa},
        memuaskan = ${payload.memuaskan},
        cukup = ${payload.cukup},
        buruk = ${payload.buruk},
        sangat_buruk = ${payload.sangat_buruk}
      WHERE id = ${id}
    `;
    revalidatePath("/admin/aspek");
    return { success: true };
  } catch (error) {
    console.error("Gagal update aspek:", error);
    return { success: false, message: "Gagal memperbarui data di database." };
  }
}
