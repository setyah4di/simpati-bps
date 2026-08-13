import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Download, Eye, X, FileText, AlertCircle, Search, XCircle } from 'lucide-react';
import { renderAsync } from 'docx-preview';

// PENTING: sesuaikan dengan lokasi folder di public.
// Berdasarkan gambar, struktur foldernya: public/templates/templates/<file>.docx
const BASE_PATH = '/templates/templates/';

// Daftar file SESUAI dengan yang ada di folder public/templates/templates/
const templates = [
  { no: 1, name: 'Instruksi Lembaga', file: '1. Instruksi lembaga.docx' },
  { no: 2, name: 'Surat Edaran Kepala', file: '2. surat edaran kepala.docx' },
  { no: 3, name: 'Surat Edaran Pusat', file: '2. surat edaran pusat.docx' },
  { no: 4, name: 'Surat Edaran Daerah', file: '2.1 surat edaran daerah.docx' },
  { no: 5, name: 'Keputusan (Logo Garuda)', file: '3. KEPUTUSAN logo garuda.docx' },
  { no: 6, name: 'Keputusan (Logo BPS)', file: '3.1 KEPUTUSAN logo bps.docx' },
  { no: 7, name: 'Keputusan (Logo BPS - Salinan)', file: '3.2 KEPUTUSAN logo bps - salinan.docx' },
  { no: 8, name: 'Surat Perintah Kepala', file: '4.1 surat perintah kepala.docx' },
  { no: 9, name: 'Surat Perintah Pusat', file: '4.1.1 surat perintah pusat.docx' },
  { no: 10, name: 'Surat Perintah Daerah', file: '4.1.2 surat perintah daerah.docx' },
  { no: 11, name: 'Nota Dinas', file: '5. nota dinas.docx' },
  { no: 12, name: 'Memorandum', file: '6. memorandum.docx' },
  { no: 13, name: 'Undangan Intern Pusat', file: '7. undangan intern pusat.docx' },
  { no: 14, name: 'Undangan Intern Kepala', file: '7.1 undangan intern kepala.docx' },
  { no: 15, name: 'Undangan Intern Daerah', file: '7.3 undangan intern daerah.docx' },
  { no: 16, name: 'Surat Dinas Kepala', file: '8. surat dinas kepala.docx' },
  { no: 17, name: 'Surat Dinas Pusat', file: '8.1 surat dinas pusat.docx' },
  { no: 18, name: 'Surat Dinas Daerah', file: '8.2 surat dinas daerah.docx' },
  { no: 19, name: 'Surat Kuasa', file: '10. surat kuasa.docx' },
  { no: 20, name: 'Berita Acara', file: '11. berita acara.docx' },
  { no: 21, name: 'Berita Acara Daerah', file: '11.1 berita acara daerah.docx' },
  { no: 22, name: 'Surat Keterangan', file: '12. surat keterangan.docx' },
  { no: 23, name: 'Surat Keterangan Daerah', file: '12.1 surat keterangan daerah.docx' },
  { no: 24, name: 'Surat Keterangan Tentang Hal/Peristiwa', file: '12.2 surat keterangan tentang hal atau peristiwa.docx' },
  { no: 25, name: 'Surat Pengantar', file: '13. surat pengantar.docx' },
  { no: 26, name: 'Surat Pengantar Daerah', file: '13.1 surat pengantar daerah.docx' },
  { no: 27, name: 'Pengumuman', file: '14. pengumuman.docx' },
  { no: 28, name: 'Pengumuman Daerah', file: '14.1 pengumuman daerah.docx' },
  { no: 29, name: 'Laporan', file: '15. laporan.docx' },
  { no: 30, name: 'Laporan Daerah', file: '15.1 laporan daerah.docx' },
  { no: 31, name: 'Telaahan Staf', file: '16. TELAAHAN STAF.docx' },
  { no: 32, name: 'Notula', file: '18. notula.docx' },
  { no: 33, name: 'Draft Notulensi Rapat', file: '19. Draft Notulensi Rapat.docx' },
  { no: 34, name: 'Draft Surat Internal', file: '20. Draft Surat Internal.docx' },
  { no: 35, name: 'Draft Surat Tugas', file: '21. Draft Surat Tugas.docx' },
  { no: 36, name: 'Draft Surat Undangan', file: '22. Draft Surat Undangan.docx' },
];

