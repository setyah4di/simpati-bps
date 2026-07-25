import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { apiRequest } from '../api';
import { ArrowLeft, Check } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // State untuk Registrasi & Toast
  const [isRegistering, setIsRegistering] = useState(false);
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  
  // State untuk Toast Notification
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (regPassword !== regConfirmPassword) {
      setError('Password dan konfirmasi password tidak cocok!');
      return;
    }
    
    setRegLoading(true);
    const res = await apiRequest({
      action: 'register',
      nama: regNama,
      username: regUsername,
      password: regPassword
    });

    if (res.success) {
      // Tampilkan toast
      setShowToast(true);
      
      // Sembunyikan toast setelah 3 detik
      setTimeout(() => {
        setShowToast(false);
      }, 3000);

      // Reset form & kembali ke halaman login
      setRegNama('');
      setRegPassword('');
      setRegConfirmPassword('');
      setUsername(regUsername);
      setPassword('');
      setIsRegistering(false);
    } else {
      setError(res.error || 'Gagal melakukan registrasi.');
    }
    setRegLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-800 relative">
      
      {/* ================= TOAST NOTIFICATION ================= */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-300 ${showToast ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`bg-white px-8 py-6 rounded-xl shadow-2xl flex items-center space-x-4 transform transition-all duration-500 ${showToast ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}`}>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">Registrasi Berhasil!</p>
            <p className="text-sm text-gray-500">Silakan login dengan akun baru Anda.</p>
          </div>
        </div>
      </div>
      {/* ====================================================== */}

      <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          {isRegistering ? 'Registrasi Akun' : 'Login Sistem'}
        </h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        {!isRegistering ? (
          // FORM LOGIN
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors disabled:opacity-70"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Login'}
            </button>
            
            <p className="text-center text-sm mt-6 text-gray-600">
              Belum punya akun?{' '}
              <button 
                type="button" 
                onClick={() => { setError(''); setIsRegistering(true); }} 
                className="text-blue-600 font-semibold hover:underline"
              >
                Daftar di sini
              </button>
            </p>
          </form>
        ) : (
          // FORM REGISTRASI
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm">Nama Lengkap</label>
              <input type="text" value={regNama} onChange={(e) => setRegNama(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm">Username</label>
              <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm">Password</label>
              <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm">Konfirmasi Password</label>
              <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            
            <button 
              type="submit" 
              disabled={regLoading} 
              className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors disabled:opacity-70"
            >
              {regLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Daftar'}
            </button>
            
            <button 
              type="button" 
              onClick={() => { setError(''); setIsRegistering(false); }} 
              className="w-full flex justify-center items-center text-sm mt-6 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}