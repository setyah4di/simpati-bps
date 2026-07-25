import { useState } from 'react';
import { Download, Eye, X, FileText, AlertCircle } from 'lucide-react';
import mammoth from 'mammoth';

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
];

export default function TemplateSurat() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewFile, setPreviewFile] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadingFile, setDownloadingFile] = useState(null);

  const getUrl = (file) => BASE_PATH + encodeURIComponent(file);

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

  const handlePreview = async (file, name) => {
    setShowPreview(true);
    setPreviewTitle(name);
    setPreviewFile(file);
    setLoadingPreview(true);
    setPreviewHtml('');
    setErrorMsg('');

    try {
      const url = getUrl(file);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`File tidak ditemukan (status ${response.status})! Pastikan nama file "${file}" di folder public${BASE_PATH} sama persis (termasuk huruf besar/kecil).`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setPreviewHtml(result.value);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#101828]">Template Surat</h1>
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
            {templates.map((tpl) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Preview — full screen, dokumen ditampilkan sepenuh 1 halaman A4 ===== */}
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
                onClick={() => setShowPreview(false)}
                className="hover:bg-white/10 p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Tutup preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Area halaman dokumen — dibuat berukuran A4 sesungguhnya, bukan kotak modal kecil */}
          <div className="flex-1 overflow-auto bg-slate-300 py-8 px-4">
            {loadingPreview ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 rounded-full border-4 border-[#0E2338]/20 border-t-[#0E2338] animate-spin mb-4"></div>
                <p className="text-slate-100 text-sm">Memuat isi dokumen&hellip;</p>
              </div>
            ) : errorMsg ? (
              <div className="max-w-lg mx-auto bg-white border border-red-100 text-red-700 p-5 rounded-xl text-sm flex items-start gap-3 shadow-lg">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <span className="whitespace-pre-wrap">{errorMsg}</span>
              </div>
            ) : (
              <div className="mx-auto w-full overflow-x-auto">
                <div
                  className="simpati-a4-page mx-auto bg-white shadow-2xl prose prose-sm sm:prose-base max-w-none simpati-page-in"
                  style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.5' }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        /* Ukuran A4 asli (21cm x 29.7cm) dengan margin standar dokumen resmi ~2.5cm */
        .simpati-a4-page {
          width: 21cm;
          min-height: 29.7cm;
          padding: 2.5cm;
        }
        @media (max-width: 900px) {
          .simpati-a4-page {
            width: 100%;
            min-width: 21cm;
          }
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
