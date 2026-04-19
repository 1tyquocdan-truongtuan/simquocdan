-- =============================================
-- BẢNG price_config: Bảng giá theo loại SIM
-- Admin có thể sửa giá từng loại, tự động áp dụng
-- =============================================
CREATE TABLE IF NOT EXISTS price_config (
  id          SERIAL PRIMARY KEY,
  sim_type    TEXT NOT NULL UNIQUE,   -- Tên loại SIM (trùng với SimType enum)
  price_03    INTEGER NOT NULL DEFAULT 0,  -- Giá mạng 03x (đơn vị: VNĐ)
  price_09    INTEGER NOT NULL DEFAULT 0,  -- Giá mạng 09x/08x
  note        TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng giá mặc định theo tiêu chí của shop
INSERT INTO price_config (sim_type, price_03, price_09, note) VALUES
  ('Tiến 7 số (Rồng)',              950000,  1900000, 'VIP cao nhất'),
  ('Tiến 6 số (Sảnh)',              620000,  1200000, null),
  ('Tiến 5 số (Sảnh)',              420000,   820000, null),
  ('Tiến 4 số (Sảnh)',              320000,   520000, null),
  ('Tiến 3 số (Sảnh)',              220000,   320000, null),
  ('Ngũ Quý Đuôi',                 500000,  1000000, 'VIP'),
  ('Ngũ Quý (Đầu/Giữa)',           500000,  1000000, 'VIP'),
  ('Tứ Quý Đuôi',                  220000,   370000, null),
  ('Tứ Quý (Đầu/Giữa)',            220000,   370000, null),
  ('Tam Hoa Đuôi',                 170000,   270000, null),
  ('Taxi Đầu (ABC.ABC)',            420000,   620000, null),
  ('2 dãy số Tiến đều',            320000,   520000, null),
  ('Tăng dần đều 5/6 cặp',         420000,   620000, null),
  ('Tăng dần đều (4 cặp cuối)',     370000,   570000, null),
  ('Tăng dần đều (3 cặp cuối)',     320000,   520000, null),
  ('Tăng dần đều',                 270000,   420000, null),
  ('AB.AC.AD (Tiến đơn)',           420000,   620000, null),
  ('AB.AC.AD (Tự do)',              270000,   420000, null),
  ('AB.CB.DB (Tiến chục)',          420000,   620000, null),
  ('AB.CB.DB (Tự do)',              270000,   420000, null),
  ('AB.AD (Đồng Chục - Tiến)',      320000,   520000, null),
  ('AB.AD (Đồng Chục)',            220000,   370000, null),
  ('AB.CB (Đồng Đơn Vị - Tiến)',   320000,   520000, null),
  ('AB.CB (Đồng Đơn Vị)',          220000,   370000, null),
  ('AB.CD.AB (Gánh Cặp)',          270000,   420000, null),
  ('Số Cặp/Số Đảo (ABAB/ABBA)',    320000,   520000, null),
  ('Tiến 2 đôi (ABAC)',            320000,   520000, null),
  ('Tiến 2 đôi (ABCB)',            270000,   420000, null),
  ('Tiến 4 (Không đều)',           220000,   370000, null),
  ('Tiến 1, 10, 100',              320000,   520000, null),
  ('Tiến Đơn Vị (2-9)',            270000,   420000, null),
  ('Lùi Đơn Vị (1-9)',             220000,   320000, null),
  ('Gánh Đôi',                     220000,   420000, null),
  ('Gánh Đẹp',                     220000,   520000, null),
  ('Gánh Thường',                  170000,   270000, null),
  ('ABAB.xxx',                     220000,   370000, null),
  ('ABAB.xx',                      170000,   270000, null),
  ('ABAB.x',                       170000,   270000, null),
  ('AABB.CxD',                     220000,   370000, null),
  ('AABB.Cx',                      170000,   270000, null),
  ('AABB.x',                       170000,   270000, null),
  ('ABB.CDD',                      170000,   270000, null),
  ('AAB.CCD',                      170000,   270000, null),
  ('AAB.CDD',                      170000,   270000, null),
  ('ABA.CCD',                      170000,   270000, null),
  ('ABA.CDD',                      170000,   270000, null),
  ('BCD.EAA',                      170000,   270000, null),
  ('BCD.AAx',                      150000,   220000, null),
  ('xAA.BCD',                      150000,   220000, null),
  ('AAB.CDE',                      150000,   220000, null),
  ('ABA.CDE',                      150000,   220000, null),
  ('Đầu Số Đẹp',                   150000,   220000, null),
  ('09 Trùng 1 chữ số',            130000,   200000, null),
  ('09 Trùng 2 chữ số',            150000,   220000, null),
  ('Khác',                         100000,   150000, null)
ON CONFLICT (sim_type) DO NOTHING;

-- =============================================
-- BẢNG sims: Kho SIM chính
-- =============================================
CREATE TABLE IF NOT EXISTS sims (
  id                  BIGSERIAL PRIMARY KEY,
  phone               TEXT NOT NULL UNIQUE,        -- Số đã chuẩn hóa (0326225574)
  original_phone      TEXT,                        -- Số gốc từ Excel
  network             TEXT NOT NULL DEFAULT '03'   -- '03' | '09' | '08'
                        CHECK (network IN ('03','09','08')),
  price               INTEGER NOT NULL DEFAULT 0,  -- Giá (VNĐ), auto từ price_config, admin sửa được
  status              TEXT NOT NULL DEFAULT 'available'
                        CHECK (status IN ('available','reserved','sold')),
  sim_types           TEXT[] NOT NULL DEFAULT '{}',  -- Mảng loại SIM
  primary_type        TEXT,                          -- Loại ưu tiên (loại VIP nhất)
  menh                TEXT,                          -- Kim/Mộc/Thủy/Hỏa/Thổ
  menh_color          TEXT,
  unit_advance_detail TEXT,                          -- Chi tiết phân tích
  reserved_until      TIMESTAMPTZ,                   -- Giữ số đến khi nào
  note                TEXT,                          -- Admin ghi chú
  batch               TEXT,                          -- Lô nhập (để quản lý)
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index để filter nhanh
CREATE INDEX IF NOT EXISTS idx_sims_status      ON sims(status);
CREATE INDEX IF NOT EXISTS idx_sims_network     ON sims(network);
CREATE INDEX IF NOT EXISTS idx_sims_menh        ON sims(menh);
CREATE INDEX IF NOT EXISTS idx_sims_price       ON sims(price);
CREATE INDEX IF NOT EXISTS idx_sims_sim_types   ON sims USING GIN(sim_types);
CREATE INDEX IF NOT EXISTS idx_sims_primary_type ON sims(primary_type);

-- Trigger tự cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sims_updated_at
  BEFORE UPDATE ON sims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- RLS (Row Level Security)
-- Public chỉ đọc SIM available
-- Admin full CRUD
-- =============================================
ALTER TABLE sims ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_config ENABLE ROW LEVEL SECURITY;

-- Public: chỉ xem SIM available
CREATE POLICY "public_read_available_sims"
  ON sims FOR SELECT
  USING (status = 'available');

-- Admin: full quyền (dùng service_role key)
CREATE POLICY "admin_all_sims"
  ON sims FOR ALL
  USING (auth.role() = 'service_role');

-- Public: đọc bảng giá
CREATE POLICY "public_read_price_config"
  ON price_config FOR SELECT
  USING (true);

-- Admin: sửa bảng giá
CREATE POLICY "admin_all_price_config"
  ON price_config FOR ALL
  USING (auth.role() = 'service_role');
