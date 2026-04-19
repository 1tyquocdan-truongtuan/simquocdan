import { useState } from 'react';
import { Search, Smartphone, Wifi, LayoutGrid, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../layout/Sidebar';

const LEFT_NAV = [
  { icon: Smartphone, label: 'SIM Số Đẹp', color: 'bg-[#ee0033]', active: true },
  { icon: Wifi, label: 'Internet · TV360 · Camera', color: 'bg-blue-500', active: false },
  { icon: LayoutGrid, label: 'Dịch vụ & Tiện ích', color: 'bg-gray-500', active: false },
];

const CATEGORIES = [
  { icon: '🔍', label: 'SIM Đẹp Theo Giá', color: 'bg-blue-500', page: 'sim-theo-gia' },
  { icon: '☯️', label: 'SIM Phong Thủy', color: 'bg-purple-500', page: 'sim-phong-thuy' },
  { icon: '⭐', label: 'SIM May Mắn', color: 'bg-green-500', page: '' },
  { icon: '📱', label: 'SIM Trả Sau', color: 'bg-red-500', page: '' },
  { icon: '💎', label: 'SIM 100GB/Tháng Miễn Phí 12 Tháng', color: 'bg-pink-500', page: '' },
  { icon: '🎁', label: 'Chọn Gói Khuyến Mãi Tiết Kiệm Nhất Cho SIM Đang Sử Dụng', color: 'bg-orange-500', page: '' },
];

const MENH_OPTIONS = ['Tất cả Mệnh', 'Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
const GIA_OPTIONS = ['Tất cả mức giá', 'Dưới 500K', '500K – 1 triệu', '1 – 2 triệu', 'Trên 2 triệu'];
const LOAI_OPTIONS = ['Tất cả loại sim', 'Ngũ Quý', 'Tứ Quý', 'Tam Hoa', 'Gánh', 'Tiến', 'Taxi Đầu', 'Phong Thủy'];

interface SimSoDepPageProps {
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export default function SimSoDepPage({ onClose, onNavigate }: SimSoDepPageProps) {
  const [search, setSearch] = useState('');
  const [menh, setMenh] = useState(0);
  const [gia, setGia] = useState(0);
  const [loai, setLoai] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex gap-3">

          {/* Left vertical nav */}
          <div className="hidden sm:flex flex-col gap-1 w-16 md:w-20 shrink-0">
            {LEFT_NAV.map((item, i) => (
              <button
                key={i}
                className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-colors ${
                  item.active ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-white/60'
                }`}
              >
                <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon size={18} className="text-white" />
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight ${item.active ? 'text-[#ee0033]' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Section title */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-[#ee0033] rounded-full shrink-0" />
              <h1 className="text-base font-black text-gray-800 uppercase tracking-wide">SIM SỐ ĐẸP</h1>
              <span className="text-[9px] font-black text-white bg-[#ee0033] px-1.5 py-0.5 rounded">HOT</span>
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={14} /> Đóng
              </button>
            </div>

            {/* 6 category cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => cat.page && onNavigate?.(cat.page)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3 hover:border-[#ee0033] hover:shadow-md transition-all text-left group"
                >
                  <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm`}>
                    {cat.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-700 leading-tight group-hover:text-[#ee0033] transition-colors line-clamp-2">
                    {cat.label}
                  </span>
                  <ChevronRight size={14} className="text-gray-300 shrink-0 ml-auto group-hover:text-[#ee0033]" />
                </button>
              ))}
            </div>

            {/* Search form */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <Search size={16} className="text-[#ee0033]" />
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Tìm SIM Theo Yêu Cầu</h2>
              </div>

              {/* Phone input */}
              <div className="mb-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">
                  Nhập dãy số muốn tìm
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Nhập số sim..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ee0033] text-sm bg-gray-50"
                />
              </div>

              {/* 3 dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                {/* Chọn mệnh */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Chọn Mệnh</label>
                  <div className="relative">
                    <select
                      value={menh}
                      onChange={e => setMenh(Number(e.target.value))}
                      className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ee0033] text-xs bg-white pr-8"
                    >
                      {MENH_OPTIONS.map((o, i) => <option key={i} value={i}>{o}</option>)}
                    </select>
                    <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>

                {/* Mức giá */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Mức Giá</label>
                  <div className="relative">
                    <select
                      value={gia}
                      onChange={e => setGia(Number(e.target.value))}
                      className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ee0033] text-xs bg-white pr-8"
                    >
                      {GIA_OPTIONS.map((o, i) => <option key={i} value={i}>{o}</option>)}
                    </select>
                    <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>

                {/* Loại SIM */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Loại SIM Đẹp</label>
                  <div className="relative">
                    <select
                      value={loai}
                      onChange={e => setLoai(Number(e.target.value))}
                      className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ee0033] text-xs bg-white pr-8"
                    >
                      {LOAI_OPTIONS.map((o, i) => <option key={i} value={i}>{o}</option>)}
                    </select>
                    <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Search button */}
              <button className="w-full bg-[#ee0033] text-white py-3 rounded-xl font-black text-sm hover:bg-[#cc0029] transition-colors flex items-center justify-center gap-2">
                <Search size={16} />
                TÌM KIẾM NGAY →
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block lg:w-72 xl:w-80 shrink-0">
            <div className="lg:sticky lg:top-20">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
