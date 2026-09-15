import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Proteksi ekstra: Jika tidak ada sesi, kembalikan ke login
  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 shadow-sm hidden md:block">
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <h1 className="text-lg font-bold text-blue-700">SIM Kinerja</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {role === "ADMIN" ? (
              <>
                <Link href="/admin/pegawai" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  Manajemen Pegawai
                </Link>
                <Link href="/admin/aspek" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  Aspek Penilaian
                </Link>
                <Link href="/admin/penilaian" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  Penilaian Bulanan
                </Link>
              </>
            ) : (
              <>
                <Link href="/pegawai" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  Input Presensi
                </Link>
                <Link href="/pegawai/riwayat" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  Riwayat Bulanan
                </Link>
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 md:hidden">Menu</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500">
                {session.user.role} • {session.user.nik}
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
