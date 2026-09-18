"use client";

import { useState, useEffect } from "react";
import { isCutoffPassed } from "@/lib/utils";
import { simpanDataPresensi } from "@/lib/actions/presensi";

// ======================================================================
// 🔴 KONFIGURASI GEOFENCING (RADIUS LOKASI)
// ======================================================================
// Silakan ganti titik ini dengan titik persis Gedung Utama / Gerbang BBPVP
const KANTOR_LAT = -5.146279756520978; 
const KANTOR_LNG = 119.4602166571765;

// Batas toleransi radius dalam satuan METER
const RADIUS_MAKSIMAL = 200; 

// Rumus Haversine untuk menghitung jarak GPS ke Meter secara akurat
function hitungJarakMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius bumi dalam meter
  const p1 = lat1 * (Math.PI / 180);
  const p2 = lat2 * (Math.PI / 180);
  const dp = (lat2 - lat1) * (Math.PI / 180);
  const dl = (lon2 - lon1) * (Math.PI / 180);

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
}
// ======================================================================

export default function FormPresensi({ onSuccess }: { onSuccess?: () => void }) {
  const [koordinat, setKoordinat] = useState("Mendapatkan lokasi akurat...");
  const [jarak, setJarak] = useState<number | null>(null);
  const [isInRadius, setIsInRadius] = useState<boolean>(false);
  
  // Status default dibuat kosong agar pengguna WAJIB memilih dari opsi yang terbuka
  const [statusKehadiran, setStatusKehadiran] = useState(""); 
  
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
        // Opsi enableHighAccuracy: true memaksa HP/Laptop mencari sinyal GPS murni, bukan sekadar BTS internet
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setKoordinat(`${lat}, ${lng}`);
            
            // Hitung jarak saat koordinat didapatkan
            const jarakMeter = hitungJarakMeters(lat, lng, KANTOR_LAT, KANTOR_LNG);
            setJarak(Math.round(jarakMeter));
            
            // Cek apakah masuk area kantor
            setIsInRadius(jarakMeter <= RADIUS_MAKSIMAL);
          },
          (err) => {
            setKoordinat("Gagal: Izin GPS ditolak atau sinyal lemah.");
            setIsInRadius(false);
          },
          { enableHighAccuracy: true, maximumAge: 0 }
        );
      } else if (!navigator.geolocation) {
        setKoordinat("Browser Anda tidak mendukung fitur lokasi.");
        setIsInRadius(false);
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
      setPesan({ tipe: "error", teks: "Total ukuran file tidak boleh lebih dari 4MB agar server stabil." });
      e.target.value = "";
      return;
    }

    setFiles(selectedFiles);
    setPesan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    if (statusKehadiran === "") {
      setPesan({ tipe: "error", teks: "Silakan pilih Status Kehadiran terlebih dahulu." });
      return;
    }
    
    if (files.length === 0) {
      setPesan({ tipe: "error", teks: "Harap lampirkan minimal 1 bukti foto/dokumen." });
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
        
        if (onSuccess) {
          onSuccess();
        } else {
          setUraian("");
          setKendala("");
          setStatusKehadiran("");
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
        <label className="block text-sm font-bold text-gray-700 mb-1">Titik Koordinat & Pemindai Jarak</label>
        <input type="text" value={koordinat} readOnly className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 text-sm font-medium outline-none" />
        
        {/* Indikator Status Radius */}
        {jarak !== null && (
          <p className={`text-xs mt-2.5 font-bold flex items-center gap-1.5 ${isInRadius ? "text-green-600" : "text-red-500"}`}>
            {isInRadius ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            Anda berjarak {jarak} meter dari titik tengah kantor (Maksimal: {RADIUS_MAKSIMAL}m).
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Status Kehadiran <span className="text-red-500">*</span></label>
        <select 
          name="status_kehadiran" 
          required 
          value={statusKehadiran}
          onChange={(e) => setStatusKehadiran(e.target.value)}
          className={`w-full rounded-xl border px-4 py-3 text-sm font-medium focus:ring-[#003366] transition-all bg-gray-50 ${statusKehadiran === "" ? "text-gray-400 border-gray-300" : "text-gray-900 border-[#003366]"}`}
        >
          <option value="" disabled>-- Pilih Status Kehadiran --</option>
          
          {/* Opsi Hadir & Terlambat hanya aktif jika isInRadius === true */}
          <option value="Hadir" disabled={!isInRadius}>
            Hadir {!isInRadius ? `(Terkunci: Anda berada di luar jangkauan kantor)` : ""}
          </option>
          <option value="Terlambat" disabled={!isInRadius}>
            Terlambat {!isInRadius ? `(Terkunci: Anda berada di luar jangkauan kantor)` : ""}
          </option>
          
          <option value="Izin">Izin (Dari Luar Kantor)</option>
          <option value="Sakit">Sakit (Dari Luar Kantor)</option>
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
          Lampiran Bukti Kerja (Max 3 File, Total 4MB) <span className="text-red-500">*</span>
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
        <button type="submit" disabled={isLoading || jarak === null} className="w-full rounded-xl bg-[#003366] px-4 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#002244] disabled:bg-gray-400 transition-all transform hover:-translate-y-0.5">
          {isLoading ? "Mengunggah..." : jarak === null ? "Mencari Sinyal GPS..." : "Simpan Presensi Hari Ini"}
        </button>
      </div>
    </form>
  );
}