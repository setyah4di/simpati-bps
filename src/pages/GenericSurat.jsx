import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { Plus, Search, X, Copy, Check, ChevronDown, AlertCircle } from 'lucide-react';

// =========================================================
// KOMPONEN SEARCHABLE DROPDOWN (CUSTOM)
// =========================================================
const SearchableSelect = ({ value, onChange, options, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(opt =>
    String(opt).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <div
        className={`w-full p-2 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-[#C08A34]'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-800 text-sm' : 'text-gray-400 text-sm'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-20 bottom-full mb-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg flex flex-col simpati-pop-in">
            <div className="max-h-60 overflow-auto">
              <ul className="py-1">
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-gray-500 text-sm">Tidak ada data ditemukan</li>
                ) : (
                  filteredOptions.map((opt, i) => (
                    <li
                      key={i}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#C08A34]/10 ${value === opt ? 'bg-[#C08A34]/15 text-[#8A611F] font-medium' : 'text-gray-700'}`}
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                        setSearch('');
                      }}
                    >
                      {opt}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="border-t p-2 bg-white">
              <div className="flex items-center border rounded-lg px-2 border-slate-200">
                <Search className="w-4 h-4 text-gray-400 mr-1" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-1 text-sm outline-none"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// =========================================================
// KONFIGURASI FORM & TABEL
// =========================================================
const tableConfigs = {
  surat_keluar: {
    nomorField: 'nomor_surat_keluar',
    formFields: [
      { name: 'klasifikasi_keamanan_dan_akses', label: 'Klasifikasi Keamanan', type: 'select', options: ['R - Rahasia', 'T - Terbatas', 'B - Biasa/Terbuka'] },
      { name: 'tujuan', label: 'Tujuan', type: 'text' },
      { name: 'perihal', label: 'Perihal', type: 'text' },
      { name: 'tanggal_surat', label: 'Tanggal Surat', type: 'date' },
      { name: 'klasifikasi_kode_arsip', label: 'Klasifikasi Kode Arsip', type: 'select-dynamic', source: 'arsip' },
      { name: 'subklasifikasi', label: 'Subklasifikasi', type: 'select-dynamic', source: 'sub' },
    ],
    tableColumns: ['nomor_surat_keluar', 'nama_pengaju_surat', 'klasifikasi_keamanan_dan_akses', 'tujuan', 'perihal', 'tanggal_surat', 'klasifikasi_kode_arsip', 'subklasifikasi', 'kode_klasifikasi','tanggal_pengajuan'],
    tableLabels: ['Nomor Surat', 'Pengaju Surat', 'Klasifikasi Keamanan dan Akses', 'Tujuan', 'Perihal', 'Tanggal Surat', 'Klasifikasi Kode Arsip', 'Subklasifikasi', 'Kode Klasifikasi', 'Tanggal Pengajuan'],
    dateField: 'tanggal_pengajuan',
    manualNomor: false
  },
  surat_masuk: {
    nomorField: 'nomor_surat',
    formFields: [
      { name: 'nomor_surat', label: 'Nomor Surat', type: 'text' },
      { name: 'tanggal_surat', label: 'Tanggal Surat', type: 'date' },
      { name: 'pengirim', label: 'Pengirim', type: 'text' },
      { name: 'perihal', label: 'Perihal', type: 'text' },
    ],
    tableColumns: ['nomor_surat', 'tanggal_surat', 'pengirim', 'perihal'],
    tableLabels: ['Nomor Surat', 'Tanggal Surat', 'Pengirim', 'Perihal'],
    dateField: 'tanggal_surat',
    manualNomor: true
  },
  surat_tugas: {
    nomorField: 'nomor_surat_masuk',
    formFields: [
      { name: 'klasifikasi_keamanan', label: 'Klasifikasi Keamanan', type: 'select', options: ['R - Rahasia', 'T - Terbatas', 'B - Biasa/Terbuka'] },
      { name: 'kegiatan', label: 'Kegiatan', type: 'text' },
      { name: 'tanggal_mulai_pelaksanaan', label: 'Tgl Mulai', type: 'date' },
      { name: 'tanggal_selesai_kegiatan', label: 'Tgl Selesai', type: 'date' },
      { name: 'klasifikasi_kode_arsip', label: 'Klasifikasi Kode Arsip', type: 'select-dynamic', source: 'arsip' },
      { name: 'subklasifikasi', label: 'Subklasifikasi', type: 'select-dynamic', source: 'sub' },
    ],
    tableColumns: ['nomor_surat_masuk','nama_pelaksana', 'klasifikasi_keamanan', 'kegiatan', 'tanggal_mulai_pelaksanaan', 'tanggal_selesai_kegiatan', 'klasifikasi_kode_arsip', 'subklasifikasi', 'kode_klasifikasi','tanggal_pengajuan'],
    tableLabels: ['Nomor Surat', 'Nama Pelaksana', 'Klasifikasi Keamanan dan Akses', 'Kegiatan', 'Tgl Mulai', 'Tgl Selesai', 'Klasifikasi Kode Arsip', 'Subklasifikasi', 'Kode Klasifikasi', 'Tanggal Pengajuan'],
    dateField: 'tanggal_pengajuan',
    manualNomor: false
  },
  surat_keputusan: {
    nomorField: 'nomor_surat',
    formFields: [
      { name: 'tanggal', label: 'Tanggal', type: 'date' },
      { name: 'perihal', label: 'Perihal', type: 'text' },
      { name: 'klasifikasi', label: 'Klasifikasi', type: 'select', options: ['KPG', 'Tanpa Klasifikasi'] },
    ],
    tableColumns: ['nomor_surat', 'tanggal', 'perihal', 'klasifikasi'],
    tableLabels: ['Nomor Surat', 'Tanggal', 'Perihal', 'Klasifikasi'],
    dateField: 'tanggal',
    manualNomor: false
  },
  surat_internal: {
    nomorField: 'nomor_surat_internal',
    formFields: [
      { name: 'tanggal_surat', label: 'Tanggal Surat', type: 'date' },
      { name: 'pihak_yang_dituju', label: 'Pihak Dituju', type: 'text' },
      { name: 'perihal', label: 'Perihal', type: 'text' },
      { name: 'klasifikasi_kode_arsip', label: 'Kode Arsip', type: 'select-dynamic', source: 'arsip' },
      { name: 'subklasifikasi', label: 'Subklasifikasi', type: 'select-dynamic', source: 'sub' },
    ],
    tableColumns: ['nomor_surat_internal', 'tanggal_surat', 'pihak_yang_dituju', 'perihal', 'klasifikasi_kode_arsip', 'subklasifikasi', 'kode_klasifikasi'],
    tableLabels: ['Nomor Surat', 'Tanggal', 'Pihak Dituju', 'Perihal', 'Kode Arsip', 'Subklasifikasi', 'Kode Klasifikasi'],
    dateField: 'tanggal_surat',
    manualNomor: false
  }
};

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
            {isSuccess && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-[#C08A34] simpati-ink-ring" />
              </>
            )}
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
          <div
            className={`h-full ${isSuccess ? 'bg-[#C08A34]' : 'bg-red-400'} simpati-toast-bar`}
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SKELETON ROW (loading tabel)
// =========================================================
const SkeletonRow = ({ cols }) => (
  <tr className="border-b border-slate-100">
    <td className="p-3">
      <div className="h-3.5 w-4 rounded simpati-skeleton" />
    </td>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-3">
        <div
          className="h-3.5 rounded simpati-skeleton"
          style={{ width: `${55 + ((i * 17) % 40)}%` }}
        />
      </td>
    ))}
  </tr>
);

