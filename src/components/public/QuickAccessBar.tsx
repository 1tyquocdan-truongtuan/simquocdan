import { Smartphone, Wifi, Gift, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

const ITEMS = [
  { icon: Smartphone, label: 'SIM Số Đẹp', color: 'bg-red-500', id: 'sim-soDep', isPage: true },
  { icon: Wifi, label: 'Internet · TV', color: 'bg-blue-500', id: 'packages-internet', isPage: false },
  { icon: Gift, label: 'Khuyến Mãi', color: 'bg-green-500', id: 'promotions', isPage: false },
  { icon: LayoutGrid, label: 'Dịch Vụ', color: 'bg-purple-500', id: 'viettel-services', isPage: false },
];

interface QuickAccessBarProps {
  onSimSoDep?: () => void;
}

export default function QuickAccessBar({ onSimSoDep }: QuickAccessBarProps) {
  const handleClick = (item: typeof ITEMS[0]) => {
    if (item.isPage && onSimSoDep) {
      onSimSoDep();
    } else {
      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="grid grid-cols-4 md:flex md:justify-start md:gap-2 py-1.5 md:py-2">
          {ITEMS.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              onClick={() => handleClick(item)}
              className="flex flex-col items-center gap-1 py-1.5 md:px-4 md:py-2 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className={`w-9 h-9 md:w-10 md:h-10 ${item.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                <item.icon size={18} className="text-white" />
              </div>
              <span className="text-[9px] md:text-xs font-bold text-gray-600 text-center leading-tight">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
