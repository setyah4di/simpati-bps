import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  LayoutDashboard, FolderTree, FileText, Settings, LogOut,
  Menu, X, Building2, Archive, ChevronDown, Hash
} from 'lucide-react';

// Menu paling atas (di atas dropdown Nomor Surat)
const dashboardMenu = [
  // { path: '/', label: 'Dashboard', icon: LayoutDashboard },
];

// Sub-menu dropdown "Nomor Surat" -> 5 jenis surat, mengarah ke halaman pengelolaan nomor surat
const suratMenu = [
  { path: '/surat-keluar', label: 'Surat Keluar' },
  { path: '/surat-masuk', label: 'Surat Masuk' },
  { path: '/surat-tugas', label: 'Surat Tugas' },
  { path: '/surat-keputusan', label: 'Surat Keputusan' },
  { path: '/surat-internal', label: 'Surat Internal' },
];

// Sub-menu dropdown "Arsip" -> 5 jenis surat, mengarah ke halaman daftar arsip Google Drive
const archiveMenu = [
  { path: '/arsip/surat-keluar', label: 'Surat Keluar' },
  { path: '/arsip/surat-masuk', label: 'Surat Masuk' },
  { path: '/arsip/surat-tugas', label: 'Surat Tugas' },
  { path: '/arsip/surat-keputusan', label: 'Surat Keputusan' },
  { path: '/arsip/surat-internal', label: 'Surat Internal' },
];

// Menu sisanya (di bawah dropdown Arsip)
const secondaryMenu = [
  { path: '/klasifikasi', label: 'Klasifikasi Surat', icon: FolderTree },
  { path: '/template', label: 'Template Surat', icon: FileText },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isSuratActive = suratMenu.some((item) => item.path === location.pathname);
  const [isSuratOpen, setIsSuratOpen] = useState(isSuratActive);

  const isArsipActive = location.pathname.startsWith('/arsip');
  const [isArsipOpen, setIsArsipOpen] = useState(isArsipActive);

  // Otomatis buka dropdown yang relevan kalau lagi berada di salah satu halamannya
  // (mis. setelah reload langsung di /surat-tugas atau /arsip/surat-tugas)
  useEffect(() => {
    if (isSuratActive) setIsSuratOpen(true);
  }, [isSuratActive]);

  useEffect(() => {
    if (isArsipActive) setIsArsipOpen(true);
  }, [isArsipActive]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay untuk menutup sidebar di HP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-[1px]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-72 bg-slate-900 text-white flex flex-col h-full shadow-xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Tombol close khusus mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

  {/* Logo BPS & Nama Instansi */}
        {/* <div className="flex items-center gap-2 px-4 pt-4 border-b border-white/10">
          <img
            src="/image/logo_bps.png"
            alt="Logo BPS"
            className="w-8 h-8 object-contain shrink-0 opacity-90"
          />
          <div className="text-[13px] leading-tight">
            <span className="block text-slate-200 font-semibold">Badan Pusat Statistik</span>
            <span className="block text-slate-400">Tanjung Jabung Barat</span>
          </div>
        </div> */}

        {/* Brand */}
        <div className="flex items-center gap-3 px-6 pt-6 border-b border-white/10 shrink-0">
          <div className="w-10 h-10 rounded-xl  flex items-center justify-center shrink-0">
            {/* <Building2 className="w-5 h-5 text-white" /> */}
             <img
            src="/image/logo_bps.png"
            alt="Logo BPS"
            className="w-8 h-8 object-contain shrink-0 opacity-90"
          />
          </div>
          <div className="min-w-0">
            <h1 className="text-base text-xl font-bold tracking-wide leading-none">SIMPATI</h1>
            <p className="text-[13px] text-slate-300 leading-snug mt-1">
              Sistem Informasi Manajemen Persuratan Terintegrasi
            </p>
          </div>
        </div>
        
      
        {/* Navigasi */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 mb-2 text-[13px] font-semibold uppercase tracking-wider text-slate-400">
            Menu Utama
          </p>
          <div className="space-y-1">
            {dashboardMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}

            {/* Dropdown menu Nomor Surat */}
            <div>
              <button
                type="button"
                onClick={() => setIsSuratOpen((prev) => !prev)}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isSuratActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Hash className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate flex-1 text-left">Nomor Surat</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isSuratOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isSuratOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pl-4 border-l border-white/10 ml-5 space-y-1">
                  {suratMenu.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium transition-colors truncate ${
                          isActive
                            ? 'bg-blue-600/90 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            {/* Dropdown menu Arsip */}
            <div>
              <button
                type="button"
                onClick={() => setIsArsipOpen((prev) => !prev)}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isArsipActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Archive className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate flex-1 text-left">Arsip</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isArsipOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isArsipOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pl-4 border-l border-white/10 ml-5 space-y-1">
                  {archiveMenu.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm font-medium transition-colors truncate ${
                          isActive
                            ? 'bg-blue-600/90 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            {secondaryMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        
        {/* User & Logout */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 mb-3 rounded-lg bg-white/5">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user?.nama)}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400 leading-none">Masuk sebagai</p>
              <p className="text-sm font-semibold text-white truncate mt-1">{user?.nama}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar (mobile) */}
        <header className="md:hidden bg-slate-900 text-white px-4 h-14 flex items-center justify-between shrink-0 shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm tracking-wide">SIMPATI</span>
          <div className="w-7" />
        </header>

        {/* Konten Utama */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
