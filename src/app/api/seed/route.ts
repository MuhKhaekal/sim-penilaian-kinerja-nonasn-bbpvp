import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Kita buat password default "password123" dan di-hash untuk keamanan
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Memasukkan Akun Admin
    await sql`
      INSERT INTO data_akun (nik, nama, bagian, jabatan, email, password, role)
      VALUES (
        '1234567890123456', 
        'Administrator BBPVP', 
        'Kepegawaian', 
        'Admin Sistem', 
        'admin@bbpvp.id', 
        ${hashedPassword}, 
        'ADMIN'
      )
      ON CONFLICT (email) DO NOTHING;
    `;

    // 2. Memasukkan Akun Pegawai
    await sql`
      INSERT INTO data_akun (nik, nama, bagian, jabatan, email, password, role)
      VALUES (
        '6543210987654321', 
        'Pegawai Percobaan', 
        'Umum', 
        'Staf Administrasi', 
        'pegawai@bbpvp.id', 
        ${hashedPassword}, 
        'PEGAWAI'
      )
      ON CONFLICT (email) DO NOTHING;
    `;

    return NextResponse.json({ 
      success: true, 
      message: "Data akun berhasil ditambahkan! Silakan kembali ke halaman login." 
    });

  } catch (error) {
    console.error("Error saat seeding data:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Terjadi kesalahan saat menambahkan data.",
      error: (error as Error).message
    }, { status: 500 });
  }
}