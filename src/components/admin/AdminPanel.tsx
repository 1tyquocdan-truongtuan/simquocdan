import { useState, useEffect, useCallback, useMemo } from 'react';
import { LogOut, LayoutDashboard, Smartphone, ShoppingBag, Tag, DollarSign, Upload, Trash2, Edit2, Save, X, RefreshCw, CheckCircle, AlertCircle, Menu, ChevronUp, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { normalizePhone, analyzeSim, getMenhAndColor, formatPhoneDisplay } from '../../utils/simLogic';
import { detectNetwork, getPrimaryType, fetchPriceConfig, updatePriceConfig, upsertSims, fetchAllSimsAdmin, updateSimPrice, updateSimStatus, deleteSim as deleteSimService, lookupPrice } from '../../services/simService';
import type { SimEntry, Order, OrderStatus, PriceConfig } from '../../types';

interface AdminPanelProps { onLogout: () => void; }
type Tab = 'dashboard' | 'sims' | 'orders' | 'promotions' | 'price_config';
type SortCol = 'phone' | 'price' | 'status' | 'network';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  delivering: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã huỷ',
};
const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  delivering: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ─── Helpers (outside component) ─────────────────────────────────────────────

const stripVI = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[àáạảãăắặẳẵằâấậẩẫ]/g, 'a')
    .replace(/[èéẹẻẽêếệểễề]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôốộổỗồơớợởỡờ]/g, 'o')
    .replace(/[ùúụủũưứựửữừ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/[đ]/g, 'd');

const findPhoneCol = (rows: any[][]): { headerRow: number; phoneCol: number } => {
  for (let r = 0; r < Math.min(15, rows.length); r++) {
    const row = rows[r] || [];
    // Bỏ qua hàng tiêu đề/mô tả: cần ít nhất 2 ô có nội dung mới là header thật
    const nonEmpty = row.filter((c: any) => c != null && String(c).trim() !== '').length;
    if (nonEmpty < 2) continue;
    const headers = row.map((h: any) => stripVI(String(h ?? '')));
    const col = headers.findIndex((h: string) => {
      // Keyword đặc thù — khớp bất kể độ dài
      if (h.includes('isdn') || h === 'sdt' || h === 'phone' || h === 'mobile' || h === 'sim') return true;
      // Keyword chung — chỉ khớp khi ô ngắn (không phải câu mô tả dài)
      if (h.length > 25) return false;
      return h.includes('dien thoai') || h.includes('so dt') || h.includes('sdt') ||
        (h.includes('so') && !h.includes('stt') && !h.includes('so luong') && !h.includes('so thu') && !h.includes('iso'));
    });
    if (col >= 0) return { headerRow: r, phoneCol: col };
  }
  // Fallback: scan data để tìm cột có giá trị SĐT hợp lệ
  for (let r = 0; r < Math.min(15, rows.length); r++) {
    for (let c = 0; c < (rows[r] || []).length; c++) {
      if (normalizePhone(rows[r][c])) return { headerRow: r - 1, phoneCol: c };
    }
  }
  return { headerRow: -1, phoneCol: -1 };
};

// ─── Visual helpers ──────────────────────────────────────────────────────────

const getTypeColor = (type?: string): { bg: string; color: string } => {
  if (!type || type === 'Khác') return { bg: '#f3f4f6', color: '#9ca3af' };
  const t = type.toLowerCase();
  if (t.includes('ngũ quý')) return { bg: '#ede9fe', color: '#6d28d9' };
  if (t.includes('tứ quý')) return { bg: '#fee2e2', color: '#b91c1c' };
  if (t.includes('tam hoa')) return { bg: '#fef3c7', color: '#b45309' };
  if (t.includes('rồng') || t.includes('tiến 7')) return { bg: '#fce7f3', color: '#9d174d' };
  if (t.includes('sảnh') || t.includes('tiến 6') || t.includes('tiến 5')) return { bg: '#dbeafe', color: '#1d4ed8' };
  if (t.includes('gánh')) return { bg: '#e0e7ff', color: '#3730a3' };
  if (t.includes('taxi')) return { bg: '#fef9c3', color: '#a16207' };
  if (t.includes('tăng dần')) return { bg: '#d1fae5', color: '#065f46' };
  if (t.includes('đầu số đẹp')) return { bg: '#fce7f3', color: '#be185d' };
  if (t.includes('tiến')) return { bg: '#e0f2fe', color: '#0369a1' };
  if (t.includes('abab') || t.includes('aabb')) return { bg: '#f0fdf4', color: '#166534' };
  if (t.includes('aab') || t.includes('aba') || t.includes('kép')) return { bg: '#f0fdf4', color: '#15803d' };
  return { bg: '#f3f4f6', color: '#6b7280' };
};

const TypeBadge = ({ type }: { type?: string }) => {
  if (!type || type === 'Khác') return <span className="text-[10px] text-gray-300 italic">Khác</span>;
  const { bg, color } = getTypeColor(type);
  return (
    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: bg, color }}>
      {type}
    </span>
  );
};

