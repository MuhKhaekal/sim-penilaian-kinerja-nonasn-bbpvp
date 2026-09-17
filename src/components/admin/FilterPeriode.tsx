"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FilterPeriode({ defaultBulan, defaultTahun }: { defaultBulan: number; defaultTahun: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fungsi yang langsung berjalan begitu dropdown diubah nilainya
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);

    // Mengubah URL secara instan tanpa memuat ulang seluruh halaman (Soft Navigation)
    router.replace(`${pathname}?${params.toString()}`);
  };

  const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
      {/* Dropdown Bulan */}
      <div className="relative w-full sm:w-48">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <select
          defaultValue={defaultBulan}
          onChange={(e) => handleFilterChange("bulan", e.target.value)}
          className="block w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-bold text-[#003366] focus:border-[#003366] focus:ring-[#003366] transition-all shadow-sm cursor-pointer outline-none appearance-none"
        >
          {namaBulan.map((nama, index) => (
            <option key={index + 1} value={index + 1}>
              {nama}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Tahun */}
      <div className="relative w-full sm:w-32">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <select
          defaultValue={defaultTahun}
          onChange={(e) => handleFilterChange("tahun", e.target.value)}
          className="block w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-bold text-[#003366] focus:border-[#003366] focus:ring-[#003366] transition-all shadow-sm cursor-pointer outline-none appearance-none"
        >
          {[2024, 2025, 2026, 2027].map((th) => (
            <option key={th} value={th}>
              {th}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
