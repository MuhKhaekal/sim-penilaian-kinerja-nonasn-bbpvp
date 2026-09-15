import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Proteksi Halaman Admin
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      // Jika Pegawai coba masuk ke /admin, tendang balik ke dashboard pegawai
      return NextResponse.redirect(new URL("/pegawai", req.url));
    }

    // 2. Proteksi Halaman Pegawai
    if (path.startsWith("/pegawai") && token?.role !== "PEGAWAI") {
      // Jika Admin coba masuk ke dashboard /pegawai, tendang balik ke admin
      return NextResponse.redirect(new URL("/admin/pegawai", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Fungsi ini menentukan apakah user diizinkan mengakses matcher atau tidak
      // Jika mereturn true, lanjut ke fungsi middleware di atas. Jika false, arahkan ke /login.
      authorized: ({ token }) => !!token,
    },
  },
);

// Tentukan rute (path) mana saja yang ingin dikunci oleh satpam ini
export const config = {
  matcher: ["/admin/:path*", "/pegawai/:path*"],
};
