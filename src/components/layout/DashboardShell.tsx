"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoutButton from "@/components/ui/LogoutButton";

type DashboardUser = {
  name: string;
  role: string;
  nik: string;
};

type NavLink = {
  name: string;
  href: string;
  icon: string;
};

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: DashboardUser;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isNavigating, startTransition] = useTransition();

  const pathname = usePathname();
  const router = useRouter();

  const navLinks: NavLink[] =
    user.role === "ADMIN"
      ? [
          {
            name: "Manajemen Pegawai",
            href: "/admin/pegawai",
            icon: "👥",
          },
          {
            name: "Aspek Penilaian",
            href: "/admin/aspek",
            icon: "📋",
          },
          {
            name: "Penilaian Bulanan",
            href: "/admin/penilaian",
            icon: "⭐",
          },
          {
            name: "Kelola Hari Libur",
            href: "/admin/hari-libur",
            icon: "🗓️",
          },
        ]
      : [
          {
            name: "Input Presensi",
            href: "/pegawai",
            icon: "📝",
          },
          {
            name: "Riwayat Bulanan",
            href: "/pegawai/riwayat",
            icon: "🕒",
          },
        ];

  /**
   * Navigasi menu sidebar
   *
   * useTransition digunakan agar loading mengikuti proses
   * navigasi React, bukan menggunakan timer manual.
   */
  const handleMenuClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    // Jika sedang berada di halaman yang sama,
    // tidak perlu melakukan navigasi lagi.
    if (pathname === href) {
      setIsSidebarOpen(false);
      return;
    }

    // Jika sedang melakukan navigasi,
    // cegah klik berulang.
    if (isNavigating) {
      return;
    }

    setIsSidebarOpen(false);

    startTransition(() => {
      router.push(href);
    });
  };

  /**
   * Menentukan menu aktif.
   */
  const isLinkActive = (href: string) => {
    if (href === "/pegawai" || href === "/admin") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  /**
   * Menentukan judul halaman pada header.
   */
  const currentPage =
    navLinks.find((link) => isLinkActive(link.href))?.name ||
    "Dasbor";

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden relative">
      {/* =========================================================
          LOADING NAVIGASI
      ========================================================== */}
      {isNavigating && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-fade-in-up">
            <svg
              className="animate-spin h-12 w-12 text-[#003366] mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-100"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>

            <h3 className="text-[#003366] font-bold text-lg tracking-wide">
              Memuat Halaman
            </h3>

            <p className="text-gray-500 text-xs mt-1 font-medium">
              Mohon tunggu sebentar...
            </p>
          </div>
        </div>
      )}

      {/* =========================================================
          ANIMATION & PRINT STYLE
      ========================================================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }

              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fade-up {
              animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            @media print {
              .no-print {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* =========================================================
          MOBILE OVERLAY
      ========================================================== */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#003366]/20 backdrop-blur-sm transition-opacity md:hidden no-print"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72
          bg-white border-r border-gray-200
          shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          no-print flex flex-col
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* HEADER SIDEBAR */}
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src="/logo-bbpvp-makassar.png"
              alt="Logo BBPVP"
              className="w-10 h-10 object-contain drop-shadow-sm"
              onError={(e) => {
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=SI&background=003366&color=fff&rounded=true&bold=true";
              }}
            />

            <div>
              <h1 className="text-lg font-black text-[#003366] tracking-tight leading-tight">
                SIM Kinerja
              </h1>

              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                BBPVP Makassar
              </p>
            </div>
          </div>
        </div>

        {/* MENU NAVIGASI */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Menu Utama
          </p>

          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) =>
                  handleMenuClick(e, link.href)
                }
                aria-disabled={isNavigating}
                className={`
                  group flex items-center gap-3
                  px-3 py-3 rounded-xl
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-50/80 text-[#003366] shadow-sm ring-1 ring-blue-100/50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                  ${
                    isNavigating
                      ? "cursor-wait"
                      : ""
                  }
                `}
              >
                <div
                  className={`
                    w-8 h-8 rounded-lg
                    flex items-center justify-center
                    text-lg transition-transform duration-200
                    ${
                      isActive
                        ? "bg-white shadow-sm border border-blue-100 scale-110"
                        : "bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:scale-110 group-hover:shadow-sm"
                    }
                  `}
                >
                  {link.icon}
                </div>

                <span
                  className={`text-sm ${
                    isActive
                      ? "font-bold"
                      : "font-medium"
                  }`}
                >
                  {link.name}
                </span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#003366]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:border-blue-100 transition-colors cursor-default">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#003366] to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
              {user.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user.name}
              </p>

              <p className="text-xs font-medium text-gray-500 truncate">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================
          KONTEN UTAMA
      ========================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 bg-white/70 backdrop-blur-lg border-b border-gray-200 shadow-sm z-30 no-print">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setIsSidebarOpen(true)
              }
              className="p-2.5 -ml-2 text-gray-600 hover:bg-gray-100 hover:text-[#003366] rounded-xl md:hidden transition-colors"
              aria-label="Buka menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <h2 className="hidden sm:block text-lg font-black text-[#003366] tracking-tight">
              {currentPage}
            </h2>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">
                {user.name}
              </p>

              <p className="text-xs font-medium text-gray-500">
                NIK: {user.nik}
              </p>
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            <LogoutButton />
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <div className="animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
