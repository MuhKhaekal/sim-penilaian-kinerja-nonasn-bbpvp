import { getHariLibur } from "@/lib/actions/libur";
import ManajemenHariLibur from "@/components/admin/ManajemenHariLibur";

type HariLiburT = {
  id: string;
  tanggal: string;
  keterangan: string;
};

export default async function HariLiburAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    edit?: string;
    tahun?: string;
  }>;
}) {
  const params = await searchParams;

  // Tahun default mengikuti tahun berjalan
  const currentYear = new Date().getFullYear().toString();
  const tahunFilter = params.tahun || currentYear;

  // Ambil data sesuai filter tahun
  const res = await getHariLibur(tahunFilter);
  const daftarLibur = (res.data as HariLiburT[]) || [];

  // Cari data yang sedang diedit
  const editId = params.edit;
  const dataEdit = editId
    ? daftarLibur.find((item) => item.id === editId) ?? null
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* HEADER */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#003366]" />

        <div className="pl-2">
          <h2 className="text-2xl font-black text-[#003366] tracking-tight">
            Manajemen Hari Libur
          </h2>

          <p className="text-gray-500 text-sm mt-1 font-medium">
            Atur kalender libur nasional dan cuti bersama instansi.
          </p>
        </div>
      </div>

      <ManajemenHariLibur
        initialData={daftarLibur}
        tahunFilter={tahunFilter}
        dataEdit={dataEdit}
      />
    </div>
  );
}
