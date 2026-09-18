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
      SELECT id, tanggal, uraian_aktivitas, kendala, titik_koordinat, lampiran, status_kehadiran 
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

    const { rowCount, rows } = await sql`
      SELECT id FROM penilaian_kinerja 
      WHERE user_id::text = ${payload.user_id} AND bulan = ${payload.bulan} AND tahun = ${payload.tahun}
    `;

    if (rowCount && rowCount > 0) {
      // UPDATE DATA YANG ADA (Sekaligus ubah status bulanan jadi VERIFIED)
      await sql`
        UPDATE penilaian_kinerja 
        SET detail_nilai = ${evaluasiString}::jsonb,
            status = 'VERIFIED'
        WHERE id = ${rows[0].id}
      `;
    } else {
      // INSERT DATA BARU (Dengan status VERIFIED)
      await sql`
        INSERT INTO penilaian_kinerja (user_id, bulan, tahun, detail_nilai, status)
        VALUES (${payload.user_id}::uuid, ${payload.bulan}, ${payload.tahun}, ${evaluasiString}::jsonb, 'VERIFIED')
      `;
    }

    // 🔴 PERBAIKAN UTAMA: Sapu bersih semua status PENDING harian menjadi DISETUJUI
    // Eksekusi ini akan menyisir seluruh hari di bulan dan tahun yang dievaluasi
    await sql`
      UPDATE presensi
      SET status_verifikasi = 'DISETUJUI'
      WHERE user_id::text = ${payload.user_id}
        AND EXTRACT(MONTH FROM tanggal) = ${payload.bulan}
        AND EXTRACT(YEAR FROM tanggal) = ${payload.tahun}
        AND status_verifikasi = 'PENDING'
    `;

    // Refresh cache agar perubahan status langsung terlihat di frontend
    revalidatePath("/admin/penilaian", "layout");

    // Opsional: Jika Anda juga mau me-refresh cache halaman pegawai
    revalidatePath("/pegawai/riwayat", "layout");

    return { success: true };
  } catch (error) {
    console.error("GAGAL SIMPAN PENILAIAN KE DB:", error);
    return { success: false, message: "Terjadi kesalahan pada struktur database." };
  }
}
