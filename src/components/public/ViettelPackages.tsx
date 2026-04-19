import { MapPin, ShieldCheck, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SERVICES = [
  { icon: MapPin, label: 'Cập nhật CMND/CCCD', color: 'bg-red-100 text-red-600', desc: 'Hỗ trợ chuẩn hoá thông tin thuê bao theo quy định TTVT7/TT4T, đảm bảo 5 phút/1 thuê bao.' },
  { icon: ShieldCheck, label: 'Hỗ trợ địa điểm bị lũ lụt, bão, cháy rừng', color: 'bg-orange-100 text-orange-600', desc: 'Hỗ trợ và ưu đãi cho người dùng tại vùng thiên tai, hỗ trợ theo từng đợt thiên tai của Viettel.' },
  { icon: Building2, label: 'Địa điểm ĐKTT chuyên chú cho khách mua SIM ONLINE', color: 'bg-green-100 text-green-600', desc: 'Trải nghiệm mua SIM online không cần ra cửa hàng. Đăng ký chính chủ tại nhà mọi lúc.' },
];

const QUICK_SERVICES = [
  { icon: '🌐', label: 'Internet · TV', color: 'bg-blue-500' },
  { icon: '💳', label: 'Thanh toán', color: 'bg-green-500' },
  { icon: '🛡️', label: 'Bảo hiểm', color: 'bg-purple-500' },
  { icon: '💰', label: 'Vay tiền mới', color: 'bg-yellow-500' },
  { icon: '🏦', label: 'Ngân hàng', color: 'bg-indigo-500' },
  { icon: '🔄', label: 'Chuyển tiền', color: 'bg-pink-500' },
];

export default function ViettelPackages() {

  return (
    <motion.section
      id="viettel-services"
      initial={{ y: 20 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4 }}
      className="py-5 md:py-6 bg-white mt-4"
    >
      <div>
        {/* Header */}
        <div className="mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🏢</span>
            <h2 className="text-sm md:text-base font-black text-gray-800 uppercase tracking-wide">
              Dịch Vụ Viettel Toàn Diện
            </h2>
          </div>
          <div className="mt-1 h-0.5 w-20 bg-[#ee0033] rounded-full" />
          <p className="text-gray-400 text-xs mt-1">Chúng tôi cung cấp đầy đủ các giải pháp viễn thông cho gia đình và doanh nghiệp.</p>
        </div>

        {/* Main service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {SERVICES.map(s => (
            <div key={s.label} className="border border-gray-200 rounded-xl p-3 hover:border-[#ee0033] hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                <s.icon size={20} />
              </div>
              <h3 className="font-black text-xs text-gray-800 mb-1.5 leading-tight">{s.label}</h3>
              <p className="text-gray-500 text-[10px] leading-relaxed mb-3">{s.desc}</p>
              <div className="flex gap-2">
                <button className="flex-1 text-[10px] font-bold text-[#ee0033] border border-[#ee0033] py-1 rounded-lg hover:bg-red-50 transition-colors">
                  Xem chi tiết
                </button>
                <button className="flex-1 text-[10px] font-bold text-white bg-[#ee0033] py-1 rounded-lg hover:bg-[#cc0029] transition-colors">
                  Hỗ trợ ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick services grid */}
        <div className="bg-gray-50 rounded-xl p-3">
          <h3 className="text-xs font-black text-gray-600 mb-3 uppercase">Dịch Vụ Nhanh</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {QUICK_SERVICES.map(s => (
              <button key={s.label} className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity">
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                  {s.icon}
                </div>
                <span className="text-[10px] text-gray-600 font-semibold text-center leading-tight">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SIM packages */}
        <div className="mt-4" id="packages-sim">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-black text-gray-800 uppercase">Gói Cước SIM Viettel</h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {[
              { name: 'D60', price: '60K/tháng', data: '3GB/ngày', hot: false },
              { name: 'VD89', price: '89K/tháng', data: '4GB/ngày', hot: true },
              { name: 'V120', price: '120K/tháng', data: '5GB/ngày', hot: false },
              { name: 'VD149', price: '149K/tháng', data: '7GB/ngày', hot: false },
              { name: 'MAX5G', price: '200K/tháng', data: '10GB/ngày', hot: false },
            ].map(pkg => (
              <div key={pkg.name}
                className={`flex-none rounded-xl border-2 p-3 min-w-[110px] text-center transition-all ${pkg.hot ? 'border-[#ee0033] bg-red-50' : 'border-gray-200 bg-white'}`}>
                {pkg.hot && <div className="text-[9px] font-black text-[#ee0033] mb-1">⭐ HOT</div>}
                <div className={`font-black text-sm ${pkg.hot ? 'text-[#ee0033]' : 'text-gray-800'}`}>{pkg.name}</div>
                <div className="text-gray-500 text-[10px] my-1">{pkg.data}</div>
                <div className={`font-black text-xs ${pkg.hot ? 'text-[#ee0033]' : 'text-gray-700'}`}>{pkg.price}</div>
                <a href="tel:0359247247"
                  className={`block mt-2 text-[10px] font-bold py-1 rounded-lg ${pkg.hot ? 'bg-[#ee0033] text-white' : 'border border-[#ee0033] text-[#ee0033]'}`}>
                  Đăng ký
                </a>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1 md:hidden">← Vuốt để xem thêm →</p>
        </div>
      </div>
    </motion.section>
  );
}
