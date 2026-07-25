import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { apiRequest } from '../api';
import { ArrowLeft, Check, User, Lock, Eye, EyeOff } from 'lucide-react';

function Spinner({ className = 'h-5 w-5 text-white' }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEnteringApp, setIsEnteringApp] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(username, password);
    if (res.success) {
      setIsEnteringApp(true);
      setTimeout(() => navigate('/'), 900);
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regConfirmPassword) {
      setError('Password dan konfirmasi password tidak cocok!');
      return;
    }
    setRegLoading(true);
    const res = await apiRequest({ action: 'register', nama: regNama, username: regUsername, password: regPassword });
    if (res.success) {
      setToastKey((k) => k + 1);
      setShowToast(true);
      setRegNama(''); setRegPassword(''); setRegConfirmPassword('');
      setUsername(regUsername); setPassword('');
      setTimeout(() => {
        setShowToast(false);
        setIsRegistering(false);
      }, 2400);
    } else {
      setError(res.error || 'Gagal melakukan registrasi.');
    }
    setRegLoading(false);
  };

  const dotPattern = {
    backgroundImage: 'radial-gradient(rgba(233,201,122,0.18) 1px, transparent 1px)',
    backgroundSize: '18px 18px',
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ===== Panel brand — desktop ===== */}
      <div className="hidden lg:flex lg:w-[44%] relative bg-[#0E2338] text-white flex-col justify-between p-12 overflow-hidden shrink-0">
        <div className="absolute inset-0" style={dotPattern} aria-hidden="true" />
        <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full border-2 border-dashed border-[#C08A34]/25" aria-hidden="true" />
        <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full border border-[#C08A34]/20" aria-hidden="true" />

        <div className="relative z-10 flex items-center gap-3">
          {/* Logo BPS */}
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center ring-1 ring-[#C08A34]/40 shrink-0 p-1">
            <img src="/image/logo_bps.png" alt="Logo BPS" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide leading-none">SIMPATI</h1>
            <p className="text-[11px] text-slate-400 mt-1">BPS Kab. Tanjung Jabung Barat</p>
          </div>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="text-2xl font-semibold leading-snug text-slate-100">
            Satu pintu untuk seluruh arsip persuratan kantor.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C08A34] shrink-0" />
              Surat masuk, keluar, tugas, dan keputusan tercatat rapi
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C08A34] shrink-0" />
              Klasifikasi &amp; template surat yang konsisten
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#C08A34] shrink-0" />
              Terintegrasi untuk seluruh pegawai
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} BPS Kabupaten Tanjung Jabung Barat
        </p>
      </div>

      {/* ===== Panel form ===== */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#F5F6F8] lg:bg-white relative">
        <div className="w-full max-w-sm">
          {/* Brand ringkas — mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center ring-1 ring-[#C08A34]/40 mb-3 p-1 shadow-sm">
              <img src="/image/logo_bps.png" alt="Logo BPS" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold text-[#0E2338] tracking-wide">SIMPATI</h1>
            <p className="text-xs text-slate-500 mt-1 text-center">BPS Kab. Tanjung Jabung Barat</p>
          </div>

          <div key={isRegistering ? 'register' : 'login'} className="simpati-fade-in">
            <h2 className="text-2xl font-bold mb-1 text-[#101828]">
              {isRegistering ? 'Buat akun baru' : 'Selamat datang'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {isRegistering ? 'Lengkapi data di bawah untuk mendaftar.' : 'Masuk untuk melanjutkan ke SIMPATI.'}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                {error}
              </div>
            )}

            {!isRegistering ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Username</label>
                  <div className="relative">
                    <User className="w-[18px] h-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/50 focus:border-[#C08A34] outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-[18px] h-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/50 focus:border-[#C08A34] outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] rounded"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 bg-[#0E2338] hover:bg-[#163654] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] focus-visible:ring-offset-2"
                >
                  {loading ? <Spinner /> : 'Masuk'}
                </button>
                <p className="text-center text-sm mt-6 text-slate-600">
                  Belum punya akun?{' '}
                  <button type="button" onClick={() => { setError(''); setIsRegistering(true); }} className="text-[#0E2338] font-semibold hover:underline underline-offset-2">
                    Daftar di sini
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Nama Lengkap</label>
                  <input type="text" value={regNama} onChange={(e) => setRegNama(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/50 focus:border-[#C08A34] outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Username</label>
                  <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/50 focus:border-[#C08A34] outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3.5 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/50 focus:border-[#C08A34] outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] rounded"
                      aria-label={showRegPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showRegPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">Konfirmasi Password</label>
                  <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/50 focus:border-[#C08A34] outline-none transition-colors" required />
                </div>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full flex justify-center items-center gap-2 bg-[#C08A34] hover:bg-[#AD7A2C] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E2338] focus-visible:ring-offset-2"
                >
                  {regLoading ? <Spinner /> : 'Daftar'}
                </button>
                <button
                  type="button"
                  onClick={() => { setError(''); setIsRegistering(false); }}
                  className="w-full flex justify-center items-center text-sm mt-2 text-slate-600 hover:text-[#0E2338] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ===== Overlay: sukses registrasi (animasi stempel) ===== */}
      {showToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E2338]/40 backdrop-blur-[2px] simpati-fade-in">
          <div key={toastKey} className="bg-white px-8 py-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-xs mx-4">
            <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-[#C08A34] simpati-ink-ring" />
              <span className="absolute inset-0 rounded-full border-2 border-[#C08A34] simpati-ink-ring simpati-ink-ring-delay" />
              <div className="w-16 h-16 rounded-full bg-[#0E2338] flex items-center justify-center ring-4 ring-[#E9C97A]/30 simpati-stamp">
                <Check className="w-8 h-8 text-[#E9C97A]" strokeWidth={3} />
              </div>
            </div>
            <p className="font-bold text-[#101828] text-lg simpati-fade-in-delay">Registrasi Berhasil</p>
            <p className="text-sm text-slate-500 mt-1 simpati-fade-in-delay">Silakan masuk dengan akun baru Anda.</p>
          </div>
        </div>
      )}

      {/* ===== Overlay: transisi masuk setelah login ===== */}
      {isEnteringApp && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0E2338] simpati-fade-in">
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center ring-1 ring-[#C08A34]/50 mb-6 simpati-pulse p-1">
            <img src="/image/logo_bps.png" alt="Logo BPS" className="w-full h-full object-contain" />
          </div>
          <p className="text-slate-200 text-sm mb-4">Menyiapkan ruang kerja Anda&hellip;</p>
          <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#C08A34] rounded-full simpati-progress" />
          </div>
        </div>
      )}

      <style>{`
        @keyframes simpatiFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .simpati-fade-in { animation: simpatiFadeIn 0.35s ease-out; }
        .simpati-fade-in-delay { animation: simpatiFadeIn 0.4s ease-out 0.15s both; }

        @keyframes simpatiStamp {
          0% { transform: scale(2.4) rotate(-18deg); opacity: 0; }
          60% { transform: scale(0.92) rotate(-6deg); opacity: 1; }
          80% { transform: scale(1.04) rotate(-8deg); }
          100% { transform: scale(1) rotate(-8deg); }
        }
        .simpati-stamp { animation: simpatiStamp 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        @keyframes simpatiInkRing {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        .simpati-ink-ring { animation: simpatiInkRing 1s ease-out 0.45s both; }
        .simpati-ink-ring-delay { animation: simpatiInkRing 1s ease-out 0.7s both; }

        @keyframes simpatiPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .simpati-pulse { animation: simpatiPulse 1.1s ease-in-out infinite; }

        @keyframes simpatiProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .simpati-progress { animation: simpatiProgress 0.9s ease-in-out forwards; }

        @media (prefers-reduced-motion: reduce) {
          .simpati-fade-in, .simpati-fade-in-delay, .simpati-stamp, .simpati-ink-ring,
          .simpati-ink-ring-delay, .simpati-pulse, .simpati-progress {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}