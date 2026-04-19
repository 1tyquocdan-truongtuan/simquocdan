import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../layout/Sidebar';

const ZODIAC = [
  { label: 'Tuổi Tý', icon: '🐭' },
  { label: 'Tuổi Sửu', icon: '🐂' },
  { label: 'Tuổi Dần', icon: '🐯' },
  { label: 'Tuổi Mão', icon: '🐰' },
  { label: 'Tuổi Thìn', icon: '🐲' },
  { label: 'Tuổi Tỵ', icon: '🐍' },
  { label: 'Tuổi Ngọ', icon: '🐴' },
  { label: 'Tuổi Mùi', icon: '🐑' },
  { label: 'Tuổi Thân', icon: '🐒' },
  { label: 'Tuổi Dậu', icon: '🐓' },
  { label: 'Tuổi Tuất', icon: '🐕' },
  { label: 'Tuổi Hợi', icon: '🐷' },
];

const MENH = [
  { label: 'Kim', icon: '💫', color: '#C8A951', border: '#C8A951', bg: '#FFFBF0' },
  { label: 'Mộc', icon: '🌿', color: '#228B22', border: '#228B22', bg: '#F0FFF0' },
  { label: 'Thủy', icon: '💧', color: '#1E90FF', border: '#1E90FF', bg: '#F0F8FF' },
  { label: 'Hỏa', icon: '🔥', color: '#FF4500', border: '#FF4500', bg: '#FFF5F0' },
  { label: 'Thổ', icon: '⛰️', color: '#8B6914', border: '#8B6914', bg: '#FFF8F0' },
];

interface Props { onBack: () => void; }

export default function SimPhongThuyPage({ onBack }: Props) {
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.25 }}>
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">
        <div className="flex gap-4">
          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-center gap-2 mb-6">
              <button onClick={onBack} className="text-gray-500 hover:text-[#ee0033] transition-colors">
                <ArrowLeft size={18} />
              </button>
              <div className="w-1 h-6 bg-[#ee0033] rounded-full" />
              <h1 className="text-base font-black text-gray-800 uppercase tracking-wide">SIM PHONG THỦY</h1>
            </div>

            {/* Zodiac section */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
              <h2 className="text-center text-sm font-semibold text-gray-600 italic mb-5">Sim Hợp Theo Con Giáp</h2>
              <div className="grid grid-cols-6 gap-3">
                {ZODIAC.map((z) => (
                  <button key={z.label} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-full border-2 border-[#ee0033] flex items-center justify-center text-2xl bg-white group-hover:bg-red-50 transition-colors shadow-sm">
                      {z.icon}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight group-hover:text-[#ee0033] transition-colors">
                      {z.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mệnh section */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-center text-sm font-semibold text-gray-600 italic mb-5">Sim Theo Mệnh</h2>
              <div className="flex justify-center gap-6">
                {MENH.map((m) => (
                  <button key={m.label} className="flex flex-col items-center gap-2 group">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110"
                      style={{ border: `3px solid ${m.border}`, backgroundColor: m.bg }}
                    >
                      {m.icon}
                    </div>
                    <span className="text-xs font-bold" style={{ color: m.color }}>
                      Mệnh {m.label}
                    </span>
                  </button>
                ))}
              </div>
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
