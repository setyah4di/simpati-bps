import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { Plus, Search, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
// =========================================================
// TOAST (notifikasi sukses / gagal bergaya stempel)
// =========================================================
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div key={toast.id} className="fixed top-4 right-4 z-[60] w-full max-w-xs simpati-toast-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
            {isSuccess && <span className="absolute inset-0 rounded-full border-2 border-[#C08A34] simpati-ink-ring" />}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isSuccess ? 'bg-[#0E2338] ring-2 ring-[#E9C97A]/40 simpati-stamp' : 'bg-red-50'}`}>
              {isSuccess ? (
                <Check className="w-[18px] h-[18px] text-[#E9C97A]" strokeWidth={3} />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-[#101828]">{isSuccess ? 'Berhasil' : 'Gagal'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-1 bg-slate-100">
          <div className={`h-full ${isSuccess ? 'bg-[#C08A34]' : 'bg-red-400'} simpati-toast-bar`} style={{ animationDuration: `${toast.duration}ms` }} />
        </div>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    <td className="p-3"><div className="h-3.5 w-4 rounded simpati-skeleton" /></td>
    <td className="p-3"><div className="h-3.5 rounded simpati-skeleton" style={{ width: '70%' }} /></td>
    <td className="p-3"><div className="h-3.5 rounded simpati-skeleton" style={{ width: '55%' }} /></td>
    <td className="p-3"><div className="h-3.5 rounded simpati-skeleton" style={{ width: '40%' }} /></td>
  </tr>
);

export default function Klasifikasi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ klasifikasi_kode_arsip: '', subklasifikasi: '', kode_klasifikasi: '' });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const notify = (type, message, duration = 3200) => {
    setToast({ id: Date.now(), type, message, duration });
    clearTimeout(notify._t);
    notify._t = setTimeout(() => setToast(null), duration);
  };

 const fetchData = async () => {
  setLoading(true);
  const { data, error } = await supabase.from('klasifikasi').select('*').order('id', { ascending: false });
  if (!error) setData(data);
  setLoading(false);
};

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e) => {
  e.preventDefault();
  const { error } = await supabase.from('klasifikasi').insert([formData]);
  if (!error) {
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
      {/* Header Responsif */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#101828]">Klasifikasi Surat</h1>
        {/* <button
          onClick={() => { setFormError(''); setShowModal(true); }}
          className="w-full sm:w-auto bg-[#0E2338] hover:bg-[#163654] text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Klasifikasi
        </button> */}
      </div>

      {/* Search Bar Responsif */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 flex items-center border border-slate-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#C08A34]/40 focus-within:border-[#C08A34] transition-colors">
          <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 outline-none"
          />
        </div>
      </div>

      {/* Tabel Responsif (Bisa scroll horizontal di layar kecil) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[400px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">No</th>
              <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">Klasifikasi Kode Arsip</th>
              <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">Subklasifikasi</th>
              <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">Kode Klasifikasi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-500 simpati-fade-in">Tidak ada data</td>
              </tr>
            ) : (
              filteredData.map((item, i) => (
                <tr key={item.id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors simpati-row-in" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium text-gray-800">{item.klasifikasi_kode_arsip}</td>
                  <td className="p-3">{item.subklasifikasi}</td>
                  <td className="p-3">{item.kode_klasifikasi}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Responsif */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto simpati-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8 simpati-modal-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-lg md:text-xl font-bold text-[#101828]">Tambah Klasifikasi</h2>
              <button
                onClick={() => !loadingSubmit && setShowModal(false)}
                disabled={loadingSubmit}
                className="hover:bg-slate-100 p-1 rounded disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2 simpati-fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <fieldset disabled={loadingSubmit} className={`space-y-4 border-0 p-0 m-0 transition-opacity duration-200 ${loadingSubmit ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Klasifikasi Kode Arsip</label>
                  <input
                    type="text"
                    required
                    value={formData.klasifikasi_kode_arsip}
                    onChange={(e) => setFormData({...formData, klasifikasi_kode_arsip: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Subklasifikasi</label>
                  <input
                    type="text"
                    required
                    value={formData.subklasifikasi}
                    onChange={(e) => setFormData({...formData, subklasifikasi: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Kode Klasifikasi</label>
                  <input
                    type="text"
                    required
                    value={formData.kode_klasifikasi}
                    onChange={(e) => setFormData({...formData, kode_klasifikasi: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors"
                  />
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={loadingSubmit}
                className="w-full flex justify-center items-center gap-2 bg-[#0E2338] hover:bg-[#163654] text-white py-2.5 rounded-lg transition-colors disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] focus-visible:ring-offset-2"
              >
                {loadingSubmit ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        @keyframes simpatiFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .simpati-fade-in { animation: simpatiFadeIn 0.25s ease-out; }

        @keyframes simpatiModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .simpati-modal-in { animation: simpatiModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes simpatiRowIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .simpati-row-in { animation: simpatiRowIn 0.3s ease-out both; }

        @keyframes simpatiShimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .simpati-skeleton {
          background: linear-gradient(90deg, #EEF0F3 25%, #F7F8FA 37%, #EEF0F3 63%);
          background-size: 400% 100%;
          animation: simpatiShimmer 1.4s ease infinite;
        }

        @keyframes simpatiToastIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .simpati-toast-in { animation: simpatiToastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes simpatiToastBar { from { width: 100%; } to { width: 0%; } }
        .simpati-toast-bar { animation: simpatiToastBar linear forwards; }

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
        .simpati-ink-ring { animation: simpatiInkRing 0.9s ease-out 0.35s both; }

        @media (prefers-reduced-motion: reduce) {
          .simpati-fade-in, .simpati-modal-in, .simpati-row-in, .simpati-skeleton,
          .simpati-toast-in, .simpati-toast-bar, .simpati-stamp, .simpati-ink-ring {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
