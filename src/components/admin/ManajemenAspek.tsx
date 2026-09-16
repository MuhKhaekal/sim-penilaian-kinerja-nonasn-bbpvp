"use client";

import { useState } from "react";
import { tambahAspek, hapusAspek, updateAspek } from "@/lib/actions/aspek"; // 🔴 Import updateAspek
import { useRouter } from "next/navigation";

type RubrikProps = {
  id: number;
  nama_aspek: string;
  istimewa: string;
  memuaskan: string;
  cukup: string;
  buruk: string;
  sangat_buruk: string;
};

const INITIAL_FORM_DATA = {
  nama_aspek: "",
  istimewa: "",
  memuaskan: "",
  cukup: "",
  buruk: "",
  sangat_buruk: "",
};

export default function ManajemenAspek({ initialData }: { initialData: RubrikProps[] }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // 🔴 STATE BARU UNTUK MODE EDIT
  const [editingId, setEditingId] = useState<number | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔴 Fungsi saat tombol Edit di tabel diklik
  const handleKlikEdit = (item: RubrikProps) => {
    setEditingId(item.id);
    setFormData({
      nama_aspek: item.nama_aspek,
      istimewa: item.istimewa,
      memuaskan: item.memuaskan,
      cukup: item.cukup,
      buruk: item.buruk,
      sangat_buruk: item.sangat_buruk,
    });
    // Scroll otomatis ke atas (ke arah form)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔴 Fungsi untuk membatalkan mode edit
  const handleBatalEdit = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
  };

  // 🔴 Fungsi Submit sekarang memiliki 2 cabang: Tambah atau Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let res;
      if (editingId) {
        // Mode Update
        res = await updateAspek(editingId, formData);
      } else {
        // Mode Tambah Baru
        res = await tambahAspek(formData);
      }

      if (res.success) {
        setFormData(INITIAL_FORM_DATA);
        setEditingId(null); // Keluar dari mode edit setelah sukses
        router.refresh();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan teknis saat menyimpan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHapus = async (id: number, namaAspek: string) => {
    if (!window.confirm(`Yakin ingin menghapus rubrik "${namaAspek}"?`)) return;
    try {
      const res = await hapusAspek(id);
      if (res.success) {
        if (editingId === id) handleBatalEdit(); // Jika yg dihapus sedang diedit, reset form
        router.refresh();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Gagal menghapus data.");
    }
  };

  return (
    <div className="space-y-8 mt-6">
      {/* FORM INPUT & EDIT RUBRIK */}
      <div className={`p-6 rounded-xl border shadow-sm transition-colors ${editingId ? "bg-yellow-50 border-yellow-300" : "bg-white border-gray-200"}`}>
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
          <h3 className={`font-bold ${editingId ? "text-yellow-800" : "text-gray-800"}`}>{editingId ? "✏️ Edit Aspek & Rubrik Penilaian" : "Tambah Aspek & Rubrik Penilaian Baru"}</h3>
          {editingId && <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Mode Edit Aktif</span>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nama Aspek Penilaian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_aspek"
              required
              value={formData.nama_aspek}
              onChange={handleInputChange}
              placeholder="Contoh: Kualitas Kerja"
              className="w-full rounded-md border-gray-300 border p-2 text-sm focus:border-blue-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-green-600 mb-1">Istimewa (90-100)</label>
              <textarea name="istimewa" required rows={3} value={formData.istimewa} onChange={handleInputChange} className="w-full rounded-md border-green-200 bg-green-50 border p-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-600 mb-1">Memuaskan (75-89.99)</label>
              <textarea name="memuaskan" required rows={3} value={formData.memuaskan} onChange={handleInputChange} className="w-full rounded-md border-blue-200 bg-blue-50 border p-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-yellow-600 mb-1">Cukup (60-74.99)</label>
              <textarea name="cukup" required rows={3} value={formData.cukup} onChange={handleInputChange} className="w-full rounded-md border-yellow-200 bg-yellow-50 border p-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-orange-600 mb-1">Buruk (40-59.99)</label>
              <textarea name="buruk" required rows={3} value={formData.buruk} onChange={handleInputChange} className="w-full rounded-md border-orange-200 bg-orange-50 border p-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-red-600 mb-1">Buruk Sekali (&lt; 40)</label>
              <textarea name="sangat_buruk" required rows={3} value={formData.sangat_buruk} onChange={handleInputChange} className="w-full rounded-md border-red-200 bg-red-50 border p-2 text-xs" />
            </div>
          </div>

          <div className="flex justify-end pt-2 gap-3">
            {/* Tombol Batal Edit (Hanya muncul saat mode edit) */}
            {editingId && (
              <button type="button" onClick={handleBatalEdit} disabled={isLoading} className="px-6 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                Batal
              </button>
            )}
            <button type="submit" disabled={isLoading} className={`${editingId ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"} text-white px-6 py-2 rounded-md text-sm font-medium transition disabled:bg-gray-400`}>
              {isLoading ? "Menyimpan..." : editingId ? "Update Rubrik" : "Simpan Rubrik"}
            </button>
          </div>
        </form>
      </div>

      {/* TABEL DAFTAR RUBRIK */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-800">Daftar Aspek & Rubrik Penilaian</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-[1000px]">
            <thead className="bg-white border-b border-gray-100 text-gray-700 text-xs text-center">
              <tr>
                <th className="px-4 py-3 font-bold w-48 text-left">Aspek Penilaian</th>
                <th className="px-4 py-3 font-semibold bg-green-50">Istimewa</th>
                <th className="px-4 py-3 font-semibold bg-blue-50">Memuaskan</th>
                <th className="px-4 py-3 font-semibold bg-yellow-50">Cukup</th>
                <th className="px-4 py-3 font-semibold bg-orange-50">Buruk</th>
                <th className="px-4 py-3 font-semibold bg-red-50">Buruk Sekali</th>
                <th className="px-4 py-3 font-semibold w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 align-top">
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Belum ada data rubrik penilaian.
                  </td>
                </tr>
              ) : (
                initialData.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50 ${editingId === item.id ? "bg-yellow-50" : ""}`}>
                    <td className="px-4 py-3 font-bold text-gray-900">{item.nama_aspek}</td>
                    <td className="px-4 py-3 text-xs whitespace-pre-wrap">{item.istimewa}</td>
                    <td className="px-4 py-3 text-xs whitespace-pre-wrap">{item.memuaskan}</td>
                    <td className="px-4 py-3 text-xs whitespace-pre-wrap">{item.cukup}</td>
                    <td className="px-4 py-3 text-xs whitespace-pre-wrap">{item.buruk}</td>
                    <td className="px-4 py-3 text-xs whitespace-pre-wrap">{item.sangat_buruk}</td>
                    <td className="px-4 py-3 text-center space-y-2">
                      {/* 🔴 Tombol EDIT ditambahkan */}
                      <button onClick={() => handleKlikEdit(item)} className="block w-full text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition border border-blue-200">
                        Edit
                      </button>
                      <button onClick={() => handleHapus(item.id, item.nama_aspek)} className="block w-full text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition border border-red-200">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
