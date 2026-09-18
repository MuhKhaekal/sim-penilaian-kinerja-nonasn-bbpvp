"use client";

import { useState, useEffect, useCallback } from "react";
import FormPresensi from "@/components/FormPresensi";
import { checkDateStatus, getWitaDate } from "@/lib/utils";
import { getPresensiByDate } from "@/lib/actions/presensi";
import { getHariLibur } from "@/lib/actions/libur"; // 🔴 Import fungsi libur

type PastData = {
  status_verifikasi: string;
  status_kehadiran: string;
  uraian_aktivitas: string;
  kendala: string | null;
  lampiran: string[] | null;
};

type HariLiburT = {
  id: string;
  tanggal: string;
  keterangan: string;
};

const formatDateToYMD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};

export default function PegawaiDashboard() {
  const today = getWitaDate();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [currentMonthView, setCurrentMonthView] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [pastData, setPastData] = useState<PastData | null>(null);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  // 🔴 State baru untuk menyimpan daftar tanggal merah dari database
  const [daftarLibur, setDaftarLibur] = useState<string[]>([]);
  const [keteranganLibur, setKeteranganLibur] = useState<Record<string, string>>({});

  // Menarik data libur saat halaman pertama kali dimuat
  useEffect(() => {
    const fetchLibur = async () => {
      const res = await getHariLibur();
      if (res.success && res.data) {
        // 🔴 PERBAIKAN: Tampung dan cast res.data menjadi HariLiburT[]
        const dataLibur = res.data as HariLiburT[];

        const arrayTanggal = dataLibur.map((item) => item.tanggal);
        const mapKeterangan: Record<string, string> = {};

        dataLibur.forEach((item) => {
          mapKeterangan[item.tanggal] = item.keterangan;
        });

        setDaftarLibur(arrayTanggal);
        setKeteranganLibur(mapKeterangan);
      }
    };
    fetchLibur();
  }, []);

  const baseStatus = checkDateStatus(selectedDate);
  const dateYMD = formatDateToYMD(selectedDate);

  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
  const isNationalHoliday = daftarLibur.includes(dateYMD);
  const isOffDay = isWeekend || isNationalHoliday;

  let displayStatus = baseStatus;
  if (isOffDay) {
    displayStatus = "LIBUR";
  }

  const fetchPastData = useCallback(async () => {
    setIsLoadingPast(true);
    const response = await getPresensiByDate(dateYMD);
    setPastData(response.data as PastData);
    setIsLoadingPast(false);
  }, [selectedDate, dateYMD]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (baseStatus === "PAST" || baseStatus === "TODAY") {
        fetchPastData();
      } else {
        setPastData(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedDate, baseStatus, fetchPastData]);

  const nextMonth = () => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1));
  const goToToday = () => {
    setCurrentMonthView(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const daysInMonth = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 0).getDate();
  const startDayOfMonth = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth(), 1).getDay();

  const calendarGrid = [];
  for (let i = 0; i < startDayOfMonth; i++) calendarGrid.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarGrid.push(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth(), i));
  const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* ... (Kode Header dan Tombol Hari Ini sama seperti sebelumnya) ... */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#003366] tracking-tight">Presensi Harian</h2>
          <p className="text-gray-500 text-sm mt-1">Pilih tanggal pada kalender untuk melihat atau mengisi presensi.</p>
        </div>
        <button onClick={goToToday} className="bg-blue-50 text-[#003366] px-4 py-2 rounded-lg text-sm font-bold border border-blue-100 hover:bg-[#003366] hover:text-white transition-colors shadow-sm">
          📅 Ke Hari Ini
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-fit">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="font-bold text-[#003366] uppercase tracking-wider text-sm">{currentMonthView.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {namaHari.map((hari, i) => (
              <div key={i} className={`text-[11px] font-black py-1 uppercase ${i === 0 || i === 6 ? "text-red-400" : "text-gray-400"}`}>
                {hari}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((date, index) => {
              if (!date) return <div key={index} className="p-2"></div>;

              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const dayStat = checkDateStatus(date);

              const isCellWeekend = date.getDay() === 0 || date.getDay() === 6;
              const cellYMD = formatDateToYMD(date);
              const isCellNationalHoliday = daftarLibur.includes(cellYMD);
              const isCellOffDay = isCellWeekend || isCellNationalHoliday;

              let btnClass = "h-10 w-full rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center ";

              if (isSelected) {
                btnClass += "bg-[#003366] text-white shadow-md transform scale-105";
              } else if (isToday) {
                btnClass += "bg-blue-50 text-[#003366] border border-blue-200 hover:bg-blue-100";
              } else if (dayStat === "FUTURE") {
                btnClass += "text-gray-300 hover:bg-gray-50 cursor-not-allowed";
              } else if (isCellOffDay) {
                btnClass += "text-red-500 bg-red-50 hover:bg-red-100 border border-red-100";
              } else {
                btnClass += "text-gray-600 hover:bg-gray-100";
              }

              return (
                <button key={index} onClick={() => setSelectedDate(date)} className={btnClass} title={isCellNationalHoliday ? keteranganLibur[cellYMD] : ""}>
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-7 lg:col-span-8">
          {isLoadingPast ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#003366] bg-white rounded-2xl shadow-sm border border-gray-100 h-full min-h-[350px]">
              <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-bold animate-pulse">Memeriksa Database...</p>
            </div>
          ) : (
            <>
              {/* KONDISI 1: JIKA ADA DATA */}
              {pastData && (
                <div className="rounded-2xl bg-white p-6 sm:p-8 border border-gray-100 shadow-sm animate-fade-in-up">
                  {/* ... (Blok Kode Kondisi 1 dibiarkan sama persis seperti sebelumnya) ... */}
                  <div className="border-b border-gray-100 pb-5 mb-6">
                    {baseStatus === "TODAY" ? (
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-green-600 p-2 rounded-full">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Selesai Presensi</h3>
                          <p className="text-sm text-gray-500 font-medium">Anda sudah mengirimkan laporan kinerja hari ini.</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-bold text-[#003366]">Rekap Presensi Harian</h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Persetujuan Atasan</p>
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold border ${pastData.status_verifikasi === "PENDING" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : pastData.status_verifikasi === "DISETUJUI" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}
                        >
                          {pastData.status_verifikasi}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status Kehadiran</p>
                        <p className="font-black text-[#003366] text-lg uppercase tracking-wide">{pastData.status_kehadiran || "Hadir"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-2">Uraian Aktivitas Pekerjaan</p>
                      <div className="bg-white text-gray-700 p-4 rounded-xl border border-gray-200 leading-relaxed text-sm shadow-inner">{pastData.uraian_aktivitas}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* KONDISI 2: JIKA TIDAK ADA DATA & HARI KERJA */}
              {!pastData && displayStatus === "TODAY" && <FormPresensi onSuccess={fetchPastData} />}

              {/* KONDISI 3: JIKA TIDAK ADA DATA & HARI LIBUR/WEEKEND */}
              {!pastData && displayStatus === "LIBUR" && (
                <div className="text-center py-16 bg-orange-50 rounded-2xl border border-orange-200 shadow-sm animate-fade-in-up flex flex-col items-center justify-center h-full min-h-[350px]">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600 shadow-sm border border-orange-200">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {/* 🔴 Fitur Keren: Jika ini libur nasional, tampilkan keterangan spesifik dari database Admin */}
                  <h4 className="text-orange-800 font-black text-xl mb-2 tracking-tight">{isNationalHoliday ? keteranganLibur[dateYMD] : "Akhir Pekan (Hari Libur)"}</h4>
                  <p className="text-orange-700 text-sm font-medium max-w-xs">Anda tidak perlu melakukan presensi. Form otomatis ditutup. Selamat beristirahat!</p>
                </div>
              )}

              {/* KONDISI 4: ALFA */}
              {!pastData && displayStatus === "PAST" && (
                <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100 shadow-sm animate-fade-in-up flex flex-col items-center justify-center h-full min-h-[350px]">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 shadow-sm border border-red-200">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h4 className="text-red-800 font-bold text-xl mb-2 tracking-tight">Tidak Ada Presensi</h4>
                  <p className="text-red-600 text-sm font-medium">Anda tercatat Alfa (Mangkir) pada hari kerja ini.</p>
                </div>
              )}

              {/* KONDISI 5: FUTURE */}
              {!pastData && displayStatus === "FUTURE" && (
                <div className="rounded-2xl bg-gray-50 p-10 border border-gray-200 text-center text-gray-500 animate-fade-in-up flex flex-col items-center justify-center h-full min-h-[350px] shadow-sm">
                  <div className="bg-gray-200 p-5 rounded-full mb-5 shadow-inner">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-gray-700 text-xl tracking-tight">Tanggal Terkunci</h3>
                  <p className="text-sm mt-2 max-w-xs font-medium text-gray-400">Anda tidak dapat mengisi presensi untuk hari di masa depan.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
