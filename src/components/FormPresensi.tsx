"use client";

import { useState, useEffect } from "react";
import { isCutoffPassed } from "@/lib/utils";
import { simpanDataPresensi } from "@/lib/actions/presensi";

// 🔴 PERBAIKAN 1: Tambahkan prop onSuccess
export default function FormPresensi({ onSuccess }: { onSuccess?: () => void }) {
  const [koordinat, setKoordinat] = useState("Mendapatkan lokasi...");
  const [statusKehadiran, setStatusKehadiran] = useState("Hadir");
  const [uraian, setUraian] = useState("");
  const [kendala, setKendala] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

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
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 3) {
      setPesan({ tipe: "error", teks: "Maksimal hanya 3 file." });
      e.target.value = "";
      return;
    }

    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 4 * 1024 * 1024) {
      setPesan({ tipe: "error", teks: "Total ukuran tidak boleh lebih dari 5MB." });
      e.target.value = "";
      return;
    }

    setFiles(selectedFiles);
    setPesan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (files.length === 0) {
      setPesan({ tipe: "error", teks: "Harap lampirkan minimal 1 bukti." });
      return;
    }

    setIsLoading(true);
    setPesan(null);

    try {
      const formData = new FormData();
      formData.append("koordinat", koordinat);
      formData.append("status_kehadiran", statusKehadiran);
      formData.append("uraian", uraian);
      formData.append("kendala", kendala);
      files.forEach((file) => formData.append("lampiran", file));

      const response = await simpanDataPresensi(formData);

      if (response.success) {
        setPesan({ tipe: "sukses", teks: "Berhasil! Presensi Anda hari ini telah tersimpan." });
        
        // 🔴 PERBAIKAN 2: Jika berhasil, laporkan ke Dasbor agar form langsung dikunci!
        if (onSuccess) {
          onSuccess();
        } else {
          setUraian("");
          setKendala("");
          setStatusKehadiran("Hadir");
          setFiles([]);
        }
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
      <div className="rounded-2xl bg-red-50 p-8 border border-red-200 text-center shadow-sm">
        <h3 className="text-red-700 font-bold text-lg">Form Terkunci</h3>
        <p className="text-red-600 mt-2">Batas waktu pengisian presensi harian telah terlewati.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm animate-fade-in-up">
      <h3 className="text-xl font-bold text-[#003366] border-b border-gray-100 pb-4">Form Presensi Hari Ini</h3>
      
      {pesan && <div className={`p-4 rounded-xl text-sm border font-medium ${pesan.tipe === "sukses" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{pesan.teks}</div>}

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Titik Koordinat (Otomatis)</label>
        <input type="text" value={koordinat} readOnly className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 text-sm font-medium outline-none" />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Status Kehadiran</label>
        <select 
          name="status_kehadiran" 
          required 
          value={statusKehadiran}
          onChange={(e) => setStatusKehadiran(e.target.value)}
          className="w-full rounded-xl border-gray-300 border px-4 py-3 text-sm font-medium text-gray-900 focus:border-[#003366] focus:ring-[#003366] transition-all bg-gray-50"
        >
          <option value="Hadir">Hadir</option>
          <option value="Terlambat">Terlambat</option>
          <option value="Izin">Izin</option>
          <option value="Sakit">Sakit</option>
          <option value="Alfa">Alfa / Mangkir</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Uraian Aktivitas Pekerjaan <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={uraian}
          onChange={(e) => setUraian(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 font-medium focus:bg-white focus:border-[#003366] focus:ring-[#003366] transition-all"
          placeholder="Jelaskan secara singkat apa yang Anda kerjakan hari ini..."
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Kendala yang Dialami (Opsional)</label>
        <textarea
          rows={2}
          value={kendala}
          onChange={(e) => setKendala(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-gray-50 text-gray-900 px-4 py-3 text-sm font-medium focus:bg-white focus:border-[#003366] focus:ring-[#003366] transition-all"
          placeholder="Apakah ada hambatan dalam penyelesaian tugas?"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Lampiran Bukti Kerja (Max 3 File, Total 5MB) <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          multiple
          required
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-[#003366] hover:file:bg-blue-100 transition-colors cursor-pointer"
        />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-[#003366] px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#002244] disabled:bg-gray-400 transition-all transform hover:-translate-y-0.5">
          {isLoading ? "Mengunggah..." : "Simpan Presensi Hari Ini"}
        </button>
      </div>
    </form>
  );
}