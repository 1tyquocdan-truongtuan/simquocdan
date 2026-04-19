import { Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {

  return (
    <motion.footer
      id="contact"
      initial={{ y: 20 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900 text-gray-300 mt-4"
    >
      {/* Store locator banner */}
      <div className="bg-[#ee0033]">
        <div className="max-w-7xl mx-auto px-4 py-5 md:py-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex-1">
              <div className="text-white font-black text-lg md:text-xl mb-1">
                🏪 GIỮ THĂM CỬA HÀNG CHUYÊN VIETTEL
              </div>
              <p className="text-red-100 text-sm leading-relaxed">
                Trải nghiệm dịch vụ Viettel chuyên nghiệp nhất. Được hỗ trợ và tư vấn sau khi ký hợp đồng, đầy đủ chính sách ưu đãi cho khách hàng thân thiết.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <a
                href="tel:0359247247"
                className="flex items-center gap-2 bg-white text-[#ee0033] px-4 py-2.5 rounded-full font-black text-sm hover:bg-red-50 transition-colors"
              >
                <Phone size={15} />
                0359.247.247
              </a>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border-2 border-white text-white px-4 py-2.5 rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
              >
                <MapPin size={15} />
                XEM TRÊN GOOGLE MAPS
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ee0033] rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-black text-lg">V</span>
              </div>
              <div>
                <div className="text-white font-black text-base">SIM QUỐC DÂN</div>
                <div className="text-gray-400 text-xs">Viễn Thông Quốc Dân</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Chuyên cung cấp SIM số đẹp Viettel chính hãng, gói cước ưu đãi và dịch vụ lắp đặt internet, truyền hình, camera tại TP.HCM.
            </p>
            <a href="tel:0359247247"
              className="inline-flex items-center gap-2 bg-[#ee0033] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-[#cc0029] transition-colors">
              <Phone size={14} /> 0359.247.247
            </a>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Liên Hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Phone size={14} className="text-[#ee0033] mt-0.5 shrink-0" />
                <div>
                  <div className="text-white text-xs font-semibold">Tư vấn & Đặt SIM</div>
                  <a href="tel:0359247247" className="text-[#ff4466] font-black text-base hover:underline">0359.247.247</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#ee0033] mt-0.5 shrink-0" />
                <div>
                  <div className="text-white text-xs font-semibold">Khu vực phục vụ</div>
                  <div className="text-gray-400 text-xs">TP. Hồ Chí Minh</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={14} className="text-[#ee0033] mt-0.5 shrink-0" />
                <div>
                  <div className="text-white text-xs font-semibold">Giờ làm việc</div>
                  <div className="text-gray-400 text-xs">8:00 - 21:00 (Thứ 2 - CN)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Dịch Vụ</h3>
            <ul className="space-y-2">
              {[
                'SIM Số Đẹp Viettel',
                'Gói Cước SIM',
                'Lắp Internet Cáp Quang',
                'Truyền Hình TV360',
                'Camera An Ninh',
                'Chuyển Mạng Giữ Số',
              ].map(item => (
                <li key={item}>
                  <button className="text-gray-400 hover:text-[#ff4466] text-xs transition-colors text-left">
                    › {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Commit */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">Cam Kết</h3>
            <ul className="space-y-2">
              {[
                'SIM Viettel chính hãng 100%',
                'Đăng ký thông tin chính chủ',
                'Giao SIM tận nơi TP.HCM',
                'Giữ số 24h sau đặt hàng',
                'Hỗ trợ tư vấn miễn phí',
                'Bảo hành dịch vụ 1 năm',
              ].map(item => (
                <li key={item} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="text-green-400 shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>© 2025 Viễn Thông Quốc Dân. All rights reserved.</span>
          <span>Địa bàn phục vụ: TP. Hồ Chí Minh</span>
        </div>
      </div>
    </motion.footer>
  );
}
