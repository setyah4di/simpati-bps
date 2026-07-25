import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { apiRequest } from '../api';

export default function Pengaturan() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newUsername, setNewUsername] = useState(user.username);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('Memproses...');
    const res = await apiRequest({
      action: 'changePassword',
      username: user.username,
      oldPassword,
      newUsername,
      newPassword
    });
    
    if (res.success) {
      setMsg('Username/Password berhasil diubah. Silakan login kembali.');
      // Update local storage username jika berubah
      const updatedUser = { ...user, username: newUsername };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      setMsg('Error: ' + res.error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pengaturan Akun</h1>
      <div className="bg-white p-6 rounded shadow max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username Baru</label>
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password Lama</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password Baru</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Simpan Perubahan</button>
          {msg && <p className="text-sm text-center text-gray-700 mt-2">{msg}</p>}
        </form>
      </div>
    </div>
  );
}