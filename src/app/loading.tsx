export default function GlobalLoading() {
  return (
    // Lapisan transparan yang menutupi seluruh layar (z-index sangat tinggi agar selalu di depan)
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md">
      
      {/* Kotak Loading Estetik */}
      <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 transform transition-all animate-fade-in-up">
        
        {/* Spinner SVG Kustom warna #003366 */}
        <svg 
          className="animate-spin h-14 w-14 text-[#003366] mb-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        
        <h3 className="text-[#003366] font-black text-xl tracking-wide">Memproses Data</h3>
        <p className="text-gray-500 text-sm mt-1.5 font-medium">Mohon tunggu sebentar...</p>
        
      </div>
    </div>
  );
}