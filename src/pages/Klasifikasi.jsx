import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { Plus, Search, X } from 'lucide-react';

export default function Klasifikasi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ klasifikasi_kode_arsip: '', subklasifikasi: '', kode_klasifikasi: '' });

  const fetchData = async () => {
    setLoading(true);
    const res = await apiRequest({ action: 'getAll', sheet: 'klasifikasi' });
    if (res.success) setData(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await apiRequest({ action: 'add', sheet: 'klasifikasi', data: formData });
    if (res.success) {
      setShowModal(false);
      setFormData({ klasifikasi_kode_arsip: '', subklasifikasi: '', kode_klasifikasi: '' });
      fetchData();
    }
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Klasifikasi Surat</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Tambah Klasifikasi
        </button>
      </div>

      <div className="flex gap-4 mb-4 bg-white p-4 rounded shadow-sm">
        <div className="flex-1 flex items-center border rounded px-3">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input type="text" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-2 outline-none" />
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Klasifikasi Kode Arsip</th>
              <th className="p-3">Subklasifikasi</th>
              <th className="p-3">Kode Klasifikasi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-10">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">Tidak ada data</td>
              </tr>
            ) : (
              filteredData.map((item, i) => (
                <tr key={item.id || i} className="border-b hover:bg-gray-50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{item.klasifikasi_kode_arsip}</td>
                  <td className="p-3">{item.subklasifikasi}</td>
                  <td className="p-3">{item.kode_klasifikasi}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Tambah Klasifikasi</h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-gray-100 p-1 rounded"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Klasifikasi Kode Arsip</label>
                <input type="text" required value={formData.klasifikasi_kode_arsip} onChange={(e) => setFormData({...formData, klasifikasi_kode_arsip: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subklasifikasi</label>
                <input type="text" required value={formData.subklasifikasi} onChange={(e) => setFormData({...formData, subklasifikasi: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kode Klasifikasi</label>
                <input type="text" required value={formData.kode_klasifikasi} onChange={(e) => setFormData({...formData, kode_klasifikasi: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Simpan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}