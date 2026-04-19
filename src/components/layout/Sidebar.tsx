import { Phone, MessageCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RECENT_ORDERS = [
  { name: 'B. Thị Xuyên', phone: '0326****74', badge: 'ĐẶT MỚI' },
  { name: 'T. Tiến Nam', phone: '0326***93', badge: 'ĐẶT MỚI' },
  { name: 'N. Thị Hằng', phone: '0326***71', badge: 'ĐẶT MỚI' },
  { name: 'L. Minh Nhật', phone: '0326****07', badge: 'ĐẶT MỚI' },
  { name: 'P. Thị Lan', phone: '0376***84', badge: 'ĐẶT MỚI' },
  { name: 'H. Thanh Thủy', phone: '0376***91', badge: 'ĐẶT MỚI' },
];

const SERVICES = [
  { icon: '🌐', label: 'Internet · TV', color: 'bg-blue-500' },
  { icon: '💳', label: 'Thanh toán', color: 'bg-green-500' },
  { icon: '🛡️', label: 'Bảo hiểm', color: 'bg-purple-500' },
  { icon: '💰', label: 'Vay tiền mới', color: 'bg-yellow-500' },
  { icon: '🏦', label: 'Ngân hàng', color: 'bg-indigo-500' },
  { icon: '🔄', label: 'Chuyển tiền', color: 'bg-pink-500' },
];

const NEWS = [
  {
    img: '📰',
    title: 'Các địa điểm cập nhật CMND tại Sim lẻ thu hồi, cháy, hàng nhanh chóng',
    date: '19/04/2026',
  },
  {
    img: '📡',
    title: 'Viettel Store chính thức mở tại Hoa Ngữ Ấn',
    date: '18/04/2026',
  },
];

export default function Sidebar() {

  return (
    <motion.aside
      initial={{ y: 20 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Hướng dẫn */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-3 py-2">
          <h3 className="text-xs font-black text-gray-700 uppercase tracking-wide">📋 Hướng Dẫn</h3>
        </div>
        <div className="p-3 space-y-2">
          {[
            'Bước 1: Chọn số đẹp trong danh sách',
            'Bước 2: Nhấn "Đặt mua" để đặt hàng',
            'Bước 3: Nhân viên sẽ liên hệ xác nhận',
            'Bước 4: Đăng ký SIM tại điểm giao dịch',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 bg-[#ee0033] text-white rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-gray-600 text-[11px] leading-relaxed">{step.replace(/^Bước \d+: /, '')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Đồng ký gói mới */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-red-600 px-3 py-2">
          <h3 className="text-xs font-black text-white uppercase tracking-wide">🔴 Đăng Ký Gói Mới</h3>
        </div>
        <div className="p-3 space-y-2">
          {[
            'Người dùng đang dùng CCCD mới nộp bản',
            'Người ngoài 16 tuổi cần làm theo',
            'Liên hệ hotline để được hỗ trợ',
            'Hoàn thành đăng ký trong 5 phút',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-gray-600 text-[11px] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Thủ tục đăng ký */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-3 py-2">
          <h3 className="text-xs font-black text-gray-700 uppercase tracking-wide">📄 Thủ Tục Đăng Ký</h3>
        </div>
        <div className="p-3">
          <p className="text-gray-600 text-[11px] mb-2 font-semibold">Thủ đơn mang theo bao gồm:</p>
          <ul className="space-y-1.5">
            {[
              'Người đăng ký: Cần mang CCCD/Hộ chiếu',
              'Người ngoài 16 tuổi cần kèm giám hộ',
              'Thủ bộ đồng ý của người thân (nếu có)',
              'Mang theo 1 ảnh 3x4 (nếu cần thiết)',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                <ChevronRight size={10} className="text-[#ee0033] shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Hotline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
        <h3 className="text-xs font-black text-gray-700 uppercase mb-3 text-center">📞 Hỗ Trợ Trực Tuyến</h3>
        <a
          href="tel:0359247247"
          className="flex items-center justify-center gap-2 bg-[#ee0033] text-white py-2.5 rounded-xl font-black text-sm hover:bg-[#cc0029] transition-colors mb-2"
        >
          <Phone size={16} className="animate-pulse" />
          0359 247 247
        </a>
        <a
          href="https://zalo.me/0359247247"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors mb-2"
        >
          <MessageCircle size={15} />
          Chat qua Zalo
        </a>
        <p className="text-center text-gray-500 text-[10px]">hoặc nhắn tin: <strong>0359 247 247</strong></p>
        <a
          href="tel:0359247247"
          className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors mt-2"
        >
          📦 Đặt Hàng Mới
        </a>
      </div>

      {/* Đơn hàng mới */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-3 py-2">
          <h3 className="text-xs font-black text-gray-700 uppercase tracking-wide">🛒 Đơn Hàng Mới</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {RECENT_ORDERS.map((order, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2">
              <div>
                <div className="text-[11px] font-bold text-gray-700">{order.name}</div>
                <div className="text-[10px] text-gray-400">{order.phone}</div>
              </div>
              <span className="text-[9px] font-black text-white bg-green-500 px-1.5 py-0.5 rounded-full">
                {order.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dịch vụ nổi bật */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-3 py-2">
          <h3 className="text-xs font-black text-gray-700 uppercase tracking-wide">⭐ Dịch Vụ Nổi Bật</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          {SERVICES.map(s => (
            <button key={s.label} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-lg shadow-sm`}>
                {s.icon}
              </div>
              <span className="text-[9px] text-gray-600 font-semibold text-center leading-tight">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tin tức mới */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-3 py-2">
          <h3 className="text-xs font-black text-gray-700 uppercase tracking-wide">📰 Tin Tức Mới</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {NEWS.map((news, i) => (
            <div key={i} className="flex gap-2 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                {news.img}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-700 font-semibold leading-tight line-clamp-2 mb-1">
                  {news.title}
                </p>
                <span className="text-[10px] text-gray-400">{news.date}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-3 pb-3">
          <button className="text-[#ee0033] text-xs font-semibold hover:underline">
            Xem tất cả tin tức →
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
