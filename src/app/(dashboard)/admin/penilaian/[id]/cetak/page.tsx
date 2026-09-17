import { getDetailPegawaiDanEvaluasi } from "@/lib/actions/penilaian";
import { getDaftarAspek } from "@/lib/actions/aspek";
import PrintButton from "@/components/admin/PrintButton";
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

  const sakit = detailNilai["sakit"] || "0";
  const izin = detailNilai["izin"] || "0";
  const terlambat = detailNilai["terlambat"] || "0";
  const alfa = detailNilai["alfa"] || "0";

  return (
    <div className="print-wrapper bg-gray-200 min-h-screen py-10 print:bg-white print:py-0 print:min-h-0 print:h-auto print:overflow-visible text-black">
      <style
        dangerouslySetInnerHTML={{
          __html: `
      @media print {

        @page {
          size: A4 landscape;
          margin: 12mm;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
          background: #fff !important;
        }

        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /*
         * ==========================================================
         * RESET SEMUA LELUHUR YANG BERPOTENSI MEMBATASI TINGGI/OVERFLOW
         * ==========================================================
         * Layout admin (sidebar + area konten scroll) biasanya memberi
         * tinggi tetap (h-screen) dan overflow-y-auto pada wrapper
         * konten. Saat dicetak, browser hanya akan mencetak apa yang
         * "muat" di dalam kotak tsb, sehingga halaman kedua dan area
         * tanda tangan ikut terpotong / hilang. Blok ini menetralkan
         * pembatasan tsb khusus untuk mode cetak.
         */

        body * {
          max-height: none !important;
        }

        body > div,
        #__next,
        #__next > div,
        main,
        [class*="overflow-y-auto"],
        [class*="overflow-y-scroll"],
        [class*="overflow-auto"],
        [class*="overflow-hidden"],
        [class*="h-screen"],
        [class*="max-h-screen"] {
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow: visible !important;
        }

        .no-print,
        button {
          display: none !important;
        }

        /*
         * ==========================================================
         * AREA CETAK
         * ==========================================================
         */

        #area-cetak {
          position: static !important;

          width: 100% !important;
          max-width: none !important;

          height: auto !important;
          min-height: 0 !important;

          margin: 0 !important;
          padding: 0 !important;

          overflow: visible !important;

          background: #fff !important;
          box-shadow: none !important;
        }

        /*
         * ==========================================================
         * HEADER
         * ==========================================================
         */

        .print-header {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /*
         * ==========================================================
         * WRAPPER TABEL
         * ==========================================================
         */

        .table-wrapper {
          display: block !important;

          width: 100% !important;
          height: auto !important;

          margin-top: 6mm !important;
          margin-bottom: 8mm !important;

          overflow: visible !important;

          break-inside: auto !important;
          page-break-inside: auto !important;
        }

        /*
         * ==========================================================
         * TABEL
         * ==========================================================
         */

        .print-table {
          display: table !important;

          width: 100% !important;
          height: auto !important;

          table-layout: fixed !important;

          /*
           * Gunakan collapse.
           * Lebih stabil untuk tabel multi-page.
           */
          border-collapse: separate !important;
          border-spacing: 0 !important;

          border: none !important;
          break-inside: auto !important;
          page-break-inside: auto !important;

          /*
           * Tabel harus boleh mengalir ke halaman berikutnya.
           */
          break-inside: auto !important;
          page-break-inside: auto !important;
        }

        /*
         * HEADER TABEL DIULANG SETIAP HALAMAN
         */

        .print-table thead {
          display: table-header-group !important;
        }

        .print-table tbody {
          display: table-row-group !important;
        }

        /*
         * ==========================================================
         * CELL
         * ==========================================================
         */

        .print-table th,
        .print-table td {
          border: none !important;
          box-shadow: inset 0 0 0 1px #000 !important;

          vertical-align: top !important;

          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /*
         * Jangan paksa setiap row tetap satu halaman.
         *
         * Ini penting.
         *
         * Karena isi cell panjang, browser perlu diberi
         * kebebasan menentukan pagination.
         */

        .print-table tr {
          break-inside: auto !important;
          page-break-inside: auto !important;
        }

        /*
         * Header tidak boleh dipotong.
         */

        .print-table thead tr {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        /*
         * ==========================================================
         * TANDA TANGAN
         * ==========================================================
         */

        .area-ttd {
          display: block !important;

          width: 100% !important;

          margin-top: 12mm !important;
          padding-right: 12mm !important;

          text-align: right !important;

          clear: both !important;

          position: relative !important;

          visibility: visible !important;

          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .area-ttd-inner {
          display: inline-block !important;

          width: 75mm !important;

          text-align: center !important;

          position: relative !important;

          visibility: visible !important;

          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .stamp-wrapper {
          display: block !important;

          width: 100% !important;
          height: 32mm !important;

          margin: 2mm 0 !important;

          position: relative !important;

          overflow: visible !important;

          text-align: center !important;
        }

        .stamp-image {
          display: block !important;

          position: static !important;

          width: auto !important;
          height: 30mm !important;

          max-width: 65mm !important;
          max-height: 32mm !important;

          margin: 0 auto !important;

          object-fit: contain !important;

          opacity: 0.9 !important;

          visibility: visible !important;

          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
        }}
      />

      {/* ================================================================
          KONTTAINER UTAMA
          ================================================================ */}
      <div
        id="area-cetak"
        className="
          max-w-[29.7cm]
          min-h-[21cm]
          mx-auto
          bg-white
          p-[1.5cm]
          shadow-lg
          print:max-w-none
          print:min-h-0
          print:p-0
          print:shadow-none
          text-[11px]
        "
      >
        {/* Tombol cetak */}
        <div className="flex justify-end mb-4 no-print">
          <PrintButton />
        </div>

        {/* ==============================================================
            JUDUL
            ============================================================== */}
        <div className="print-header text-center mb-6">
          <h3 className="text-lg font-bold uppercase underline">PENILAIAN KINERJA PEGAWAI NON PNS</h3>
        </div>

        {/* ==============================================================
            IDENTITAS PEGAWAI
            ============================================================== */}
        <div className="print-header mb-4">
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

          {/* ============================================================
              KEHADIRAN
              ============================================================ */}
          <div className="flex items-start gap-2 font-semibold mt-6">
            <span className="w-40 mt-1">KEHADIRAN PEGAWAI</span>

            <span className="mt-1">:</span>

            <div className="flex-1 grid grid-cols-4 gap-4 text-center ml-4">
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

        {/* ================================================================
            TABEL PENILAIAN
            ================================================================ */}
        <div className="table-wrapper mb-8 mt-6">
          <table className="print-table w-full text-[11px]">
            <thead>
              <tr className="bg-gray-100 print:bg-transparent text-center font-bold align-middle">
                <th className="px-1 py-2 w-8">NO</th>

                <th className="px-2 py-2 w-32">ASPEK PENILAIAN</th>

                <th className="px-2 py-2">
                  ISTIMEWA
                  <br />
                  90 - 100
                </th>

                <th className="px-2 py-2">
                  MEMUASKAN
                  <br />
                  75 – 89.99
                </th>

                <th className="px-2 py-2">
                  CUKUP
                  <br />
                  60 – 74.99
                </th>

                <th className="px-2 py-2">
                  BURUK
                  <br />
                  40 – 59.99
                </th>

                <th className="px-2 py-2">
                  BURUK SEKALI
                  <br />
                  &lt; 40
                </th>

                <th className="px-1 py-2 w-12">NILAI</th>
              </tr>
            </thead>

            <tbody className="align-top">
              {daftarRubrik.map((rubrik, index) => {
                const nilaiString = detailNilai[rubrik.nama_aspek] || "-";

                let skorAngka = "-";

                if (nilaiString === "Istimewa") {
                  skorAngka = "95";
                } else if (nilaiString === "Memuaskan") {
                  skorAngka = "85";
                } else if (nilaiString === "Cukup") {
                  skorAngka = "70";
                } else if (nilaiString === "Buruk") {
                  skorAngka = "50";
                } else if (nilaiString === "Sangat Buruk") {
                  skorAngka = "30";
                }

                return (
                  <tr key={rubrik.id}>
                    <td className="px-2 py-3 text-center">{index + 1}.</td>

                    <td className="px-2 py-3 font-bold">{rubrik.nama_aspek}</td>

                    <td className="px-2 py-3 text-justify leading-relaxed">{rubrik.istimewa}</td>

                    <td className="px-2 py-3 text-justify leading-relaxed">{rubrik.memuaskan}</td>

                    <td className="px-2 py-3 text-justify leading-relaxed">{rubrik.cukup}</td>

                    <td className="px-2 py-3 text-justify leading-relaxed">{rubrik.buruk}</td>

                    <td className="px-2 py-3 text-justify leading-relaxed">{rubrik.sangat_buruk}</td>

                    <td className="px-2 py-3 text-center font-bold text-sm align-middle">{skorAngka}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* ================================================================
            TANDA TANGAN
            ================================================================ */}
        <div className="flex justify-end mt-12 pr-12 text-[12px] area-ttd">
          <div className="area-ttd-inner text-center relative">
            <p className="mb-2">Mengetahui,</p>

            <p>Kepala Bagian BBPVP Makassar</p>

            <div className="h-16 my-1 flex items-center justify-center relative">
              <img
                src="/stempel-ttd.png"
                alt="Stempel"
                className="
                  stamp-image
                  absolute
                  h-36
                  opacity-90
                  object-contain
                  -ml-8
                "
              />
            </div>

            <p className="font-bold underline">Andi Mencen Ashar, S.T., M.T.</p>

            <p>NIP. 197703122009011007</p>
          </div>
        </div>
      </div>
    </div>
  );
}
