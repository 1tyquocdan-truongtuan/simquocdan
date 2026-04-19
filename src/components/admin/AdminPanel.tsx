import { useState, useEffect, useCallback } from 'react';
import { LogOut, LayoutDashboard, Smartphone, ShoppingBag, Tag, DollarSign, Upload, Trash2, Edit2, Save, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { normalizePhone, analyzeSim, getMenhAndColor, formatPhoneDisplay } from '../../utils/simLogic';
import { detectNetwork, getPrimaryType, fetchPriceConfig, updatePriceConfig, upsertSims, fetchAllSimsAdmin, updateSimPrice, updateSimStatus, deleteSim as deleteSimService, lookupPrice } from '../../services/simService';
import type { SimEntry, Order, OrderStatus, PriceConfig } from '../../types';

interface AdminPanelProps { onLogout: () => void; }
type Tab = 'dashboard' | 'sims' | 'orders' | 'promotions' | 'price_config';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  delivering: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã huỷ',
};
const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  delivering: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sims, setSims] = useState<SimEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [priceConfig, setPriceConfig] = useState<PriceConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number; total: number } | null>(null);
  const [editPriceId, setEditPriceId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editPriceConfigId, setEditPriceConfigId] = useState<number | null>(null);
  const [editPrice03, setEditPrice03] = useState('');
  const [editPrice09, setEditPrice09] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [simFilter, setSimFilter] = useState<'all' | 'available' | 'sold' | 'reserved'>('all');
  const [simSearch, setSimSearch] = useState('');

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

  // ─── Import Excel ────────────────────────────────────────────────────────────
  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setImportResult(null);
    try {
      // Parse Excel
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (rows.length < 2) return;

      const headers = rows[0].map((h: any) => String(h).toLowerCase());
      const phoneCol = headers.findIndex((h: string) => h.includes('số') || h.includes('phone') || h.includes('sim') || h.includes('sdt'));
      const batchName = file.name.replace(/\.[^.]+$/, '');

      // Cần bảng giá để auto-price
      const config = priceConfig.length > 0 ? priceConfig : await fetchPriceConfig();
      if (config.length > 0 && priceConfig.length === 0) setPriceConfig(config);

      const entries: Parameters<typeof upsertSims>[0] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const raw = row[phoneCol >= 0 ? phoneCol : 0];
        const phone = normalizePhone(raw);
        if (!phone) continue;

        const { types, detail } = analyzeSim(phone);
        const { menh, color } = getMenhAndColor(phone);
        const network = detectNetwork(phone);
        const primaryType = getPrimaryType(types);
        const price = lookupPrice(primaryType, network, config);

        entries.push({
          phone,
          original_phone: String(raw),
          network,
          price,
          sim_types: types,
          primary_type: primaryType,
          menh,
          menh_color: color,
          unit_advance_detail: detail || '',
          batch: batchName,
        });
      }

      const result = await upsertSims(entries);
      setImportResult({ ...result, total: entries.length });
      await loadData();
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // ─── SIM Actions ─────────────────────────────────────────────────────────────
  const saveSimPrice = async (sim: SimEntry) => {
    const numPrice = parseInt(editPrice.replace(/[^0-9]/g, ''));
    if (!isNaN(numPrice)) {
      await updateSimPrice(sim.id, numPrice);
      await loadData();
    }
    setEditPriceId(null);
  };

  const handleStatusChange = async (sim: SimEntry, status: 'available' | 'sold' | 'reserved') => {
    await updateSimStatus(sim.id, status);
    await loadData();
  };

  const handleDeleteSim = async (id: number) => {
    if (!confirm('Xoá SIM này?')) return;
    await deleteSimService(id);
    await loadData();
  };

  // ─── Price Config Actions ─────────────────────────────────────────────────────
  const savePriceConfig = async (id: number) => {
    await updatePriceConfig(id, parseInt(editPrice03) || 0, parseInt(editPrice09) || 0);
    setPriceConfig(await fetchPriceConfig());
    setEditPriceConfigId(null);
  };

  // ─── Other ───────────────────────────────────────────────────────────────────
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

  // ─── Filtered SIMs ────────────────────────────────────────────────────────────
  const filteredSims = sims.filter(s => {
    if (simFilter !== 'all' && s.status !== simFilter) return false;
    if (simSearch && !s.normalizedPhone.includes(simSearch.replace(/[^0-9]/g, ''))) return false;
    return true;
  });

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { id: 'sims', icon: Smartphone, label: 'Kho SIM' },
    { id: 'orders', icon: ShoppingBag, label: 'Đơn hàng' },
    { id: 'price_config', icon: DollarSign, label: 'Bảng giá' },
    { id: 'promotions', icon: Tag, label: 'Khuyến mãi' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-[#ee0033] shadow-xl z-40 flex flex-col">
        <div className="p-5 border-b border-red-400">
          <div className="text-white font-black text-lg">SIM QUỐC DÂN</div>
          <div className="text-red-200 text-xs">Quản trị hệ thống</div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${tab === t.id ? 'bg-white text-[#ee0033]' : 'text-red-100 hover:bg-white/10'}`}>
              <t.icon size={18} />{t.label}
            </button>
          ))}
        </nav>
        <div className="p-3">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-200 hover:text-white hover:bg-white/10 rounded-xl text-sm font-semibold transition-colors">
            <LogOut size={18} />Đăng xuất
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 flex-1 p-6">

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-black text-gray-800 mb-6">Tổng quan</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Tổng SIM', value: sims.length, color: 'bg-blue-500' },
                { label: 'Đang bán', value: sims.filter(s => s.status === 'available').length, color: 'bg-green-500' },
                { label: 'Đã bán', value: sims.filter(s => s.status === 'sold').length, color: 'bg-gray-500' },
                { label: 'Đơn chờ', value: orders.filter(o => o.status === 'pending').length, color: 'bg-[#ee0033]' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl mb-3`} />
                  <div className="text-3xl font-black text-gray-800">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-3">Đơn hàng gần đây</h2>
              <div className="space-y-2">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="font-semibold text-gray-800">{order.sim_number}</div>
                      <div className="text-xs text-gray-500">{order.customer_name} — {order.contact_phone}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-gray-400 text-sm">Chưa có đơn hàng</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── KHO SIM ── */}
        {tab === 'sims' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-black text-gray-800">Kho SIM <span className="text-gray-400 font-normal text-base">({sims.length} số)</span></h1>
              <div className="flex items-center gap-2">
                <button onClick={loadData} className="p-2 text-gray-500 hover:text-gray-700 transition-colors"><RefreshCw size={16} /></button>
                <label className={`flex items-center gap-2 ${loading ? 'bg-gray-400' : 'bg-[#ee0033] hover:bg-[#cc0029]'} text-white px-4 py-2.5 rounded-xl cursor-pointer transition-colors text-sm font-semibold`}>
                  <Upload size={16} />
                  {loading ? 'Đang xử lý...' : 'Import Excel'}
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcel} className="hidden" disabled={loading} />
                </label>
              </div>
            </div>

            {/* Import result */}
            {importResult && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm font-semibold ${importResult.inserted > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                {importResult.inserted > 0 ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                Import xong: <strong>{importResult.inserted}</strong> số mới / <strong>{importResult.total}</strong> số trong file
                {importResult.skipped > 0 && <span className="text-gray-500">({importResult.skipped} trùng)</span>}
                <button onClick={() => setImportResult(null)} className="ml-auto"><X size={14} /></button>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <input
                type="tel" placeholder="Tìm số..." value={simSearch}
                onChange={e => setSimSearch(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ee0033] w-48"
              />
              {(['all', 'available', 'sold', 'reserved'] as const).map(f => (
                <button key={f} onClick={() => setSimFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${simFilter === f ? 'bg-[#ee0033] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                  {{ all: 'Tất cả', available: 'Đang bán', sold: 'Đã bán', reserved: 'Đang giữ' }[f]}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Số điện thoại</th>
                    <th className="px-4 py-3 text-left">Loại chính</th>
                    <th className="px-4 py-3 text-left">Mạng</th>
                    <th className="px-4 py-3 text-left">Mệnh</th>
                    <th className="px-4 py-3 text-left">Giá</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-center">Xoá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSims.slice(0, 200).map(sim => (
                    <tr key={sim.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 sim-number font-bold text-gray-800 whitespace-nowrap">
                        {formatPhoneDisplay(sim.normalizedPhone)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                        <div className="truncate text-xs">{sim.primaryType || sim.simTypes[0]}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${sim.network === '09' || sim.network === '08' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {sim.network || '03'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: sim.menhColor }}>{sim.menh}</span>
                      </td>
                      <td className="px-4 py-3">
                        {editPriceId === sim.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                              className="border rounded-lg px-2 py-1 text-xs w-24 focus:outline-none focus:border-[#ee0033]" autoFocus />
                            <button onClick={() => saveSimPrice(sim)} className="text-green-500"><Save size={14} /></button>
                            <button onClick={() => setEditPriceId(null)} className="text-gray-400"><X size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditPriceId(sim.id); setEditPrice(sim.price?.replace(/[^0-9]/g, '') || ''); }}
                            className="flex items-center gap-1 text-gray-700 hover:text-[#ee0033] font-semibold text-xs">
                            {sim.price || '—'} <Edit2 size={11} className="opacity-40" />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select value={sim.status || 'available'} onChange={e => handleStatusChange(sim, e.target.value as any)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#ee0033]">
                          <option value="available">Đang bán</option>
                          <option value="reserved">Đang giữ</option>
                          <option value="sold">Đã bán</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeleteSim(sim.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSims.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                      {sims.length === 0 ? 'Kho trống. Import file Excel để bắt đầu.' : 'Không có SIM phù hợp.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
              {filteredSims.length > 200 && (
                <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 text-center">
                  Hiển thị 200/{filteredSims.length} số. Dùng bộ lọc để thu hẹp.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ĐƠN HÀNG ── */}
        {tab === 'orders' && (
          <div>
            <h1 className="text-2xl font-black text-gray-800 mb-6">Đơn hàng ({orders.length})</h1>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Số SIM</th>
                    <th className="px-4 py-3 text-left">Khách hàng</th>
                    <th className="px-4 py-3 text-left">SĐT liên hệ</th>
                    <th className="px-4 py-3 text-left">Giá</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-center">Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 sim-number font-bold text-[#ee0033]">{order.sim_number}</td>
                      <td className="px-4 py-3 font-semibold">{order.customer_name}</td>
                      <td className="px-4 py-3 text-gray-600">{order.contact_phone}</td>
                      <td className="px-4 py-3 font-semibold text-[#ee0033]">{order.sim_price}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#ee0033]">
                          {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">Chưa có đơn hàng nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BẢNG GIÁ ── */}
        {tab === 'price_config' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-black text-gray-800">Bảng giá theo loại SIM</h1>
                <p className="text-gray-500 text-sm mt-1">Sửa giá ở đây → tự động áp dụng cho lần import tiếp theo</p>
              </div>
              <button onClick={() => fetchPriceConfig().then(setPriceConfig)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                <RefreshCw size={14} /> Làm mới
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Loại SIM</th>
                    <th className="px-4 py-3 text-right">Giá mạng 03 (VNĐ)</th>
                    <th className="px-4 py-3 text-right">Giá mạng 09/08 (VNĐ)</th>
                    <th className="px-4 py-3 text-center">Sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {priceConfig.map(pc => (
                    <tr key={pc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{pc.sim_type}</td>
                      <td className="px-4 py-3 text-right">
                        {editPriceConfigId === pc.id ? (
                          <input type="number" value={editPrice03} onChange={e => setEditPrice03(e.target.value)}
                            className="border rounded-lg px-2 py-1 text-sm w-28 text-right focus:outline-none focus:border-[#ee0033]" autoFocus />
                        ) : (
                          <span className="text-gray-700">{pc.price_03.toLocaleString('vi-VN')}đ</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editPriceConfigId === pc.id ? (
                          <input type="number" value={editPrice09} onChange={e => setEditPrice09(e.target.value)}
                            className="border rounded-lg px-2 py-1 text-sm w-28 text-right focus:outline-none focus:border-[#ee0033]" />
                        ) : (
                          <span className="text-gray-700">{pc.price_09.toLocaleString('vi-VN')}đ</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editPriceConfigId === pc.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => savePriceConfig(pc.id)} className="text-green-500 hover:text-green-700"><Save size={16} /></button>
                            <button onClick={() => setEditPriceConfigId(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditPriceConfigId(pc.id); setEditPrice03(String(pc.price_03)); setEditPrice09(String(pc.price_09)); }}
                            className="text-gray-400 hover:text-[#ee0033] transition-colors">
                            <Edit2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {priceConfig.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-10 text-gray-400">Chưa có dữ liệu. Chạy migration SQL trước.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── KHUYẾN MÃI ── */}
        {tab === 'promotions' && (
          <div>
            <h1 className="text-2xl font-black text-gray-800 mb-6">Khuyến mãi</h1>
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
              <h2 className="font-bold text-gray-700 mb-4">Thêm chương trình mới</h2>
              <div className="space-y-3">
                <input type="text" value={promoTitle} onChange={e => setPromoTitle(e.target.value)}
                  placeholder="Tiêu đề khuyến mãi"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ee0033]" />
                <textarea value={promoDesc} onChange={e => setPromoDesc(e.target.value)}
                  placeholder="Mô tả chi tiết" rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ee0033] resize-none" />
                <button onClick={addPromotion} className="bg-[#ee0033] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#cc0029] transition-colors">
                  Thêm khuyến mãi
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {promotions.map(promo => (
                <div key={promo.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-gray-800">{promo.title}</div>
                    <div className="text-gray-500 text-sm mt-1">{promo.description}</div>
                    <div className={`text-xs mt-2 ${promo.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {promo.is_active ? '● Đang hiển thị' : '○ Đã ẩn'}
                    </div>
                  </div>
                  <button onClick={() => deletePromotion(promo.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {promotions.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Chưa có chương trình khuyến mãi</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
