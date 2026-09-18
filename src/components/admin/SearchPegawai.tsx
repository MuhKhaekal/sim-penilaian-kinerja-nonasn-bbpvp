"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SearchPegawaiProps {
  placeholder: string;
}

export default function SearchPegawai({
  placeholder,
}: SearchPegawaiProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("query") ?? ""
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentQuery = searchParams.get("query") ?? "";

      // Tidak melakukan navigasi jika query belum berubah
      if (searchTerm.trim() === currentQuery) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      params.set("page", "1");

      if (searchTerm.trim()) {
        params.set("query", searchTerm.trim());
      } else {
        params.delete("query");
      }

      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:w-80">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 11-14 0z"
          />
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
