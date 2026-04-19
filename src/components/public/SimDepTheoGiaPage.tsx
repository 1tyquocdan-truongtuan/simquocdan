import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../layout/Sidebar';

const PRICE_RANGES = [
  { label: 'Dưới 300k', sub: 'CHỌN NGAY', color: 'bg-blue-500', icon: '💵' },
  { label: '300k-400k', sub: 'CHỌN NGAY', color: 'bg-green-500', icon: '💰' },
  { label: '400k-600k', sub: 'CHỌN NGAY', color: 'bg-orange-500', icon: '💳' },
  { label: '600k-1 triệu', sub: 'CHỌN NGAY', color: 'bg-red-500', icon: '💎' },
  { label: '1 triệu – 2 triệu', sub: 'CHỌN NGAY', color: 'bg-purple-500', icon: '👑' },
  { label: 'Trên 2 triệu', sub: 'CHỌN NGAY', color: 'bg-teal-500', icon: '🏆' },
];

interface Props { onBack: () => void; }

export default function SimDepTheoGiaPage({ onBack }: Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }}>
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">
        <div className="flex gap-4">
          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-center gap-2 mb-5">
              <button onClick={onBack} className="text-gray-500 hover:text-[#ee0033] transition-colors">
                <ArrowLeft size={18} />
              </button>
              <div className="w-1 h-6 bg-[#ee0033] rounded-full" />
              <h1 className="text-base font-black text-gray-800 uppercase tracking-wide">SIM ĐẸP THEO GIÁ</h1>
            </div>

            <p className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Chọn Theo Mức Giá</p>

            {/* Price range cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PRICE_RANGES.map((r) => (
                <button
                  key={r.label}
                  className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:border-[#ee0033] hover:shadow-md transition-all text-left group"
                >
                  <div className={`w-12 h-12 ${r.color} rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0`}>
                    {r.icon}
                  </div>
                  <div>
                    <div className="font-black text-gray-800 text-sm group-hover:text-[#ee0033] transition-colors">{r.label}</div>
                    <div className="text-[#ee0033] text-[11px] font-bold mt-0.5">{r.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <button className="bg-[#ee0033] text-white px-10 py-3 rounded-full font-black text-sm hover:bg-[#cc0029] transition-colors flex items-center gap-2 shadow-md">
                🔍 BẤM XEM
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:w-72 xl:w-80 shrink-0">
            <div className="lg:sticky lg:top-20"><Sidebar /></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
