import { supabase } from '../lib/supabase';
import type { SimEntry, PriceConfig } from '../types';
import { SimType } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Xác định mạng (03/09/08) từ đầu số */
export function detectNetwork(phone: string): '03' | '09' | '08' {
  const prefix = phone.substring(0, 3);
  if (['086','096','097','098','039','038','037','036','035','034','033','032'].includes(prefix)) return '09';
  if (['089'].includes(prefix)) return '08';
  return '03';
}

/** Tìm loại SIM ưu tiên nhất (để định giá) */
const TYPE_PRIORITY: SimType[] = [
  SimType.TIEN_7_LIEN_TIEP, SimType.NGU_QUY_DUOI, SimType.NGU_QUY_GIUA,
  SimType.TIEN_6_LIEN_TIEP, SimType.TIEN_5_LIEN_TIEP,
  SimType.TAXI_DAU, SimType.TANG_DAN_DEU_5_6_CAP, SimType.AB_AC_AD_TIEN, SimType.AB_CB_DB_TIEN,
  SimType.TIEN_4_LIEN_TIEP, SimType.TANG_DAN_DEU_4_CUOI, SimType.TU_QUY_DUOI, SimType.TU_QUY_GIUA,
  SimType.SIM_CAP_DAO, SimType.TIEN_2_DOI_ABAC, SimType.AB_AD_DONG_CHUC_TIEN, SimType.AB_CB_DONG_DON_VI_TIEN,
  SimType.TIEN_DEU_2_DAY, SimType.TANG_DAN_DEU_3_CUOI, SimType.AB_CD_AB_GANH_CAP,
  SimType.TIEN_1_10_100, SimType.TIEN_2_DOI_ABCB, SimType.TIEN_4_KHONG_DEU,
  SimType.AB_AC_AD_FREE, SimType.AB_CB_DB_FREE, SimType.TIEN_DON_VI,
  SimType.GANH_DEP, SimType.GANH_DOI, SimType.TAM_HOA_DUOI,
  SimType.AB_AD_DONG_CHUC, SimType.AB_CB_DONG_DON_VI, SimType.TANG_DAN_DEU,
  SimType.LUI_DON_VI, SimType.GANH_THUONG, SimType.TIEN_3_LIEN_TIEP,
  SimType.ABAB_3_DUOI, SimType.AABB_3_DUOI, SimType.ABAB_2_DUOI, SimType.AABB_2_DUOI, SimType.ABAB_1_DUOI,
  SimType.AABB_X, SimType.ABB_CDD, SimType.AAB_CCD, SimType.AAB_CDD, SimType.ABA_CCD, SimType.ABA_CDD,
  SimType.KEP_DUOI_1_CAP, SimType.ABA_CDE_GANH, SimType.KEP_AP_DUOI_1_CAP,
  SimType.KEP_GIUA_1_CAP, SimType.KEP_DAU_1_CAP,
  SimType.DAU_SO_DEP, SimType.TRUNG_2_CHU_SO_09, SimType.TRUNG_1_CHU_SO_09,
  SimType.OTHER,
];

export function getPrimaryType(types: SimType[]): SimType {
  for (const t of TYPE_PRIORITY) {
    if (types.includes(t)) return t;
  }
  return SimType.OTHER;
}

// ─── Price Config ─────────────────────────────────────────────────────────────

export async function fetchPriceConfig(): Promise<PriceConfig[]> {
  const { data, error } = await supabase.from('price_config').select('*').order('id');
  if (error) throw error;
  return data || [];
}

export async function updatePriceConfig(id: number, price_03: number, price_09: number): Promise<void> {
  const { error } = await supabase.from('price_config').update({ price_03, price_09 }).eq('id', id);
  if (error) throw error;
}

/** Lấy giá từ bảng config theo loại và mạng */
export function lookupPrice(primaryType: string, network: string, config: PriceConfig[]): number {
  const row = config.find(c => c.sim_type === primaryType);
  if (!row) return 0;
  return network === '09' || network === '08' ? row.price_09 : row.price_03;
}

// ─── SIM CRUD ─────────────────────────────────────────────────────────────────

/** Lấy danh sách SIM available để hiển thị web */
export async function fetchAvailableSims(filters?: {
  menh?: string;
  primaryType?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: SimEntry[]; count: number }> {
  let query = supabase
    .from('sims')
    .select('*', { count: 'exact' })
    .eq('status', 'available')
    .order('price', { ascending: true });

  if (filters?.menh) query = query.eq('menh', filters.menh);
  if (filters?.primaryType) query = query.eq('primary_type', filters.primaryType);
  if (filters?.minPrice) query = query.gte('price', filters.minPrice);
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice);
  if (filters?.search) query = query.ilike('phone', `%${filters.search}%`);
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []).map(dbRowToSimEntry), count: count || 0 };
}

/** Admin: lấy toàn bộ SIM (kể cả sold/reserved) */
export async function fetchAllSimsAdmin(): Promise<SimEntry[]> {
  const { data, error } = await supabase
    .from('sims')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(dbRowToSimEntry);
}

/** Admin: import hàng loạt SIM vào DB */
export async function upsertSims(entries: {
  phone: string;
  original_phone: string;
  network: string;
  price: number;
  sim_types: string[];
  primary_type: string;
  menh: string;
  menh_color: string;
  unit_advance_detail: string;
  batch?: string;
}[]): Promise<{ inserted: number; skipped: number }> {
  const { data, error } = await supabase
    .from('sims')
    .upsert(entries, { onConflict: 'phone', ignoreDuplicates: false })
    .select('id');
  if (error) throw error;
  return { inserted: data?.length || 0, skipped: entries.length - (data?.length || 0) };
}

/** Admin: cập nhật giá 1 SIM */
export async function updateSimPrice(id: number, price: number): Promise<void> {
  const { error } = await supabase.from('sims').update({ price }).eq('id', id);
  if (error) throw error;
}

/** Admin: cập nhật trạng thái SIM */
export async function updateSimStatus(id: number, status: 'available' | 'sold' | 'reserved'): Promise<void> {
  const { error } = await supabase.from('sims').update({ status }).eq('id', id);
  if (error) throw error;
}

/** Admin: xóa SIM */
export async function deleteSim(id: number): Promise<void> {
  const { error } = await supabase.from('sims').delete().eq('id', id);
  if (error) throw error;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function dbRowToSimEntry(row: any): SimEntry {
  return {
    id: row.id,
    originalPhone: row.original_phone || row.phone,
    normalizedPhone: row.phone,
    lastSix: row.phone.slice(-6),
    simTypes: row.sim_types || [],
    unitAdvanceDetail: row.unit_advance_detail,
    price: row.price ? formatPrice(row.price) : 'Liên hệ',
    menh: row.menh,
    menhColor: row.menh_color,
    status: row.status,
    network: row.network,
    primaryType: row.primary_type,
    note: row.note,
    batch: row.batch,
  };
}

function formatPrice(price: number): string {
  if (price >= 1000000) return (price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1) + ' triệu';
  return (price / 1000).toFixed(0) + 'K';
}
