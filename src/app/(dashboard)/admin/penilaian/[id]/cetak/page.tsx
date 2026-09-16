import { getDetailPegawaiDanEvaluasi } from "@/lib/actions/penilaian";
import { getDaftarAspek } from "@/lib/actions/aspek";
import PrintButton from "@/components/admin/PrintButton";
import { getWitaDate } from "@/lib/utils";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
type RubrikT = {
  id: number;
  nama_aspek: string;
  istimewa: string;
  memuaskan: string;
  cukup: string;
  buruk: string;
  sangat_buruk: string;
};

export async function generateMetadata({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ bulan: string; tahun: string }> }): Promise<Metadata> {
  const { id: user_id } = await params;
  const { bulan, tahun } = await searchParams;

  const resDetail = await getDetailPegawaiDanEvaluasi(user_id, parseInt(bulan), parseInt(tahun));
  const namaPegawai = resDetail.data?.pegawai?.nama || "Pegawai";

  return {
    title: `${namaPegawai}_Laporan Kinerja Bulanan`,
  };
}

export default async function CetakPenilaianPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ bulan: string; tahun: string }> }) {
  const { id: user_id } = await params;
  const { bulan, tahun } = await searchParams;
  const numBulan = parseInt(bulan);
  const numTahun = parseInt(tahun);

  const [resDetail, resAspek] = await Promise.all([getDetailPegawaiDanEvaluasi(user_id, numBulan, numTahun), getDaftarAspek()]);

  const { pegawai, evaluasi } = resDetail.data || {};
  const daftarRubrik = (resAspek.data as RubrikT[]) || [];

  if (!pegawai || !evaluasi) {
    return <div className="p-10 text-center font-bold text-red-600">Data evaluasi belum tersedia. Harap simpan penilaian terlebih dahulu sebelum mencetak.</div>;
  }

  const detailNilai: Record<string, string> = evaluasi.detail_nilai || {};

  // 🔴 PERBAIKAN 2: Mengambil nilai kehadiran (Jika belum ada di DB, otomatis jadi "0")
  const sakit = detailNilai["sakit"] || "0";
  const izin = detailNilai["izin"] || "0";
  const terlambat = detailNilai["terlambat"] || "0";
  const alfa = detailNilai["alfa"] || "0";

  const today = getWitaDate();
  const tanggalCetak = today.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-gray-200 min-h-screen py-10 print:py-0 print:bg-white text-black">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          /* 🔴 PERBAIKAN 1: Margin 0 akan MEMAKSA browser menyembunyikan URL dan Tanggal bawaan! */
          @page { size: landscape; margin: 0; } 
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; margin: 0; }
          
          body * { visibility: hidden; }
          #area-cetak, #area-cetak * { visibility: visible; }
          
          /* Karena margin kertas 0, kita beri padding agar teks tidak menabrak ujung kertas */
          #area-cetak { position: absolute; left: 0; top: 0; width: 100vw; padding: 15mm !important; margin: 0 !important; }
        }
      `,
        }}
      />

      <div id="area-cetak" className="max-w-[29.7cm] min-h-[21cm] mx-auto bg-white p-[1.5cm] shadow-lg print:shadow-none print:p-0 relative text-[11px]">
        <div className="absolute top-4 right-4 print:hidden">
          <PrintButton />
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-bold uppercase underline">PENILAIAN KINERJA PEGAWAI NON PNS</h3>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 font-semibold">
            <div>
              <div className="flex">
                <span className="w-36">NAMA KARYAWAN</span>
                <span className="w-4">:</span>
                <span className="uppercase border-b border-dotted border-black flex-1">{pegawai.nama}</span>
              </div>
              <div className="flex mt-1">
                <span className="w-36">NIK</span>
                <span className="w-4">:</span>
                <span className="uppercase border-b border-dotted border-black flex-1">{pegawai.nik}</span>
              </div>
            </div>
            <div>
              <div className="flex">
                <span className="w-24">BAGIAN</span>
                <span className="w-4">:</span>
                <span className="uppercase border-b border-dotted border-black flex-1">{pegawai.bagian}</span>
              </div>
              <div className="flex mt-1">
                <span className="w-24">JABATAN</span>
                <span className="w-4">:</span>
                <span className="uppercase border-b border-dotted border-black flex-1">{pegawai.jabatan}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 font-semibold mt-6">
            <span className="w-40 mt-1">KEHADIRAN PEGAWAI</span>
            <span className="mt-1">:</span>
            <div className="flex-1 grid grid-cols-4 gap-4 text-center ml-4">
              {/* 🔴 Titik-titik diganti dengan variabel angka yang sesungguhnya */}
              <div>
                <p>SAKIT</p>
                <p className="mt-2 font-normal text-[10px]">{sakit} HARI/PERIODE</p>
              </div>
              <div>
                <p>IZIN</p>
                <p className="mt-2 font-normal text-[10px]">{izin} HARI/PERIODE</p>
              </div>
              <div>
                <p>TERLAMBAT</p>
                <p className="mt-2 font-normal text-[10px]">{terlambat} HARI/PERIODE</p>
              </div>
              <div>
                <p>ALFA/MANGKIR</p>
                <p className="mt-2 font-normal text-[10px]">{alfa} HARI/PERIODE</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 mt-6">
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100 print:bg-transparent text-center font-bold align-middle h-12">
                <th className="border border-black px-1 w-8">NO</th>
                <th className="border border-black px-2 w-32">ASPEK PENILAIAN</th>
                <th className="border border-black px-2">
                  ISTIMEWA
                  <br />
                  90 - 100
                </th>
                <th className="border border-black px-2">
                  MEMUASKAN
                  <br />
                  75 – 89.99
                </th>
                <th className="border border-black px-2">
                  CUKUP
                  <br />
                  60 – 74.99
                </th>
                <th className="border border-black px-2">
                  BURUK
                  <br />
                  40 – 59.99
                </th>
                <th className="border border-black px-2">
                  BURUK SEKALI
                  <br />
                  &lt; 40
                </th>
                <th className="border border-black px-1 w-12">NILAI</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {daftarRubrik.map((rubrik, index) => {
                const nilaiString = detailNilai[rubrik.nama_aspek] || "-";

                let skorAngka = "-";
                if (nilaiString === "Istimewa") skorAngka = "95";
                else if (nilaiString === "Memuaskan") skorAngka = "85";
                else if (nilaiString === "Cukup") skorAngka = "70";
                else if (nilaiString === "Buruk") skorAngka = "50";
                else if (nilaiString === "Sangat Buruk") skorAngka = "30";

                return (
                  <tr key={rubrik.id}>
                    <td className="border border-black px-2 py-3 text-center">{index + 1}.</td>
                    <td className="border border-black px-2 py-3 font-bold">{rubrik.nama_aspek}</td>
                    <td className="border border-black px-2 py-3 text-justify leading-relaxed">{rubrik.istimewa}</td>
                    <td className="border border-black px-2 py-3 text-justify leading-relaxed">{rubrik.memuaskan}</td>
                    <td className="border border-black px-2 py-3 text-justify leading-relaxed">{rubrik.cukup}</td>
                    <td className="border border-black px-2 py-3 text-justify leading-relaxed">{rubrik.buruk}</td>
                    <td className="border border-black px-2 py-3 text-justify leading-relaxed">{rubrik.sangat_buruk}</td>
                    <td className="border border-black px-2 py-3 text-center font-bold text-sm align-middle">{skorAngka}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-12 pr-12 text-[12px]">
          <div className="text-center relative">
            <p className="mb-2">Mengetahui,</p>
            <p>Kepala Bagian BBPVP Makassar</p>
            <div className="h-16 my-1 flex items-center justify-center relative">
              <img src="/stempel-ttd.png" alt="Stempel" className="absolute h-36 opacity-90 object-contain -ml-8" />
            </div>
            <p className="font-bold underline">Andi Mencen Ashar, S.T., M.T.</p>
            <p>NIP. 197703122009011007</p>
          </div>
        </div>
      </div>
    </div>
  );
}
