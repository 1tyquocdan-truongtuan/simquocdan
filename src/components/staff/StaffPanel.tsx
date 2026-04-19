import { useEffect, useState } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order, OrderStatus } from '../../types';

interface StaffPanelProps {
  onLogout: () => void;
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  delivering: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivering: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function StaffPanel({ onLogout }: StaffPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    fetchOrders();
  };

  const displayed = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#ee0033] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div>
          <div className="font-black text-xl">SIM QUỐC DÂN</div>
          <div className="text-red-200 text-xs">Giao diện nhân viên</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchOrders} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm transition-colors">
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-800">Quản lý Đơn Hàng</h1>
          <div className="text-sm text-gray-500">{orders.length} đơn hàng</div>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { val: 'all', label: 'Tất cả' },
            ...Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => ({ val, label })),
          ].map(item => (
            <button
              key={item.val}
              onClick={() => setFilter(item.val as any)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === item.val ? 'bg-[#ee0033] text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-[#ee0033]'
              }`}
            >
              {item.label}
              {item.val !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({orders.filter(o => o.status === item.val).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {displayed.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Số SIM</div>
                    <div className="sim-number font-black text-[#ee0033] text-lg">{order.sim_number}</div>
                    <div className="text-sm font-semibold text-gray-600">{order.sim_price}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Khách hàng</div>
                    <div className="font-semibold text-gray-800">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.cccd}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Liên hệ</div>
                    <a href={`tel:${order.contact_phone}`} className="font-semibold text-[#ee0033] hover:underline">{order.contact_phone}</a>
                    <div className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString('vi-VN')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Địa chỉ</div>
                    <div className="text-sm text-gray-700">{order.address}</div>
                    {order.note && <div className="text-xs text-gray-400 mt-1">Ghi chú: {order.note}</div>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#ee0033] font-medium"
                  >
                    {Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
          {displayed.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="font-semibold">Không có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
