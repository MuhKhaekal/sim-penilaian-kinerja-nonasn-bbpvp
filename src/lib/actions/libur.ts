"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Tambahkan parameter opsional (tahun?: string)
export async function getHariLibur(tahun?: string) {
  try {
    // Jika filter tahun diisi dan bukan "semua"
    if (tahun && tahun !== "semua") {
      const { rows } = await sql`
        SELECT id, TO_CHAR(tanggal, 'YYYY-MM-DD') as tanggal, keterangan 
        FROM hari_libur 
        WHERE EXTRACT(YEAR FROM tanggal) = ${tahun}
        ORDER BY tanggal ASC
      `;
      return { success: true, data: rows };
    }

    // Jika filter tidak ada atau disetel ke "Semua Tahun"
    const { rows } = await sql`
      SELECT id, TO_CHAR(tanggal, 'YYYY-MM-DD') as tanggal, keterangan 
      FROM hari_libur 
      ORDER BY tanggal ASC
    `;
    return { success: true, data: rows };
  } catch (error) {
    console.error("Gagal mengambil hari libur:", error);
    return { success: false, data: [] };
  }
}

export async function tambahHariLibur(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Akses ditolak" };

  const tanggal = formData.get("tanggal") as string;
  const keterangan = formData.get("keterangan") as string;

  try {
    await sql`
      INSERT INTO hari_libur (tanggal, keterangan) 
      VALUES (${tanggal}, ${keterangan})
    `;
    revalidatePath("/admin/hari-libur");
    return { success: true, message: "Hari libur berhasil ditambahkan." };
  } catch (error) {
    // 🔴 PERBAIKAN: Hapus tipe 'any' dan gunakan pengecekan tipe bawaan JavaScript (instanceof Error)
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return { success: false, message: "Tanggal ini sudah didaftarkan sebagai hari libur." };
    }
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}

export async function hapusHariLibur(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Akses ditolak" };

  try {
    await sql`DELETE FROM hari_libur WHERE id = ${id}`;
    revalidatePath("/admin/hari-libur");
    return { success: true, message: "Hari libur berhasil dihapus." };
  } catch (error) {
    return { success: false, message: "Gagal menghapus data." };
  }
}

export async function editHariLibur(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { success: false, message: "Akses ditolak" };

  const id = formData.get("id") as string;
  const tanggal = formData.get("tanggal") as string;
  const keterangan = formData.get("keterangan") as string;

  try {
    await sql`
      UPDATE hari_libur 
      SET tanggal = ${tanggal}, keterangan = ${keterangan} 
      WHERE id = ${id}
    `;
    revalidatePath("/admin/hari-libur");
    return { success: true, message: "Hari libur berhasil diperbarui." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return { success: false, message: "Tanggal ini sudah didaftarkan sebagai hari libur." };
    }
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