// Opsi docx-preview: dibuat agar hasil render semirip mungkin dengan file asli
// (ukuran halaman, margin, font, alignment, tabel, header/footer semua dipertahankan)
const DOCX_RENDER_OPTIONS = {
  className: 'docx',
  inWrapper: true,
  ignoreWidth: false,
  // Tinggi halaman dibiarkan menyesuaikan konten (bukan dipotong 29.7cm),
  // karena breakPages dimatikan di bawah.
  ignoreHeight: true,
  ignoreFonts: false,
  // PENTING: breakPages HARUS false. Saat true, docx-preview mencoba memecah
  // sendiri baris tabel yang melewati batas halaman (auto page-splitting).
  // Untuk tabel 2 kolom yang isi tiap kolomnya berbeda jumlah paragraf
  // (seperti blok "Notulis" vs "Mengetahui"), proses pemecahan otomatis ini
  // punya bug: salah satu kolom bisa hilang total dari hasil render.
  // Dengan breakPages: false, dokumen dirender mengalir apa adanya (tanpa
  // dipecah paksa oleh library) sehingga semua kolom & isi tabel tetap utuh.
  breakPages: false,
  ignoreLastRenderedPageBreak: true,
  experimental: true,
  trimXmlDeclaration: true,
  useBase64URL: true,
  renderChanges: false,
  renderHeaders: true,
  renderFooters: true,
  renderFootnotes: true,
  renderEndnotes: true,
  debug: false,
};

