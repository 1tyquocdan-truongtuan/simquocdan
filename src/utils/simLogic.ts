import { SimType } from '../types';

export const normalizePhone = (phone: any): string => {
  if (phone === null || phone === undefined) return '';
  let str = phone.toString().replace(/[^0-9]/g, '');
  if (str.length < 9) return '';
  if (str.length === 9) str = '0' + str;
  if (str.length > 10) {
    if (str.startsWith('84')) str = '0' + str.substring(2);
  }
  return str.slice(-10);
};

export const findConsecutiveIndex = (phone: string, n: number): number => {
  if (phone.length < n) return -1;
  for (let i = 0; i <= phone.length - n; i++) {
    let isMatch = true;
    for (let j = 0; j < n - 1; j++) {
      const current = parseInt(phone[i + j]);
      const next = parseInt(phone[i + j + 1]);
      if (next !== current + 1) { isMatch = false; break; }
    }
    if (isMatch) return i;
  }
  return -1;
};

export interface APInfo {
  formatted: string;
  count: number;
  startIndex: number;
  endIndex: number;
  lengths: number[];
  step: number;
}

export const checkArithmeticProgression = (phone: string): APInfo | null => {
  let bestAP: APInfo | null = null;
  for (let start = 0; start <= phone.length - 3; start++) {
    for (let len1 = 1; len1 <= 3; len1++) {
      if (start + len1 > phone.length) continue;
      const n1 = parseInt(phone.substring(start, start + len1));
      for (let len2 = 1; len2 <= 3; len2++) {
        if (start + len1 + len2 > phone.length) continue;
        const n2 = parseInt(phone.substring(start + len1, start + len1 + len2));
        const d = n2 - n1;
        if (d <= 0) continue;
        let currentSequence = [n1];
        let currentSequenceStr = [phone.substring(start, start + len1)];
        currentSequence.push(n2);
        currentSequenceStr.push(phone.substring(start + len1, start + len1 + len2));
        let currentPos = start + len1 + len2;
        let nextVal = n2 + d;
        while (currentPos < phone.length) {
          const nextValStr = nextVal.toString();
          if (phone.startsWith(nextValStr, currentPos)) {
            currentSequence.push(nextVal);
            currentSequenceStr.push(nextValStr);
            currentPos += nextValStr.length;
            nextVal += d;
          } else break;
        }
        if (currentSequence.length >= 3) {
          const totalLen = currentSequenceStr.join('').length;
          if (d === 1 && currentSequence.length < 5) continue;
          if (totalLen >= 3) {
            const info: APInfo = {
              formatted: currentSequenceStr.join('.'),
              count: currentSequence.length,
              startIndex: start,
              endIndex: currentPos,
              lengths: currentSequenceStr.map(s => s.length),
              step: d
            };
            if (!bestAP || info.count > bestAP.count || (info.count === bestAP.count && info.endIndex > bestAP.endIndex)) {
              bestAP = info;
            }
          }
        }
      }
    }
  }
  return bestAP;
};

export const isSequential = (str: string): boolean => {
  if (str.length < 3) return false;
  for (let i = 0; i < str.length - 1; i++) {
    if (parseInt(str[i + 1]) !== parseInt(str[i]) + 1) return false;
  }
  return true;
};