const MenhHex = ({ menh, color }: { menh?: string; color?: string }) => {
  if (!menh) return <span className="text-xs text-gray-300">—</span>;
  return (
    <div style={{
      clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
      background: color || '#9ca3af',
      width: 38, height: 38, minWidth: 38,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 900, color: 'white', textAlign: 'center', lineHeight: 1.1,
    }}>{menh}</div>
  );
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sims, setSims] = useState<SimEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [priceConfig, setPriceConfig] = useState<PriceConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; total: number; sheets: number } | null>(null);
  const [editPriceId, setEditPriceId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editPriceConfigId, setEditPriceConfigId] = useState<number | null>(null);
  const [editPrice03, setEditPrice03] = useState('');
  const [editPrice09, setEditPrice09] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  // SIM filters
  const [simFilter, setSimFilter] = useState<'all' | 'available' | 'sold' | 'reserved'>('all');
  const [simSearch, setSimSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState<'all' | '03' | '09' | '08'>('all');
  const [menhFilter, setMenhFilter] = useState('');
  // Sort
  const [sortCol, setSortCol] = useState<SortCol>('phone');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  // Pagination
  const [simPage, setSimPage] = useState(1);
  const SIM_PAGE_SIZE = 50;
  // Multi-select
  const [selectedSims, setSelectedSims] = useState<Set<number>>(new Set());
  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [simData, orderData, promoData, pcData] = await Promise.all([
      fetchAllSimsAdmin().catch(() => []),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).then(r => r.data || []),
      supabase.from('promotions').select('*').order('created_at', { ascending: false }).then(r => r.data || []),
      fetchPriceConfig().catch(() => []),
    ]);
    setSims(simData);
    setOrders(orderData as Order[]);
    setPromotions(promoData);
    setPriceConfig(pcData);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Import Excel (đọc TẤT CẢ sheet) ────────────────────────────────────────
  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setImportResult(null);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });

      const batchName = file.name.replace(/\.[^.]+$/, '');
      const config = priceConfig.length > 0 ? priceConfig : await fetchPriceConfig();
      if (config.length > 0 && priceConfig.length === 0) setPriceConfig(config);

      const allEntries: Parameters<typeof upsertSims>[0] = [];
      const seenPhones = new Set<string>(); // dedup qua nhiều sheet
      let sheetsProcessed = 0;

      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
        if (!rows || rows.length < 2) continue;

        const { headerRow, phoneCol } = findPhoneCol(rows);
        if (phoneCol < 0) continue; // sheet này không có cột SĐT
        sheetsProcessed++;

        const dataStart = Math.max(1, headerRow + 1);
        for (let i = dataStart; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.every((c: any) => c == null || c === '')) continue;
          const raw = row[phoneCol];
          const phone = normalizePhone(raw);
          if (!phone || seenPhones.has(phone)) continue;
          seenPhones.add(phone);

          const { types, detail } = analyzeSim(phone);
          const { menh, color } = getMenhAndColor(phone);
          const network = detectNetwork(phone);
          const primaryType = getPrimaryType(types);
          const price = lookupPrice(primaryType, network, config);

          allEntries.push({
            phone, original_phone: String(raw ?? ''), network, price,
            sim_types: types as string[], primary_type: primaryType as string,
            menh, menh_color: color, unit_advance_detail: detail || '', batch: batchName,
          });
        }
      }

      if (allEntries.length === 0) {
        alert(`Không tìm thấy SĐT hợp lệ!\nFile có ${wb.SheetNames.length} sheet, ${sheetsProcessed} sheet có cột số điện thoại.\n\nĐịnh dạng chấp nhận: 9 số, 10 số, 11 số (số bàn).`);
        return;
      }

      let totalInserted = 0;
      for (let i = 0; i < allEntries.length; i += 100) {
        const r = await upsertSims(allEntries.slice(i, i + 100));
        totalInserted += r.inserted;
      }

      setImportResult({ inserted: totalInserted, skipped: allEntries.length - totalInserted, total: allEntries.length, sheets: sheetsProcessed });
      setSelectedSims(new Set());
      await loadData();
    } catch (err: any) {
      console.error('Import error:', err);
      alert('Lỗi import: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // ─── SIM Actions ─────────────────────────────────────────────────────────────
  const saveSimPrice = async (sim: SimEntry) => {
    const numPrice = parseInt(editPrice.replace(/[^0-9]/g, ''));
    if (!isNaN(numPrice)) { await updateSimPrice(sim.id, numPrice); await loadData(); }
    setEditPriceId(null);
  };

  const handleStatusChange = async (sim: SimEntry, status: 'available' | 'sold' | 'reserved') => {
    await updateSimStatus(sim.id, status);
    await loadData();
  };

  const handleDeleteSim = async (id: number) => {
    if (!confirm('Xoá SIM này?')) return;
    await deleteSimService(id);
    setSelectedSims(prev => { const n = new Set(prev); n.delete(id); return n; });
    await loadData();
  };

  const deleteSelected = async () => {
    if (selectedSims.size === 0) return;
    if (!confirm(`Xoá ${selectedSims.size} SIM đã chọn?`)) return;
    const ids = Array.from(selectedSims);
    for (let i = 0; i < ids.length; i += 50)
      await supabase.from('sims').delete().in('id', ids.slice(i, i + 50));
    setSelectedSims(new Set());
    await loadData();
  };

  const deleteAll = async () => {
    if (sims.length === 0) return;
    if (!confirm(`⚠️ XOÁ TOÀN BỘ ${sims.length} SIM trong kho?\nHành động này KHÔNG THỂ HOÀN TÁC!`)) return;
    const ans = prompt('Nhập "XOACHET" để xác nhận:');
    if (ans !== 'XOACHET') { alert('Xác nhận sai. Đã huỷ.'); return; }
    await supabase.from('sims').delete().gte('id', 0);
    setSelectedSims(new Set());
    await loadData();
  };

  // ─── Sort ─────────────────────────────────────────────────────────────────
  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setSimPage(1);
  };

  // ─── Price Config ─────────────────────────────────────────────────────────
  const savePriceConfig = async (id: number) => {
    await updatePriceConfig(id, parseInt(editPrice03) || 0, parseInt(editPrice09) || 0);
    setPriceConfig(await fetchPriceConfig());
    setEditPriceConfigId(null);
  };

  // ─── Orders & Promotions ──────────────────────────────────────────────────
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
  };

  const addPromotion = async () => {
    if (!promoTitle.trim()) return;
    await supabase.from('promotions').insert([{ title: promoTitle, description: promoDesc, is_active: true }]);
    setPromoTitle(''); setPromoDesc('');
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (data) setPromotions(data);
  };

  const deletePromotion = async (id: string) => {
    await supabase.from('promotions').delete().eq('id', id);
    setPromotions(p => p.filter(x => x.id !== id));
  };

  // ─── Filtered + Sorted SIMs ──────────────────────────────────────────────
  const filteredSims = useMemo(() => {
    let result = sims.filter(s => {
      if (simFilter !== 'all' && s.status !== simFilter) return false;
      if (networkFilter !== 'all' && s.network !== networkFilter) return false;
      if (menhFilter && s.menh !== menhFilter) return false;
      if (simSearch) {
        const q = simSearch.replace(/[^0-9]/g, '');
        if (q && !s.normalizedPhone.includes(q)) return false;
        if (!q && !s.normalizedPhone.includes(simSearch)) return false;
      }
      return true;
    });
    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'phone') cmp = a.normalizedPhone.localeCompare(b.normalizedPhone);
      else if (sortCol === 'price') {
        cmp = (parseInt((a.price || '0').replace(/[^0-9]/g, '')) || 0) -
              (parseInt((b.price || '0').replace(/[^0-9]/g, '')) || 0);
      }
      else if (sortCol === 'status') cmp = (a.status || '').localeCompare(b.status || '');
      else if (sortCol === 'network') cmp = (a.network || '').localeCompare(b.network || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [sims, simFilter, networkFilter, menhFilter, simSearch, sortCol, sortDir]);

  const totalPages = Math.ceil(filteredSims.length / SIM_PAGE_SIZE);
  const pagedSims = filteredSims.slice((simPage - 1) * SIM_PAGE_SIZE, simPage * SIM_PAGE_SIZE);
  const allPageSelected = pagedSims.length > 0 && pagedSims.every(s => selectedSims.has(s.id));

  const toggleSelectAll = () => {
    setSelectedSims(prev => {
      const n = new Set(prev);
      if (allPageSelected) pagedSims.forEach(s => n.delete(s.id));
      else pagedSims.forEach(s => n.add(s.id));
      return n;
    });
  };

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'sims', icon: Smartphone, label: 'Kho SIM' },
    { id: 'orders', icon: ShoppingBag, label: 'Đơn hàng' },
    { id: 'price_config', icon: DollarSign, label: 'Bảng giá' },
    { id: 'promotions', icon: Tag, label: 'Khuyến mãi' },
  ];

  const SortTh = ({ col, label, className = '' }: { col: SortCol; label: string; className?: string }) => (
    <th onClick={() => toggleSort(col)}
      className={`px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer select-none whitespace-nowrap ${className}`}>
      <span className="inline-flex items-center gap-0.5">
        {label}
        <span className="inline-flex flex-col ml-0.5">
          <ChevronUp size={9} className={sortCol === col && sortDir === 'asc' ? 'text-[#ee0033]' : 'text-gray-300'} />
          <ChevronDown size={9} className={sortCol === col && sortDir === 'desc' ? 'text-[#ee0033]' : 'text-gray-300'} />
        </span>
      </span>
    </th>
  );

  const navTo = (t: Tab) => { setTab(t); setSidebarOpen(false); };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-56 bg-[#ee0033] shadow-xl z-40 flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-red-400 flex items-center justify-between">
          <div>
            <div className="text-white font-black text-base leading-tight">SIM QUỐC DÂN</div>
            <div className="text-red-200 text-xs">Quản trị hệ thống</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-red-200 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => navTo(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${tab === t.id ? 'bg-white text-[#ee0033]' : 'text-red-100 hover:bg-white/10'}`}>
              <t.icon size={17} />{t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-red-400">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-200 hover:text-white hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors">
            <LogOut size={17} />Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-56 min-w-0 flex flex-col">

        {/* Mobile topbar */}
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 bg-[#ee0033] px-4 py-3 shadow-md">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1"><Menu size={20} /></button>
          <span className="text-white font-black text-sm flex-1">
            {tabs.find(t => t.id === tab)?.label ?? 'Admin'}
          </span>
          <button onClick={loadData} className="text-red-200 hover:text-white p-1"><RefreshCw size={16} /></button>
        </div>

        <div className={`flex-1 overflow-hidden ${tab === 'sims' ? 'flex flex-col' : 'p-3 md:p-6 overflow-y-auto'}`}>

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-800 mb-4">Tổng quan</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Tổng SIM', value: sims.length, bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500', icon: '📱' },
                  { label: 'Đang bán', value: sims.filter(s => s.status === 'available').length, bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-500', icon: '✅' },
                  { label: 'Đã bán', value: sims.filter(s => s.status === 'sold').length, bg: 'bg-gray-50', text: 'text-gray-600', bar: 'bg-gray-400', icon: '📦' },
                  { label: 'Đơn chờ', value: orders.filter(o => o.status === 'pending').length, bg: 'bg-red-50', text: 'text-[#ee0033]', bar: 'bg-[#ee0033]', icon: '🔔' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-2xl p-4 shadow-sm`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl">{s.icon}</span>
                      <div className={`w-1.5 h-8 ${s.bar} rounded-full`} />
                    </div>
                    <div className={`text-3xl font-black ${s.text}`}>{s.value}</div>
                    <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h2 className="font-bold text-gray-700 mb-3 text-sm">Đơn hàng gần đây</h2>
                <div className="space-y-2">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800 sim-number text-sm">{order.sim_number}</div>
                        <div className="text-xs text-gray-400 truncate">{order.customer_name} · {order.contact_phone}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Chưa có đơn hàng</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── KHO SIM ── 3-panel layout */}
          {tab === 'sims' && (
            <div className="flex flex-1 overflow-hidden h-full">

              {/* LEFT PANEL */}
              <div className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
                {/* Import button */}
                <div className="p-3 border-b border-gray-100">
                  <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-colors ${loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#ee0033] hover:bg-[#cc0029] text-white'}`}>
                    <Upload size={14} />
                    {loading ? 'Đang xử lý...' : 'Nhập File Excel SIM'}
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} className="hidden" disabled={loading} />
                  </label>
                </div>

                {/* Tất cả SIM */}
                <div className="p-3 border-b border-gray-100">
                  <button onClick={() => { setSimFilter('all'); setMenhFilter(''); setNetworkFilter('all'); setSimSearch(''); setSimPage(1); }}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl font-bold transition-colors text-sm
                      ${simFilter === 'all' && !menhFilter && networkFilter === 'all' && !simSearch ? 'bg-[#ee0033] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <span className="flex items-center gap-2">≡ Tất cả SIM</span>
                    <span className="font-black">{sims.length.toLocaleString('vi-VN')}</span>
                  </button>
                </div>

                {/* Trạng thái */}
                <div className="p-3 border-b border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Trạng thái</div>
                  {([
                    ['available', '🟢', 'Đang bán'] as const,
                    ['sold', '⚫', 'Đã bán'] as const,
                    ['reserved', '🟡', 'Đang giữ'] as const,
                  ]).map(([f, icon, label]) => (
                    <button key={f} onClick={() => { setSimFilter(f); setSimPage(1); }}
                      className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold mb-1 transition-colors
                        ${simFilter === f ? 'bg-red-50 text-[#ee0033]' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <span>{icon} {label}</span>
                      <span className="text-gray-400">{sims.filter(s => s.status === f).length.toLocaleString()}</span>
                    </button>
                  ))}
                </div>

                {/* Mạng */}
                <div className="p-3 border-b border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Nhà mạng</div>
                  {([
                    ['09', 'VT', 'Viettel/MB', 'bg-purple-100 text-purple-700'],
                    ['03', 'MB', 'Mobi/Vina', 'bg-blue-100 text-blue-700'],
                    ['08', 'VNA', 'Vinaphone 08x', 'bg-pink-100 text-pink-700'],
                  ] as [string, string, string, string][]).map(([v, short, label, cls]) => (
                    <button key={v} onClick={() => { setNetworkFilter(v as any); setSimPage(1); }}
                      className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold mb-1 transition-colors
                        ${networkFilter === v ? 'bg-red-50 text-[#ee0033]' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <span className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${cls}`}>{short}</span>
                        {label}
                      </span>
                      <span className="text-gray-400">{sims.filter(s => s.network === v).length.toLocaleString()}</span>
                    </button>
                  ))}
                </div>

                {/* Mệnh */}
                <div className="p-3 flex-1 border-b border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Phong thủy</div>
                  {([['Kim','#b5a642'],['Mộc','#4caf50'],['Thủy','#2196f3'],['Hỏa','#f44336'],['Thổ','#ff9800']] as [string,string][]).map(([m, c]) => (
                    <button key={m} onClick={() => { setMenhFilter(menhFilter === m ? '' : m); setSimPage(1); }}
                      className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold mb-1 transition-colors
                        ${menhFilter === m ? 'bg-gray-100' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c }} />
                        <span style={{ color: menhFilter === m ? c : undefined }}>{m}</span>
                      </span>
                      <span className="text-gray-400">{sims.filter(s => s.menh === m).length.toLocaleString()}</span>
                    </button>
                  ))}
                </div>

                {/* Delete all */}
                <div className="p-3">
                  <button onClick={deleteAll}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-400 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors">
                    <Trash2 size={12} /> Xoá tất cả kho
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT */}
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-gray-50">

                {/* Mobile top import bar */}
                <div className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 shrink-0">
                  <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${loading ? 'bg-gray-200 text-gray-400' : 'bg-[#ee0033] text-white'}`}>
                    <Upload size={12} />{loading ? '...' : 'Import'}
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} className="hidden" disabled={loading} />
                  </label>
                  <select value={simFilter} onChange={e => { setSimFilter(e.target.value as any); setSimPage(1); }}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none bg-white flex-1">
                    <option value="all">Tất cả ({sims.length})</option>
                    <option value="available">🟢 Đang bán</option>
                    <option value="sold">⚫ Đã bán</option>
                    <option value="reserved">🟡 Đang giữ</option>
                  </select>
                  <select value={menhFilter} onChange={e => { setMenhFilter(e.target.value); setSimPage(1); }}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none bg-white">
                    <option value="">Mệnh</option>
                    {['Kim','Mộc','Thủy','Hỏa','Thổ'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>

                {/* Top bar */}
                <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-2 flex-wrap shrink-0">
                  <span className="text-sm font-bold text-gray-700">
                    Đang xem: <span className="text-[#ee0033]">
                      {({ all: 'Tất cả', available: 'Đang bán', sold: 'Đã bán', reserved: 'Đang giữ' } as Record<string,string>)[simFilter]}
                    </span>
                    {menhFilter && <span className="text-gray-400 font-normal text-xs"> · {menhFilter}</span>}
                  </span>
                  <span className="text-xs text-gray-400">{filteredSims.length.toLocaleString()} / {sims.length.toLocaleString()}</span>
                  <div className="flex-1" />
                  <input type="tel" placeholder="🔍 Tìm số SIM..." value={simSearch}
                    onChange={e => { setSimSearch(e.target.value); setSimPage(1); }}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#ee0033] w-36" />
                  {(simFilter !== 'all' || menhFilter || networkFilter !== 'all' || simSearch) && (
                    <button onClick={() => { setSimFilter('all'); setMenhFilter(''); setNetworkFilter('all'); setSimSearch(''); setSimPage(1); }}
                      className="px-3 py-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg text-xs font-semibold">
                      Xóa bộ lọc
                    </button>
                  )}
                  {selectedSims.size > 0 && (
                    <button onClick={deleteSelected}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-bold">
                      <Trash2 size={12} /> Xoá {selectedSims.size}
                    </button>
                  )}
                  <button onClick={loadData} className="p-1.5 text-gray-400 hover:text-gray-700 shrink-0">
                    <RefreshCw size={14} />
                  </button>
                </div>

                {/* Import result */}
                {importResult && (
                  <div className={`flex items-center gap-2 px-4 py-2 text-xs border-b shrink-0 ${
                    importResult.inserted > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                    {importResult.inserted > 0 ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    <span className="flex-1">
                      {importResult.total === 0 ? 'Không đọc được số điện thoại nào'
                        : <><strong>{importResult.sheets}</strong> sheet · <strong>{importResult.inserted}</strong> mới / <strong>{importResult.total}</strong> tổng{importResult.skipped > 0 && <span className="opacity-70"> ({importResult.skipped} trùng → cập nhật)</span>}</>}
                    </span>
                    <button onClick={() => setImportResult(null)} className="hover:opacity-60"><X size={12} /></button>
                  </div>
                )}

                {/* Table */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-3 py-3 w-9">
                          <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll}
                            className="rounded border-gray-300 accent-[#ee0033] cursor-pointer" />
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase whitespace-nowrap hidden md:table-cell">Chi tiết</th>
                        <SortTh col="phone" label="Số SIM" />
                        <SortTh col="price" label="Giá bán" />
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase whitespace-nowrap hidden lg:table-cell">Loại SIM đẹp</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase hidden sm:table-cell">Mệnh</th>
                        <SortTh col="status" label="TT" />
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase w-10">✕</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pagedSims.map(sim => (
                        <tr key={sim.id} className={`transition-colors ${selectedSims.has(sim.id) ? 'bg-red-50/60' : 'bg-white hover:bg-gray-50'}`}>
                          <td className="px-3 py-2.5 w-9">
                            <input type="checkbox" checked={selectedSims.has(sim.id)}
                              onChange={() => setSelectedSims(prev => {
                                const n = new Set(prev); n.has(sim.id) ? n.delete(sim.id) : n.add(sim.id); return n;
                              })}
                              className="rounded border-gray-300 accent-[#ee0033] cursor-pointer" />
                          </td>
                          <td className="px-3 py-2.5 hidden md:table-cell max-w-[130px]">
                            <div className="text-xs text-gray-400 truncate">{sim.unitAdvanceDetail || sim.primaryType || '—'}</div>
                          </td>
                          <td className="px-3 py-2.5 sim-number font-black text-[#ee0033] whitespace-nowrap text-sm">
                            {formatPhoneDisplay(sim.normalizedPhone)}
                          </td>
                          <td className="px-3 py-2.5">
                            {editPriceId === sim.id ? (
                              <div className="flex items-center gap-1">
                                <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                                  className="border rounded px-1.5 py-0.5 text-xs w-20 focus:outline-none focus:border-[#ee0033]" autoFocus />
                                <button onClick={() => saveSimPrice(sim)} className="text-green-500"><Save size={13} /></button>
                                <button onClick={() => setEditPriceId(null)} className="text-gray-400"><X size={13} /></button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditPriceId(sim.id); setEditPrice(sim.price?.replace(/[^0-9]/g, '') || ''); }}
                                className="flex items-center gap-1 text-gray-700 hover:text-[#ee0033] font-bold text-xs group whitespace-nowrap">
                                {sim.price || '—'} <Edit2 size={10} className="opacity-0 group-hover:opacity-60" />
                              </button>
                            )}
                          </td>
                          <td className="px-3 py-2.5 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {(sim.simTypes?.length > 0 ? sim.simTypes.slice(0, 2) : [sim.primaryType]).map((t, i) => (
                                <TypeBadge key={i} type={t as string} />
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 hidden sm:table-cell">
                            <MenhHex menh={sim.menh} color={sim.menhColor} />
                          </td>
                          <td className="px-3 py-2.5">
                            <select value={sim.status || 'available'} onChange={e => handleStatusChange(sim, e.target.value as any)}
                              className="border border-gray-100 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-[#ee0033] bg-white cursor-pointer">
                              <option value="available">🟢</option>
                              <option value="reserved">🟡</option>
                              <option value="sold">⚫</option>
                            </select>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button onClick={() => handleDeleteSim(sim.id)} className="text-gray-200 hover:text-red-500 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredSims.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                          {sims.length === 0 ? (
                            <div><div className="text-5xl mb-3">📂</div>
                              <div className="font-semibold text-gray-500 mb-1">Kho chưa có SIM</div>
                              <div className="text-xs">Nhấn <strong>Nhập File Excel SIM</strong> để thêm</div>
                            </div>
                          ) : (
                            <div><div className="text-3xl mb-2">🔍</div>
                              <div className="text-sm">Không có SIM phù hợp với bộ lọc</div>
                            </div>
                          )}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-2.5 bg-white border-t border-gray-100 flex items-center gap-2 justify-between flex-wrap shrink-0">
                    <span className="text-xs text-gray-400">Trang {simPage}/{totalPages} · {filteredSims.length.toLocaleString()} kết quả</span>
                    <div className="flex gap-1">
                      <button onClick={() => setSimPage(p => Math.max(1, p - 1))} disabled={simPage === 1}
                        className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#ee0033] hover:text-[#ee0033]">← Trước</button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = Math.max(1, Math.min(totalPages - 4, simPage - 2)) + i;
                        return (
                          <button key={p} onClick={() => setSimPage(p)}
                            className={`w-7 h-7 text-xs rounded-lg font-semibold ${p === simPage ? 'bg-[#ee0033] text-white' : 'border border-gray-200 hover:border-[#ee0033] hover:text-[#ee0033]'}`}>
                            {p}
                          </button>
                        );
                      })}
                      <button onClick={() => setSimPage(p => Math.min(totalPages, p + 1))} disabled={simPage === totalPages}
                        className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-[#ee0033] hover:text-[#ee0033]">Sau →</button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT PANEL – SIM đã chọn */}
              <div className="hidden xl:flex flex-col w-52 shrink-0 bg-white border-l border-gray-200">
                <div className="p-3 border-b border-gray-200 bg-[#ee0033] flex items-start justify-between">
                  <div>
                    <div className="text-white font-black text-xs uppercase tracking-wide">SIM đã chọn</div>
                    <div className="text-red-200 text-[10px] mt-0.5">Chuẩn bị xuất file cho khách</div>
                  </div>
                  {selectedSims.size > 0 && (
                    <div className="w-6 h-6 bg-white text-[#ee0033] rounded-full text-xs font-black flex items-center justify-center shrink-0">
                      {selectedSims.size}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {selectedSims.size === 0 ? (
                    <div className="text-center py-10 text-gray-300">
                      <div className="text-4xl mb-2">☐</div>
                      <div className="text-xs leading-relaxed">Chưa có SIM nào<br/>được chọn</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {pagedSims.filter(s => selectedSims.has(s.id)).map(s => (
                        <div key={s.id} className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded-lg gap-1">
                          <div className="min-w-0">
                            <div className="sim-number text-xs font-bold text-[#ee0033] truncate">{formatPhoneDisplay(s.normalizedPhone)}</div>
                            <div className="text-[10px] text-gray-400">{s.price || '—'}</div>
                          </div>
                          <button onClick={() => setSelectedSims(prev => { const n = new Set(prev); n.delete(s.id); return n; })}
                            className="text-gray-300 hover:text-red-500 shrink-0"><X size={11} /></button>
                        </div>
                      ))}
                      {selectedSims.size > pagedSims.filter(s => selectedSims.has(s.id)).length && (
                        <div className="text-[10px] text-gray-400 text-center py-1 italic">
                          +{selectedSims.size - pagedSims.filter(s => selectedSims.has(s.id)).length} trên trang khác
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 space-y-2">
                  {selectedSims.size > 0 && (
                    <button onClick={deleteSelected}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors">
                      Xoá {selectedSims.size} SIM đã chọn
                    </button>
                  )}
                  <button disabled
                    className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5">
                    Xuất file bán hàng
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ── ĐƠN HÀNG ── */}
          {tab === 'orders' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-xl font-black text-gray-800">Đơn hàng <span className="text-gray-400 font-normal text-sm">({orders.length})</span></h1>
                <button onClick={loadData} className="ml-auto p-2 text-gray-400 hover:text-gray-700"><RefreshCw size={15} /></button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Số SIM</th>
                        <th className="px-4 py-3 text-left">Khách hàng</th>
                        <th className="px-4 py-3 text-left hidden sm:table-cell">SĐT liên hệ</th>
                        <th className="px-4 py-3 text-left hidden md:table-cell">Giá</th>
                        <th className="px-4 py-3 text-left">Trạng thái</th>
                        <th className="px-4 py-3 text-center">Cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 sim-number font-bold text-[#ee0033] whitespace-nowrap text-sm">{order.sim_number}</td>
                          <td className="px-4 py-3 font-semibold text-sm max-w-[120px]">
                            <div className="truncate">{order.customer_name}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{order.contact_phone}</td>
                          <td className="px-4 py-3 font-bold text-[#ee0033] text-xs hidden md:table-cell">{order.sim_price}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${ORDER_STATUS_COLORS[order.status]}`}>
                              {ORDER_STATUS_LABELS[order.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#ee0033] bg-white">
                              {Object.entries(ORDER_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-14 text-gray-400">
                          <div className="text-4xl mb-2">📋</div>
                          <div className="text-sm">Chưa có đơn hàng nào</div>
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── BẢNG GIÁ ── */}
          {tab === 'price_config' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h1 className="text-xl font-black text-gray-800">Bảng giá theo loại SIM</h1>
                  <p className="text-gray-400 text-xs mt-0.5">Sửa giá → tự động áp dụng cho lần import tiếp theo</p>
                </div>
                <button onClick={() => fetchPriceConfig().then(setPriceConfig)}
                  className="ml-auto p-2 text-gray-400 hover:text-gray-700"><RefreshCw size={15} /></button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Loại SIM</th>
                        <th className="px-4 py-3 text-right">Mạng 03</th>
                        <th className="px-4 py-3 text-right">Mạng 09/08</th>
                        <th className="px-4 py-3 text-center w-14">Sửa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {priceConfig.map(pc => (
                        <tr key={pc.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-semibold text-gray-800 text-sm">{pc.sim_type}</td>
                          <td className="px-4 py-2.5 text-right">
                            {editPriceConfigId === pc.id
                              ? <input type="number" value={editPrice03} onChange={e => setEditPrice03(e.target.value)}
                                  className="border rounded px-2 py-0.5 text-xs w-24 text-right focus:outline-none focus:border-[#ee0033]" autoFocus />
                              : <span className="text-xs text-gray-700">{pc.price_03.toLocaleString('vi-VN')}đ</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {editPriceConfigId === pc.id
                              ? <input type="number" value={editPrice09} onChange={e => setEditPrice09(e.target.value)}
                                  className="border rounded px-2 py-0.5 text-xs w-24 text-right focus:outline-none focus:border-[#ee0033]" />
                              : <span className="text-xs text-gray-700">{pc.price_09.toLocaleString('vi-VN')}đ</span>}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {editPriceConfigId === pc.id ? (
                              <div className="flex justify-center gap-2">
                                <button onClick={() => savePriceConfig(pc.id)} className="text-green-500 hover:text-green-700"><Save size={14} /></button>
                                <button onClick={() => setEditPriceConfigId(null)} className="text-gray-400"><X size={14} /></button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditPriceConfigId(pc.id); setEditPrice03(String(pc.price_03)); setEditPrice09(String(pc.price_09)); }}
                                className="text-gray-400 hover:text-[#ee0033]"><Edit2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {priceConfig.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-sm">Chưa có dữ liệu. Chạy migration SQL trước.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── KHUYẾN MÃI ── */}
          {tab === 'promotions' && (
            <div>
              <h1 className="text-xl font-black text-gray-800 mb-4">Khuyến mãi</h1>
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <h2 className="font-bold text-gray-700 mb-3 text-sm">Thêm chương trình mới</h2>
                <div className="space-y-3">
                  <input type="text" value={promoTitle} onChange={e => setPromoTitle(e.target.value)}
                    placeholder="Tiêu đề khuyến mãi"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ee0033]" />
                  <textarea value={promoDesc} onChange={e => setPromoDesc(e.target.value)}
                    placeholder="Mô tả chi tiết" rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ee0033] resize-none" />
                  <button onClick={addPromotion}
                    className="bg-[#ee0033] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#cc0029] transition-colors text-sm">
                    Thêm khuyến mãi
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {promotions.map(promo => (
                  <div key={promo.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-800 text-sm">{promo.title}</div>
                      <div className="text-gray-500 text-xs mt-1">{promo.description}</div>
                      <div className={`text-xs mt-2 ${promo.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        {promo.is_active ? '● Đang hiển thị' : '○ Đã ẩn'}
                      </div>
                    </div>
                    <button onClick={() => deletePromotion(promo.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {promotions.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-8">Chưa có chương trình khuyến mãi</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
