import { useState } from 'react';
import { motion } from 'framer-motion';

type Tab = 'internet' | 'tv' | 'camera' | 'combo';

const internetPlans = [
  { name: 'MESHV3_H_TV', speed: '500Mbps', price: '180.000đ', highlight: false,
    desc: 'Gói cơ bản 32 kênh số, phù hợp hộ gia đình nhỏ. Trải nghiệm hình ảnh sắc nét, kết nối ổn định.' },
  { name: 'NETTV01_H_TV', speed: '1500Mbps', price: '280.000đ', highlight: true,
    desc: 'Gói phổ biến nhất cho gia đình. Tốc độ cao, trải nghiệm giải trí số toàn diện với đầy đủ kênh.' },
  { name: 'NETTV2_H_TV', speed: '1500Mbps', price: '350.000đ', highlight: false,
    desc: 'Mạng mạnh hơn cho các gia đình đông thành viên hoặc làm việc tại nhà cần kết nối tin cậy.' },
  { name: 'MESHV3_1_TV', speed: 'Tốc độ nhanh', price: '450.000đ', highlight: false,
    desc: 'Gói lên tới 32 kênh số. Trải nghiệm Mesh WiFi phủ sóng toàn nhà, không còn vùng tối sóng.' },
];

const tvPlans = [
  { name: 'TV360 Basic', channels: '50 kênh', price: '50.000đ', highlight: false },
  { name: 'TV360 Standard', channels: '100 kênh', price: '80.000đ', highlight: true },
  { name: 'TV360 Premium', channels: '200+ kênh', price: '120.000đ', highlight: false },
];

const cameraPlans = [
  { name: 'Camera 1 mắt', res: '2MP Full HD', price: '1.200.000đ', highlight: false },
  { name: 'Camera 4 mắt', res: '2MP Full HD', price: '3.500.000đ', highlight: true },
  { name: 'Camera 8 mắt', res: '4K Ultra HD', price: '6.500.000đ', highlight: false },
];

export default function InternetPackages() {
  const [tab, setTab] = useState<Tab>('internet');

  return (
    <motion.section
      id="packages-internet"
      initial={{ y: 20 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4 }}
      className="py-5 md:py-6 bg-white mt-4"
    >
      <div>
        {/* Section header */}
        <div className="mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🌐</span>
            <h2 className="text-sm md:text-base font-black text-gray-800 uppercase tracking-wide">
              Internet · TV360 · Camera
            </h2>
          </div>
          <div className="mt-1 h-0.5 w-20 bg-[#ee0033] rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {([
            { key: 'internet', label: 'Gói Internet' },
            { key: 'tv', label: 'Gói Truyền Hình' },
            { key: 'camera', label: 'Camera' },
            { key: 'combo', label: 'Gói Combo Internet + Truyền Hình' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-[#ee0033] text-[#ee0033]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Internet plans */}
        {tab === 'internet' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {internetPlans.map(plan => (
              <div key={plan.name}
                className={`rounded-xl border-2 p-3 transition-all ${plan.highlight ? 'border-[#ee0033] bg-red-50' : 'border-gray-200 bg-white'}`}>
                <div className={`text-xs font-black mb-1 ${plan.highlight ? 'text-[#ee0033]' : 'text-gray-700'}`}>
                  {plan.name}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <span className={`text-red-500 text-sm`}>●</span>
                  <span className="text-xs font-bold text-gray-700">Tốc độ {plan.speed}</span>
                </div>
                <p className="text-gray-500 text-[10px] leading-relaxed mb-3">{plan.desc}</p>
                <div className="text-[#ee0033] font-black text-sm mb-2">{plan.price}<span className="text-gray-400 font-normal text-[10px]">/tháng</span></div>
                <a href="tel:0359247247"
                  className={`block text-center py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                    plan.highlight ? 'bg-[#ee0033] text-white hover:bg-[#cc0029]' : 'border border-[#ee0033] text-[#ee0033] hover:bg-red-50'
                  }`}>
                  ĐĂNG KÝ NGAY
                </a>
              </div>
            ))}
          </div>
        )}

        {/* TV plans */}
        {tab === 'tv' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tvPlans.map(plan => (
              <div key={plan.name}
                className={`rounded-xl border-2 p-3 ${plan.highlight ? 'border-[#ee0033] bg-red-50' : 'border-gray-200'}`}>
                {plan.highlight && (
                  <div className="text-[9px] font-black text-[#ee0033] mb-1">⭐ PHỔ BIẾN</div>
                )}
                <div className="font-black text-xs text-gray-800 mb-1">{plan.name}</div>
                <div className="text-gray-500 text-[10px] mb-2">{plan.channels}</div>
                <div className="text-[#ee0033] font-black text-sm mb-2">{plan.price}<span className="text-gray-400 font-normal text-[10px]">/tháng</span></div>
                <a href="tel:0359247247"
                  className={`block text-center py-1.5 rounded-lg text-[10px] font-bold ${
                    plan.highlight ? 'bg-[#ee0033] text-white' : 'border border-[#ee0033] text-[#ee0033]'
                  }`}>
                  Đăng ký
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Camera plans */}
        {tab === 'camera' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cameraPlans.map(plan => (
              <div key={plan.name}
                className={`rounded-xl border-2 p-3 ${plan.highlight ? 'border-[#ee0033] bg-red-50' : 'border-gray-200'}`}>
                {plan.highlight && (
                  <div className="text-[9px] font-black text-[#ee0033] mb-1">⭐ BÁN CHẠY</div>
                )}
                <div className="font-black text-xs text-gray-800 mb-1">{plan.name}</div>
                <div className="text-gray-500 text-[10px] mb-2">{plan.res}</div>
                <div className="text-[#ee0033] font-black text-sm mb-2">{plan.price}</div>
                <a href="tel:0359247247"
                  className={`block text-center py-1.5 rounded-lg text-[10px] font-bold ${
                    plan.highlight ? 'bg-[#ee0033] text-white' : 'border border-[#ee0033] text-[#ee0033]'
                  }`}>
                  Tư vấn
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Combo */}
        {tab === 'combo' && (
          <div className="space-y-3">
            {[
              { name: 'Internet 100Mbps + TV360 Basic', price: '200.000đ', saves: '30.000đ' },
              { name: 'Internet 200Mbps + TV360 Standard', price: '320.000đ', saves: '40.000đ', highlight: true },
              { name: 'Internet 500Mbps + TV360 Premium', price: '450.000đ', saves: '50.000đ' },
            ].map(combo => (
              <div key={combo.name}
                className={`flex items-center justify-between rounded-xl border-2 p-3 ${combo.highlight ? 'border-[#ee0033] bg-red-50' : 'border-gray-200'}`}>
                <div>
                  <div className="font-bold text-sm text-gray-800">{combo.name}</div>
                  <div className="text-green-600 text-xs font-semibold">Tiết kiệm {combo.saves}/tháng</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[#ee0033] font-black text-base">{combo.price}<span className="text-gray-400 font-normal text-[10px]">/tháng</span></div>
                  <a href="tel:0359247247"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${combo.highlight ? 'bg-[#ee0033] text-white' : 'border border-[#ee0033] text-[#ee0033]'}`}>
                    Đăng ký
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-4">
          <a href="tel:0359247247" className="text-[#ee0033] text-xs font-semibold hover:underline">
            Xem tất cả gói cước →
          </a>
        </div>
      </div>
    </motion.section>
  );
}
