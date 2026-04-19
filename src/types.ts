export enum SimType {
  ALL = 'Tất cả',
  GANH_DOI = 'Gánh Đôi',
  GANH_DEP = 'Gánh Đẹp',
  GANH_THUONG = 'Gánh Thường',
  TIEN_4_KHONG_DEU = 'Tiến 4 (Không đều)',
  TIEN_2_DOI_ABAC = 'Tiến 2 đôi (ABAC)',
  TIEN_2_DOI_ABCB = 'Tiến 2 đôi (ABCB)',
  TIEN_3_LIEN_TIEP = 'Tiến 3 số (Sảnh)',
  TIEN_4_LIEN_TIEP = 'Tiến 4 số (Sảnh)',
  TIEN_5_LIEN_TIEP = 'Tiến 5 số (Sảnh)',
  TIEN_6_LIEN_TIEP = 'Tiến 6 số (Sảnh)',
  TIEN_7_LIEN_TIEP = 'Tiến 7 số (Rồng)',
  TIEN_1_10_100 = 'Tiến 1, 10, 100',
  TIEN_DON_VI = 'Tiến Đơn Vị (2-9)',
  LUI_DON_VI = 'Lùi Đơn Vị (1-9)',
  SIM_CAP_DAO = 'Số Cặp/Số Đảo (ABAB/ABBA)',
  AB_AC_AD_FREE = 'AB.AC.AD (Tự do)',
  AB_AC_AD_TIEN = 'AB.AC.AD (Tiến đơn)',
  AB_CB_DB_FREE = 'AB.CB.DB (Tự do)',
  AB_CB_DB_TIEN = 'AB.CB.DB (Tiến chục)',
  AB_AD_DONG_CHUC_TIEN = 'AB.AD (Đồng Chục - Tiến)',
  AB_AD_DONG_CHUC = 'AB.AD (Đồng Chục)',
  AB_CB_DONG_DON_VI_TIEN = 'AB.CB (Đồng Đơn Vị - Tiến)',
  AB_CB_DONG_DON_VI = 'AB.CB (Đồng Đơn Vị)',
  AB_CD_AB_GANH_CAP = 'AB.CD.AB (Gánh Cặp)',
  DAU_SO_DEP = 'Đầu Số Đẹp',
  ABB_CDD = 'ABB.CDD',
  AAB_CCD = 'AAB.CCD',
  AAB_CDD = 'AAB.CDD',
  ABA_CCD = 'ABA.CCD',
  ABA_CDD = 'ABA.CDD',
  TAXI_DAU = 'Taxi Đầu (ABC.ABC)',
  TANG_DAN_DEU = 'Tăng dần đều',
  TANG_DAN_DEU_3_CUOI = 'Tăng dần đều (3 cặp cuối)',
  TANG_DAN_DEU_4_CUOI = 'Tăng dần đều (4 cặp cuối)',
  TANG_DAN_DEU_5_6_CAP = 'Tăng dần đều 5/6 cặp',
  TIEN_DEU_2_DAY = '2 dãy số Tiến đều',
  TU_QUY_GIUA = 'Tứ Quý (Đầu/Giữa)',
  NGU_QUY_GIUA = 'Ngũ Quý (Đầu/Giữa)',
  TAM_HOA_DUOI = 'Tam Hoa Đuôi',
  TU_QUY_DUOI = 'Tứ Quý Đuôi',
  NGU_QUY_DUOI = 'Ngũ Quý Đuôi',
  AABB_3_DUOI = 'AABB.CxD',
  AABB_2_DUOI = 'AABB.Cx',
  ABAB_3_DUOI = 'ABAB.xxx',
  ABAB_2_DUOI = 'ABAB.xx',
  ABAB_1_DUOI = 'ABAB.x',
  AABB_X = 'AABB.x',
  KEP_DUOI_1_CAP = 'BCD.EAA',
  KEP_AP_DUOI_1_CAP = 'BCD.AAx',
  KEP_GIUA_1_CAP = 'xAA.BCD',
  KEP_DAU_1_CAP = 'AAB.CDE',
  ABA_CDE_GANH = 'ABA.CDE',
  TRUNG_1_CHU_SO_09 = '09 Trùng 1 chữ số',
  TRUNG_2_CHU_SO_09 = '09 Trùng 2 chữ số',
  OTHER = 'Khác'
}

export interface SimEntry {
  id: number;
  originalPhone: string;
  normalizedPhone: string;
  lastSix: string;
  simTypes: SimType[];
  unitAdvanceDetail?: string;
  price?: string;
  menh?: string;
  menhColor?: string;
  status?: 'available' | 'sold' | 'reserved';
  network?: '03' | '09' | '08';
  primaryType?: string;
  note?: string;
  batch?: string;
  [key: string]: any;
}

export interface PriceConfig {
  id: number;
  sim_type: string;
  price_03: number;
  price_09: number;
  note?: string;
  updated_at: string;
}

export interface ProcessingResult {
  data: SimEntry[];
  headers: string[];
}

export type UserRole = 'admin' | 'staff';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  sim_number: string;
  sim_price: string;
  customer_name: string;
  cccd: string;
  contact_phone: string;
  address: string;
  note: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

export interface ViettelPackage {
  id: string;
  name: string;
  price: string;
  data: string;
  calls: string;
  sms?: string;
  duration: string;
  highlight?: boolean;
  type: 'sim' | 'internet';
}
