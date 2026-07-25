import { Download } from 'lucide-react';

const templates = [
  { no: 1, name: 'SOP', file: '/templates/1-sop.docx' },
  { no: 2, name: 'Berita Acara', file: '/templates/2-berita_acara.docx' },
  { no: 3, name: 'Surat Keputusan', file: '/templates/3-surat_keputusan.docx' },
  { no: 4, name: 'Surat Pengantar', file: '/templates/4-surat_pengantar.docx' },
  { no: 5, name: 'Surat Eksternal', file: '/templates/5-surat_eksternal.docx' },
  { no: 6, name: 'Undangan Internal', file: '/templates/6-undangan_internal.docx' },
  { no: 7, name: 'Surat Tugas', file: '/templates/7-surat_tugas.docx' },
];

export default function TemplateSurat() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Template Surat</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 w-16">No</th>
              <th className="p-3">Format Surat</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl) => (
              <tr key={tpl.no} className="border-b hover:bg-gray-50">
                <td className="p-3">{tpl.no}</td>
                <td className="p-3">{tpl.name}</td>
                <td className="p-3 text-right">
                  <a href={tpl.file} download className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">
                    <Download className="w-4 h-4 mr-1" /> Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}