export default function TemplateSurat() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewFile, setPreviewFile] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadingFile, setDownloadingFile] = useState(null);

  // ===== State untuk fitur search =====
  const [searchQuery, setSearchQuery] = useState('');

  // Container tempat docx-preview menyuntikkan halaman hasil render
  const previewContainerRef = useRef(null);

  const getUrl = (file) => BASE_PATH + encodeURIComponent(file);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (tpl) =>
        tpl.name.toLowerCase().includes(q) ||
        tpl.file.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleDownload = async (file) => {
    setDownloadingFile(file);
    try {
      const url = getUrl(file);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`File tidak ditemukan (status ${response.status}). Pastikan file "${file}" ada di folder public${BASE_PATH}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert(error.message);
    } finally {
      setDownloadingFile(null);
    }
  };

  // Render dokumen ke dalam container menggunakan docx-preview,
  // bukan lagi konversi ke HTML string via mammoth.
  const renderDocxPreview = useCallback(async (file) => {
    setLoadingPreview(true);
    setErrorMsg('');

    try {
      const url = getUrl(file);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`File tidak ditemukan (status ${response.status})! Pastikan nama file "${file}" di folder public${BASE_PATH} sama persis (termasuk huruf besar/kecil).`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Bersihkan hasil render sebelumnya agar tidak menumpuk
      if (previewContainerRef.current) {
        previewContainerRef.current.innerHTML = '';
      }

      await renderAsync(
        arrayBuffer,
        previewContainerRef.current,
        previewContainerRef.current,
        DOCX_RENDER_OPTIONS
      );
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error?.message ||
          'Gagal menampilkan preview dokumen. Coba download file untuk melihat isi aslinya.'
      );
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  const handlePreview = (file, name) => {
    setPreviewTitle(name);
    setPreviewFile(file);
    setShowPreview(true);
  };

  // Trigger render setelah container ter-mount di DOM (saat showPreview jadi true)
  useEffect(() => {
    if (showPreview && previewFile) {
      renderDocxPreview(previewFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview, previewFile]);

  const closePreview = () => {
    setShowPreview(false);
    setPreviewFile('');
    setErrorMsg('');
    if (previewContainerRef.current) {
      previewContainerRef.current.innerHTML = '';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#101828]">Template Surat</h1>

        {/* ===== Input pencarian ===== */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama format surat..."
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C08A34] focus:border-transparent transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Bersihkan pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-3 w-16 text-slate-500 font-semibold">No</th>
              <th className="p-3 text-slate-500 font-semibold">Format Surat</th>
              <th className="p-3 text-right w-48 text-slate-500 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-400">
                  <Search className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  Tidak ada format surat yang cocok dengan pencarian "{searchQuery}".
                </td>
              </tr>
            ) : (
              filteredTemplates.map((tpl) => (
                <tr key={tpl.no} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3">{tpl.no}</td>
                  <td className="p-3 flex items-center text-gray-800 font-medium">
                    <FileText className="w-4 h-4 mr-2 text-[#C08A34] shrink-0" />
                    {tpl.name}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handlePreview(tpl.file, tpl.name)}
                        className="inline-flex items-center bg-[#0E2338] hover:bg-[#163654] text-white px-3 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] focus-visible:ring-offset-1"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Preview
                      </button>
                      <button
                        onClick={() => handleDownload(tpl.file)}
                        disabled={downloadingFile === tpl.file}
                        className="inline-flex items-center bg-[#C08A34] hover:bg-[#AD7A2C] text-white px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E2338] focus-visible:ring-offset-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {downloadingFile === tpl.file ? 'Mengunduh...' : 'Download'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Preview — full screen, dokumen dirender apa adanya oleh docx-preview ===== */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm simpati-fade-in">
          {/* Toolbar atas */}
          <div className="flex justify-between items-center px-4 sm:px-6 py-3 bg-[#0E2338] text-white shrink-0 shadow-lg z-10">
            <h2 className="text-base sm:text-lg font-bold flex items-center min-w-0">
              <FileText className="w-5 h-5 mr-2 text-[#E9C97A] shrink-0" />
              <span className="truncate">{previewTitle}</span>
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDownload(previewFile)}
                disabled={downloadingFile === previewFile}
                className="hidden sm:inline-flex items-center bg-[#C08A34] hover:bg-[#AD7A2C] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Download className="w-4 h-4 mr-1" />
                {downloadingFile === previewFile ? 'Mengunduh...' : 'Download'}
              </button>
              <button
                onClick={closePreview}
                className="hover:bg-white/10 p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Tutup preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Area halaman dokumen */}
          <div className="flex-1 overflow-auto bg-slate-300 py-8 px-4 relative">
            {loadingPreview && (
              <div className="absolute inset-0 flex flex-col items-center justify-center py-24 bg-slate-300/90 z-10">
                <div className="w-12 h-12 rounded-full border-4 border-[#0E2338]/20 border-t-[#0E2338] animate-spin mb-4"></div>
                <p className="text-slate-700 text-sm">Memuat isi dokumen&hellip;</p>
              </div>
            )}

            {errorMsg && !loadingPreview && (
              <div className="max-w-lg mx-auto bg-white border border-red-100 text-red-700 p-5 rounded-xl text-sm flex items-start gap-3 shadow-lg">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <span className="whitespace-pre-wrap">{errorMsg}</span>
              </div>
            )}

            {/* Container ini WAJIB selalu ter-mount (tidak di-unmount kondisional)
                supaya ref-nya tersedia saat renderAsync dipanggil */}
            <div
              ref={previewContainerRef}
              className={`simpati-docx-container mx-auto simpati-page-in ${errorMsg ? 'hidden' : ''}`}
            />
          </div>
        </div>
      )}

      <style>{`
        /* docx-preview membuat elemen .docx-wrapper > .docx (per halaman) dengan
           ukuran & margin PERSIS sesuai section properties file aslinya, jadi kita
           tidak perlu lagi memaksakan ukuran A4 secara manual seperti versi mammoth. */
        .simpati-docx-container .docx-wrapper {
          background: transparent;
          padding: 0;
        }
        .simpati-docx-container .docx-wrapper > .docx {
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 30px -5px rgba(0,0,0,0.35);
        }

        /* PENTING: paksa semua tabel di dalam hasil render docx-preview memakai
           layout tabel native browser (table/table-row/table-cell), apa pun CSS
           global di aplikasi ini (mis. reset/CSS tabel responsif dari dashboard
           lain yang tidak di-scope). Tanpa ini, kolom kanan pada tabel tanda
           tangan (mis. "Mengetahui, ...") bisa collapse/hilang secara visual
           walau isinya sebenarnya ada di HTML. */
        .simpati-docx-container table {
          display: table !important;
          width: auto !important;
          table-layout: auto !important;
          border-collapse: collapse !important;
          max-width: none !important;
        }
        .simpati-docx-container tbody {
          display: table-row-group !important;
        }
        .simpati-docx-container tr {
          display: table-row !important;
        }
        .simpati-docx-container td,
        .simpati-docx-container th {
          display: table-cell !important;
          float: none !important;
          width: auto !important;
          max-width: none !important;
          vertical-align: top;
        }

        @keyframes simpatiFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .simpati-fade-in { animation: simpatiFadeIn 0.25s ease-out; }

        @keyframes simpatiPageIn {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .simpati-page-in { animation: simpatiPageIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }

        @media (prefers-reduced-motion: reduce) {
          .simpati-fade-in, .simpati-page-in {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
