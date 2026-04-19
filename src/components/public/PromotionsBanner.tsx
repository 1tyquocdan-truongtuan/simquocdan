import { useEffect, useState } from 'react';
import { Tag, Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DEFAULT_PROMOS = [
  { id: '1', title: 'Mua SIM tặng gói cước 1 tháng', description: 'Áp dụng khi mua SIM từ 200.000đ - Tặng gói D60 hoặc VD89 miễn phí 1 tháng', is_active: true },
  { id: '2', title: 'Giảm 50K khi lắp internet kèm SIM', description: 'Đăng ký gói internet gia đình + mua SIM số đẹp - Giảm ngay 50.000đ trên hóa đơn đầu tiên', is_active: true },
  { id: '3', title: 'Giới thiệu bạn bè - Nhận 100K', description: 'Mỗi khách hàng giới thiệu thành công nhận ngay 100.000đ vào tài khoản MoMo/ViettelPay', is_active: true },
];

export default function PromotionsBanner() {
  const [promos, setPromos] = useState(DEFAULT_PROMOS);

  useEffect(() => {
    supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data && data.length > 0) setPromos(data);
      });
  }, []);

  return (
    <section id="promotions" className="py-12 bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ee0033] text-white px-4 py-1.5 rounded-full text-sm font-bold mb-3">
            <Gift size={14} />
            KHUYẾN MÃI
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">
            Ưu Đãi <span className="text-[#ee0033]">Hấp Dẫn</span>
          </h2>
          <p className="text-gray-500">Chương trình khuyến mãi đang áp dụng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {promos.filter(p => p.is_active).map((promo, i) => (
            <div key={promo.id} className={`rounded-2xl p-6 relative overflow-hidden ${i === 1 ? 'bg-[#ee0033] text-white' : 'bg-white border-2 border-red-100'}`}>
              <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 ${i === 1 ? 'bg-white' : 'bg-[#ee0033]'}`} />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${i === 1 ? 'bg-white/20' : 'bg-red-100'}`}>
                <Tag size={22} className={i === 1 ? 'text-white' : 'text-[#ee0033]'} />
              </div>
              <h3 className={`font-black text-lg mb-2 ${i === 1 ? 'text-white' : 'text-gray-800'}`}>{promo.title}</h3>
              <p className={`text-sm leading-relaxed ${i === 1 ? 'text-red-100' : 'text-gray-500'}`}>{promo.description}</p>
              <a
                href="tel:0359247247"
                className={`mt-5 inline-block px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                  i === 1 ? 'bg-white text-[#ee0033] hover:bg-red-50' : 'bg-[#ee0033] text-white hover:bg-[#cc0029]'
                }`}
              >
                Áp dụng ngay
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
