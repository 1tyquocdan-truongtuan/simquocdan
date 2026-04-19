import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, SlidersHorizontal, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SimEntry } from '../../types';
import { SimType } from '../../types';
import { formatPhoneDisplay } from '../../utils/simLogic';
import OrderModal from './OrderModal';

const PRICE_RANGES = [
  { label: 'Tất cả', max: Infinity },
  { label: 'Dưới 500K', max: 500000 },
  { label: '500K - 1 triệu', max: 1000000, min: 500000 },
  { label: '1 - 2 triệu', max: 2000000, min: 1000000 },
  { label: 'Trên 2 triệu', min: 2000000, max: Infinity },
];

const SIM_CATEGORIES = [
  SimType.ALL,
  SimType.NGU_QUY_DUOI, SimType.TU_QUY_DUOI, SimType.TAM_HOA_DUOI,
  SimType.TU_QUY_GIUA, SimType.NGU_QUY_GIUA,
  SimType.SIM_CAP_DAO, SimType.TAXI_DAU,
  SimType.GANH_DOI, SimType.GANH_DEP,
  SimType.TIEN_7_LIEN_TIEP, SimType.TIEN_6_LIEN_TIEP, SimType.TIEN_5_LIEN_TIEP,
  SimType.TIEN_4_LIEN_TIEP, SimType.TIEN_3_LIEN_TIEP,
  SimType.DAU_SO_DEP, SimType.KEP_DUOI_1_CAP,
];

const PAGE_SIZE = 9;

interface SimCatalogProps {
  externalSims?: SimEntry[];
  simsLoading?: boolean;
}

export default function SimCatalog({ externalSims, simsLoading }: SimCatalogProps) {
  const [sims, setSims] = useState<SimEntry[]>([]);
  const [filtered, setFiltered] = useState<SimEntry[]>([]);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<SimType>(SimType.ALL);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState(0);
  const [orderSim, setOrderSim] = useState<{ phone: string; price: string } | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (externalSims) setSims(externalSims);
  }, [externalSims]);

  const applyFilters = useCallback(() => {
    let result = sims;
    if (category !== SimType.ALL) result = result.filter(s => s.simTypes.includes(category));
    if (search.trim()) {
      const q = search.replace(/[^0-9]/g, '');
      result = result.filter(s => s.normalizedPhone.includes(q));
    }
    const range = PRICE_RANGES[priceRange];
    if (range.max !== Infinity || range.min) {
      result = result.filter(s => {
        const p = parseInt((s.price || '0').replace(/[^0-9]/g, ''));
        if (isNaN(p)) return false;
        const min = range.min ?? 0;
        return p >= min && p <= range.max;
      });
    }
    setFiltered(result);
    setPage(1);
  }, [sims, category, search, priceRange]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <motion.section
      id="sim-catalog"
      initial={{ y: 20 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.4 }}
      className="py-5 md:py-6 bg-white"
    >
      <div>
        {/* Section header - matching reference style */}
        <div className="mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[#ee0033] text-base">❤</span>
            <h2 className="text-sm md:text-base font-black text-gray-800 uppercase tracking-wide">
              Chọn SIM Đẹp Theo Giá
            </h2>
          </div>
          <div className="mt-1 h-0.5 w-20 bg-[#ee0033] rounded-full" />
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                inputMode="numeric"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm số điện thoại..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#ee0033] text-sm bg-white"
              />
            </div>
            <button
              onClick={() => setShowFilter(f => !f)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${showFilter ? 'bg-[#ee0033] text-white border-[#ee0033]' : 'border-gray-200 text-gray-600 bg-white'}`}
            >
              <SlidersHorizontal size={14} />
              Lọc
            </button>
          </div>

          {/* Price ranges */}
          {showFilter && (
            <div className="flex gap-1.5 flex-wrap mb-2">
              {PRICE_RANGES.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setPriceRange(i)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${priceRange === i ? 'bg-[#ee0033] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {SIM_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  category === cat ? 'bg-[#ee0033] text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-500 text-xs">
            Hiển thị <strong>{paginated.length}</strong> / <strong>{filtered.length}</strong> số
            {category !== SimType.ALL && ` "${category}"`}
          </p>
        </div>

        {/* SIM Grid */}
        {simsLoading ? (
          <div className="text-center py-10 text-gray-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#ee0033]" />
            <p className="text-sm">Đang tải danh sách SIM...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📱</div>
            <p className="font-semibold text-sm">Chưa có SIM nào</p>
            <p className="text-xs mt-1">Thay đổi bộ lọc hoặc liên hệ để được tư vấn</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 border border-gray-100 rounded-lg overflow-hidden divide-x divide-y divide-gray-100">
            {paginated.map(sim => (
              <SimCard
                key={sim.id}
                sim={sim}
                liked={wishlist.has(sim.id)}
                onLike={() => toggleWishlist(sim.id)}
                onOrder={() => setOrderSim({ phone: formatPhoneDisplay(sim.normalizedPhone), price: sim.price || 'Liên hệ' })}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-4 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2.5 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:border-[#ee0033] hover:text-[#ee0033] text-xs transition-colors">
              ← Trước
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded text-xs font-semibold ${p === page ? 'bg-[#ee0033] text-white' : 'border border-gray-200 hover:border-[#ee0033] hover:text-[#ee0033]'} transition-colors`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded border border-gray-200 disabled:opacity-40 hover:border-[#ee0033] hover:text-[#ee0033] text-xs transition-colors">
              Sau →
            </button>
          </div>
        )}

        {/* View more link */}
        {totalPages > 1 && (
          <div className="text-center mt-3">
            <button className="text-[#ee0033] text-xs font-semibold hover:underline">
              Xem tất cả {filtered.length} số →
            </button>
          </div>
        )}
      </div>

      <OrderModal sim={orderSim} onClose={() => setOrderSim(null)} />
    </motion.section>
  );
}

