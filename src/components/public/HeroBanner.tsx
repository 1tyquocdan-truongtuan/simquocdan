import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    id: 1,
    title: 'INTERNET CÁP QUANG',
    desc: 'Miễn phí lắp đặt, tặng modem wifi 6 thế hệ mới khi đăng ký gói cước Internet + Truyền hình.',
    cta: 'ĐĂNG KÝ NGAY ƯU ĐÃI',
    ctaId: 'packages-internet',
    tag: 'KHUYẾN MÃI',
  },
  {
    id: 2,
    title: 'SIM SỐ ĐẸP VIETTEL',
    desc: 'Hơn 10.000 số đẹp các loại: Ngũ quý, Tứ quý, Phong thủy, Taxi đầu... Đăng ký chính chủ tại nhà.',
    cta: 'XEM DANH SÁCH SIM',
    ctaId: 'sim-catalog',
    tag: 'HOT',
  },
  {
    id: 3,
    title: 'GÓI CƯỚC ƯU ĐÃI',
    desc: 'Đăng ký gói D60, VD89, V120... data khủng gọi thả ga chỉ từ 60.000đ/tháng.',
    cta: 'XEM GÓI CƯỚC',
    ctaId: 'packages-sim',
    tag: 'MỚI',
  },
  {
    id: 4,
    title: 'CAMERA AN NINH',
    desc: 'Lắp đặt camera Viettel cho gia đình và doanh nghiệp. Xem trực tiếp qua điện thoại 24/7.',
    cta: 'TÌM HIỂU THÊM',
    ctaId: 'packages-internet',
    tag: 'DỊCH VỤ',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative bg-[#ee0033] overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white opacity-5" />
        <div className="absolute -right-5 top-10 w-48 h-48 rounded-full bg-white opacity-5" />
        <div className="absolute right-40 bottom-0 w-32 h-32 rounded-full bg-white opacity-5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-5 md:py-10 pb-8 md:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl"
          >
            <div className="inline-block bg-white/20 text-white text-[10px] md:text-xs font-black px-2 py-0.5 md:px-3 md:py-1 rounded mb-1.5 md:mb-2 tracking-wider">
              {slide.tag}
            </div>

            <h1 className="text-xl md:text-4xl font-black text-white mb-1.5 md:mb-2 leading-tight">
              {slide.title}
            </h1>
            <p className="text-red-100 text-xs md:text-base mb-4 md:mb-5 leading-relaxed max-w-md line-clamp-2 md:line-clamp-none">
              {slide.desc}
            </p>

            <button
              onClick={() => scrollTo(slide.ctaId)}
              className="bg-white text-[#ee0033] px-4 md:px-6 py-2 md:py-2.5 rounded font-black text-xs md:text-sm hover:bg-red-50 transition-colors shadow"
            >
              {slide.cta}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>

      {/* Arrow controls */}
      <button
        onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronLeft size={14} className="text-white" />
      </button>
      <button
        onClick={() => setCurrent(c => (c + 1) % slides.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        <ChevronRight size={14} className="text-white" />
      </button>
    </section>
  );
}
