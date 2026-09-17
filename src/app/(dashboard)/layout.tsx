import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell"; // 🔴 Panggil pembungkusnya

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Proteksi ekstra: Jika tidak ada sesi, kembalikan ke login
  if (!session) {
    redirect("/login");
  }

  // Siapkan data user untuk dikirim ke Sidebar
  const userData = {
    name: session.user.name || "Pengguna",
    role: session.user.role || "PEGAWAI",
    nik: session.user.nik || "-",
  };

  return (
    // Membungkus anak (children) menggunakan Client Component agar bisa dianimasikan
    <DashboardShell user={userData}>
      {children}
    </DashboardShell>
  );
}