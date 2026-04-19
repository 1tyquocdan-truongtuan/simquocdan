import { normalizePhone, analyzeSim, getMenhAndColor } from '../utils/simLogic';
import type { SimEntry } from '../types';

const DEMO_PHONES = [
  { phone: '0326225574', price: '1.200.000đ' },
  { phone: '0326224056', price: '800.000đ' },
  { phone: '0326224714', price: '600.000đ' },
  { phone: '0326252905', price: '500.000đ' },
  { phone: '0326223724', price: '700.000đ' },
  { phone: '0326234617', price: '450.000đ' },
  { phone: '0326244610', price: '900.000đ' },
  { phone: '0326245532', price: '550.000đ' },
  { phone: '0326245742', price: '650.000đ' },
  { phone: '0326244410', price: '480.000đ' },
  { phone: '0326246642', price: '2.500.000đ' },
  { phone: '0326245319', price: '750.000đ' },
  { phone: '0326246451', price: '1.100.000đ' },
  { phone: '0326245532', price: '880.000đ' },
  { phone: '0326246413', price: '520.000đ' },
  { phone: '0326252891', price: '600.000đ' },
  { phone: '0326319523', price: '480.000đ' },
  { phone: '0326311357', price: '730.000đ' },
  { phone: '0326310714', price: '560.000đ' },
  { phone: '0326315239', price: '670.000đ' },
  { phone: '0326311924', price: '490.000đ' },
  { phone: '0326319432', price: '810.000đ' },
  { phone: '0326319681', price: '550.000đ' },
  { phone: '0326319932', price: '3.200.000đ' },
  { phone: '0326322873', price: '620.000đ' },
  { phone: '0326324964', price: '580.000đ' },
  { phone: '0326322728', price: '710.000đ' },
  // Phong thủy SIMs
  { phone: '0326274321', price: '980.000đ' },
  { phone: '0326281510', price: '750.000đ' },
  { phone: '0326284712', price: '860.000đ' },
  { phone: '0326283494', price: '920.000đ' },
  { phone: '0326285441', price: '1.050.000đ' },
  { phone: '0326283940', price: '780.000đ' },
  { phone: '0326291568', price: '640.000đ' },
  { phone: '0326295401', price: '570.000đ' },
  { phone: '0326302041', price: '490.000đ' },
  { phone: '0326322410', price: '880.000đ' },
  { phone: '0376319681', price: '950.000đ' },
  { phone: '0376322273', price: '1.300.000đ' },
  { phone: '0376319440', price: '750.000đ' },
  { phone: '0376324964', price: '830.000đ' },
  { phone: '0376316410', price: '690.000đ' },
  { phone: '0376322710', price: '560.000đ' },
];

let _cache: SimEntry[] | null = null;

export function getDemoSims(): SimEntry[] {
  if (_cache) return _cache;
  const seen = new Set<string>();
  const entries: SimEntry[] = [];
  let id = 1;
  for (const item of DEMO_PHONES) {
    const phone = normalizePhone(item.phone);
    if (!phone || seen.has(phone)) continue;
    seen.add(phone);
    const { types, detail } = analyzeSim(phone);
    const { menh, color } = getMenhAndColor(phone);
    entries.push({
      id: id++,
      originalPhone: item.phone,
      normalizedPhone: phone,
      lastSix: phone.slice(-6),
      simTypes: types,
      unitAdvanceDetail: detail,
      price: item.price,
      menh,
      menhColor: color,
      status: 'available',
    });
  }
  _cache = entries;
  return entries;
}
