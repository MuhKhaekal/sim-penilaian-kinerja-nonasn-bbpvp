"use client";

import { useState, useEffect } from "react";
import FormPresensi from "@/components/FormPresensi";
import { checkDateStatus, getWitaDate } from "@/lib/utils";
import { getPresensiByDate } from "@/lib/actions/presensi";

type PastData = {
  status_verifikasi: string;
  status_kehadiran: string; // 🔴 1. Ditambahkan ke dalam definisi tipe
  uraian_aktivitas: string;
  kendala: string | null;
  lampiran: string[] | null;
};

export default function PegawaiDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(getWitaDate());
  const [pastData, setPastData] = useState<PastData | null>(null);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  const today = getWitaDate();
  const calendarDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  const status = checkDateStatus(selectedDate);

  useEffect(() => {
    if (status === "PAST") {
      const timer = setTimeout(() => {
        setIsLoadingPast(true);

        const fetchPastData = async () => {
          const dateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];

          const response = await getPresensiByDate(dateStr);
          setPastData(response.data as PastData);
          setIsLoadingPast(false);
        };

        fetchPastData();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [selectedDate, status]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Presensi Harian</h2>
        <p className="text-gray-500 text-sm">Pilih tanggal untuk melihat atau mengisi presensi.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-2 overflow-x-auto">
        {calendarDays.map((date, idx) => {
          const isSelected = date.getDate() === selectedDate.getDate();
          const dayStatus = checkDateStatus(date);

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center justify-center min-w-[60px] p-3 rounded-lg border transition-all ${isSelected ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <span className="text-xs uppercase">{date.toLocaleDateString("id-ID", { weekday: "short" })}</span>
              <span className="text-xl font-bold">{date.getDate()}</span>
              <span className="text-[10px] mt-1 font-medium">{dayStatus === "TODAY" ? "Hari Ini" : dayStatus === "FUTURE" ? "Terkunci" : "Riwayat"}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {status === "TODAY" && <FormPresensi />}

        {status === "FUTURE" && (
          <div className="rounded-lg bg-gray-50 p-8 border border-gray-200 text-center text-gray-500">
            <span className="text-2xl block mb-2">🔒</span>
            Presensi untuk tanggal ini belum dapat diisi.
          </div>
        )}

        {status === "PAST" && (
          <div className="rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Riwayat: {selectedDate.toLocaleDateString("id-ID", { dateStyle: "full" })}</h3>

            {isLoadingPast ? (
              <p className="text-center text-gray-500 py-4 animate-pulse">Memuat data...</p>
            ) : pastData ? (
              <div className="space-y-4">
                
                {/* 🔴 2. Area Status Persetujuan dan Kehadiran Bersebelahan */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Status Persetujuan</p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold border ${
                        pastData.status_verifikasi === "PENDING"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : pastData.status_verifikasi === "DISETUJUI"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {pastData.status_verifikasi}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Keterangan Kehadiran</p>
                    <p className="mt-1 font-bold text-blue-700 uppercase">
                      {pastData.status_kehadiran || "Hadir"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Uraian Aktivitas</p>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">{pastData.uraian_aktivitas}</p>
                </div>
                
                {pastData.kendala && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kendala</p>
                    <p className="mt-1 text-gray-900 bg-red-50 p-3 rounded-md border border-red-100">{pastData.kendala}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Lampiran</p>
                  <p className="text-sm mt-1 text-blue-600 font-medium">🔒 {pastData.lampiran?.length || 0} File Tersimpan Aman (Private Store)</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-red-50 rounded-lg border border-red-100">
                <p className="text-red-600 font-medium">Anda tercatat Alfa (Tidak Mengisi Presensi) pada hari ini.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}