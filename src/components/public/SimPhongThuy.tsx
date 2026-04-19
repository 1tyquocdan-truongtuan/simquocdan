import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SimEntry } from '../../types';
import { SimType } from '../../types';
import { formatPhoneDisplay } from '../../utils/simLogic';
import OrderModal from './OrderModal';

const MENH_FILTERS = ['Tất cả', 'Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
const MENH_COLORS: Record<string, string> = {
  Kim: '#C0C0C0', Mộc: '#228B22', Thủy: '#1E90FF', Hỏa: '#FF4500', Thổ: '#8B6914',
};

const PHONG_THUY_TYPES = [
  SimType.TAM_HOA_DUOI, SimType.TU_QUY_DUOI, SimType.NGU_QUY_DUOI,
  SimType.TU_QUY_GIUA, SimType.NGU_QUY_GIUA,
  SimType.SIM_CAP_DAO, SimType.TAXI_DAU,
  SimType.GANH_DOI, SimType.GANH_DEP, SimType.GANH_THUONG,
  SimType.AB_AC_AD_TIEN, SimType.AB_AC_AD_FREE,
  SimType.TANG_DAN_DEU_3_CUOI, SimType.TANG_DAN_DEU_4_CUOI,
];

const PAGE_SIZE = 9;

interface SimPhongThuyProps {
  sims: SimEntry[];
}

export default function SimPhongThuy({ sims }: SimPhongThuyProps) {
  const [menhFilter, setMenhFilter] = useState('Tất cả');
  const [category, setCategory] = useState<SimType | 'Tất cả'>('Tất cả');
  const [page, setPage] = useState(1);
  const [orderSim, setOrderSim] = useState<{ phone: string; price: string } | null>(null);

  const phongThuySims = sims.filter(s =>
    s.simTypes.some(t => PHONG_THUY_TYPES.includes(t))
  );

  const filtered = phongThuySims.filter(s => {
    if (menhFilter !== 'Tất cả' && s.menh !== menhFilter) return false;
    if (category !== 'Tất cả' && !s.simTypes.includes(category as SimType)) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (sims.length === 0) return null;

  return (
    <motion.section
      initial={{ y: 20 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4 }}
      className="py-5 md:py-6 bg-gray-50 rounded-xl mt-4"
    >
      <div>
        {/* Header */}
        <div className="mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-base">☯️</span>
            <h2 className="text-sm md:text-base font-black text-gray-800 uppercase tracking-wide">
              Chọn SIM Phong Thủy
            </h2>
          </div>
          <div className="mt-1 h-0.5 w-20 bg-[#ee0033] rounded-full" />
        </div>

        {/* Mệnh filter */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {MENH_FILTERS.map(m => (
            <button
              key={m}
              onClick={() => { setMenhFilter(m); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border ${
                menhFilter === m
                  ? 'text-white border-transparent'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
              style={menhFilter === m ? { backgroundColor: m !== 'Tất cả' ? MENH_COLORS[m] : '#ee0033', borderColor: 'transparent' } : {}}
            >
              {m !== 'Tất cả' && <span className="mr-1">●</span>}
              Mệnh {m}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => { setCategory('Tất cả'); setPage(1); }}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${category === 'Tất cả' ? 'bg-[#ee0033] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            Tất cả
          </button>
          {PHONG_THUY_TYPES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${category === cat ? 'bg-[#ee0033] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-gray-500 text-xs mb-3">
          <strong>{filtered.length}</strong> số phong thủy{menhFilter !== 'Tất cả' && ` mệnh ${menhFilter}`}
        </p>

        {/* Grid */}
        {paginated.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Không có số phong thủy phù hợp</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 border border-gray-100 rounded-lg overflow-hidden divide-x divide-y divide-gray-100">
            {paginated.map(sim => {
              const mainType = sim.simTypes.find(t => PHONG_THUY_TYPES.includes(t)) || sim.simTypes[0];
              const menhColor = MENH_COLORS[sim.menh || ''] || '#ee0033';
              return (
                <div
                  key={sim.id}
                  onClick={() => setOrderSim({ phone: formatPhoneDisplay(sim.normalizedPhone), price: sim.price || 'Liên hệ' })}
                  className="bg-white hover:bg-red-50 transition-colors cursor-pointer group flex items-stretch"
                >
                  <div className="w-1 shrink-0" style={{ backgroundColor: menhColor }} />
                  <div className="flex-1 px-2.5 py-2.5 min-w-0">
                    <div className="text-[#ee0033] font-black text-sm sim-number truncate leading-tight">
                      {formatPhoneDisplay(sim.normalizedPhone)}
                    </div>
                    <div className="text-gray-400 text-[10px] truncate mt-0.5 leading-tight">
                      {(mainType || '').length > 18 ? (mainType || '').substring(0, 16) + '…' : (mainType || '')}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-gray-800 font-bold text-xs">{sim.price || 'Liên hệ'}</span>
                      {sim.menh && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded-full" style={{ color: menhColor, backgroundColor: menhColor + '18' }}>
                          {sim.menh}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2.5 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:border-[#ee0033] hover:text-[#ee0033] text-xs">← Trước</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded text-xs font-semibold ${p === page ? 'bg-[#ee0033] text-white' : 'border border-gray-200 hover:border-[#ee0033] hover:text-[#ee0033]'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:border-[#ee0033] hover:text-[#ee0033] text-xs">Sau →</button>
          </div>
        )}
      </div>

      <OrderModal sim={orderSim} onClose={() => setOrderSim(null)} />
    </motion.section>
  );
}
