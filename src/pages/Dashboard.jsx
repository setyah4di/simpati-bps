import { useEffect, useRef, useState } from 'react';
import { MailPlus, MailMinus, Briefcase, Gavel, Files, X, Search, ExternalLink, FileText, CalendarRange, RefreshCw, AlertCircle } from 'lucide-react';

// =========================================================
// KONFIGURASI ENDPOINT GOOGLE APPS SCRIPT (sama dengan ArsipSurat.jsx)
// =========================================================
const ARSIP_APPS_SCRIPT_URL = import.meta.env.VITE_ARSIP_APPS_SCRIPT_URL || '';

const suratConfig = {
  surat_keluar: { label: 'Surat Keluar', icon: MailPlus, color: 'bg-blue-500', ring: 'ring-blue-300' },
  surat_masuk: { label: 'Surat Masuk', icon: MailMinus, color: 'bg-green-500', ring: 'ring-green-300' },
  surat_tugas: { label: 'Surat Tugas', icon: Briefcase, color: 'bg-yellow-500', ring: 'ring-yellow-300' },
  surat_keputusan: { label: 'Surat Keputusan', icon: Gavel, color: 'bg-purple-500', ring: 'ring-purple-300' },
  surat_internal: { label: 'Surat Internal', icon: Files, color: 'bg-indigo-500', ring: 'ring-indigo-300' },
};

// Warna garis untuk line chart (dalam hex agar kontras terlihat di grafik)
const chartColors = {
  surat_keluar: '#3b82f6',     // blue-500
  surat_masuk: '#22c55e',      // green-500
  surat_tugas: '#f59e0b',      // amber-500 (lebih terang dari yellow agar terbaca)
  surat_keputusan: '#a855f7',  // purple-500
  surat_internal: '#6366f1',   // indigo-500
};

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

// Helper: ambil 6 bulan terakhir (termasuk bulan ini)
const getLast6Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      shortLabel: d.toLocaleDateString('id-ID', { month: 'short' }),
    });
  }
  return months;
};

