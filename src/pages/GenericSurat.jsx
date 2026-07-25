import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useAuth } from '../AuthContext';
import { Plus, Search, X, Copy, Check, ChevronDown } from 'lucide-react';

// =========================================================
// KOMPONEN SEARCHABLE DROPDOWN (CUSTOM)
// =========================================================
// =========================================================
// KOMPONEN SEARCHABLE DROPDOWN (CUSTOM)
// =========================================================
const SearchableSelect = ({ value, onChange, options, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filter opsi berdasarkan teks pencarian
  const filteredOptions = options.filter(opt => 
    String(opt).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Tombol Dropdown */}
      <div 
        className={`w-full p-2 border rounded flex items-center justify-between cursor-pointer ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:border-blue-500'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-800 text-sm' : 'text-gray-400 text-sm'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Area Dropdown (Muncul ke ATAS saat isOpen) */}
      {isOpen && !disabled && (
        <>
          {/* Overlay transparan untuk menutup dropdown saat klik di luar */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          
          {/* Panel muncul di atas (bottom-full mb-1) */}
          <div className="absolute z-20 bottom-full mb-1 w-full bg-white border rounded shadow-lg flex flex-col">
            
            {/* Daftar Opsi (bisa di-scroll, urutan normal dari atas) */}
            <div className="max-h-60 overflow-auto">
              <ul className="py-1">
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-gray-500 text-sm">Tidak ada data ditemukan</li>
                ) : (
                  filteredOptions.map((opt, i) => (
                    <li
                      key={i}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${value === opt ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
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

            {/* Input Pencarian (menempel di bawah dropdown) */}
            <div className="border-t p-2 bg-white">
              <div className="flex items-center border rounded px-2">
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
    tableLabels: ['Nomor Surat', 'Pengaju Surat', 'Klasifikasi', 'Tujuan', 'Perihal', 'Tanggal Surat', 'Klasifikasi ', 'Subklasifikasi', 'Kode Klasifikasi', 'Tanggal Pengajuan'],
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
    tableColumns: ['nomor_surat_masuk', 'klasifikasi_keamanan', 'kegiatan', 'tanggal_mulai_pelaksanaan', 'tanggal_selesai_kegiatan', 'klasifikasi_kode_arsip', 'subklasifikasi', 'kode_klasifikasi'],
    tableLabels: ['Nomor Surat', 'Klasifikasi', 'Kegiatan', 'Tgl Mulai', 'Tgl Selesai', 'Klasifikasi ', 'Subklasifikasi', 'Kode Klasifikasi'],
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
  
  const [klasifikasiData, setKlasifikasiData] = useState([]);
  
  const config = tableConfigs[type];

  const fetchData = async () => {
    setLoading(true);
    const res = await apiRequest({ action: 'getAll', sheet: type });
    if (res.success) {
      const sortedData = res.data.sort((a, b) => {
        const idA = parseInt(a.id, 10) || 0;
        const idB = parseInt(b.id, 10) || 0;
        return idB - idA;
      });
      setData(sortedData);
    }
    setLoading(false);
  };

  const fetchKlasifikasi = async () => {
    const res = await apiRequest({ action: 'getAll', sheet: 'klasifikasi' });
    if (res.success) setKlasifikasiData(res.data);
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
    setLoadingSubmit(true);

    let payloadData = { ...formData };

    if (!config.formFields.some(f => f.name === 'kode_klasifikasi') && config.tableColumns.includes('kode_klasifikasi')) {
      payloadData.kode_klasifikasi = generateKodeKlasifikasi(payloadData.klasifikasi_kode_arsip, payloadData.subklasifikasi);
    }

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

    const res = await apiRequest({ 
      action: 'add', 
      sheet: type, 
      data: payloadData, 
      username: user.username,
      namaFallback: user.nama 
    });

    if (res.success) {
      setShowModal(false);
      setFormData({});
      fetchData();
    } else {
      alert('Gagal menambah data: ' + res.error);
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
        <h1 className="text-2xl font-bold">{title}</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Tambah {title}
        </button>
      </div>

      <div className="flex gap-4 mb-4 bg-white p-4 rounded shadow-sm">
        <div className="flex-1 flex items-center border rounded px-3">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input type="text" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-2 outline-none" />
        </div>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2 border rounded" />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">No</th>
              {config.tableLabels.map(label => <th key={label} className="p-3 whitespace-nowrap">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={config.tableLabels.length + 1} className="p-10">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={config.tableLabels.length + 1} className="p-4 text-center text-gray-500">Tidak ada data</td>
              </tr>
            ) : (
              filteredData.map((item, i) => (
                <tr key={item.id || i} className="border-b hover:bg-gray-50">
                  <td className="p-3">{i + 1}</td>
                  {config.tableColumns.map(col => (
                    <td key={col} className="p-3">
                      {col === config.nomorField ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{item[col] || '-'}</span>
                          {item[col] && (
                            <button onClick={() => handleCopy(item[col], item.id || i)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Salin Nomor Surat">
                              {copiedId === (item.id || i) ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Tambah {title}</h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-gray-100 p-1 rounded"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-4 space-y-4">
              
              {!config.manualNomor && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm mb-4">
                  Nomor surat & kode klasifikasi akan dibuat secara otomatis oleh sistem setelah form ini disimpan.
                </div>
              )}

              {config.formFields.map((field) => (
                <div key={field.name} className="relative">
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  
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
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t">
                <button 
                  type="submit" 
                  disabled={loadingSubmit} 
                  className="flex items-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-70 transition-colors"
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
    </div>
  );
}