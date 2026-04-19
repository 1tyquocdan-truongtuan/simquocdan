import { Home, Grid3x3, Gift, Phone } from 'lucide-react';

const TABS = [
  { icon: Home, label: 'Trang chủ', id: 'hero' },
  { icon: Grid3x3, label: 'Danh mục', id: 'sim-catalog' },
  { icon: Gift, label: 'Khuyến mãi', id: 'promotions' },
  { icon: Phone, label: 'Liên hệ', id: 'contact' },
];

export default function MobileBottomNav() {
  const scrollTo = (id: string) => {
    if (id === 'hero') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <div className="flex items-center justify-around">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => scrollTo(tab.id)}
            className="flex flex-col items-center gap-0.5 py-2 px-3 flex-1 text-gray-500 hover:text-[#ee0033] active:text-[#ee0033] transition-colors"
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </button>
        ))}
        <a
          href="tel:0359247247"
          className="flex flex-col items-center gap-0.5 py-2 px-3 flex-1 text-white bg-[#ee0033]"
        >
          <Phone size={20} />
          <span className="text-[10px] font-bold">Gọi ngay</span>
        </a>
      </div>
    </nav>
  );
}
