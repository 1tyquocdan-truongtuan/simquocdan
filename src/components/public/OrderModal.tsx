import { useState } from 'react';
import { X, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { sendOrderToTelegram } from '../../utils/telegram';
import { supabase } from '../../lib/supabase';

interface OrderModalProps {
  sim: { phone: string; price: string } | null;
  onClose: () => void;
}

interface FormData {
  customer_name: string;
  cccd: string;
  contact_phone: string;
  address: string;
  note: string;
}

export default function OrderModal({ sim, onClose }: OrderModalProps) {
  const [form, setForm] = useState<FormData>({ customer_name: '', cccd: '', contact_phone: '', address: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!sim) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.customer_name.trim()) { setError('Vui lòng nhập họ tên.'); return; }
    if (!form.cccd.trim()) { setError('Vui lòng nhập số CCCD.'); return; }
    if (!form.contact_phone.trim()) { setError('Vui lòng nhập số điện thoại liên hệ.'); return; }
    if (!form.address.trim()) { setError('Vui lòng nhập địa chỉ nhận SIM.'); return; }
    setLoading(true); setError('');
    try {
      const orderData = { sim_number: sim.phone, sim_price: sim.price, ...form, status: 'pending' };
      const { error: dbError } = await supabase.from('orders').insert([orderData]);
      if (dbError) console.warn('Supabase:', dbError.message);
      await sendOrderToTelegram({ sim_number: sim.phone, sim_price: sim.price, ...form });
      setSuccess(true);
    } catch {
      setError('Có lỗi xảy ra. Vui lòng gọi hotline để đặt hàng.');
    } finally {
      setLoading(false);
    }
  };

  const change = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#ee0033] rounded-t-2xl px-4 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-white font-black text-lg">Đăng ký mua SIM</h2>
            <p className="text-red-200 text-xs uppercase tracking-wide">Thông tin đơn hàng</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
            <h3 className="font-black text-xl text-gray-800 mb-2">Đặt hàng thành công!</h3>
            <p className="text-gray-600 text-sm mb-2">Chúng tôi sẽ liên hệ xác nhận trong vòng <strong>30 phút</strong>.</p>
            <p className="text-sm text-gray-500 mb-6">Số <strong className="text-[#ee0033]">{sim.phone}</strong> được giữ 24 giờ.</p>
            <button onClick={onClose} className="bg-[#ee0033] text-white px-8 py-3 rounded-full font-bold">Đóng</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            {/* SIM info */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center border border-gray-200">
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide text-[10px]">Số Thuê Bao</div>
                <div className="sim-number font-black text-gray-800 text-lg">{sim.phone}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide text-[10px]">Giá Tiền</div>
                <div className="text-[#ee0033] font-black text-xl">{sim.price}</div>
              </div>
            </div>

            {[
              { label: 'Họ và tên khách hàng', field: 'customer_name' as const, placeholder: 'Nhập họ tên của bạn', type: 'text', inputMode: undefined },
              { label: 'Giấy tờ đăng ký thông tin chính chủ', field: 'cccd' as const, placeholder: 'Số CCCD', type: 'text', inputMode: 'numeric' as const },
              { label: 'Số điện thoại liên hệ', field: 'contact_phone' as const, placeholder: 'Nhập số điện thoại nhận sim', type: 'tel', inputMode: 'tel' as const },
            ].map(f => (
              <div key={f.field}>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">{f.label}</label>
                <input
                  type={f.type}
                  inputMode={f.inputMode}
                  value={form[f.field]}
                  onChange={change(f.field)}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ee0033] text-sm"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Địa chỉ nhận SIM</label>
              <textarea
                value={form.address}
                onChange={change('address')}
                placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ee0033] text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Ghi chú (nếu có)</label>
              <input
                type="text"
                value={form.note}
                onChange={change('note')}
                placeholder="Ví dụ: Giao giờ hành chính"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ee0033] text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2 text-sm">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ee0033] text-white py-4 rounded-xl font-black text-base uppercase tracking-wide disabled:opacity-60 active:scale-95 transition-all shadow-lg"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </button>

            <div className="space-y-1 pb-2">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Phone size={11} className="text-[#ee0033] shrink-0" />
                <span>Tư vấn bán hàng: <a href="tel:0359247247" className="text-[#ee0033] font-semibold">0359.247.247</a></span>
              </div>
              <div className="flex items-start gap-2 text-gray-500 text-xs">
                <AlertCircle size={11} className="text-[#ee0033] shrink-0 mt-0.5" />
                <span>Thời gian giữ số trong 24 tiếng kể từ thời điểm đặt hàng thành công.</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
