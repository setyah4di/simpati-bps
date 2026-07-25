import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { User, Lock, KeyRound, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

export default function Pengaturan() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newUsername, setNewUsername] = useState(user.username);
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // 1. Validasi password lama dengan mencocokkannya di database Supabase
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .eq('password', oldPassword)
      .single();

    if (fetchError || !userData) {
      setStatus({ type: 'error', message: 'Password lama yang Anda masukkan salah.' });
      setLoading(false);
      return;
    }

    // 2. Jika password lama benar, lakukan update username & password baru
    const { error: updateError } = await supabase
      .from('users')
      .update({ username: newUsername, password: newPassword })
      .eq('id', user.id);

    if (!updateError) {
      setStatus({ type: 'success', message: 'Username/Password berhasil diubah. Silakan login kembali.' });
      
      // Update local storage username jika berubah
      const updatedUser = { ...user, username: newUsername };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setOldPassword('');
      setNewPassword('');
    } else {
      setStatus({ type: 'error', message: updateError.message || 'Terjadi kesalahan. Username mungkin sudah digunakan.' });
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#101828]">Pengaturan Akun</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-md simpati-fade-in">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-dashed border-slate-200">
          <div className="w-11 h-11 rounded-full bg-[#0E2338] flex items-center justify-center text-sm font-bold text-white shrink-0">
            {(user?.nama || '?').trim().split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#101828] truncate">{user?.nama}</p>
            <p className="text-xs text-slate-500">Ubah username dan password akun Anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {status && (
            <div
              className={`px-4 py-3 rounded-lg text-sm flex items-start gap-2.5 simpati-fade-in ${
                status.type === 'success'
                  ? 'bg-[#0E2338]/5 border border-[#C08A34]/25 text-[#0E2338]'
                  : 'bg-red-50 border border-red-100 text-red-700'
              }`}
            >
              {status.type === 'success' ? (
                <span className="relative w-5 h-5 shrink-0 flex items-center justify-center mt-0.5">
                  <span className="absolute inset-0 rounded-full border-2 border-[#C08A34] simpati-ink-ring" />
                  <span className="w-5 h-5 rounded-full bg-[#0E2338] flex items-center justify-center simpati-stamp">
                    <Check className="w-3 h-3 text-[#E9C97A]" strokeWidth={3} />
                  </span>
                </span>
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          <fieldset disabled={loading} className={`space-y-4 border-0 p-0 m-0 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Username Baru</label>
              <div className="relative">
                <User className="w-[18px] h-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Password Lama</label>
              <div className="relative">
                <Lock className="w-[18px] h-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] rounded"
                  aria-label={showOldPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showOldPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Password Baru</label>
              <div className="relative">
                <KeyRound className="w-[18px] h-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] rounded"
                  aria-label={showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showNewPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-[#0E2338] hover:bg-[#163654] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] focus-visible:ring-offset-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes simpatiFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .simpati-fade-in { animation: simpatiFadeIn 0.3s ease-out; }

        @keyframes simpatiStamp {
          0% { transform: scale(2.2) rotate(-16deg); opacity: 0; }
          60% { transform: scale(0.92) rotate(-6deg); opacity: 1; }
          80% { transform: scale(1.04) rotate(-8deg); }
          100% { transform: scale(1) rotate(-8deg); }
        }
        .simpati-stamp { animation: simpatiStamp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

        @keyframes simpatiInkRing {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .simpati-ink-ring { animation: simpatiInkRing 0.9s ease-out 0.3s both; }

        @media (prefers-reduced-motion: reduce) {
          .simpati-fade-in, .simpati-stamp, .simpati-ink-ring {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}