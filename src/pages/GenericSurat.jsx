import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { Plus, Search, X, Copy, Check, ChevronDown, AlertCircle, Upload, FileText, Trash2, Eye, Pencil } from 'lucide-react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

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
    manualNomor: false,
    listColumns: [
      { field: 'nomor_surat_keluar', label: 'Nomor Surat' },
      { field: 'tanggal_surat', label: 'Tanggal Surat' },
      { field: 'perihal', label: 'Perihal' },
      { field: 'tujuan', label: 'Tujuan' },
    ]
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
    manualNomor: true,
    listColumns: [
      { field: 'nomor_surat', label: 'Nomor Surat' },
      { field: 'tanggal_surat', label: 'Tanggal Surat' },
      { field: 'pengirim', label: 'Pengirim' },
      { field: 'perihal', label: 'Perihal' },
    ]
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
    manualNomor: false,
    listColumns: [
      { field: 'nomor_surat_masuk', label: 'Nomor Surat' },
      { field: 'nama_pelaksana', label: 'Nama Pelaksana' },
      { field: 'tanggal_pengajuan', label: 'Tanggal Pengajuan' },
      { field: 'kegiatan', label: 'Kegiatan' },
    ]
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
    manualNomor: false,
    listColumns: [
      { field: 'nomor_surat', label: 'Nomor Surat' },
      { field: 'tanggal', label: 'Tanggal' },
      { field: 'perihal', label: 'Perihal' },
      { field: 'klasifikasi', label: 'Klasifikasi' },
    ]
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
    manualNomor: false,
    listColumns: [
      { field: 'nomor_surat_internal', label: 'Nomor Surat' },
      { field: 'tanggal_surat', label: 'Tanggal Surat' },
      { field: 'perihal', label: 'Perihal' },
      { field: 'pihak_yang_dituju', label: 'Pihak yang Dituju' },
    ]
  }
};

const SATKER_CODE = '15070';