export const analyzeSim = (phone: string): { types: SimType[], detail?: string } => {
  if (!phone || phone.length < 10) return { types: [SimType.OTHER] };
  const types: SimType[] = [];
  let unitDetailArr: string[] = [];

  const abc1 = phone.substring(1, 4);
  const abc2 = phone.substring(4, 7);
  if (abc1 === abc2) { types.push(SimType.TAXI_DAU); unitDetailArr.push(`Taxi đầu (${abc1}.${abc2})`); }

  const last4Digits = phone.slice(-4);
  const d1 = last4Digits[0], d2 = last4Digits[1], d3 = last4Digits[2], d4 = last4Digits[3];
  if (d1 !== d2) {
    if (d1 === d3 && d2 === d4) { types.push(SimType.SIM_CAP_DAO); unitDetailArr.push("Dạng ABAB"); }
    else if (d1 === d4 && d2 === d3) { types.push(SimType.SIM_CAP_DAO); unitDetailArr.push("Dạng ABBA"); }
  }

  const prefix = phone.substring(0, 4);
  const pd2 = prefix[1], pd3 = prefix[2], pd4 = prefix[3];
  const pv2 = parseInt(pd2), pv3 = parseInt(pd3), pv4 = parseInt(pd4);
  let prefixMatch = false, prefixTypeLabel = "";
  if (pd2 === pd3 && pd3 === pd4) { prefixMatch = true; prefixTypeLabel = `Đầu Tam Hoa (${prefix})`; }
  else if (pv3 === pv2 + 1 && pv4 === pv3 + 1) { prefixMatch = true; prefixTypeLabel = `Đầu Tiến (${prefix})`; }
  else if (prefix[0] === pd3 && pd2 === pd4) { prefixMatch = true; prefixTypeLabel = `Đầu Cặp (${prefix})`; }
  else if ((prefix[0] === pd4 && pd2 === pd3) || (pd2 === pd4) || (prefix[0] === '0' && (pd2 === '3' || pd2 === '8') && pd2 === pd4)) { prefixMatch = true; prefixTypeLabel = `Đầu Gánh (${prefix})`; }
  else if ((pd3 === pd4 && pd2 !== pd3) || (prefix[0] === '0' && pd2 === '3' && pd3 === '3')) { prefixMatch = true; prefixTypeLabel = `Đầu Kép (${prefix})`; }
  if (prefixMatch) { types.push(SimType.DAU_SO_DEP); unitDetailArr.push(prefixTypeLabel); }

  for (let i = 0; i <= 5; i++) {
    if (phone[i] === phone[i+1] && phone[i] === phone[i+2] && phone[i] === phone[i+3]) { types.push(SimType.TU_QUY_GIUA); unitDetailArr.push(`Tứ quý giữa (${phone[i].repeat(4)})`); break; }
  }
  for (let i = 0; i <= 4; i++) {
    if (phone[i] === phone[i+1] && phone[i] === phone[i+2] && phone[i] === phone[i+3] && phone[i] === phone[i+4]) { types.push(SimType.NGU_QUY_GIUA); unitDetailArr.push(`Ngũ quý giữa (${phone[i].repeat(5)})`); break; }
  }
  if (phone[5] === phone[6] && phone[6] === phone[7] && phone[7] === phone[8] && phone[8] === phone[9]) { types.push(SimType.NGU_QUY_DUOI); unitDetailArr.push(`Ngũ quý đuôi (${phone[9].repeat(5)})`); }
  else if (phone[6] === phone[7] && phone[7] === phone[8] && phone[8] === phone[9]) { types.push(SimType.TU_QUY_DUOI); unitDetailArr.push(`Tứ quý đuôi (${phone[9].repeat(4)})`); }
  else if (phone[7] === phone[8] && phone[8] === phone[9]) { types.push(SimType.TAM_HOA_DUOI); unitDetailArr.push(`Tam hoa đuôi (${phone[9].repeat(3)})`); }

  const isCapDao = types.includes(SimType.SIM_CAP_DAO);
  const l6 = phone.slice(-6);
  const ld1 = l6[0], ld2 = l6[1], ld3 = l6[2], ld4 = l6[3], ld5 = l6[4], ld6 = l6[5];
  if (ld5 === ld6 && ld5 !== ld4) { types.push(SimType.KEP_DUOI_1_CAP); unitDetailArr.push(`Đuôi AA (${ld4}${ld5}${ld6})`); }
  if (!isCapDao && ld4 === ld5 && ld4 !== ld3 && ld4 !== ld6) types.push(SimType.KEP_AP_DUOI_1_CAP);
  if (!isCapDao && ld2 === ld3 && ld2 !== ld1 && ld2 !== ld4) types.push(SimType.KEP_GIUA_1_CAP);
  if (ld1 === ld2 && ld1 !== ld3) types.push(SimType.KEP_DAU_1_CAP);
  if (ld1 === ld3 && ld1 !== ld2) { types.push(SimType.ABA_CDE_GANH); unitDetailArr.push(`Gánh đầu (${ld1}${ld2}${ld3})`); }

  if (phone[3] === phone[4] && phone[5] === phone[6] && phone[3] !== phone[5]) { types.push(SimType.AABB_3_DUOI); unitDetailArr.push("AABB đuôi 3"); }
  if (phone[4] === phone[5] && phone[6] === phone[7] && phone[4] !== phone[6]) { types.push(SimType.AABB_2_DUOI); unitDetailArr.push("AABB đuôi 2"); }
  if (phone[3] === phone[5] && phone[4] === phone[6] && phone[3] !== phone[4]) { types.push(SimType.ABAB_3_DUOI); unitDetailArr.push("ABAB đuôi 3"); }
  if (phone[4] === phone[6] && phone[5] === phone[7] && phone[4] !== phone[5]) { types.push(SimType.ABAB_2_DUOI); unitDetailArr.push("ABAB đuôi 2"); }
  if (phone[5] === phone[7] && phone[6] === phone[8] && phone[5] !== phone[6]) { types.push(SimType.ABAB_1_DUOI); unitDetailArr.push("ABAB đuôi 1"); }

  const s_d1 = phone[4], s_d2 = phone[5], s_d3 = phone[6], s_d4 = phone[7], s_d5 = phone[8], s_d6 = phone[9];
  if (s_d2 === s_d3 && s_d4 === s_d5) { types.push(SimType.AABB_X); unitDetailArr.push(`Dạng AABB.x ${s_d1 === s_d6 ? "(x trùng)" : "(x khác)"}`); }
  if (s_d1 === s_d2 && s_d4 === s_d5) { types.push(SimType.AAB_CCD); unitDetailArr.push("Dạng AAB.CCD"); }
  if (s_d1 === s_d2 && s_d5 === s_d6) { types.push(SimType.AAB_CDD); unitDetailArr.push("Dạng AAB.CDD"); }
  if (s_d1 === s_d3 && s_d4 === s_d5) { types.push(SimType.ABA_CCD); unitDetailArr.push("Dạng ABA.CCD"); }
  if (s_d1 === s_d3 && s_d5 === s_d6) { types.push(SimType.ABA_CDD); unitDetailArr.push("Dạng ABA.CDD"); }
  if (s_d2 === s_d3 && s_d5 === s_d6) { types.push(SimType.ABB_CDD); unitDetailArr.push("Dạng ABB.CDD"); }

  const sd1 = phone[6], sd2 = phone[7], sd3 = phone[8], sd4 = phone[9];
  const sv1 = parseInt(sd1), sv2 = parseInt(sd2), sv3 = parseInt(sd3), sv4 = parseInt(sd4);
  if (sd1 === sd3 && sd2 !== sd4 && sd1 !== sd2) {
    if (sv4 > sv2 && sv4 !== sv2 + 1) { types.push(SimType.AB_AD_DONG_CHUC_TIEN); unitDetailArr.push("AB.AD (Đồng Chục - Tiến)"); }
    else if (sv4 < sv2) { types.push(SimType.AB_AD_DONG_CHUC); unitDetailArr.push("AB.AD (Đồng Chục)"); }
  }
  if (sd2 === sd4 && sd1 !== sd3 && sd1 !== sd2) {
    if (sv1 < sv3 && sv3 !== sv1 + 1) { types.push(SimType.AB_CB_DONG_DON_VI_TIEN); unitDetailArr.push("AB.CB (Đồng Đơn Vị - Tiến)"); }
    else if (sv1 > sv3) { types.push(SimType.AB_CB_DONG_DON_VI); unitDetailArr.push("AB.CB (Đồng Đơn Vị)"); }
  }

  const cp1 = phone[4] + phone[5], cp2 = phone[6] + phone[7], cp3 = phone[8] + phone[9];
  if (cp1 === cp3 && cp1 !== cp2) { types.push(SimType.AB_CD_AB_GANH_CAP); unitDetailArr.push("Dạng AB.CD.AB"); }

  const c1 = phone[4], u1 = phone[5], c2 = phone[6], u2 = phone[7], c3 = phone[8], u3 = phone[9];
  if (c1 === c2 && c2 === c3 && u1 !== u2 && u2 !== u3 && u1 !== u3) {
    const pr1 = parseInt(u1), pr2 = parseInt(u2), pr3 = parseInt(u3);
    types.push(pr1 < pr2 && pr2 < pr3 ? SimType.AB_AC_AD_TIEN : SimType.AB_AC_AD_FREE);
    unitDetailArr.push(`Đầu ${c1}`);
  }
  if (u1 === u2 && u2 === u3 && c1 !== c2 && c2 !== c3 && c1 !== c3) {
    const pr1 = parseInt(c1), pr2 = parseInt(c2), pr3 = parseInt(c3);
    types.push(pr1 < pr2 && pr2 < pr3 ? SimType.AB_CB_DB_TIEN : SimType.AB_CB_DB_FREE);
    unitDetailArr.push(`Đuôi ${u1}`);
  }

  const lastSixVal = phone.slice(-6);
  const sa = parseInt(lastSixVal[0]), sb = parseInt(lastSixVal[1]), sc = parseInt(lastSixVal[2]);
  const sx = parseInt(lastSixVal[3]), sy = parseInt(lastSixVal[4]), sz = parseInt(lastSixVal[5]);
  if (sx > sa && sb === sy && sc === sz) { const diff = sx - sa; types.push(diff === 1 ? SimType.TIEN_1_10_100 : SimType.TIEN_DON_VI); unitDetailArr.push(`Tiến ${diff} nút (Trăm)`); }
  else if (sy > sb && sa === sx && sc === sz) { const diff = sy - sb; types.push(diff === 1 ? SimType.TIEN_1_10_100 : SimType.TIEN_DON_VI); unitDetailArr.push(`Tiến ${diff} nút (Chục)`); }
  else if (sz > sc && sa === sx && sb === sy) { const diff = sz - sc; types.push(diff === 1 ? SimType.TIEN_1_10_100 : SimType.TIEN_DON_VI); unitDetailArr.push(`Tiến ${diff} nút (Đơn vị)`); }
  if (sa > sx && sb === sy && sc === sz) { types.push(SimType.LUI_DON_VI); unitDetailArr.push(`Lùi ${sa - sx} nút (Trăm)`); }
  else if (sb > sy && sa === sx && sc === sz) { types.push(SimType.LUI_DON_VI); unitDetailArr.push(`Lùi ${sb - sy} nút (Chục)`); }
  else if (sc > sz && sa === sx && sb === sy) { types.push(SimType.LUI_DON_VI); unitDetailArr.push(`Lùi ${sc - sz} nút (Đơn vị)`); }

  if (findConsecutiveIndex(phone, 7) !== -1) types.push(SimType.TIEN_7_LIEN_TIEP);
  else if (findConsecutiveIndex(phone, 6) !== -1) types.push(SimType.TIEN_6_LIEN_TIEP);
  else if (findConsecutiveIndex(phone, 5) !== -1) types.push(SimType.TIEN_5_LIEN_TIEP);
  else if (findConsecutiveIndex(phone, 4) !== -1) types.push(SimType.TIEN_4_LIEN_TIEP);
  else {
    const last3 = phone.slice(-3);
    const m1 = parseInt(last3[0]), m2 = parseInt(last3[1]), m3 = parseInt(last3[2]);
    if (m2 === m1 + 1 && m3 === m2 + 1) types.push(SimType.TIEN_3_LIEN_TIEP);
  }

  const apResult = checkArithmeticProgression(phone);
  if (apResult) {
    types.push(SimType.TANG_DAN_DEU);
    const isCuoi = apResult.endIndex === phone.length;
    const allTwoDigits = apResult.lengths.every(l => l === 2);
    if (apResult.count === 3 && isCuoi && allTwoDigits && apResult.step >= 1 && apResult.step <= 4) types.push(SimType.TANG_DAN_DEU_3_CUOI);
    else if (apResult.count === 4 && isCuoi) types.push(SimType.TANG_DAN_DEU_4_CUOI);
    else if (apResult.count >= 5) types.push(SimType.TANG_DAN_DEU_5_6_CAP);
  }

  let hasDoubleSequential = false;
  for (let i = 0; i <= phone.length - 6 && !hasDoubleSequential; i++) {
    for (const len1 of [3, 4]) {
      if (i + len1 > phone.length - 3) continue;
      const seq1 = phone.substring(i, i + len1);
      if (isSequential(seq1)) {
        for (const len2 of [3, 4]) {
          if (i + len1 + len2 > phone.length) continue;
          const seq2 = phone.substring(i + len1, i + len1 + len2);
          if (isSequential(seq2)) {
            hasDoubleSequential = true;
            unitDetailArr.push(`2 dãy tiến đều (${seq1}.${seq2})`);
            break;
          }
        }
      }
      if (hasDoubleSequential) break;
    }
  }
  if (hasDoubleSequential) types.push(SimType.TIEN_DEU_2_DAY);

  const lastFour = phone.slice(-4);
  const n1 = parseInt(lastFour[0]), n2 = parseInt(lastFour[1]), n3 = parseInt(lastFour[2]), n4 = parseInt(lastFour[3]);
  if (n1 < n2 && n2 < n3 && n3 < n4 && !(n2 === n1+1 && n3 === n2+1 && n4 === n3+1)) types.push(SimType.TIEN_4_KHONG_DEU);
  if (lastFour[0] === lastFour[2] && n4 === n2 + 1) types.push(SimType.TIEN_2_DOI_ABAC);
  if (lastFour[1] === lastFour[3] && n3 === n1 + 1) types.push(SimType.TIEN_2_DOI_ABCB);

  const isGanh6XYZ_full = lastSixVal[3] === lastSixVal[5];
  const isGanh6ABC = lastSixVal[0] === lastSixVal[2];
  const hasPair6ABC = lastSixVal[0] === lastSixVal[1] || lastSixVal[1] === lastSixVal[2];
  if (isGanh6XYZ_full) {
    if (isGanh6ABC) types.push(SimType.GANH_DOI);
    else if (hasPair6ABC) types.push(SimType.GANH_DEP);
    else types.push(SimType.GANH_THUONG);
  }

  if (phone.startsWith('09') && !types.some(t => t !== SimType.DAU_SO_DEP)) {
    const last6 = phone.slice(-6);
    const digitCounts: Record<string, number> = {};
    for (const char of last6) digitCounts[char] = (digitCounts[char] || 0) + 1;
    const duplicateDigits = Object.values(digitCounts).filter(count => count >= 2).length;
    if (duplicateDigits === 1) types.push(SimType.TRUNG_1_CHU_SO_09);
    else if (duplicateDigits >= 2) types.push(SimType.TRUNG_2_CHU_SO_09);
  }

  const uniqueDetails = Array.from(new Set(unitDetailArr));
  if (types.length === 0) { types.push(SimType.OTHER); if (uniqueDetails.length === 0) uniqueDetails.push("Khác"); }
  return { types, detail: uniqueDetails.join(', ') };
};

export const getMenhAndColor = (phone: string): { menh: string; color: string } => {
  if (!phone) return { menh: '', color: '' };
  let sum = 0;
  for (let i = 0; i < phone.length; i++) {
    const digit = parseInt(phone[i]);
    if (!isNaN(digit)) sum += digit;
  }
  let quaiSo = sum % 9;
  if (quaiSo === 0 && sum > 0) quaiSo = 9;
  switch (quaiSo) {
    case 1: return { menh: 'Thủy', color: '#2563eb' };
    case 2: case 5: case 8: return { menh: 'Thổ', color: '#78350f' };
    case 3: case 4: return { menh: 'Mộc', color: '#16a34a' };
    case 6: case 7: return { menh: 'Kim', color: '#ca8a04' };
    case 9: return { menh: 'Hỏa', color: '#dc2626' };
    default: return { menh: '', color: '' };
  }
};

export const formatPhoneDisplay = (phone: string): string => {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0,4)}.${phone.slice(4,7)}.${phone.slice(7,10)}`;
};
