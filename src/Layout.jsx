import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  LayoutDashboard, MailPlus, MailMinus, Briefcase, Gavel, Files, 
  FolderTree, FileText, Settings, LogOut 
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

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <h1 className="text-xl font-bold">Sistem Arsip Surat</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm hover:bg-slate-700 transition-colors ${
                  isActive ? 'bg-slate-900 border-l-4 border-blue-500' : ''
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-sm text-gray-400 mb-2">Login sebagai: <br/><span className="font-bold text-white">{user?.nama}</span></p>
          <button onClick={handleLogout} className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}