// =========================================================
// KOMPONEN UTAMA
// =========================================================
export default function GenericSurat({ type, title }) {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const [klasifikasiData, setKlasifikasiData] = useState([]);

  const config = tableConfigs[type];

  const notify = (type, message, duration = 3200) => {
    setToast({ id: Date.now(), type, message, duration });
    clearTimeout(notify._t);
    notify._t = setTimeout(() => setToast(null), duration);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: resData, error } = await supabase
      .from(type)
      .select('*')
      .order('id', { ascending: false });
      
    if (!error) setData(resData || []);
    setLoading(false);
  };

  const fetchKlasifikasi = async () => {
    const { data: resData, error } = await supabase
      .from('klasifikasi')
      .select('*')
      .order('id', { ascending: true });
      
    if (!error) setKlasifikasiData(resData || []);
  };

  useEffect(() => {
    fetchData();
    fetchKlasifikasi();
  }, [type]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateKodeKlasifikasi = (kodeArsip, subklasifikasi) => {
    if (!kodeArsip || !subklasifikasi) return '';
    const arsipPart = String(kodeArsip).split(/[\s\-]/)[0].trim();
    const subPart = String(subklasifikasi).split(/[\s\-]/)[0].trim();
    if (arsipPart && subPart) return `${arsipPart}.${subPart}`;
    return '';
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoadingSubmit(true);

    let payloadData = { ...formData };

    // Generate Kode Klasifikasi
    if (!config.formFields.some(f => f.name === 'kode_klasifikasi') && config.tableColumns.includes('kode_klasifikasi')) {
      payloadData.kode_klasifikasi = generateKodeKlasifikasi(payloadData.klasifikasi_kode_arsip, payloadData.subklasifikasi);
    }

    // Isi otomatis nama pengaju / pelaksana dari data user yang login
    if (type === 'surat_keluar') payloadData.nama_pengaju_surat = user?.nama;
    if (type === 'surat_tugas') payloadData.nama_pelaksana = user?.nama;

    // Generate Nomor Surat Otomatis
    if (!config.manualNomor) {
      const validData = data.filter(item => item[config.nomorField]);
      let maxSeq = 0;

      validData.forEach(item => {
        const nomor = String(item[config.nomorField]);
        const match = nomor.match(/(\d+)/);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      });

      const yearNow = new Date().getFullYear();
      const satker = '15070';
      const kodeKlasifikasi = (payloadData.kode_klasifikasi || '').trim();

      if (type === 'surat_keluar' || type === 'surat_tugas') {
        const secCode = type === 'surat_keluar'
          ? (payloadData.klasifikasi_keamanan_dan_akses || 'B').charAt(0)
          : (payloadData.klasifikasi_keamanan || 'B').charAt(0);

        const dateFieldToCheck = type === 'surat_keluar' ? 'tanggal_surat' : 'tanggal_mulai_pelaksanaan';
        const tglSurat = new Date(payloadData[dateFieldToCheck]);
        const tglHariIni = new Date();
        tglHariIni.setHours(0, 0, 0, 0);

        let newNomorSurat = '';

        if (tglSurat < tglHariIni) {
          const targetSeqStr = String(maxSeq).padStart(3, '0');
          let maxSuffixChar = 0;
          const suffixRegex = new RegExp(`-${targetSeqStr}([A-Z])`);
          validData.forEach(item => {
            const nomor = String(item[config.nomorField]);
            const suffixMatch = nomor.match(suffixRegex);
            if (suffixMatch && suffixMatch[1]) {
              const charCode = suffixMatch[1].charCodeAt(0);
              if (charCode > maxSuffixChar) maxSuffixChar = charCode;
            }
          });
          let suffix = 'A';
          if (maxSuffixChar > 0) suffix = String.fromCharCode(maxSuffixChar + 1);
          newNomorSurat = kodeKlasifikasi ? `${secCode}-${targetSeqStr}${suffix}/${satker}/${kodeKlasifikasi}/${yearNow}` : `${secCode}-${targetSeqStr}${suffix}/${satker}/${yearNow}`;
        } else {
          const newSeq = String(maxSeq + 1).padStart(3, '0');
          newNomorSurat = kodeKlasifikasi ? `${secCode}-${newSeq}/${satker}/${kodeKlasifikasi}/${yearNow}` : `${secCode}-${newSeq}/${satker}/${yearNow}`;
        }
        payloadData[config.nomorField] = newNomorSurat;

      } else if (type === 'surat_keputusan') {
        const dateParts = payloadData.tanggal.split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        const mmdd = `${month}${day}`;
        const klasifikasi = (payloadData.klasifikasi || 'KPG').trim();
        let maxSeqDay = 0;
        const seqRegex = new RegExp(`^${mmdd}(\\d{3})/`);
        validData.forEach(item => {
          const nomor = String(item[config.nomorField]);
          const match = nomor.match(seqRegex);
          if (match) {
            const seq = parseInt(match[1], 10);
            if (seq > maxSeqDay) maxSeqDay = seq;
          }
        });
        const newSeq = String(maxSeqDay + 1).padStart(3, '0');
        payloadData[config.nomorField] = `${mmdd}${newSeq}/${satker}/${klasifikasi} TAHUN ${year}`;
      } else if (type === 'surat_internal') {
        const tglSurat = new Date(payloadData.tanggal_surat);
        const tglHariIni = new Date();
        tglHariIni.setHours(0, 0, 0, 0);
        let newNomorSurat = '';
        if (tglSurat < tglHariIni) {
          const targetSeqStr = String(maxSeq).padStart(3, '0');
          let maxSuffixChar = 0;
          const suffixRegex = new RegExp(`^${targetSeqStr}([A-Z])`);
          validData.forEach(item => {
            const nomor = String(item[config.nomorField]);
            const suffixMatch = nomor.match(suffixRegex);
            if (suffixMatch && suffixMatch[1]) {
              const charCode = suffixMatch[1].charCodeAt(0);
              if (charCode > maxSuffixChar) maxSuffixChar = charCode;
            }
          });
          let suffix = 'A';
          if (maxSuffixChar > 0) suffix = String.fromCharCode(maxSuffixChar + 1);
          newNomorSurat = kodeKlasifikasi ? `${targetSeqStr}${suffix}/${satker}/${kodeKlasifikasi}/${yearNow}` : `${targetSeqStr}${suffix}/${satker}/${yearNow}`;
        } else {
          const newSeq = String(maxSeq + 1).padStart(3, '0');
          newNomorSurat = kodeKlasifikasi ? `${newSeq}/${satker}/${kodeKlasifikasi}/${yearNow}` : `${newSeq}/${satker}/${yearNow}`;
        }
        payloadData[config.nomorField] = newNomorSurat;
      } else {
        const newSeq = String(maxSeq + 1).padStart(3, '0');
        const newNomorSurat = kodeKlasifikasi ? `${newSeq}/${satker}/${kodeKlasifikasi}/${yearNow}` : `${newSeq}/${satker}/${yearNow}`;
        payloadData[config.nomorField] = newNomorSurat;
      }
    }

    // INSERT KE SUPABASE
    const { error } = await supabase.from(type).insert([payloadData]);

    if (!error) {
      setShowModal(false);
      setFormData({});
      fetchData();
      notify('success', `${title} berhasil ditambahkan.`);
    } else {
      setFormError(error.message || 'Gagal menambah data. Silakan coba lagi.');
    }
    setLoadingSubmit(false);
  };

  const filteredData = data.filter(item => {
    const matchSearch = Object.values(item).some(val => String(val).toLowerCase().includes(search.toLowerCase()));
    const matchDate = dateFilter ? (item[config.dateField] && String(item[config.dateField]).substring(0,10) === dateFilter) : true;
    return matchSearch && matchDate;
  });

  const uniqueKodeArsip = [...new Set(klasifikasiData.map(k => k.klasifikasi_kode_arsip).filter(Boolean))];
  const availableSubklasifikasi = klasifikasiData.filter(k => k.klasifikasi_kode_arsip === formData.klasifikasi_kode_arsip).map(k => k.subklasifikasi);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#101828]">{title}</h1>
        <button
          onClick={() => { setFormError(''); setShowModal(true); }}
          className="bg-[#0E2338] hover:bg-[#163654] text-white px-4 py-2 rounded-lg flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah {title}
        </button>
      </div>

      <div className="flex gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 flex items-center border border-slate-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#C08A34]/40 focus-within:border-[#C08A34] transition-colors">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input type="text" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-2 outline-none" />
        </div>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-3 text-slate-500 font-semibold">No</th>
              {config.tableLabels.map(label => <th key={label} className="p-3 whitespace-nowrap text-slate-500 font-semibold">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={config.tableLabels.length} />
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={config.tableLabels.length + 1} className="p-10 text-center text-gray-500 simpati-fade-in">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              filteredData.map((item, i) => (
                <tr key={item.id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors simpati-row-in" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                  <td className="p-3">{i + 1}</td>
              {config.tableColumns.map(col => (
              <td key={col} className={`p-3 ${col === config.nomorField ? 'whitespace-nowrap' : ''}`}>
                {col === config.nomorField ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 whitespace-nowrap">{item[col] || '-'}</span>
                    {item[col] && (
                      <button onClick={() => handleCopy(item[col], item.id || i)} className="text-gray-400 hover:text-[#C08A34] transition-colors" title="Salin Nomor Surat">
                        {copiedId === (item.id || i) ? <Check className="w-4 h-4 text-green-500 simpati-pop-in" /> : <Copy className="w-4 h-4" />}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 simpati-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto simpati-modal-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#101828]">Tambah {title}</h2>
              <button
                onClick={() => !loadingSubmit && setShowModal(false)}
                disabled={loadingSubmit}
                className="hover:bg-slate-100 p-1 rounded disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-4">

              {!config.manualNomor && (
                <div className="bg-[#C08A34]/10 text-[#8A611F] p-3 rounded-lg text-sm mb-4 border border-[#C08A34]/20">
                  Nomor surat akan dibuat secara otomatis oleh sistem setelah form ini disimpan.
                </div>
              )}

              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2 simpati-fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <fieldset
                disabled={loadingSubmit}
                className={`space-y-4 border-0 p-0 m-0 transition-opacity duration-200 ${loadingSubmit ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {config.formFields.map((field) => (
                  <div key={field.name} className="relative">
                    <label className="block text-sm font-medium mb-1 text-slate-700">{field.label}</label>

                    {field.type === 'select-dynamic' && field.source === 'arsip' && (
                      <SearchableSelect
                        value={formData[field.name] || ''}
                        onChange={(val) => setFormData({...formData, [field.name]: val, subklasifikasi: '' })}
                        options={uniqueKodeArsip}
                        placeholder={`Pilih ${field.label}`}
                      />
                    )}

                    {field.type === 'select-dynamic' && field.source === 'sub' && (
                      <SearchableSelect
                        value={formData[field.name] || ''}
                        onChange={(val) => setFormData({...formData, [field.name]: val})}
                        options={availableSubklasifikasi}
                        placeholder={`Pilih ${field.label}`}
                        disabled={!formData.klasifikasi_kode_arsip}
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        required
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none bg-white transition-colors"
                      >
                        <option value="" disabled>Pilih {field.label}</option>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}

                    {field.type !== 'select' && field.type !== 'select-dynamic' && (
                      <input
                        type={field.type}
                        required
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors"
                      />
                    )}
                  </div>
                ))}
              </fieldset>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
                {loadingSubmit && <span className="text-xs text-slate-400">Menyimpan data&hellip;</span>}
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="flex items-center justify-center gap-2 bg-[#0E2338] text-white px-6 py-2 rounded-lg hover:bg-[#163654] disabled:opacity-80 transition-colors min-w-[112px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] focus-visible:ring-offset-2"
                >
                  {loadingSubmit ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        @keyframes simpatiFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .simpati-fade-in { animation: simpatiFadeIn 0.25s ease-out; }

        @keyframes simpatiModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .simpati-modal-in { animation: simpatiModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes simpatiPopIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .simpati-pop-in { animation: simpatiPopIn 0.2s ease-out both; }

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

        @keyframes simpatiToastBar {
          from { width: 100%; }
          to { width: 0%; }
        }
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
          .simpati-fade-in, .simpati-modal-in, .simpati-pop-in, .simpati-row-in,
          .simpati-skeleton, .simpati-toast-in, .simpati-toast-bar,
          .simpati-stamp, .simpati-ink-ring {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}