import { useEffect, useState } from 'react';
import { Search, Plus, X, AlertCircle, Check, Upload, FileText, ExternalLink, RefreshCw, Archive, CalendarRange } from 'lucide-react';

// =========================================================
// KONFIGURASI ENDPOINT GOOGLE APPS SCRIPT
// Isi dengan URL /exec hasil deploy Code.gs (lihat file Code.gs terlampir)
// Disarankan taruh di file .env sebagai VITE_ARSIP_APPS_SCRIPT_URL lalu import.meta.env di sini
// =========================================================
const ARSIP_APPS_SCRIPT_URL = import.meta.env.VITE_ARSIP_APPS_SCRIPT_URL || '';

// Ekstensi file yang diizinkan untuk diunggah sebagai arsip surat
const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '-';
  const num = Number(bytes);
  if (isNaN(num) || num === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  return `${(num / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const formatTanggalID = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// =========================================================
// TOAST (notifikasi sukses / gagal, konsisten dengan halaman surat lain)
// =========================================================
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div key={toast.id} className="fixed top-4 right-4 z-[60] w-full max-w-xs simpati-toast-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isSuccess ? 'bg-[#0E2338]' : 'bg-red-50'}`}>
            {isSuccess ? <Check className="w-[18px] h-[18px] text-[#E9C97A]" strokeWidth={3} /> : <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-[#101828]">{isSuccess ? 'Berhasil' : 'Gagal'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    <td className="p-3"><div className="h-3.5 w-4 rounded simpati-skeleton" /></td>
    <td className="p-3"><div className="h-3.5 w-2/3 rounded simpati-skeleton" /></td>
    <td className="p-3"><div className="h-3.5 w-1/2 rounded simpati-skeleton" /></td>
    <td className="p-3"><div className="h-3.5 w-1/3 rounded simpati-skeleton" /></td>
    <td className="p-3"><div className="h-3.5 w-10 rounded simpati-skeleton" /></td>
  </tr>
);

// =========================================================
// KOMPONEN UTAMA
// type   : kunci folder di Google Drive, mis. 'surat_keluar' (harus sama dengan FOLDER_IDS di Code.gs)
// title  : judul halaman, mis. 'Arsip Surat Keluar'
// =========================================================
export default function ArsipSurat({ type, title }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const notify = (t, message, duration = 3200) => {
    setToast({ id: Date.now(), type: t, message, duration });
    clearTimeout(notify._t);
    notify._t = setTimeout(() => setToast(null), duration);
  };

  const fetchFiles = async () => {
    if (!ARSIP_APPS_SCRIPT_URL) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${ARSIP_APPS_SCRIPT_URL}?action=list&folder=${type}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setFiles(json.files || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Gagal memuat daftar arsip dari Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    setSearch('');
    setDateFrom('');
    setDateTo('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setFormError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedFile) {
      setFormError('Silakan pilih file yang ingin diarsipkan.');
      return;
    }
    if (!ARSIP_APPS_SCRIPT_URL) {
      setFormError('URL Google Apps Script belum dikonfigurasi (VITE_ARSIP_APPS_SCRIPT_URL).');
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const res = await fetch(ARSIP_APPS_SCRIPT_URL, {
        method: 'POST',
        // text/plain dipakai supaya tidak memicu CORS preflight ke Apps Script
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'upload',
          folder: type,
          filename: selectedFile.name,
          mimeType: selectedFile.type || 'application/octet-stream',
          base64,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      notify('success', `${selectedFile.name} berhasil diarsipkan ke Google Drive.`);
      setShowModal(false);
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      console.error(err);
      setFormError('Gagal mengunggah file ke Google Drive. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchSearch = String(f.name).toLowerCase().includes(search.toLowerCase());

    let matchDate = true;
    if (f.uploadedAt) {
      const uploaded = new Date(f.uploadedAt);
      uploaded.setHours(0, 0, 0, 0);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (uploaded < from) matchDate = false;
      }
      if (matchDate && dateTo) {
        const to = new Date(dateTo);
        to.setHours(0, 0, 0, 0);
        if (uploaded > to) matchDate = false;
      }
    } else if (dateFrom || dateTo) {
      matchDate = false;
    }

    return matchSearch && matchDate;
  });

  const isDateFilterActive = Boolean(dateFrom || dateTo);
  const clearDateFilter = () => { setDateFrom(''); setDateTo(''); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">{title}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Daftar arsip surat yang tersimpan di Google Drive.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFiles}
            title="Muat ulang"
            className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setFormError(''); setSelectedFile(null); setShowModal(true); }}
            className="bg-[#0E2338] hover:bg-[#163654] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Arsip
          </button>
        </div>
      </div>

      {!ARSIP_APPS_SCRIPT_URL && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            URL Google Apps Script belum diatur. Tambahkan <code className="font-mono">VITE_ARSIP_APPS_SCRIPT_URL</code> pada file <code className="font-mono">.env</code> agar daftar arsip dan fitur unggah dapat berfungsi.
          </span>
        </div>
      )}

      {/* ================= CARD JUMLAH ARSIP ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#0E2338] flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5 text-[#E9C97A]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">
              {isDateFilterActive ? 'Arsip Sesuai Filter Tanggal' : 'Jumlah Arsip Tersedia'}
            </p>
            <p className="text-2xl font-bold text-[#101828] leading-tight">
              {loading ? '-' : filteredFiles.length}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 flex items-center border border-slate-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#C08A34]/40 focus-within:border-[#C08A34] transition-colors">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Cari nama file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3">
          <CalendarRange className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="py-2 outline-none text-sm text-slate-600"
            aria-label="Dari tanggal"
          />
          <span className="text-slate-300 text-sm">s/d</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="py-2 outline-none text-sm text-slate-600"
            aria-label="Sampai tanggal"
          />
          {isDateFilterActive && (
            <button
              onClick={clearDateFilter}
              title="Hapus filter tanggal"
              className="text-slate-400 hover:text-red-500 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-3 text-slate-500 font-semibold">No</th>
              <th className="p-3 text-slate-500 font-semibold">Nama File</th>
              <th className="p-3 text-slate-500 font-semibold">Ukuran</th>
              <th className="p-3 text-slate-500 font-semibold whitespace-nowrap">Tanggal Upload</th>
              <th className="p-3 text-slate-500 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-500">
                  {!ARSIP_APPS_SCRIPT_URL
                    ? 'Menunggu konfigurasi Google Apps Script.'
                    : isDateFilterActive || search
                      ? 'Tidak ada arsip yang cocok dengan filter.'
                      : 'Belum ada arsip yang diunggah.'}
                </td>
              </tr>
            ) : (
              filteredFiles.map((f, i) => (
                <tr key={f.id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#8A611F] shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">{formatBytes(f.size)}</td>
                  <td className="p-3 whitespace-nowrap">{formatTanggalID(f.uploadedAt)}</td>
                  <td className="p-3">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#8A611F] hover:text-[#C08A34] text-sm font-medium"
                    >
                      Buka <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL TAMBAH ARSIP ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#101828]">Tambah Arsip &ndash; {title}</h2>
              <button
                onClick={() => !uploading && setShowModal(false)}
                disabled={uploading}
                className="hover:bg-slate-100 p-1 rounded disabled:opacity-40"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-4 space-y-4">
              <p className="text-xs text-slate-400">
                File yang diunggah akan otomatis tersimpan ke folder Google Drive untuk {title.replace('Arsip ', '')}.
              </p>

              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {!selectedFile ? (
                <label className="flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#C08A34] hover:bg-[#C08A34]/5 transition-colors text-sm text-slate-500">
                  <Upload className="w-5 h-5" />
                  Klik untuk pilih file
                  <span className="text-xs text-slate-400">PDF, DOC/DOCX, atau gambar</span>
                  <input type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleFileChange} className="hidden" disabled={uploading} />
                </label>
              ) : (
                <div className="flex items-center justify-between gap-2 w-full p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#8A611F] shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploading}
                    className="text-slate-400 hover:text-red-500 shrink-0 disabled:opacity-40"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center justify-center gap-2 bg-[#0E2338] text-white px-6 py-2 rounded-lg hover:bg-[#163654] disabled:opacity-70 transition-colors min-w-[120px]"
                >
                  {uploading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Unggah ke Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        @keyframes simpatiShimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .simpati-skeleton {
          background: linear-gradient(90deg, #EEF0F3 25%, #F7F8FA 37%, #EEF0F3 63%);
          background-size: 400% 100%;
          animation: simpatiShimmer 1.4s ease infinite;
        }
        @keyframes simpatiToastIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        .simpati-toast-in { animation: simpatiToastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
    </div>
  );
}
