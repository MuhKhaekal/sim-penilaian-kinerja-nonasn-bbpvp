"use client";

import { useMemo, useState } from "react";

type RiwayatAktivitasT = {
  id: string | number;
  tanggal: string | Date;
  uraian_aktivitas: string;
  kendala?: string | null;
  titik_koordinat?: string;
  lampiran: string | string[];
  status_kehadiran?: string;
};

type Props = {
  riwayatHarian: RiwayatAktivitasT[];
  bulan: number;
  tahun: number;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  hadir: {
    label: "Hadir",
    color: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  terlambat: {
    label: "Terlambat",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-500",
  },
  izin: {
    label: "Izin",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  sakit: {
    label: "Sakit",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  alfa: {
    label: "Alfa",
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

function getDateKey(value: string | Date): string {
  // Hindari perubahan tanggal akibat parsing timezone
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatus(status?: string) {
  const normalized = (status || "hadir").toLowerCase().trim();

  if (normalized.includes("telat") || normalized === "terlambat") {
    return "terlambat";
  }

  if (normalized === "izin") return "izin";
  if (normalized === "sakit") return "sakit";

  if (normalized === "alfa" || normalized.includes("mangkir")) {
    return "alfa";
  }

  return "hadir";
}

function parseLampiran(lampiran: string | string[]): string[] {
  if (Array.isArray(lampiran)) return lampiran;

  if (!lampiran) return [];

  try {
    const parsed: unknown = JSON.parse(lampiran);

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }

    return [];
  } catch {
    return [];
  }
}

function formatTanggal(dateKey: string) {
  // Buat tanggal lokal, bukan UTC
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function KalenderPresensi({ riwayatHarian, bulan, tahun }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const tanggalPertama = [...riwayatHarian]
      .sort((a, b) => getDateKey(a.tanggal).localeCompare(getDateKey(b.tanggal)))
      .find((item) => {
        const [year, month] = getDateKey(item.tanggal).split("-").map(Number);

        return year === tahun && month === bulan;
      });

    return tanggalPertama ? getDateKey(tanggalPertama.tanggal) : null;
  });

  const aktivitasPerTanggal = useMemo(() => {
    const map = new Map<string, RiwayatAktivitasT[]>();

    riwayatHarian.forEach((item) => {
      const key = getDateKey(item.tanggal);
      const daftar = map.get(key) || [];

      daftar.push(item);
      map.set(key, daftar);
    });

    return map;
  }, [riwayatHarian]);

  const jumlahHari = new Date(tahun, bulan, 0).getDate();

  // JavaScript: 0 = Minggu, 6 = Sabtu
  const hariPertama = new Date(tahun, bulan - 1, 1).getDay();

  const tanggalTerpilih = selectedDate ? aktivitasPerTanggal.get(selectedDate) || [] : [];

  const jumlahAktivitasBulan = riwayatHarian.filter((item) => {
    const [year, month] = getDateKey(item.tanggal).split("-").map(Number);

    return year === tahun && month === bulan;
  }).length;

  return (
    <div className="space-y-6">
      {/* KALENDER */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900">Kalender Presensi</h3>
            <p className="mt-1 text-sm text-gray-500">Pilih tanggal untuk melihat detail aktivitas pegawai.</p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-[#003366]">{new Date(tahun, bulan - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((hari, index) => (
              <div key={hari} className={`py-2 text-center text-xs font-black uppercase tracking-wide sm:text-sm ${index === 0 || index === 6 ? "text-red-500" : "text-gray-500"}`}>
                <span className="sm:hidden">{hari.slice(0, 1)}</span>
                <span className="hidden sm:inline">{hari}</span>
              </div>
            ))}

            {Array.from({ length: hariPertama }, (_, index) => (
              <div key={`kosong-${index}`} aria-hidden="true" className="min-h-[64px] rounded-xl bg-gray-50/50 sm:min-h-[92px]" />
            ))}

            {Array.from({ length: jumlahHari }, (_, index) => {
              const nomorHari = index + 1;

              const dateKey = [tahun, String(bulan).padStart(2, "0"), String(nomorHari).padStart(2, "0")].join("-");

              const daftarAktivitas = aktivitasPerTanggal.get(dateKey) || [];

              const statusUnik = [...new Set(daftarAktivitas.map((item) => getStatus(item.status_kehadiran)))];

              const isSelected = selectedDate === dateKey;

              const dayOfWeek = (hariPertama + index) % 7;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  aria-pressed={isSelected}
                  aria-label={`${nomorHari} ${formatTanggal(dateKey)}${statusUnik.length ? `, status ${statusUnik.map((status) => STATUS_CONFIG[status].label).join(", ")}` : ", belum ada data presensi"}`}
                  className={`flex min-h-[64px] flex-col items-center justify-start gap-1.5 rounded-xl border p-1.5 transition-all hover:border-blue-300 hover:bg-blue-50 sm:min-h-[92px] sm:gap-2 sm:p-3 ${
                    isSelected ? "border-[#003366] bg-blue-50 ring-2 ring-blue-100" : daftarAktivitas.length ? "border-gray-200 bg-white" : "border-transparent bg-gray-50/70"
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold sm:h-9 sm:w-9 sm:text-base ${isSelected ? "bg-[#003366] text-white" : isWeekend ? "text-red-500" : "text-gray-700"}`}>{nomorHari}</span>

                  {/* Indikator status tepat di bawah nomor tanggal */}
                  <div className="flex min-h-2 flex-wrap items-center justify-center gap-1">
                    {statusUnik.map((status) => (
                      <span key={status} title={STATUS_CONFIG[status].label} aria-label={STATUS_CONFIG[status].label} className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${STATUS_CONFIG[status].dot}`} />
                    ))}
                  </div>

                  {daftarAktivitas.length > 0 && <span className="hidden text-[10px] font-semibold text-gray-500 sm:block">{daftarAktivitas.length} aktivitas</span>}
                </button>
              );
            })}
          </div>

          {/* LEGENDA */}
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-3 border-t border-gray-100 pt-5">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                <span className="text-xs font-medium text-gray-600">{config.label}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-gray-400">Setiap titik menunjukkan status yang tercatat pada tanggal tersebut. Jika ada beberapa aktivitas dengan status berbeda, semua indikator status akan ditampilkan.</p>
        </div>
      </section>

      {/* DETAIL TANGGAL YANG DIPILIH */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-black text-gray-900">Detail Presensi Harian</h3>
            <p className="mt-1 text-sm text-gray-500">{selectedDate ? formatTanggal(selectedDate) : "Pilih tanggal pada kalender"}</p>
          </div>

          <span className="w-fit rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600">{tanggalTerpilih.length} aktivitas</span>
        </div>

        {!selectedDate ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-gray-700">Belum ada tanggal yang dipilih</p>
            <p className="mt-1 text-sm text-gray-500">Pilih tanggal di kalender untuk melihat detail presensi.</p>
          </div>
        ) : tanggalTerpilih.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
              </svg>
            </div>

            <p className="font-bold text-gray-700">Tidak ada data aktivitas</p>
            <p className="mt-1 text-sm text-gray-500">Tidak ditemukan aktivitas yang tercatat pada tanggal ini. Ini tidak otomatis berarti pegawai berstatus alfa.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tanggalTerpilih.map((item) => {
              const statusKey = getStatus(item.status_kehadiran);
              const config = STATUS_CONFIG[statusKey];
              const urls = parseLampiran(item.lampiran);

              return (
                <article key={item.id} className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Status Kehadiran</p>
                      <span className={`mt-2 inline-flex rounded-lg border px-3 py-1.5 text-xs font-bold ${config.color}`}>
                        <span className={`mr-2 mt-1 h-2 w-2 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-gray-400">ID aktivitas: {item.id}</span>
                  </div>

                  <div>
                    <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-500">Uraian Aktivitas</h4>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{item.uraian_aktivitas || "Tidak ada uraian aktivitas."}</p>
                  </div>

                  {item.kendala && (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                      <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-red-600">Kendala / Hambatan</h4>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-red-800">{item.kendala}</p>
                    </div>
                  )}

                  {urls.length > 0 ? (
                    <div>
                      <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-gray-500">Lampiran Aktivitas</h4>

                      <div className="flex flex-wrap gap-2">
                        {urls.map((url, index) => (
                          <a
                            key={`${item.id}-${index}`}
                            href={`/api/berkas?url=${encodeURIComponent(url)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-[#003366] hover:text-white"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            File {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Tidak ada lampiran.</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-xs text-gray-400">Total {jumlahAktivitasBulan} aktivitas tercatat pada bulan ini.</p>
    </div>
  );
}
