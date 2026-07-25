import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { MailPlus, MailMinus, Briefcase, Gavel, Files, X } from 'lucide-react';

const suratConfig = {
  surat_keluar: { label: 'Surat Keluar', icon: MailPlus, color: 'bg-blue-500' },
  surat_masuk: { label: 'Surat Masuk', icon: MailMinus, color: 'bg-green-500' },
  surat_tugas: { label: 'Surat Tugas', icon: Briefcase, color: 'bg-yellow-500' },
  surat_keputusan: { label: 'Surat Keputusan', icon: Gavel, color: 'bg-purple-500' },
  surat_internal: { label: 'Surat Internal', icon: Files, color: 'bg-indigo-500' },
};

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState('');
  const [summary, setSummary] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    const res = await apiRequest({ action: 'dashboardSummary', date: dateFilter });
    if (res.success) setSummary(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchSummary(); }, [dateFilter]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <input 
          type="date" 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {loading ? (
          // Animasi Skeleton Loading
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
            </div>
          ))
        ) : (
          summary && Object.keys(suratConfig).map((key) => {
            const cfg = suratConfig[key];
            const data = summary[key];
            // Filter baris yang benar-benar memiliki ID
            const validItems = data.items.filter(item => item.id && item.id !== '');
            // Mengurangi 1 angka sesuai permintaan
            const total = Math.max(0, validItems.length);
            
            return (
              <div 
                key={key} 
                onClick={() => setModalData({ title: cfg.label, items: validItems })}
                className={`${cfg.color} text-white p-6 rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-all transform hover:scale-105 hover:shadow-lg`}
              >
                <cfg.icon className="w-8 h-8 mb-4" />
                <h3 className="text-lg font-semibold">{cfg.label}</h3>
                <p className="text-4xl font-bold mt-2">{total}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Daftar Surat */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Daftar {modalData.title}</h2>
              <button onClick={() => setModalData(null)} className="hover:bg-gray-100 p-1 rounded"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4 overflow-auto">
              {modalData.items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tidak ada data</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">No Surat</th>
                      <th className="p-2">Tanggal</th>
                      <th className="p-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.items.map((item, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-2">{item.nomor_surat_keluar || item.nomor_surat || item.nomor_surat_masuk || item.nomor_surat_internal || '-'}</td>
                        <td className="p-2">{item.tanggal_pengajuan || item.tanggal_surat || item.tanggal || '-'}</td>
                        <td className="p-2">{item.perihal || item.kegiatan || item.tujuan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}