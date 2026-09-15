"use client";

import { useState, useEffect } from "react";
import { isCutoffPassed } from "@/lib/utils";
import { simpanDataPresensi } from "@/lib/actions/presensi";

export default function FormPresensi() {
  const [koordinat, setKoordinat] = useState("Mendapatkan lokasi...");
  const [uraian, setUraian] = useState("");
  const [kendala, setKendala] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔴 TAMBAHKAN STATE INI UNTUK NOTIFIKASI
  const [pesan, setPesan] = useState<{ tipe: "sukses" | "error"; teks: string } | null>(null);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      const currentLockStatus = isCutoffPassed();
      setIsLocked(currentLockStatus);

      if (!currentLockStatus && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setKoordinat(`${pos.coords.latitude}, ${pos.coords.longitude}`),
          (err) => setKoordinat("Gagal mendapatkan lokasi. Pastikan izin GPS aktif."),
        );
      } else if (!navigator.geolocation) {
        setKoordinat("Browser tidak mendukung Geolocation.");
      }
    }, 0);

    return () => clearTimeout(initTimer);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (Logika file tetap sama seperti sebelumnya) ...
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 3) {
      setPesan({ tipe: "error", teks: "Maksimal hanya 3 file." });
      e.target.value = "";
      return;
    }

    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 5 * 1024 * 1024) {
      setPesan({ tipe: "error", teks: "Total ukuran tidak boleh lebih dari 5MB." });
      e.target.value = "";
      return;
    }

    setFiles(selectedFiles);
    setPesan(null); // Hapus pesan error saat file valid
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (files.length === 0) {
      setPesan({ tipe: "error", teks: "Harap lampirkan minimal 1 bukti." });
      return;
    }

    setIsLoading(true);
    setPesan(null); // Reset pesan sebelum memproses

    try {
      const formData = new FormData();
      formData.append("koordinat", koordinat);
      formData.append("uraian", uraian);
      formData.append("kendala", kendala);
      files.forEach((file) => formData.append("lampiran", file));

      const response = await simpanDataPresensi(formData);

      if (response.success) {
        // 🔴 TAMPILKAN PESAN SUKSES
        setPesan({ tipe: "sukses", teks: "Berhasil! Presensi Anda hari ini telah tersimpan." });
        setUraian("");
        setKendala("");
        setFiles([]);
      } else {
        setPesan({ tipe: "error", teks: response.message || "Gagal menyimpan data." });
      }
    } catch (error) {
      setPesan({ tipe: "error", teks: "Terjadi kesalahan koneksi saat mengunggah data." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLocked) {
    return (
      <div className="rounded-lg bg-red-50 p-6 border border-red-200 text-center">
        <h3 className="text-red-700 font-bold text-lg">Form Terkunci</h3>
        <p className="text-red-600 mt-2">Batas waktu pengisian presensi harian telah terlewati.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Form Presensi Hari Ini</h3>
      {pesan && <div className={`p-4 rounded-md text-sm border ${pesan.tipe === "sukses" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{pesan.teks}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Titik Koordinat (Otomatis)</label>
        <input type="text" value={koordinat} readOnly className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Uraian Aktivitas <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={uraian}
          onChange={(e) => setUraian(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Jelaskan pekerjaan Anda hari ini..."
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Kendala yang Dialami (Opsional)</label>
        <textarea
          rows={2}
          value={kendala}
          onChange={(e) => setKendala(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Apakah ada kendala?"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Lampiran Bukti Kerja (Max 3 File, Total Max 5MB) <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          multiple
          required
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <button type="submit" disabled={isLoading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
        {isLoading ? "Mengunggah Data..." : "Simpan Presensi"}
      </button>
    </form>
  );
}