// =========================================================
// GENERATOR NOMOR SURAT (murni, tanpa side-effect)
// Dipisah dari handleAdd supaya bisa dipanggil ULANG saat retry
// jika terjadi tabrakan nomor antar user (lihat handleAdd).
// =========================================================
const computeNomorSurat = (type, payloadData, existingData, config) => {
  const validData = existingData.filter((item) => item[config.nomorField]);
  let maxSeq = 0;
  validData.forEach((item) => {
    const nomor = String(item[config.nomorField]);
    const match = nomor.match(/(\d+)/);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  });

  const yearNow = new Date().getFullYear();
  const satker = SATKER_CODE;
  const kodeKlasifikasi = (payloadData.kode_klasifikasi || '').trim();

  if (type === 'surat_keluar' || type === 'surat_tugas') {
    const secCode = type === 'surat_keluar'
      ? (payloadData.klasifikasi_keamanan_dan_akses || 'B').charAt(0)
      : (payloadData.klasifikasi_keamanan || 'B').charAt(0);

    const dateFieldToCheck = type === 'surat_keluar' ? 'tanggal_surat' : 'tanggal_mulai_pelaksanaan';
    const tglSurat = new Date(payloadData[dateFieldToCheck]);
    const tglHariIni = new Date();
    tglHariIni.setHours(0, 0, 0, 0);

    if (tglSurat < tglHariIni) {
      const targetSeqStr = String(maxSeq).padStart(3, '0');
      let maxSuffixChar = 0;
      const suffixRegex = new RegExp(`-${targetSeqStr}([A-Z])`);
      validData.forEach((item) => {
        const nomor = String(item[config.nomorField]);
        const suffixMatch = nomor.match(suffixRegex);
        if (suffixMatch && suffixMatch[1]) {
          const charCode = suffixMatch[1].charCodeAt(0);
          if (charCode > maxSuffixChar) maxSuffixChar = charCode;
        }
      });
      let suffix = 'A';
      if (maxSuffixChar > 0) suffix = String.fromCharCode(maxSuffixChar + 1);
      return kodeKlasifikasi
        ? `${secCode}-${targetSeqStr}${suffix}/${satker}/${kodeKlasifikasi}/${yearNow}`
        : `${secCode}-${targetSeqStr}${suffix}/${satker}/${yearNow}`;
    }

    const newSeq = String(maxSeq + 1).padStart(3, '0');
    return kodeKlasifikasi
      ? `${secCode}-${newSeq}/${satker}/${kodeKlasifikasi}/${yearNow}`
      : `${secCode}-${newSeq}/${satker}/${yearNow}`;
  }

  if (type === 'surat_keputusan') {
    const dateParts = payloadData.tanggal.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const mmdd = `${month}${day}`;
    const klasifikasi = (payloadData.klasifikasi || 'KPG').trim();
    let maxSeqDay = 0;
    const seqRegex = new RegExp(`^${mmdd}(\\d{3})/`);
    validData.forEach((item) => {
      const nomor = String(item[config.nomorField]);
      const match = nomor.match(seqRegex);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeqDay) maxSeqDay = seq;
      }
    });
    const newSeq = String(maxSeqDay + 1).padStart(3, '0');
    return `${mmdd}${newSeq}/${satker}/${klasifikasi} TAHUN ${year}`;
  }

  if (type === 'surat_internal') {
    const tglSurat = new Date(payloadData.tanggal_surat);
    const tglHariIni = new Date();
    tglHariIni.setHours(0, 0, 0, 0);

    if (tglSurat < tglHariIni) {
      const targetSeqStr = String(maxSeq).padStart(3, '0');
      let maxSuffixChar = 0;
      const suffixRegex = new RegExp(`^${targetSeqStr}([A-Z])`);
      validData.forEach((item) => {
        const nomor = String(item[config.nomorField]);
        const suffixMatch = nomor.match(suffixRegex);
        if (suffixMatch && suffixMatch[1]) {
          const charCode = suffixMatch[1].charCodeAt(0);
          if (charCode > maxSuffixChar) maxSuffixChar = charCode;
        }
      });
      let suffix = 'A';
      if (maxSuffixChar > 0) suffix = String.fromCharCode(maxSuffixChar + 1);
      return kodeKlasifikasi
        ? `${targetSeqStr}${suffix}/${satker}/${kodeKlasifikasi}/${yearNow}`
        : `${targetSeqStr}${suffix}/${satker}/${yearNow}`;
    }

    const newSeq = String(maxSeq + 1).padStart(3, '0');
    return kodeKlasifikasi
      ? `${newSeq}/${satker}/${kodeKlasifikasi}/${yearNow}`
      : `${newSeq}/${satker}/${yearNow}`;
  }

  const newSeq = String(maxSeq + 1).padStart(3, '0');
  return kodeKlasifikasi ? `${newSeq}/${satker}/${kodeKlasifikasi}/${yearNow}` : `${newSeq}/${satker}/${yearNow}`;
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
// KONFIGURASI DELIMITER TAG PADA TEMPLATE
// Template surat di sini pakai format ${nama_tag}, BUKAN {nama_tag}
// =========================================================
const TEMPLATE_DELIMITERS = { start: '${', end: '}' };
const TAG_REGEX = /\$\{([a-zA-Z0-9_]+)\}/g;

// Baca isi word/document.xml dari file .docx lalu ambil semua nama tag ${...} yang unik
const extractTemplateTags = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const zip = new PizZip(arrayBuffer);
  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) return [];
  const xml = docXmlFile.asText();
  const text = xml.replace(/<[^>]+>/g, ''); // buang tag XML, sisakan teks
  const tags = new Set();
  let match;
  TAG_REGEX.lastIndex = 0;
  while ((match = TAG_REGEX.exec(text)) !== null) {
    tags.add(match[1]);
  }
  return [...tags];
};

// Ubah nama_tag_seperti_ini jadi "Nama Tag Seperti Ini" untuk label input
const prettifyTagLabel = (tag) =>
  tag
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Tag yang mengandung kata "ttd" atau "tte" dianggap sebagai slot tanda tangan,
// dan sengaja dibiarkan KOSONG (tidak diminta input, tidak diisi gambar apa pun).
const SIGNATURE_TAG_PATTERN = /ttd|tte/i;
const isSignatureTag = (tag) => SIGNATURE_TAG_PATTERN.test(tag);