function SimCard({ sim, liked, onLike, onOrder }: {
  sim: SimEntry;
  liked: boolean;
  onLike: () => void;
  onOrder: () => void;
}) {
  const mainType = sim.simTypes.find(t => t !== SimType.DAU_SO_DEP && t !== SimType.OTHER) || sim.simTypes[0];
  const isVip = [SimType.NGU_QUY_DUOI, SimType.TU_QUY_DUOI, SimType.NGU_QUY_GIUA, SimType.TAXI_DAU].includes(mainType);

  return (
    <div
      onClick={onOrder}
      className="relative bg-white hover:bg-red-50 transition-colors cursor-pointer group flex items-stretch"
    >
      {/* Left red indicator bar */}
      <div className={`w-1 shrink-0 ${isVip ? 'bg-[#ee0033]' : 'bg-red-200'}`} />

      <div className="flex-1 px-2.5 py-2.5 min-w-0">
        {/* VIP badge */}
        {isVip && (
          <span className="text-[8px] font-black text-white bg-[#ee0033] px-1 py-0.5 rounded mr-1 align-middle">VIP</span>
        )}
        {/* Phone number */}
        <div className="text-[#ee0033] font-black text-sm leading-tight sim-number truncate">
          {formatPhoneDisplay(sim.normalizedPhone)}
        </div>

        {/* Type */}
        <div className="text-gray-400 text-[10px] truncate leading-tight mt-0.5">
          {(mainType || '').length > 18 ? (mainType || '').substring(0, 16) + '…' : (mainType || '')}
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-gray-800 font-bold text-xs">{sim.price || 'Liên hệ'}</span>
          {sim.menh && (
            <span className="text-[9px] font-bold px-1 py-0.5 rounded-full" style={{ color: sim.menhColor, backgroundColor: sim.menhColor + '18' }}>
              {sim.menh}
            </span>
          )}
        </div>
      </div>

      {/* Heart */}
      <button
        onClick={e => { e.stopPropagation(); onLike(); }}
        className="px-2 flex items-center shrink-0"
      >
        <Heart
          size={12}
          className={liked ? 'fill-red-500 text-red-500' : 'text-gray-200 group-hover:text-red-300'}
        />
      </button>
    </div>
  );
}
