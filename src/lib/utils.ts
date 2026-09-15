// Fungsi untuk memformat class CSS (opsional tapi sangat berguna)
export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Mendapatkan waktu saat ini dalam zona waktu WITA (Asia/Makassar)
export function getWitaDate() {
  const now = new Date();
  const witaString = now.toLocaleString("en-US", { timeZone: "Asia/Makassar" });
  return new Date(witaString);
}

// Mengecek apakah hari ini sudah lewat batas 23:59 WITA
export function isCutoffPassed() {
  const nowWita = getWitaDate();
  const hours = nowWita.getHours();
  const minutes = nowWita.getMinutes();
  
  // Jika sudah pukul 23:59 ke atas, kembalikan true (terkunci)
  if (hours === 23 && minutes >= 59) return true;
  return false;
}

// Mengecek status tanggal (Past, Today, Future)
export function checkDateStatus(selectedDate: Date) {
  const today = getWitaDate();
  // Hilangkan jam/menit agar perbandingan murni berdasarkan hari
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(selectedDate);
  checkDate.setHours(0, 0, 0, 0);

  if (checkDate.getTime() === today.getTime()) return "TODAY";
  if (checkDate.getTime() < today.getTime()) return "PAST";
  return "FUTURE";
}