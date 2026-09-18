"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  tambahHariLibur,
  hapusHariLibur,
  editHariLibur,
} from "@/lib/actions/libur";

type HariLiburT = {
  id: string;
  tanggal: string;
  keterangan: string;
};

type ToastType = "success" | "error";

type ToastState = {
  show: boolean;
  type: ToastType;
  title: string;
  message: string;
};

type ManajemenHariLiburProps = {
  initialData: HariLiburT[];
  tahunFilter: string;
  dataEdit: HariLiburT | null;
};

const INITIAL_TOAST: ToastState = {
  show: false,
  type: "success",
  title: "",
  message: "",
};

export default function ManajemenHariLibur({
  initialData,
  tahunFilter,
  dataEdit,
}: ManajemenHariLiburProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const [toast, setToast] = useState<ToastState>(INITIAL_TOAST);

  /**
   * Menampilkan toast
   */
  const showToast = (
    type: ToastType,
    title: string,
    message: string
  ) => {
    setToast({
      show: true,
      type,
      title,
      message,
    });
  };

  /**
   * Menutup toast
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

  /**
   * Submit tambah / edit hari libur
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const isEdit = dataEdit !== null;

    try {
      if (isEdit) {
        await editHariLibur(formData);

        showToast(
          "success",
          "Berhasil Diperbarui",
          "Data hari libur berhasil diperbarui."
        );
      } else {
        await tambahHariLibur(formData);

        showToast(
          "success",
          "Berhasil Ditambahkan",
          "Hari libur baru berhasil ditambahkan."
        );
      }

      /**
       * Jika sedang edit, kembalikan URL ke mode tambah.
       * Filter tahun tetap dipertahankan.
       */
      if (isEdit) {
        router.push(`/admin/hari-libur?tahun=${tahunFilter}`);
      }

      router.refresh();
    } catch (error) {
      console.error("Error handleSubmit:", error);

      showToast(
        "error",
        "Terjadi Kesalahan",
        isEdit
          ? "Data hari libur gagal diperbarui."
          : "Hari libur gagal ditambahkan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Menghapus hari libur
   */
  const handleHapus = async (
    id: string,
    keterangan: string
  ) => {
    const confirmed = window.confirm(
      `Perhatian: Yakin ingin menghapus hari libur "${keterangan}"?\n\nTindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      await hapusHariLibur(id);

      showToast(
        "success",
        "Berhasil Dihapus",
        `Hari libur "${keterangan}" berhasil dihapus dari sistem.`
      );

      /**
       * Jika data yang dihapus sedang diedit,
       * kembali ke mode tambah.
       */
      if (dataEdit?.id === id) {
        router.push(`/admin/hari-libur?tahun=${tahunFilter}`);
      }

      router.refresh();
    } catch (error) {
      console.error("Error handleHapus:", error);

      showToast(
        "error",
        "Gagal Menghapus",
        "Data hari libur gagal dihapus."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toast menggunakan React Portal.
   *
   * Toast langsung ditempatkan di document.body sehingga
   * tidak terpengaruh oleh posisi scroll atau container parent.
   */
  const toastElement =
    typeof document !== "undefined" && toast.show
      ? createPortal(
          <div
            className="fixed top-5 right-5 z-[99999] w-[calc(100%-2rem)] sm:w-[420px]"
            role="alert"
            aria-live="polite"
          >
            <div
              className={`relative overflow-hidden rounded-2xl border bg-white shadow-2xl ${
                toast.type === "success"
                  ? "border-green-200"
                  : "border-red-200"
              }`}
            >
              <div className="flex items-start gap-4 p-4">
                {/* ICON */}
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                    toast.type === "success"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {toast.type === "success" ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>

                {/* TEXT */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p
                    className={`text-sm font-black ${
                      toast.type === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {toast.title}
                  </p>

                  <p className="mt-1 text-xs font-medium text-gray-500 leading-relaxed">
                    {toast.message}
                  </p>
                </div>

                {/* CLOSE */}
                <button
                  type="button"
                  onClick={closeToast}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Tutup notifikasi"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* PROGRESS BAR */}
              <div
                key={`${toast.type}-${toast.title}-${toast.message}`}
                className={`absolute bottom-0 left-0 h-1 ${
                  toast.type === "success"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: "100%",
                  animation:
                    "toastProgress 3.5s linear forwards",
                }}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {toastElement}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* =========================================================
            FORM TAMBAH / EDIT LIBUR
        ========================================================== */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-800">
                {dataEdit
                  ? "Edit Hari Libur"
                  : "Tambah Hari Libur"}
              </h3>

              {dataEdit && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full">
                  Mode Edit
                </span>
              )}
            </div>

            {dataEdit && (
              <input
                type="hidden"
                name="id"
                value={dataEdit.id}
              />
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Tanggal
              </label>

              <input
                type="date"
                name="tanggal"
                defaultValue={
                  dataEdit ? dataEdit.tanggal : ""
                }
                required
                disabled={isLoading}
                className="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-[#003366] focus:ring-[#003366] disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Keterangan
              </label>

              <input
                type="text"
                name="keterangan"
                defaultValue={
                  dataEdit ? dataEdit.keterangan : ""
                }
                required
                disabled={isLoading}
                placeholder="Contoh: Idul Fitri"
                className="w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900 focus:border-[#003366] focus:ring-[#003366] disabled:opacity-60"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {dataEdit && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    router.push(
                      `/admin/hari-libur?tahun=${tahunFilter}`
                    )
                  }
                  className="w-full flex justify-center items-center bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#003366] text-white py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#002244] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Menyimpan..."
                  : dataEdit
                    ? "Simpan Perubahan"
                    : "Simpan Tanggal"}
              </button>
            </div>
          </form>
        </div>

        {/* =========================================================
            KONTEN TABEL & FILTER
        ========================================================== */}
        <div className="lg:col-span-2 space-y-4">
          {/* FILTER TAHUN */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-gray-800">
              Daftar Hari Libur
            </h3>

            <form
              method="GET"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <select
                name="tahun"
                defaultValue={tahunFilter}
                disabled={isLoading}
                className="w-full sm:w-auto rounded-lg border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-[#003366] focus:ring-[#003366] outline-none disabled:opacity-60"
              >
                <option value="semua">
                  Semua Tahun
                </option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#003366] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-[#002244] transition-all disabled:bg-gray-400"
              >
                Filter
              </button>
            </form>
          </div>

          {/* TABEL */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 border-collapse">
                <thead className="bg-[#003366]/5 border-b border-gray-200 text-[#003366]">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs min-w-[180px]">
                      Tanggal
                    </th>

                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">
                      Keterangan
                    </th>

                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs min-w-[120px] text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {initialData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-10 text-center text-gray-500 font-medium"
                      >
                        Belum ada data hari libur yang
                        didaftarkan pada tahun ini.
                      </td>
                    </tr>
                  ) : (
                    initialData.map((libur) => (
                      <tr
                        key={libur.id}
                        className={`transition-colors ${
                          dataEdit?.id === libur.id
                            ? "bg-blue-50/50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                          {new Date(
                            libur.tanggal
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-700">
                          {libur.keterangan}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* EDIT */}
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() =>
                                router.push(
                                  `/admin/hari-libur?tahun=${tahunFilter}&edit=${libur.id}`
                                )
                              }
                              className="text-blue-500 hover:text-white hover:bg-blue-500 bg-blue-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                              title="Edit Hari Libur"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>

                            {/* HAPUS */}
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() =>
                                handleHapus(
                                  libur.id,
                                  libur.keterangan
                                )
                              }
                              title="Hapus"
                              className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
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
        </div>

        {/* TOAST PROGRESS ANIMATION */}
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

