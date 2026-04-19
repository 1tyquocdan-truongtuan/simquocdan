import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

const ZALO_PHONE = import.meta.env.VITE_ZALO_PHONE || '0359247247';

export default function ZaloButton() {
  const [showQR, setShowQR] = useState(false);
  const zaloLink = `https://zalo.me/${ZALO_PHONE}`;

  return (
    <>
      {/* Floating Zalo button - bottom right, above mobile nav area */}
      <a
        href={zaloLink}
        target="_blank"
        rel="noreferrer"
        onClick={e => { e.preventDefault(); setShowQR(true); }}
        className="fixed bottom-5 right-4 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        style={{ background: '#0068ff' }}
        title="Chat Zalo"
        aria-label="Liên hệ Zalo"
      >
        <svg width="30" height="30" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="50" height="50" rx="25" fill="white" fillOpacity="0"/>
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">Zalo</text>
        </svg>
        <MessageCircle size={26} className="text-white" />
      </a>

      {/* QR Modal - bottom sheet on mobile */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowQR(false)}>
          <div
            className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-6 text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar for mobile sheet */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 hidden sm:block text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#0068ff' }}>
              <MessageCircle size={28} className="text-white" />
            </div>
            <h3 className="font-black text-xl text-gray-800 mb-1">Chat với Sim Quốc Dân</h3>
            <p className="text-gray-500 text-sm mb-4">Quét QR hoặc bấm nút bên dưới để nhắn tin tư vấn</p>

            {/* QR placeholder */}
            <div className="w-44 h-44 mx-auto border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-4 bg-gray-50">
              <div className="text-center text-gray-400 text-sm">
                <div className="text-4xl mb-1">📱</div>
                <div className="text-xs">QR Zalo<br/>Sim Quốc Dân</div>
              </div>
            </div>

            <a
              href={zaloLink}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-3.5 rounded-xl font-bold text-white text-center text-base"
              style={{ background: '#0068ff' }}
            >
              Mở Zalo Chat Ngay
            </a>
            <button onClick={() => setShowQR(false)} className="block w-full py-3 text-gray-500 text-sm mt-2">
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
