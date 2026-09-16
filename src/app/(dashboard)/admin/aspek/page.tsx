import { getDaftarAspek } from "@/lib/actions/aspek";
import ManajemenAspek from "@/components/admin/ManajemenAspek";

// Definisi tipe data agar TypeScript tidak protes (menghindari 'any')
type AspekT = {
  id: number;
  nama_aspek: string;
  keterangan: string;
  bobot: number;
};

export default async function AdminAspekPage() {
  // Mengambil data langsung dari server saat halaman dimuat
  const res = await getDaftarAspek();
  const daftarAspek = (res.data as AspekT[]) || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Aspek Penilaian</h2>
        <p className="text-gray-500 text-sm mt-1">Atur kriteria dan bobot penilaian yang akan digunakan untuk mengevaluasi kinerja pegawai Non-ASN. Pastikan total keseluruhan bobot mencapai angka 100%.</p>
      </div>

      {/* Komponen Form & Tabel Interaktif */}
      <ManajemenAspek initialData={daftarAspek} />
    </div>
  );
}
