import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  LayoutDashboard, MailPlus, MailMinus, Briefcase, Gavel, Files,
  FolderTree, FileText, Settings, LogOut, Menu, X, Building2
} from 'lucide-react';

const menu = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/surat-keluar', label: 'Surat Keluar', icon: MailPlus },
  { path: '/surat-masuk', label: 'Surat Masuk', icon: MailMinus },
  { path: '/surat-tugas', label: 'Surat Tugas', icon: Briefcase },
  { path: '/surat-keputusan', label: 'Surat Keputusan', icon: Gavel },
  { path: '/surat-internal', label: 'Surat Internal', icon: Files },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base text-xl font-bold tracking-wide leading-none">SIMPATI</h1>
            <p className="text-[13px] text-slate-400 leading-snug mt-1">
              Sistem Informasi Manajemen Persuratan Terintegrasi
            </p>
          </div>
        </div>
        
          <div className="flex items-center gap-2 px-2 py-2">
            <img
              src="/image/logo_bps.png"
              alt="Logo BPS"
              className="w-6 h-6 object-contain shrink-0 opacity-90"
            />
            <p className="text-[11px] text-slate-400 leading-snug">
              <span className="text-slate-200 font-semibold">BPS Kabupaten Tanjung Jabung Barat</span>
            </p>
          </div>


        {/* Navigasi */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Menu Utama
          </p>
          <div className="space-y-1">
            {menu.map((item) => (
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