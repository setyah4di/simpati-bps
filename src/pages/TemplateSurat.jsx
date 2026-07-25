import { useState } from 'react';
import { Download, Eye, X, FileText } from 'lucide-react';
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
      <h1 className="text-2xl font-bold mb-6">Template Surat</h1>
      <div className="bg-white rounded shadow overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 w-16">No</th>
              <th className="p-3">Format Surat</th>
              <th className="p-3 text-right w-48">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl) => (
              <tr key={tpl.no} className="border-b hover:bg-gray-50">
                <td className="p-3">{tpl.no}</td>
                <td className="p-3 flex items-center text-gray-800 font-medium">
                  <FileText className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
                  {tpl.name}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handlePreview(tpl.file, tpl.name)}
                      className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Preview
                    </button>
                    <button
                      onClick={() => handleDownload(tpl.file)}
                      disabled={downloadingFile === tpl.file}
                      className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
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

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-lg z-10">
              <h2 className="text-xl font-bold flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                {previewTitle}
              </h2>
              <button onClick={() => setShowPreview(false)} className="hover:bg-gray-100 p-1 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                  <p className="text-gray-500">Memuat isi dokumen...</p>
                </div>
              ) : errorMsg ? (
                <div className="bg-red-50 text-red-600 p-4 rounded text-center whitespace-pre-wrap">
                  {errorMsg}
                </div>
              ) : (
                <div
                  className="bg-white p-8 md:p-12 shadow-md mx-auto max-w-3xl prose prose-sm sm:prose-base lg:prose-lg max-w-none"
                  style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.5' }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}