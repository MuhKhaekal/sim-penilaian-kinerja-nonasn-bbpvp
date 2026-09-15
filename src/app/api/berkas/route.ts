import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  // 1. Cek secara ketat apakah yang mengakses URL ini sudah login
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Akses Ditolak. Anda harus login untuk melihat dokumen ini.", { status: 401 });
  }

  // 2. Ambil parameter URL Vercel Blob dari query string
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new NextResponse("Parameter URL dokumen tidak ditemukan.", { status: 400 });
  }

  try {
    // 3. Server yang bertugas mengambil file langsung ke Vercel Blob 
    // dengan menyertakan Kunci Rahasia (Token)
    const response = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      return new NextResponse("Dokumen tidak ditemukan atau gagal diambil dari server penyimpanan.", { status: 404 });
    }

    // 4. Teruskan (Stream) file mentahnya ke layar browser pengguna
    const data = await response.blob();
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        // Opsional: Agar file bisa di-preview di browser, bukan dipaksa download
        "Content-Disposition": "inline", 
      },
    });
  } catch (error) {
    console.error("Error proxy berkas:", error);
    return new NextResponse("Terjadi kesalahan sistem.", { status: 500 });
  }
}