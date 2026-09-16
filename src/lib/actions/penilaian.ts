"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

export async function getRekapPegawaiBulanIni(bulan: number, tahun: number) {
  try {
    const { rows } = await sql`
      SELECT 
        a.id as user_id, 
        a.nama, 
        a.nik, 
        a.bagian, 
        a.jabatan,
        COUNT(p.id) as total_hadir,
        pk.id as id_penilaian,
        pk.status
      FROM data_akun a
      LEFT JOIN presensi p 
        ON a.id::text = p.user_id::text 
        AND EXTRACT(MONTH FROM p.tanggal) = ${bulan} 
        AND EXTRACT(YEAR FROM p.tanggal) = ${tahun}
      LEFT JOIN penilaian_kinerja pk 
        ON a.id::text = pk.user_id::text 
        AND pk.bulan = ${bulan} 
        AND pk.tahun = ${tahun}
      WHERE a.role = 'PEGAWAI'
      GROUP BY a.id, a.nama, a.nik, a.bagian, a.jabatan, pk.id, pk.status
      ORDER BY a.nama ASC
    `;
    return { success: true, data: rows };
  } catch (error) {
    console.error("Gagal mengambil rekap pegawai:", error);
    return { success: false, data: [] };
  }
}

export async function getDetailAktivitas(user_id: string, bulan: number, tahun: number) {
  try {
    const { rows } = await sql`
      SELECT id, tanggal, uraian_aktivitas, titik_koordinat, lampiran, status_kehadiran 
      FROM presensi 
      WHERE user_id::text = ${user_id} 
        AND EXTRACT(MONTH FROM tanggal) = ${bulan} 
        AND EXTRACT(YEAR FROM tanggal) = ${tahun}
      ORDER BY tanggal ASC
    `;
    return { success: true, data: rows };
  } catch (error) {
    console.error("Gagal mengambil detail aktivitas:", error);
    return { success: false, data: [] };
  }
}

export async function getDetailPegawaiDanEvaluasi(user_id: string, bulan: number, tahun: number) {
  try {
    const { rows: user } = await sql`
      SELECT nama, nik, bagian, jabatan FROM data_akun WHERE id::text = ${user_id}
    `;

    // 🔴 PERBAIKAN 1: Mengambil kolom detail_nilai, status, dan ttd_admin sesuai DB Anda
    const { rows: evaluasi } = await sql`
      SELECT detail_nilai, status, ttd_admin FROM penilaian_kinerja 
      WHERE user_id::text = ${user_id} AND bulan = ${bulan} AND tahun = ${tahun}
    `;

    return {
      success: true,
      data: {
        pegawai: user[0],
        evaluasi: evaluasi[0] || null,
      },
    };
  } catch (error) {
    console.error("Gagal mengambil detail pegawai:", error);
    return { success: false, data: null };
  }
}

export async function simpanPenilaian(payload: { user_id: string; bulan: number; tahun: number; detail_nilai: Record<string, string> }) {
  try {
    const evaluasiString = JSON.stringify(payload.detail_nilai);

    // 🔴 PERBAIKAN 2: Cek dulu apakah data sudah ada. Jika ada UPDATE, jika belum INSERT.
    // Kita lakukan ini agar tidak error jika tabel DB Anda belum dipasang UNIQUE(user_id, bulan, tahun).
    const { rowCount, rows } = await sql`
      SELECT id FROM penilaian_kinerja 
      WHERE user_id::text = ${payload.user_id} AND bulan = ${payload.bulan} AND tahun = ${payload.tahun}
    `;

    if (rowCount && rowCount > 0) {
      // UPDATE DATA YANG ADA
      await sql`
        UPDATE penilaian_kinerja 
        SET detail_nilai = ${evaluasiString}::jsonb 
        WHERE id = ${rows[0].id}
      `;
    } else {
      // INSERT DATA BARU (Dengan status 'DRAFT' otomatis dari default DB Anda)
      await sql`
        INSERT INTO penilaian_kinerja (user_id, bulan, tahun, detail_nilai)
        VALUES (${payload.user_id}::uuid, ${payload.bulan}, ${payload.tahun}, ${evaluasiString}::jsonb)
      `;
    }

    // ... kode insert/update database sebelumnya ...

    // 🔴 PERBAIKAN: Tambahkan "layout" agar cache halaman cetak ikut terhapus
    revalidatePath("/admin/penilaian", "layout");
    return { success: true };
  } catch (error) {
    console.error("GAGAL SIMPAN PENILAIAN KE DB:", error);
    return { success: false, message: "Terjadi kesalahan pada struktur database." };
  }
}
