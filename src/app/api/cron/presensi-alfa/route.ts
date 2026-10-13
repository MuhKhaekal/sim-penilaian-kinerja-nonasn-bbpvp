
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";

function getWitaDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getYesterdayWita(): string {
  const todayWita = getWitaDateString();
  const [year, month, day] = todayWita.split("-").map(Number);

  // Gunakan kalender UTC untuk menghitung selisih tanggal,
  // bukan mengurangi 24 jam dari waktu lokal server.
  const yesterday = new Date(Date.UTC(year, month - 1, day - 1));

  return [
    yesterday.getUTCFullYear(),
    String(yesterday.getUTCMonth() + 1).padStart(2, "0"),
    String(yesterday.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { success: false, message: "Akses ditolak." },
      { status: 401 }
    );
  }

  try {
    const tanggal = getYesterdayWita();

    // Sabtu = 6, Minggu = 0.
    const [year, month, day] = tanggal.split("-").map(Number);
    const hari = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

    if (hari === 0 || hari === 6) {
      return NextResponse.json({
        success: true,
        message: "Tanggal kemarin adalah akhir pekan. Alfa tidak dibuat.",
        tanggal,
        jumlah: 0,
      });
    }

    // Jangan buat alfa pada hari libur nasional yang tercatat.
    const libur = await sql`
      SELECT 1
      FROM hari_libur
      WHERE tanggal = ${tanggal}::date
      LIMIT 1
    `;

    if (libur.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Tanggal kemarin merupakan hari libur. Alfa tidak dibuat.",
        tanggal,
        jumlah: 0,
      });
    }

    // Buat alfa untuk setiap pegawai yang belum memiliki presensi.
    // ON CONFLICT mengasumsikan ada unique constraint pada
    // kombinasi (user_id, tanggal); lihat catatan setelah kode.
    const result = await sql`
      INSERT INTO presensi (
        user_id,
        tanggal,
        titik_koordinat,
        status_kehadiran,
        uraian_aktivitas,
        kendala,
        lampiran
      )
      SELECT
        u.id,
        ${tanggal}::date,
        NULL,
        'Alfa',
        'Presensi tidak diisi sampai batas waktu harian.',
        NULL,
        '[]'
      FROM data_pegawai u
      WHERE u.role = 'PEGAWAI'
        AND NOT EXISTS (
          SELECT 1
          FROM presensi p
          WHERE p.user_id = u.id
            AND p.tanggal = ${tanggal}::date
        )
      ON CONFLICT (user_id, tanggal) DO NOTHING
      RETURNING user_id
    `;

    return NextResponse.json({
      success: true,
      tanggal,
      jumlah: result.rowCount ?? result.rows.length,
      message: "Pemrosesan alfa otomatis selesai.",
    });
  } catch (error) {
    console.error("Gagal memproses alfa otomatis:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memproses alfa otomatis." },
      { status: 500 }
    );
  }
}
