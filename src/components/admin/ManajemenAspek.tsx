"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { tambahAspek, hapusAspek, updateAspek } from "@/lib/actions/aspek";
import { useRouter } from "next/navigation";

export type RubrikProps = {
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

type ToastType = "success" | "error";

type ToastState = {
  show: boolean;
  type: ToastType;
  title: string;
  message: string;
};

export default function ManajemenAspek({ initialData }: { initialData: RubrikProps[] }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const router = useRouter();

  /**
   * Menampilkan toast
   */
  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({
      show: true,
      type,
      title,
      message,
    });
  };

  /**
   * Menutup toast secara manual
   */
  const closeToast = () => {
    setToast((prev) => ({
      ...prev,
      show: false,
    }));
  };

  /**
   * Toast otomatis hilang setelah 3.5 detik
   */
  useEffect(() => {
    if (!toast.show) return;

    const timer = window.setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [toast.show]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleBatalEdit = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const isEdit = editingId !== null;

    try {
      const res = isEdit ? await updateAspek(editingId, formData) : await tambahAspek(formData);

      if (res.success) {
        setFormData(INITIAL_FORM_DATA);
        setEditingId(null);

        showToast("success", isEdit ? "Berhasil Diperbarui" : "Berhasil Ditambahkan", isEdit ? "Data rubrik berhasil diperbarui." : "Aspek dan rubrik baru berhasil ditambahkan.");

        router.refresh();
      } else {
        showToast("error", "Gagal Menyimpan", res.message || "Terjadi kesalahan saat menyimpan data.");
      }
    } catch (error) {
      console.error("Error handleSubmit:", error);

      showToast("error", "Terjadi Kesalahan", "Terjadi kesalahan teknis saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHapus = async (id: number, namaAspek: string) => {
    const confirmed = window.confirm(`Perhatian: Yakin ingin menghapus aspek "${namaAspek}"?\n\nTindakan ini tidak dapat dibatalkan.`);

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const res = await hapusAspek(id);

      if (res.success) {
        if (editingId === id) {
          handleBatalEdit();
        }

        showToast("success", "Berhasil Dihapus", `Aspek "${namaAspek}" berhasil dihapus dari sistem.`);

        router.refresh();
      } else {
        showToast("error", "Gagal Menghapus", res.message || "Data tidak dapat dihapus.");
      }
    } catch (error) {
      console.error("Error handleHapus:", error);

      showToast("error", "Terjadi Kesalahan", "Terjadi kesalahan teknis saat menghapus data.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toast dibuat menggunakan React Portal.
   *
   * Dengan cara ini toast langsung ditempatkan di document.body,
   * sehingga tidak terpengaruh oleh parent/container halaman,
   * termasuk ketika halaman sedang di-scroll sampai paling bawah.
   */
  const toastElement =
    typeof document !== "undefined" && toast.show
      ? createPortal(
          <div className="fixed top-5 right-5 z-[99999] w-[calc(100%-2rem)] sm:w-[420px]" role="alert" aria-live="polite">
            <div className={`relative overflow-hidden rounded-2xl border bg-white shadow-2xl transition-all duration-300 ${toast.type === "success" ? "border-green-200" : "border-red-200"}`}>
              <div className="flex items-start gap-4 p-4">
                {/* ICON */}
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${toast.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {toast.type === "success" ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                {/* TEXT */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={`text-sm font-black ${toast.type === "success" ? "text-green-700" : "text-red-700"}`}>{toast.title}</p>

                  <p className="mt-1 text-xs font-medium text-gray-500 leading-relaxed">{toast.message}</p>
                </div>

                {/* CLOSE BUTTON */}
                <button type="button" onClick={closeToast} className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Tutup notifikasi">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* PROGRESS BAR */}
              <div
                key={`${toast.type}-${toast.title}-${toast.message}`}
                className={`absolute bottom-0 left-0 h-1 ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                style={{
                  width: "100%",
                  animation: "toastProgress 3.5s linear forwards",
                }}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {toastElement}

      <div className="space-y-8 mt-6">
        {/* =========================================================
            FORM INPUT & EDIT
        ========================================================== */}
        <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-all duration-300 ${editingId ? "bg-yellow-50/50 border-yellow-300 ring-4 ring-yellow-50" : "bg-white border-gray-100"}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg text-white font-bold shadow-sm ${editingId ? "bg-yellow-500" : "bg-[#003366]"}`}>
                {editingId ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>

              <div>
                <h3 className={`text-xl font-black tracking-tight ${editingId ? "text-yellow-800" : "text-[#003366]"}`}>{editingId ? "Edit Parameter Rubrik" : "Tambah Aspek Baru"}</h3>

                <p className="text-sm font-medium text-gray-500 mt-0.5">Lengkapi kriteria penilaian dari tertinggi hingga terendah.</p>
              </div>
            </div>

            {editingId && (
              <span className="flex items-center gap-1.5 text-xs font-bold bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                Mode Edit Aktif
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Judul Aspek Penilaian <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="nama_aspek"
                required
                value={formData.nama_aspek}
                onChange={handleInputChange}
                placeholder="Contoh: Kualitas Kerja / Kedisiplinan / Tanggung Jawab"
                className="w-full rounded-xl border-gray-300 border px-4 py-3 text-sm text-gray-900 font-medium focus:border-[#003366] focus:ring-[#003366] bg-white shadow-sm transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-green-700 uppercase tracking-wider mb-2">
                  Istimewa <br />
                  <span className="text-[10px] font-medium text-green-600">(90-100)</span>
                </label>

                <textarea
                  name="istimewa"
                  required
                  rows={4}
                  value={formData.istimewa}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-green-200 bg-green-50/50 focus:bg-white focus:border-green-400 focus:ring-green-400 border p-3 text-xs font-medium text-gray-700 outline-none transition-all shadow-inner placeholder-green-200"
                  placeholder="Kriteria sangat melampaui standar..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                  Memuaskan <br />
                  <span className="text-[10px] font-medium text-blue-600">(75-89.99)</span>
                </label>

                <textarea
                  name="memuaskan"
                  required
                  rows={4}
                  value={formData.memuaskan}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-blue-200 bg-blue-50/50 focus:bg-white focus:border-blue-400 focus:ring-blue-400 border p-3 text-xs font-medium text-gray-700 outline-none transition-all shadow-inner placeholder-blue-200"
                  placeholder="Kriteria melampaui standar..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">
                  Cukup <br />
                  <span className="text-[10px] font-medium text-yellow-600">(60-74.99)</span>
                </label>

                <textarea
                  name="cukup"
                  required
                  rows={4}
                  value={formData.cukup}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-yellow-200 bg-yellow-50/50 focus:bg-white focus:border-yellow-400 focus:ring-yellow-400 border p-3 text-xs font-medium text-gray-700 outline-none transition-all shadow-inner placeholder-yellow-200"
                  placeholder="Kriteria sesuai standar minimum..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">
                  Buruk <br />
                  <span className="text-[10px] font-medium text-orange-600">(40-59.99)</span>
                </label>

                <textarea
                  name="buruk"
                  required
                  rows={4}
                  value={formData.buruk}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-orange-200 bg-orange-50/50 focus:bg-white focus:border-orange-400 focus:ring-orange-400 border p-3 text-xs font-medium text-gray-700 outline-none transition-all shadow-inner placeholder-orange-200"
                  placeholder="Kriteria di bawah standar..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                  Buruk Sekali <br />
                  <span className="text-[10px] font-medium text-red-600">(&lt; 40)</span>
                </label>

                <textarea
                  name="sangat_buruk"
                  required
                  rows={4}
                  value={formData.sangat_buruk}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border-red-200 bg-red-50/50 focus:bg-white focus:border-red-400 focus:ring-red-400 border p-3 text-xs font-medium text-gray-700 outline-none transition-all shadow-inner placeholder-red-200"
                  placeholder="Kriteria tidak dapat diterima..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-3 border-t border-gray-100">
              {editingId && (
                <button type="button" onClick={handleBatalEdit} disabled={isLoading} className="px-6 py-2.5 rounded-lg text-sm font-bold border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50">
                  Batal Edit
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-all transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:transform-none ${
                  editingId ? "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/30" : "bg-[#003366] hover:bg-[#002244] shadow-blue-900/30"
                }`}
              >
                {isLoading ? "Menyimpan Data..." : editingId ? "Update Rubrik" : "Simpan Aspek Baru"}
              </button>
            </div>
          </form>
        </div>

        {/* =========================================================
            DAFTAR TABEL RUBRIK
        ========================================================== */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-[1100px] border-collapse">
              <thead className="bg-[#003366]/5 border-b border-gray-200 text-[#003366]">
                <tr>
                  <th className="px-5 py-4 font-bold uppercase tracking-wider text-[11px] w-48">Aspek Penilaian</th>

                  <th className="px-3 py-4 font-bold uppercase tracking-wider text-[11px] text-green-700">Istimewa</th>

                  <th className="px-3 py-4 font-bold uppercase tracking-wider text-[11px] text-blue-700">Memuaskan</th>

                  <th className="px-3 py-4 font-bold uppercase tracking-wider text-[11px] text-yellow-700">Cukup</th>

                  <th className="px-3 py-4 font-bold uppercase tracking-wider text-[11px] text-orange-700">Buruk</th>

                  <th className="px-3 py-4 font-bold uppercase tracking-wider text-[11px] text-red-700">Buruk Sekali</th>

                  <th className="px-5 py-4 font-bold uppercase tracking-wider text-[11px] text-center w-28">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 align-top">
                {initialData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-3 text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        </div>

                        <p className="text-gray-500 font-bold text-base">Belum ada aspek yang ditambahkan.</p>

                        <p className="text-gray-400 text-sm mt-1">Gunakan formulir di atas untuk membuat rubrik baru.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  initialData.map((item) => (
                    <tr key={item.id} className={`transition-colors group ${editingId === item.id ? "bg-yellow-50/50" : "hover:bg-blue-50/30"}`}>
                      <td className="px-5 py-4">
                        <p className={`font-black text-sm ${editingId === item.id ? "text-yellow-800" : "text-gray-900"}`}>{item.nama_aspek}</p>
                      </td>

                      <td className="px-3 py-4 text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{item.istimewa}</td>

                      <td className="px-3 py-4 text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{item.memuaskan}</td>

                      <td className="px-3 py-4 text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{item.cukup}</td>

                      <td className="px-3 py-4 text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{item.buruk}</td>

                      <td className="px-3 py-4 text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{item.sangat_buruk}</td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => handleKlikEdit(item)}
                            disabled={isLoading}
                            className="flex justify-center items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg transition-all border border-blue-200"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleHapus(item.id, item.nama_aspek)}
                            disabled={isLoading}
                            className="flex justify-center items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg transition-all border border-red-200"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 01-1-1h-4a1 1 0 01-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================
            TOAST PROGRESS ANIMATION
        ========================================================== */}
        <style jsx>{`
          @keyframes toastProgress {
            from {
              width: 100%;
            }

            to {
              width: 0%;
            }
          }
        `}</style>
      </div>
    </>
  );
}