export default function Dashboard() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(null);
  const [tableSearch, setTableSearch] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const tableRef = useRef(null);

  const fetchSummary = async () => {
    if (!ARSIP_APPS_SCRIPT_URL) {
      setSummary(Object.fromEntries(Object.keys(suratConfig).map((key) => [key, { items: [] }])));
      setLoading(false);
      return;
    }

    setLoading(true);

    const tableKeys = Object.keys(suratConfig);
    const promises = tableKeys.map(async (key) => {
      try {
        const res = await fetch(`${ARSIP_APPS_SCRIPT_URL}?action=list&folder=${key}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        return { key, data: json.files || [] };
      } catch (err) {
        console.error(err);
        return { key, data: [] };
      }
    });

    const results = await Promise.all(promises);

    const newSummary = {};
    results.forEach((res) => {
      newSummary[res.key] = { items: res.data };
    });

    setSummary(newSummary);
    setLoading(false);
  };

  useEffect(() => { fetchSummary(); }, []);

  useEffect(() => {
    if (activeKey && tableRef.current) {
      const frame = requestAnimationFrame(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [activeKey]);

  const handleCardClick = (key) => {
    setTableSearch('');
    setActiveKey((prev) => (prev === key ? null : key));
  };

  const isDateFilterActive = Boolean(dateFrom || dateTo);
  const clearDateFilter = () => { setDateFrom(''); setDateTo(''); };

  const applyDateFilter = (items) => {
    if (!isDateFilterActive) return items;
    return items.filter((f) => {
      if (!f.uploadedAt) return false;
      const uploaded = new Date(f.uploadedAt);
      uploaded.setHours(0, 0, 0, 0);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (uploaded < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(0, 0, 0, 0);
        if (uploaded > to) return false;
      }
      return true;
    });
  };

  const activeCfg = activeKey ? suratConfig[activeKey] : null;
  const activeItems = activeKey && summary ? applyDateFilter(summary[activeKey].items) : [];
  const filteredItems = activeItems.filter((item) =>
    tableSearch ? String(item.name).toLowerCase().includes(tableSearch.toLowerCase()) : true
  );

  // =========================================================
  // PERSIAPAN DATA LINE CHART (6 bulan terakhir)
  // =========================================================
  const months = getLast6Months();

  const chartSeries = summary
    ? Object.keys(suratConfig).map((key) => {
        const items = summary[key]?.items || [];
        const counts = months.map((m) => {
          return items.filter((item) => {
            if (!item.uploadedAt) return false;
            const d = new Date(item.uploadedAt);
            return d.getFullYear() === m.year && d.getMonth() === m.month;
          }).length;
        });
        return {
          key,
          label: suratConfig[key].label,
          color: chartColors[key],
          counts,
        };
      })
    : [];

  const maxCount = Math.max(1, ...chartSeries.flatMap((s) => s.counts));
  const yTicksCount = 4;
  const yMax = Math.max(yTicksCount, Math.ceil(maxCount / yTicksCount) * yTicksCount);

  // Dimensi chart (viewBox)
  const chartW = 820;
  const chartH = 340;
  const pad = { top: 20, right: 24, bottom: 44, left: 44 };
  const innerW = chartW - pad.left - pad.right;
  const innerH = chartH - pad.top - pad.bottom;

  const xStep = months.length > 1 ? innerW / (months.length - 1) : 0;
  const xScale = (i) => pad.left + i * xStep;
  const yScale = (v) => pad.top + innerH - (v / yMax) * innerH;

  const buildPath = (counts) =>
    counts
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(2)} ${yScale(c).toFixed(2)}`)
      .join(' ');

  const buildAreaPath = (counts) => {
    if (!counts.length) return '';
    const top = counts
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(2)} ${yScale(c).toFixed(2)}`)
      .join(' ');
    return `${top} L ${xScale(counts.length - 1).toFixed(2)} ${yScale(0).toFixed(2)} L ${xScale(0).toFixed(2)} ${yScale(0).toFixed(2)} Z`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Ringkasan arsip surat yang tersimpan di Google Drive.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 bg-white shadow-sm">
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
          <button
            onClick={fetchSummary}
            title="Muat ulang"
            className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {!ARSIP_APPS_SCRIPT_URL && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            URL Google Apps Script belum diatur. Tambahkan <code className="font-mono">VITE_ARSIP_APPS_SCRIPT_URL</code> pada file <code className="font-mono">.env</code> agar ringkasan arsip dapat ditampilkan.
          </span>
        </div>
      )}

      {/* CARDS RINGKASAN */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="h-8 w-8 rounded-md mb-4 simpati-skeleton"></div>
              <div className="h-4 rounded w-2/3 mb-2 simpati-skeleton"></div>
              <div className="h-8 rounded w-1/3 mt-4 simpati-skeleton"></div>
            </div>
          ))
        ) : (
          summary && Object.keys(suratConfig).map((key) => {
            const cfg = suratConfig[key];
            const data = summary[key];
            const total = applyDateFilter(data.items).length;
            const isActive = activeKey === key;

            return (
              <button
                key={key}
                onClick={() => handleCardClick(key)}
                className={`${cfg.color} text-white p-4 sm:p-6 rounded-xl shadow-sm text-left cursor-pointer transition-all transform hover:scale-[1.03] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E2338] ${
                  isActive ? `ring-4 ring-offset-2 ${cfg.ring} scale-[1.03] shadow-lg` : ''
                }`}
              >
                <cfg.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4" />
                <h3 className="text-sm sm:text-lg font-semibold leading-snug">{cfg.label}</h3>
                <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{total}</p>
                <p className="text-[11px] sm:text-xs text-white/70 mt-1">
                  {isDateFilterActive ? 'arsip sesuai filter tanggal' : 'total arsip tersimpan'}
                </p>
              </button>
            );
          })
        )}
      </div>

      {/* ============ LINE CHART 6 BULAN TERAKHIR ============ */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#101828]">Tren Arsip Surat 6 Bulan Terakhir</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jumlah arsip yang diunggah per bulan untuk masing-masing jenis surat.
            </p>
          </div>
        </div>

        {/* Legend / Keterangan */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
          {chartSeries.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                <span className="font-medium">{s.label}</span>
              </span>
              <span className="text-slate-400">({s.counts.reduce((a, b) => a + b, 0)})</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="w-full h-[300px] simpati-skeleton rounded-lg"></div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-auto min-w-[560px]"
              preserveAspectRatio="xMidYMid meet"
              onMouseLeave={() => setHoveredPoint(null)}
            >
            {/* Grid horizontal & label sumbu Y */}
            {[...Array(yTicksCount + 1)].map((_, i) => {
              const y = pad.top + (innerH / yTicksCount) * i;
              const val = yMax - (yMax / yTicksCount) * i;
              return (
                <g key={`y-${i}`}>
                  <line
                    x1={pad.left}
                    y1={y}
                    x2={chartW - pad.right}
                    y2={y}
                    stroke="#EEF0F3"
                    strokeWidth="1"
                  />
                  <text
                    x={pad.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#94A3B8"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Label sumbu X (bulan) */}
            {months.map((m, i) => (
              <text
                key={`x-${i}`}
                x={xScale(i)}
                y={chartH - pad.bottom + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#94A3B8"
              >
                {m.shortLabel}
              </text>
            ))}

            {/* Area + Line untuk tiap series */}
            {chartSeries.map((s) => (
              <g key={s.key}>
                <path
                  d={buildAreaPath(s.counts)}
                  fill={s.color}
                  fillOpacity="0.06"
                  stroke="none"
                />
                <path
                  d={buildPath(s.counts)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            ))}

            {/* Titik (circle) untuk tiap data — ditaruh paling atas agar bisa di-hover */}
            {chartSeries.map((s) =>
              s.counts.map((c, i) => {
                const cx = xScale(i);
                const cy = yScale(c);
                const isHovered =
                  hoveredPoint &&
                  hoveredPoint.seriesKey === s.key &&
                  hoveredPoint.monthIndex === i;
                return (
                  <g key={`pt-${s.key}-${i}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#ffffff"
                      stroke={s.color}
                      strokeWidth="2"
                      style={{ transition: 'r 0.15s ease' }}
                    />
                    {/* invisible larger hit area */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="12"
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() =>
                        setHoveredPoint({ seriesKey: s.key, monthIndex: i, x: cx, y: cy, value: c, label: s.label, month: months[i].label })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })
            )}

            {/* Tooltip */}
            {hoveredPoint && hoveredPoint.value > 0 && (
              <g pointerEvents="none">
                {(() => {
                  const tx = Math.min(Math.max(hoveredPoint.x, 60), chartW - 60);
                  const ty = Math.max(hoveredPoint.y - 14, 30);
                  return (
                    <>
                      <rect
                        x={tx - 48}
                        y={ty - 22}
                        width="96"
                        height="24"
                        rx="6"
                        fill="#0E2338"
                        opacity="0.95"
                      />
                      <text
                        x={tx}
                        y={ty - 5}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#ffffff"
                        fontWeight="600"
                      >
                        {hoveredPoint.value} arsip
                      </text>
                    </>
                  );
                })()}
              </g>
            )}
          </svg>
          </div>
        )}

        <p className="text-[11px] text-slate-400 mt-2">
          Sumbu X: periode bulan (6 bulan terakhir). Sumbu Y: jumlah arsip yang diunggah.
        </p>
      </div>

      {/* Tabel Detail — muncul langsung di bawah cards, bukan modal */}
      {activeCfg && (
        <div key={activeKey} ref={tableRef} className="mt-6 simpati-expand-in" style={{ scrollMarginTop: '1rem' }}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`${activeCfg.color} w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0`}>
                  <activeCfg.icon className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[#101828] leading-tight truncate">Arsip {activeCfg.label}</h2>
                  <p className="text-xs text-slate-500">{filteredItems.length} arsip ditemukan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 sm:flex-none items-center border border-slate-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#C08A34]/40 focus-within:border-[#C08A34] transition-colors">
                  <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari nama file..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="py-2 text-sm outline-none w-full sm:w-56"
                  />
                </div>
                <button
                  onClick={() => setActiveKey(null)}
                  className="shrink-0 hover:bg-slate-100 p-2 rounded-lg text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A34]"
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
                    <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">Nama File</th>
                    <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">Ukuran</th>
                    <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">Tanggal Upload</th>
                    <th className="p-3 whitespace-nowrap text-slate-500 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-500">
                        {isDateFilterActive || tableSearch ? 'Tidak ada arsip yang cocok dengan filter.' : 'Belum ada arsip yang diunggah.'}
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
                        <td className="p-3">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka dokumen"
                            className="flex items-center gap-2 min-w-0 cursor-pointer group"
                          >
                            <FileText className="w-4 h-4 text-[#8A611F] shrink-0" />
                            <span className="truncate text-slate-700 group-hover:text-[#C08A34] group-hover:underline transition-colors">{item.name}</span>
                          </a>
                        </td>
                        <td className="p-3 whitespace-nowrap">{formatBytes(item.size)}</td>
                        <td className="p-3 whitespace-nowrap">{formatTanggalID(item.uploadedAt)}</td>
                        <td className="p-3">
                          <a
                            href={item.url}
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
          .simpati-expand-in, .simpati-row-in, .simpati-skeleton {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}