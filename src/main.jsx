import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Layout from './Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GenericSurat from './pages/GenericSurat'
import Klasifikasi from './pages/Klasifikasi'
import TemplateSurat from './pages/TemplateSurat'
import Pengaturan from './pages/Pengaturan'
import ArsipSurat from './pages/ArsipSurat';
import { FileText } from 'lucide-react'; // Icon untuk splash screen
import './index.css'

// 1. Import registerSW dari virtual:pwa-register
import { registerSW } from 'virtual:pwa-register'

// 2. Daftarkan Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Bisa ditambahkan notifikasi toast "Aplikasi baru saja diperbarui"
    console.log('Aplikasi telah diperbarui, memuat ulang...');
  },
  onOfflineReady() {
    console.log('Aplikasi siap digunakan secara offline');
  },
});
// =========================================================
// KOMPONEN SPLASH SCREEN (ANIMASI LOADING AWAL)
// =========================================================
function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Durasi tampilnya loading (misal: 2 detik)
    const timer1 = setTimeout(() => {
      setIsFading(true); // Mulai transisi fade out
    }, 1800);

    // Hapus komponen dari DOM setelah animasi fade out selesai
    const timer2 = setTimeout(() => {
      setIsVisible(false);
    }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#101828] transition-opacity duration-500 ease-out ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Wrapper Animasi Logo */}
      <div className="relative mb-8 flex items-center justify-center w-24 h-24">
        {/* Gelombang ping (lingkaran yang membesar) */}
        <div className="absolute w-20 h-20 border-4 border-[#C08A34]/30 rounded-full animate-ping"></div>
        
        {/* Cincin berputar */}
        <div className="absolute w-20 h-20 border-t-4 border-b-4 border-[#C08A34] rounded-full animate-spin"></div>
        
        {/* Ikon tengah */}
        <div className="relative bg-[#101828] p-2 rounded-full flex items-center justify-center">
          <FileText className="w-10 h-10 text-[#C08A34] animate-pulse" />
        </div>
      </div>

      {/* Teks Memuat */}
      <h1 className="text-xl font-bold text-white tracking-widest mb-6 uppercase">
        Memuat Arsip
      </h1>

      {/* Loading Bar (Garis Indeterminate) */}
      <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
        <div className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-[#C08A34] to-transparent animate-loading-bar"></div>
      </div>

      {/* Custom CSS untuk animasi loading bar (dipindah ke index.css jika ingin) */}
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      {/* Render SplashScreen di luar BrowserRouter agar menutupi layar paling awal */}
      <SplashScreen />
      
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/surat-keluar" element={<ProtectedRoute><GenericSurat type="surat_keluar" title="Surat Keluar" /></ProtectedRoute>} />
          <Route path="/surat-masuk" element={<ProtectedRoute><GenericSurat type="surat_masuk" title="Surat Masuk" /></ProtectedRoute>} />
          <Route path="/surat-tugas" element={<ProtectedRoute><GenericSurat type="surat_tugas" title="Surat Tugas" /></ProtectedRoute>} />
          <Route path="/surat-keputusan" element={<ProtectedRoute><GenericSurat type="surat_keputusan" title="Surat Keputusan" /></ProtectedRoute>} />
          <Route path="/surat-internal" element={<ProtectedRoute><GenericSurat type="surat_internal" title="Surat Internal" /></ProtectedRoute>} />
          <Route path="/klasifikasi" element={<ProtectedRoute><Klasifikasi /></ProtectedRoute>} />
          <Route path="/template" element={<ProtectedRoute><TemplateSurat /></ProtectedRoute>} />
          <Route path="/pengaturan" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />
          <Route path="/arsip/surat-keluar" element={<ProtectedRoute><ArsipSurat type="surat_keluar" title="Arsip Surat Keluar" /></ProtectedRoute>} />
          <Route path="/arsip/surat-masuk" element={<ProtectedRoute><ArsipSurat type="surat_masuk" title="Arsip Surat Masuk" /></ProtectedRoute>} />
          <Route path="/arsip/surat-tugas" element={<ProtectedRoute><ArsipSurat type="surat_tugas" title="Arsip Surat Tugas" /></ProtectedRoute>} />
          <Route path="/arsip/surat-keputusan" element={<ProtectedRoute><ArsipSurat type="surat_keputusan" title="Arsip Surat Keputusan" /></ProtectedRoute>} />
          <Route path="/arsip/surat-internal" element={<ProtectedRoute><ArsipSurat type="surat_internal" title="Arsip Surat Internal" /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)