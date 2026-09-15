"use server";

import { sql, createPool } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const simDb = createPool({
  connectionString: process.env.SIM_DATABASE_URL,
});

export async function getDataPegawaiSIM() {
  try {
    // 🔴 PERBAIKAN: Gunakan AS untuk menyamakan nama kolom dengan sistem kita
    const { rows } = await simDb.sql`
      SELECT 
        nip AS nik, 
        nama, 
        bidang AS bagian, 
        jabatan 
      FROM data_pegawai 
      WHERE status_kepegawaian = 'Non ASN' 
        AND bidang NOT LIKE '%SATPEL%' 
      ORDER BY nama ASC;
    `;
    return rows;
  } catch (error) {
    console.error("Gagal menarik data dari DB SIM:", error);
    return [];
  }
}

export async function getMergedPegawai() {
  try {
    const externalData = await getDataPegawaiSIM();

    const { rows: localAccounts } = await sql`
      SELECT nik, email FROM data_akun WHERE role = 'PEGAWAI'
    `;

    // 🔴 Sekarang ini akan berfungsi sempurna karena emp.nik sudah ada (dari nip AS nik)
    const mergedData = externalData.map((emp) => {
      const account = localAccounts.find((acc) => acc.nik === emp.nik);
      return {
        ...emp,
        hasAccount: !!account,
        email: account?.email || null,
      };
    });

    return { success: true, data: mergedData };
  } catch (error) {
    console.error("Gagal sinkronisasi data pegawai:", error);
    return { success: false, data: [] };
  }
}

// 3. Fungsi untuk membuat (Generate) akun baru ke Vercel Postgres
export async function generateAkunPegawai(pegawai: { nik: string; nama: string; bagian: string; jabatan: string }) {
  try {
    // 🔴 1. LOG PENDETEKSI AWAL (Akan muncul di Terminal VS Code Anda)
    console.log("Mencoba membuat akun untuk:", pegawai.nama);

    // 🔴 2. PAKSA MENJADI STRING (Untuk mencegah error tipe data dari database SIM)
    const namaLengkap = pegawai.nama ? String(pegawai.nama) : "Pegawai";
    const nikString = pegawai.nik ? String(pegawai.nik) : "00000000";
    const bagianTeks = pegawai.bagian ? String(pegawai.bagian) : "-";
    const jabatanTeks = pegawai.jabatan ? String(pegawai.jabatan) : "-";

    // Buat email otomatis dari nama depan dan 4 digit terakhir NIK
    const namaDepan = namaLengkap.split(" ")[0].toLowerCase();
    const emailOtomatis = `${namaDepan}.${nikString.slice(-4)}@bbpvp.id`;

    // Buat password default: "bbpvp123"
    const hashedPassword = await bcrypt.hash("bbpvp123", 10);

    // 🔴 3. LOG PENDETEKSI KEDUA
    console.log(`Menyimpan ke database lokal dengan email: ${emailOtomatis}`);

    await sql`
      INSERT INTO data_akun (nik, nama, bagian, jabatan, email, password, role)
      VALUES (
        ${nikString}, 
        ${namaLengkap}, 
        ${bagianTeks}, 
        ${jabatanTeks}, 
        ${emailOtomatis}, 
        ${hashedPassword}, 
        'PEGAWAI'
      )
    `;

    // Refresh halaman admin secara otomatis agar tabel langsung terupdate
    revalidatePath("/admin/pegawai");

    console.log("SUKSES! Data tersimpan.");
    return { success: true, email: emailOtomatis };
  } catch (error) {
    // 1. LOG PENDETEKSI KE TERMINAL
    console.error("GAGAL GENERATE AKUN DB:", error);

    // 2. MENGHINDARI 'any': Definisikan tipe struktur error dari PostgreSQL
    type DatabaseError = Error & { code?: string };
    const dbError = error as DatabaseError;

    // Jika error kode '23505', itu artinya NIK/Email sudah duplikat (unik)
    if (dbError.code === "23505") {
      return { success: false, message: "NIK atau Email ini sudah pernah didaftarkan." };
    }

    return { success: false, message: dbError.message || "Terjadi kesalahan sistem." };
  }
}