// =========================================================
// HELPER: isi template .docx dengan data surat -> Blob
// =========================================================
const generateFilledDocument = async (file, templateData) => {
  const arrayBuffer = await file.arrayBuffer();
  const zip = new PizZip(arrayBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: TEMPLATE_DELIMITERS,
    // Tag teks yang tidak ada datanya akan diisi string kosong, bukan error
    nullGetter: () => '',
  });

  doc.render(templateData);

  const outBuffer = doc.getZip().generate({ type: 'arraybuffer' });
  const blob = new Blob([outBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return blob;
};

// Format tanggal ke gaya Indonesia, mis. "20 Agustus 2026"
const formatTanggalID = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const [klasifikasiData, setKlasifikasiData] = useState([]);

  // ------- state untuk fitur template surat -------
  const [templateFile, setTemplateFile] = useState(null);
  const [templateFileName, setTemplateFileName] = useState('');
  const [generatingDocument, setGeneratingDocument] = useState(false);
  // Tag ${...} di template yang TIDAK bisa diisi otomatis dari data form -> minta user isi manual
  const [extraTemplateFields, setExtraTemplateFields] = useState([]);
  const [extraTemplateData, setExtraTemplateData] = useState({});
  const [scanningTemplate, setScanningTemplate] = useState(false);
  const [detectedTemplateTags, setDetectedTemplateTags] = useState([]);

  // ------- state untuk aksi Detail / Edit / Hapus -------
  const [detailItem, setDetailItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editFormError, setEditFormError] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

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
    setFormData({});
    setFormError('');
    setShowModal(false);
    setTemplateFile(null);
    setTemplateFileName('');
    setExtraTemplateFields([]);
    setExtraTemplateData({});
    setDetectedTemplateTags([]);
    setDetailItem(null);
    setShowEditModal(false);
    setEditItem(null);
    setEditFormData({});
    setEditFormError('');
    setDeleteTarget(null);
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

  const getAutoTagResolvers = (payload) => ({
    nomor_naskah: payload[config.nomorField] || '',
    nomor_surat_final: payload[config.nomorField] || '',
    tanggal_naskah: formatTanggalID(new Date()),
    judul_surat: title,
    nama_pemohon: user?.nama || '',
  });

  const resolveTemplateFields = (tags) => {
    const autoResolvers = getAutoTagResolvers(formData);
    const formFieldNames = config.formFields.map((f) => f.name);
    const unresolved = tags.filter((tag) => {
      if (isSignatureTag(tag)) return false;
      const isAutoTag = Object.prototype.hasOwnProperty.call(autoResolvers, tag);
      const isFormField = formFieldNames.includes(tag);
      const isFormattedDate = tag.endsWith('_terformat') && formFieldNames.includes(tag.replace('_terformat', ''));
      return !isAutoTag && !isFormField && !isFormattedDate;
    });
    return unresolved;
  };

  const handleTemplateFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
      notify('error', 'File template harus berformat .docx');
      e.target.value = '';
      return;
    }
    setTemplateFile(file);
    setTemplateFileName(file.name);
    setExtraTemplateData({});
    setScanningTemplate(true);
    try {
      const tags = await extractTemplateTags(file);
      if (tags.length === 0) {
        notify('error', 'Tidak ditemukan tag ${...} pada template ini. Pastikan template memakai format ${nama_tag}.');
      }
      setDetectedTemplateTags(tags);
      const unresolved = resolveTemplateFields(tags);
      setExtraTemplateFields(unresolved);
    } catch (err) {
      console.error(err);
      notify('error', 'Gagal membaca isi template. Pastikan file .docx tidak rusak.');
      setExtraTemplateFields([]);
      setDetectedTemplateTags([]);
    } finally {
      setScanningTemplate(false);
    }
    e.target.value = '';
  };

  const removeTemplateFile = () => {
    setTemplateFile(null);
    setTemplateFileName('');
    setExtraTemplateFields([]);
    setExtraTemplateData({});
    setDetectedTemplateTags([]);
  };

  const buildTemplateData = async (payload) => {
    const templateData = { ...payload, ...getAutoTagResolvers(payload), ...extraTemplateData };

    Object.keys(payload).forEach((key) => {
      if (key.toLowerCase().includes('tanggal') && payload[key]) {
        templateData[`${key}_terformat`] = formatTanggalID(payload[key]);
      }
    });

    const signatureTags = detectedTemplateTags.filter(isSignatureTag);
    signatureTags.forEach((tag) => {
      templateData[tag] = '';
    });

    return templateData;
  };

  const handleGenerateAndDownload = async (payloadData) => {
    if (!templateFile) return;
    setGeneratingDocument(true);
    try {
      const templateData = await buildTemplateData(payloadData);
      const blob = await generateFilledDocument(templateFile, templateData);
      saveAs(blob, `${title.replace(/\s+/g, '_')}_${Date.now()}.docx`);
    } catch (err) {
      console.error(err);
      notify('error', 'Gagal membuat dokumen dari template. Pastikan tag placeholder pada template sudah sesuai (contoh: ${perihal}, ${nomor_naskah}).');
    } finally {
      setGeneratingDocument(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validasi: jika template punya tag yang butuh diisi manual, wajib terisi dulu
    if (templateFile && extraTemplateFields.length > 0) {
      const belumTerisi = extraTemplateFields.filter((tag) => !String(extraTemplateData[tag] || '').trim());
      if (belumTerisi.length > 0) {
        setFormError(`Mohon lengkapi data untuk template: ${belumTerisi.map(prettifyTagLabel).join(', ')}.`);
        return;
      }
    }

    setLoadingSubmit(true);

    let payloadData = { ...formData };

    // Generate Kode Klasifikasi
    if (!config.formFields.some(f => f.name === 'kode_klasifikasi') && config.tableColumns.includes('kode_klasifikasi')) {
      payloadData.kode_klasifikasi = generateKodeKlasifikasi(payloadData.klasifikasi_kode_arsip, payloadData.subklasifikasi);
    }

    // Isi otomatis nama pengaju / pelaksana dari data user yang login
    if (type === 'surat_keluar') payloadData.nama_pengaju_surat = user?.nama;
    if (type === 'surat_tugas') payloadData.nama_pelaksana = user?.nama;

    const allowedKeys = new Set([
      config.nomorField,
      config.dateField,
      'kode_klasifikasi',
      'nama_pengaju_surat',
      'nama_pelaksana',
      ...config.formFields.map((f) => f.name),
    ]);

    // ===============================================================
    // PENANGANAN RACE CONDITION NOMOR SURAT (dua user submit bersamaan)
    // ===============================================================
    // Nomor surat dibuat di sisi klien dari data yang barusan dibaca, jadi
    // dua user yang submit hampir bersamaan bisa saja menghitung nomor yang
    // sama sebelum salah satu insert-nya benar-benar tersimpan.
    //
    // Solusinya: perlakukan ini sebagai "optimistic write" lalu retry kalau
    // gagal. Ini WAJIB dipasangkan dengan UNIQUE constraint pada kolom nomor
    // surat di database (lihat catatan SQL yang saya kirim terpisah) —
    // tanpa constraint itu, Postgres akan mengizinkan dua baris dengan nomor
    // sama dan retry di bawah ini tidak akan pernah terpicu.
    //
    // Alur tiap percobaan:
    //   1. Ambil ulang data terbaru dari tabel (bukan state lama di memori).
    //   2. Hitung nomor surat berikutnya dari data terbaru itu.
    //   3. Coba insert.
    //   4. Kalau gagal karena unique_violation (kode Postgres 23505),
    //      berarti ada user lain yang barusan "menang" nomor yang sama -
    //      ulangi dari langkah 1 dengan sedikit jeda acak, sampai maksimal
    //      MAX_ATTEMPTS kali.
    // ===============================================================
    const MAX_ATTEMPTS = 5;
    let lastError = null;
    let succeeded = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      if (!config.manualNomor) {
        const { data: latestData, error: fetchErr } = await supabase
          .from(type)
          .select('*')
          .order('id', { ascending: false });

        if (fetchErr) {
          lastError = fetchErr;
          break;
        }

        payloadData[config.nomorField] = computeNomorSurat(type, payloadData, latestData || [], config);
      }

      const sanitizedPayloadData = Object.fromEntries(
        Object.entries(payloadData).filter(([key]) => allowedKeys.has(key))
      );

      const { error } = await supabase.from(type).insert([sanitizedPayloadData]);

      if (!error) {
        succeeded = true;
        lastError = null;
        break;
      }

      lastError = error;

      // 23505 = unique_violation di Postgres. Nomor manual (surat_masuk) tidak
      // di-retry otomatis karena nomornya memang input bebas dari user.
      const isNomorClash = error.code === '23505' && !config.manualNomor;
      if (!isNomorClash) break;

      // Jeda kecil + acak sebelum mencoba lagi, supaya beberapa user yang
      // tabrakan bersamaan tidak langsung tabrakan lagi di percobaan berikutnya.
      await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 250));
    }

    if (succeeded) {
      setShowModal(false);
      fetchData();
      notify('success', `${title} berhasil ditambahkan.`);

      // Jika user melampirkan template, langsung isi otomatis & unduh dokumennya
      if (templateFile) {
        await handleGenerateAndDownload(payloadData);
      }

      setFormData({});
      setTemplateFile(null);
      setTemplateFileName('');
      setExtraTemplateFields([]);
      setExtraTemplateData({});
      setDetectedTemplateTags([]);
    } else {
      const isNomorClash = lastError?.code === '23505' && !config.manualNomor;
      setFormError(
        isNomorClash
          ? 'Nomor surat berulang kali bentrok dengan pengajuan lain yang masuk hampir bersamaan. Silakan coba simpan sekali lagi.'
          : (lastError?.message || 'Gagal menambah data. Silakan coba lagi.')
      );
    }
    setLoadingSubmit(false);
  };

  // ------- Aksi: Detail -------
  const openDetail = (item) => setDetailItem(item);
  const closeDetail = () => setDetailItem(null);

  // ------- Aksi: Edit (nomor surat tidak bisa diubah) -------
  const openEdit = (item) => {
    setEditItem(item);
    setEditFormData({ ...item });
    setEditFormError('');
    setShowEditModal(true);
  };

  const closeEdit = () => {
    if (loadingEdit) return;
    setShowEditModal(false);
    setEditItem(null);
    setEditFormData({});
    setEditFormError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditFormError('');
    if (!editItem) return;

    setLoadingEdit(true);

    let payloadData = { ...editFormData };

    payloadData[config.nomorField] = editItem[config.nomorField];

    if (!config.formFields.some((f) => f.name === 'kode_klasifikasi') && config.tableColumns.includes('kode_klasifikasi')) {
      payloadData.kode_klasifikasi = generateKodeKlasifikasi(payloadData.klasifikasi_kode_arsip, payloadData.subklasifikasi);
    }

    const allowedKeys = new Set([
      config.dateField,
      'kode_klasifikasi',
      ...config.formFields.map((f) => f.name),
    ]);
    const sanitizedPayloadData = Object.fromEntries(
      Object.entries(payloadData).filter(([key]) => allowedKeys.has(key) && key !== config.nomorField)
    );

    const { error } = await supabase.from(type).update(sanitizedPayloadData).eq('id', editItem.id);

    if (!error) {
      notify('success', `${title} berhasil diperbarui.`);
      closeEdit();
      fetchData();
    } else {
      setEditFormError(error.message || 'Gagal memperbarui data. Silakan coba lagi.');
    }
    setLoadingEdit(false);
  };

  // ------- Aksi: Hapus -------
  const openDeleteConfirm = (item) => setDeleteTarget(item);
  const closeDeleteConfirm = () => {
    if (loadingDelete) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setLoadingDelete(true);
    const { error } = await supabase.from(type).delete().eq('id', deleteTarget.id);
    if (!error) {
      notify('success', `${title} berhasil dihapus.`);
      setDeleteTarget(null);
      fetchData();
    } else {
      notify('error', error.message || 'Gagal menghapus data. Silakan coba lagi.');
    }
    setLoadingDelete(false);
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
              {config.listColumns.map((col) => (
                <th key={col.field} className="p-3 whitespace-nowrap text-slate-500 font-semibold">{col.label}</th>
              ))}
              <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={config.listColumns.length + 1} />
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={config.listColumns.length + 2} className="p-10 text-center text-gray-500 simpati-fade-in">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              filteredData.map((item, i) => (
                <tr key={item.id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors simpati-row-in" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                  <td className="p-3">{i + 1}</td>
                  {config.listColumns.map((col) => (
                    <td key={col.field} className="p-3 whitespace-nowrap">
                      {col.field === config.nomorField ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 whitespace-nowrap">{item[col.field] || '-'}</span>
                          {item[col.field] && (
                            <button onClick={() => handleCopy(item[col.field], item.id || i)} className="text-gray-400 hover:text-[#C08A34] transition-colors" title="Salin Nomor Surat">
                              {copiedId === (item.id || i) ? <Check className="w-4 h-4 text-green-500 simpati-pop-in" /> : <Copy className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      ) : (
                        item[col.field] || '-'
                      )}
                    </td>
                  ))}
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openDetail(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0E2338] hover:bg-slate-100 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#C08A34] hover:bg-slate-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
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

                {/* ================= UPLOAD TEMPLATE SURAT ================= */}
                {type !== 'surat_masuk' && (
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-sm font-medium mb-1 text-slate-700">
                      Template Surat (.docx) <span className="text-slate-400 font-normal">- Opsional</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-2">
                      Jika diunggah, sistem akan otomatis mengisi nomor surat dan data lain ke dalam template lalu langsung mengunduh hasilnya setelah disimpan.
                    </p>

                    {!templateFileName ? (
                      <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#C08A34] hover:bg-[#C08A34]/5 transition-colors text-sm text-slate-500">
                        <Upload className="w-4 h-4" />
                        Klik untuk pilih file .docx
                        <input type="file" accept=".docx" onChange={handleTemplateFileChange} className="hidden" />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between gap-2 w-full p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-[#8A611F] shrink-0" />
                          <span className="text-sm text-slate-700 truncate">{templateFileName}</span>
                          {scanningTemplate && <span className="text-xs text-slate-400 shrink-0">(memindai tag&hellip;)</span>}
                        </div>
                        <button
                          type="button"
                          onClick={removeTemplateFile}
                          className="text-slate-400 hover:text-red-500 shrink-0"
                          title="Hapus template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {type !== 'surat_masuk' && templateFileName && !scanningTemplate && extraTemplateFields.length > 0 && (
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Data Tambahan untuk Template</p>
                      <p className="text-xs text-slate-400">
                        Tag berikut ditemukan di template tapi tidak ada di form ini, mohon lengkapi manual.
                      </p>
                    </div>
                    {extraTemplateFields.map((tag) => (
                      <div key={tag}>
                        <label className="block text-sm font-medium mb-1 text-slate-700">{prettifyTagLabel(tag)}</label>
                        <input
                          type="text"
                          required
                          value={extraTemplateData[tag] || ''}
                          onChange={(e) => setExtraTemplateData({ ...extraTemplateData, [tag]: e.target.value })}
                          placeholder={`Isi untuk \${${tag}}`}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {type !== 'surat_masuk' && templateFileName && !scanningTemplate && detectedTemplateTags.some(isSignatureTag) && (
                  <p className="text-xs text-slate-400 -mt-2">
                    Tag tanda tangan ({detectedTemplateTags.filter(isSignatureTag).join(', ')}) akan dibiarkan kosong pada dokumen hasil.
                  </p>
                )}

                {type !== 'surat_masuk' && templateFileName && !scanningTemplate && extraTemplateFields.length === 0 && !detectedTemplateTags.some(isSignatureTag) && (
                  <p className="text-xs text-emerald-600 -mt-2">
                    Semua tag pada template bisa terisi otomatis dari form ini.
                  </p>
                )}
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
                  ) : (templateFileName ? 'Simpan & Unduh Dokumen' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DETAIL SURAT ================= */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 simpati-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto simpati-modal-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#101828]">Detail {title}</h2>
              <button onClick={closeDetail} className="hover:bg-slate-100 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34]">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {config.tableColumns.map((col, i) => (
                <div key={col} className="grid grid-cols-3 gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500 col-span-1">{config.tableLabels[i]}</span>
                  <span className="text-sm text-gray-800 font-medium col-span-2 break-words">
                    {detailItem[col] || '-'}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-end p-4 border-t border-slate-100">
              <button
                onClick={closeDetail}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL EDIT SURAT (nomor surat tidak bisa diubah) ================= */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 simpati-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto simpati-modal-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#101828]">Edit {title}</h2>
              <button
                onClick={closeEdit}
                disabled={loadingEdit}
                className="hover:bg-slate-100 p-1 rounded disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-4 space-y-4">
              <div className="bg-slate-50 text-slate-500 p-3 rounded-lg text-sm border border-slate-100">
                Nomor surat tidak dapat diubah.
              </div>

              {editFormError && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2 simpati-fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{editFormError}</span>
                </div>
              )}

              <fieldset
                disabled={loadingEdit}
                className={`space-y-4 border-0 p-0 m-0 transition-opacity duration-200 ${loadingEdit ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Nomor Surat</label>
                  <input
                    type="text"
                    value={editItem[config.nomorField] || ''}
                    disabled
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed"
                  />
                </div>

                {config.formFields.map((field) => {
                  if (field.name === config.nomorField) return null;
                  return (
                    <div key={field.name} className="relative">
                      <label className="block text-sm font-medium mb-1 text-slate-700">{field.label}</label>

                      {field.type === 'select-dynamic' && field.source === 'arsip' && (
                        <SearchableSelect
                          value={editFormData[field.name] || ''}
                          onChange={(val) => setEditFormData({ ...editFormData, [field.name]: val, subklasifikasi: '' })}
                          options={uniqueKodeArsip}
                          placeholder={`Pilih ${field.label}`}
                        />
                      )}

                      {field.type === 'select-dynamic' && field.source === 'sub' && (
                        <SearchableSelect
                          value={editFormData[field.name] || ''}
                          onChange={(val) => setEditFormData({ ...editFormData, [field.name]: val })}
                          options={klasifikasiData.filter((k) => k.klasifikasi_kode_arsip === editFormData.klasifikasi_kode_arsip).map((k) => k.subklasifikasi)}
                          placeholder={`Pilih ${field.label}`}
                          disabled={!editFormData.klasifikasi_kode_arsip}
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          required
                          value={editFormData[field.name] || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, [field.name]: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none bg-white transition-colors"
                        >
                          <option value="" disabled>Pilih {field.label}</option>
                          {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}

                      {field.type !== 'select' && field.type !== 'select-dynamic' && (
                        <input
                          type={field.type}
                          required
                          value={editFormData[field.name] || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, [field.name]: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C08A34]/40 focus:border-[#C08A34] outline-none transition-colors"
                        />
                      )}
                    </div>
                  );
                })}
              </fieldset>

              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
                {loadingEdit && <span className="text-xs text-slate-400">Menyimpan perubahan&hellip;</span>}
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={loadingEdit}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingEdit}
                  className="flex items-center justify-center gap-2 bg-[#0E2338] text-white px-6 py-2 rounded-lg hover:bg-[#163654] disabled:opacity-80 transition-colors min-w-[112px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34] focus-visible:ring-offset-2"
                >
                  {loadingEdit ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL KONFIRMASI HAPUS ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 simpati-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm simpati-modal-in">
            <div className="p-5">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-[#101828] mb-1">Hapus {title}?</h2>
              <p className="text-sm text-slate-500">
                Surat dengan nomor <span className="font-medium text-slate-700">{deleteTarget[config.nomorField] || '-'}</span> akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-slate-100">
              <button
                onClick={closeDeleteConfirm}
                disabled={loadingDelete}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loadingDelete}
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-70 transition-colors min-w-[96px]"
              >
                {loadingDelete ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= OVERLAY LOADING GENERATE DOKUMEN ================= */}
      {generatingDocument && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl px-6 py-5 flex items-center gap-3 shadow-xl simpati-pop-in">
            <svg className="animate-spin h-5 w-5 text-[#0E2338]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-slate-600">Menyiapkan dan mengunduh dokumen&hellip;</span>
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
