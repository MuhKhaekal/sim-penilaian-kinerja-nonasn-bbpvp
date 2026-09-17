"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchPegawai({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Menangkap kata kunci dari URL jika halaman di-refresh
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query")?.toString() || "");

  // Trik DEBOUNCE: Menunggu user selesai mengetik (300ms) sebelum mengubah URL
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      
      // Jika user mengetik, kembalikan halaman ke 1 dan set query
      params.set("page", "1"); 
      
      if (searchTerm) {
        params.set("query", searchTerm);
      } else {
        params.delete("query");
      }

      // Mengubah URL secara diam-diam tanpa memuat ulang halaman
      replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, replace, searchParams]);

  return (
    <div className="relative w-full sm:w-80">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 bg-gray-50 text-sm focus:bg-white focus:border-[#003366] focus:ring-[#003366] transition-all outline-none font-medium shadow-sm"
      />
    </div>
  );
}