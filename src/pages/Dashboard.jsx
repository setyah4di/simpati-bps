import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { MailPlus, MailMinus, Briefcase, Gavel, Files, X, Search, Copy, Check } from 'lucide-react';

const suratConfig = {
  surat_keluar: {
    label: 'Surat Keluar', icon: MailPlus, color: 'bg-blue-500', ring: 'ring-blue-300',
    nomorField: 'nomor_surat_keluar',
    dateField: 'tanggal_pengajuan',
    tableColumns: ['nomor_surat_keluar', 'nama_pengaju_surat', 'klasifikasi_keamanan_dan_akses', 'tujuan', 'perihal', 'tanggal_surat', 'klasifikasi_kode_arsip', 'subklasifikasi', 'kode_klasifikasi', 'tanggal_pengajuan'],
    tableLabels: ['Nomor Surat', 'Pengaju Surat', 'Klasifikasi Keamananan dan Akses', 'Tujuan', 'Perihal', 'Tanggal Surat', 'Klasifikasi Kode Arsip', 'Subklasifikasi', 'Kode Klasifikasi', 'Tanggal Pengajuan'],
  },
  surat_masuk: {
    label: 'Surat Masuk', icon: MailMinus, color: 'bg-green-500', ring: 'ring-green-300',
    nomorField: 'nomor_surat',
    dateField: 'tanggal_surat',
    tableColumns: ['nomor_surat', 'tanggal_surat', 'pengirim', 'perihal'],
    tableLabels: ['Nomor Surat', 'Tanggal Surat', 'Pengirim', 'Perihal'],
  },
  surat_tugas: {
    label: 'Surat Tugas', icon: Briefcase, color: 'bg-yellow-500', ring: 'ring-yellow-300',
    nomorField: 'nomor_surat_masuk',
    dateField: 'tanggal_pengajuan',
    tableColumns: ['nomor_surat_masuk', 'klasifikasi_keamanan', 'kegiatan', 'tanggal_mulai_pelaksanaan', 'tanggal_selesai_kegiatan', 'klasifikasi_kode_arsip', 'subklasifikasi', 'kode_klasifikasi','tanggal_pengajuan'],
    tableLabels: ['Nomor Surat', 'Klasifikasi Keamananan dan Akses', 'Kegiatan', 'Tgl Mulai', 'Tgl Selesai', 'Klasifikasi Kode Arsip', 'Subklasifikasi', 'Kode Klasifikasi','Tanggal Pengajuan'],
  },
  surat_keputusan: {
    label: 'Surat Keputusan', icon: Gavel, color: 'bg-purple-500', ring: 'ring-purple-300',
    nomorField: 'nomor_surat',
    dateField: 'tanggal',
    tableColumns: ['nomor_surat', 'tanggal', 'perihal', 'klasifikasi'],
    tableLabels: ['Nomor Surat', 'Tanggal', 'Perihal', 'Klasifikasi'],
  },
  surat_internal: {
    label: 'Surat Internal', icon: Files, color: 'bg-indigo-500', ring: 'ring-indigo-300',
    nomorField: 'nomor_surat_internal',
    dateField: 'tanggal_surat',
    tableColumns: ['nomor_surat_internal', 'tanggal_surat', 'pihak_yang_dituju', 'perihal', 'klasifikasi_kode_arsip', 'subklasifikasi', 'kode_klasifikasi'],
    tableLabels: ['Nomor Surat', 'Tanggal', 'Pihak Dituju', 'Perihal', 'Kode Arsip', 'Subklasifikasi', 'Kode Klasifikasi'],
  },
};

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(null);
  const [tableSearch, setTableSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    
    // Ambil semua data dari kelima tabel secara paralel menggunakan Supabase
    const tableKeys = Object.keys(suratConfig);
    const promises = tableKeys.map(async (key) => {
      const cfg = suratConfig[key];
      let query = supabase.from(key).select('*');
      
      // Jika ada filter tanggal, terapkan filter di sisi database
      if (dateFilter) {
        query = query.eq(cfg.dateField, dateFilter);
      }
      
      const { data, error } = await query;
      return { key, data: error ? [] : data };
    });

    const results = await Promise.all(promises);
    
    // Susun ulang struktur data agar sesuai dengan expektasi state summary
    const newSummary = {};
    results.forEach(res => {
      newSummary[res.key] = { items: res.data };
    });

    setSummary(newSummary);
    setLoading(false);
  };

  useEffect(() => { fetchSummary(); }, [dateFilter]);

  const handleCardClick = (key) => {
    setTableSearch('');
    setActiveKey((prev) => (prev === key ? null : key));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCfg = activeKey ? suratConfig[activeKey] : null;
  const activeItems = activeKey && summary
    ? summary[activeKey].items.filter(item => item.id && item.id !== '')
    : [];
  const filteredItems = activeItems.filter(item =>
    tableSearch ? Object.values(item).some(val => String(val).toLowerCase().includes(tableSearch.toLowerCase())) : true
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#101828]">Dashboard</h1>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="h-8 w-8 rounded-md mb-4 simpati-skeleton"></div>
              <div className="h-4 rounded w-2/3 mb-2 simpati-skeleton"></div>
              <div className="h-8 rounded w-1/3 mt-4 simpati-skeleton"></div>
            </div>
          ))
        ) : (
          summary && Object.keys(suratConfig).map((key) => {
            const cfg = suratConfig[key];
            const data = summary[key];
            const validItems = data.items.filter(item => item.id && item.id !== '');
            const total = Math.max(0, validItems.length);
            const isActive = activeKey === key;

            return (
              <button
                key={key}
                onClick={() => handleCardClick(key)}
                className={`${cfg.color} text-white p-6 rounded-xl shadow-sm text-left cursor-pointer transition-all transform hover:scale-[1.03] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E2338] ${
                  isActive ? `ring-4 ring-offset-2 ${cfg.ring} scale-[1.03] shadow-lg` : ''
                }`}
              >
                <cfg.icon className="w-8 h-8 mb-4" />
                <h3 className="text-lg font-semibold">{cfg.label}</h3>
                <p className="text-4xl font-bold mt-2">{total}</p>
              </button>
            );
          })
        )}
      </div>

      {/* Tabel Detail — muncul langsung di bawah cards, bukan modal */}
      {activeCfg && (
        <div key={activeKey} className="mt-6 simpati-expand-in">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`${activeCfg.color} w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0`}>
                  <activeCfg.icon className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#101828] leading-tight">Daftar {activeCfg.label}</h2>
                  <p className="text-xs text-slate-500">{filteredItems.length} data ditemukan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#C08A34]/40 focus-within:border-[#C08A34] transition-colors">
                  <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari di tabel ini..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="py-2 text-sm outline-none w-44 sm:w-56"
                  />
                </div>
                <button
                  onClick={() => setActiveKey(null)}
                  className="hover:bg-slate-100 p-2 rounded-lg text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34]"
                  aria-label="Tutup tabel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">No</th>
                    {activeCfg.tableLabels.map(label => (
                      <th key={label} className="p-3 whitespace-nowrap text-slate-500 font-semibold">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={activeCfg.tableLabels.length + 1} className="p-10 text-center text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, i) => (
                      <tr
                        key={item.id || i}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors simpati-row-in"
                        style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
                      >
                        <td className="p-3">{i + 1}</td>
                        {activeCfg.tableColumns.map(col => (
                          <td key={col} className="p-3 whitespace-nowrap">
                            {col === activeCfg.nomorField ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{item[col] || '-'}</span>
                                {item[col] && (
                                  <button
                                    onClick={() => handleCopy(item[col], item.id || i)}
                                    className="text-gray-400 hover:text-[#C08A34] transition-colors"
                                    title="Salin Nomor Surat"
                                  >
                                    {copiedId === (item.id || i) ? (
                                      <Check className="w-4 h-4 text-green-500 simpati-pop-in" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            ) : (
                              item[col] || '-'
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes simpatiExpandIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .simpati-expand-in { animation: simpatiExpandIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes simpatiRowIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .simpati-row-in { animation: simpatiRowIn 0.3s ease-out both; }

        @keyframes simpatiPopIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .simpati-pop-in { animation: simpatiPopIn 0.2s ease-out both; }

        @keyframes simpatiShimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .simpati-skeleton {
          background: linear-gradient(90deg, #EEF0F3 25%, #F7F8FA 37%, #EEF0F3 63%);
          background-size: 400% 100%;
          animation: simpatiShimmer 1.4s ease infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .simpati-expand-in, .simpati-row-in, .simpati-pop-in, .simpati-skeleton {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}