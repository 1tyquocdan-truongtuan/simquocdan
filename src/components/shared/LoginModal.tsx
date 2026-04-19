import { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

const CREDENTIALS = {
  admin: { password: 'admin@simquocdan', role: 'admin' as const },
  nhanvien: { password: 'nv@simquocdan', role: 'staff' as const },
};

interface LoginModalProps {
  onLogin: (role: 'admin' | 'staff', name: string) => void;
  onClose: () => void;
}

export default function LoginModal({ onLogin, onClose }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cred = CREDENTIALS[username as keyof typeof CREDENTIALS];
    if (cred && cred.password === password) {
      onLogin(cred.role, username);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-[#ee0033] rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lock size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-black text-lg">Đăng nhập</div>
              <div className="text-red-200 text-xs">Dành cho nhân viên & quản trị</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="admin hoặc nhanvien"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ee0033] focus:ring-1 focus:ring-[#ee0033]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Nhập mật khẩu"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 focus:outline-none focus:border-[#ee0033] focus:ring-1 focus:ring-[#ee0033]"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-[#ee0033] text-white py-3.5 rounded-xl font-black text-lg hover:bg-[#cc0029] transition-colors">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
