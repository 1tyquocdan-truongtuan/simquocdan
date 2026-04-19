import { useState } from 'react';
import { Menu, X, Search, ShoppingCart, ChevronDown, Phone } from 'lucide-react';

interface HeaderProps {
  onAdminClick: () => void;
}

const NAV_ITEMS = [
  {
    label: 'SIM SỐ ĐẸP', id: 'sim-catalog',
    sub: [
      'SIM ĐẸP THEO GIÁ',
      'SIM PHONG THỦY',
      'SIM MAY MẮN',
      'SIM TRẢ SAU',
      'SIM 500GB/THÁNG MIỄN PHÍ 12 THÁNG',
      'CHỌN GÓI KHUYẾN MÃI TIẾT KIỆM NHẤT CHO SIM ĐANG SỬ DỤNG',
    ],
  },
  { label: 'INTERNET · TV · CAMERA', id: 'packages-internet', sub: ['Gói Internet Gia Đình', 'Gói Doanh Nghiệp', 'Truyền Hình TV360', 'Camera An Ninh'] },
  { label: 'KHUYẾN MÃI · HƯỚNG DẪN', id: 'promotions' },
  { label: 'DỊCH VỤ VIETTEL TOÀN DIỆN', id: 'viettel-services' },
];

export default function Header({ onAdminClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <header className="bg-[#ee0033] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => scrollTo('hero')}
          >
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow">
              <span className="text-[#ee0033] font-black text-base md:text-lg">V</span>
            </div>
            <div>
              <div className="text-white font-black text-sm md:text-base leading-tight tracking-wide">
                SIM QUỐC DÂN
              </div>
              <div className="text-red-200 text-[10px] hidden sm:block">Viễn Thông Quốc Dân</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item, i) => (
              <div
                key={i}
                className="relative"
                onMouseEnter={() => item.sub && setActiveDropdown(i)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => scrollTo(item.id)}
                  className="flex items-center gap-1 text-white hover:text-red-100 text-xs font-bold px-3 py-2 transition-colors whitespace-nowrap"
                >
                  {item.label}
                  {item.sub && <ChevronDown size={12} />}
                </button>
                {item.sub && activeDropdown === i && (
                  <div className="absolute top-full left-0 bg-white shadow-2xl min-w-[280px] py-3 z-50 border-t-2 border-[#ee0033]">
                    {item.sub.map(sub => (
                      <button
                        key={sub}
                        onClick={() => scrollTo(item.id)}
                        className="block w-full text-left px-6 py-3 text-[#1a2340] hover:text-[#ee0033] font-black text-sm uppercase tracking-wide transition-colors hover:bg-gray-50"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-2 md:gap-3">
            <button className="text-white hover:text-red-100 transition-colors p-1">
              <Search size={18} />
            </button>
            <button className="text-white hover:text-red-100 transition-colors p-1">
              <ShoppingCart size={18} />
            </button>
            <a
              href="tel:0359247247"
              className="hidden md:flex items-center gap-1.5 bg-white text-[#ee0033] px-3 py-1.5 rounded-full font-bold text-xs hover:bg-red-50 transition-colors"
            >
              <Phone size={12} />
              0359.247.247
            </a>
            <button
              onClick={onAdminClick}
              className="hidden lg:block text-red-200 hover:text-white text-xs transition-colors px-1"
            >
              Quản trị
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-white p-1"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#cc0029] border-t border-red-400">
          <div className="px-4 py-2 space-y-0">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={i}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left text-white py-3 border-b border-red-400 font-bold text-sm"
              >
                {item.label}
              </button>
            ))}
            <a href="tel:0359247247" className="flex items-center gap-2 text-white py-3 border-b border-red-400 font-bold text-sm">
              <Phone size={16} /> 0359.247.247
            </a>
            <button onClick={() => { onAdminClick(); setMenuOpen(false); }} className="block text-red-300 py-2.5 text-xs">
              Quản trị
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
