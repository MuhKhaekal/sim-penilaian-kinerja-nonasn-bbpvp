import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  // Ambil sesi pengguna yang sedang login
  const session = await getServerSession(authOptions);

  // Jika belum login, tendang ke halaman login
  if (!session) {
    redirect("/login");
  }

  // Jika sudah login, cek role dan arahkan ke dasbor yang sesuai
  if (session.user.role === "ADMIN") {
    redirect("/admin/pegawai");
  } else {
    redirect("/pegawai");
  }
}
