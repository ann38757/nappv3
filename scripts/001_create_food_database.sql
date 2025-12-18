-- Create food_database table
CREATE TABLE IF NOT EXISTS public.food_database (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  protein NUMERIC(10, 2) NOT NULL,
  carbs NUMERIC(10, 2) NOT NULL,
  fat NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read food database (public data)
CREATE POLICY "food_database_select_public"
  ON public.food_database FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert food database items
CREATE POLICY "food_database_insert_public"
  ON public.food_database FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to update food database items
CREATE POLICY "food_database_update_public"
  ON public.food_database FOR UPDATE
  USING (true);

-- Create policy to allow anyone to delete food database items
CREATE POLICY "food_database_delete_public"
  ON public.food_database FOR DELETE
  USING (true);

-- Insert default food items
INSERT INTO public.food_database (id, name, protein, carbs, fat) VALUES
  ('1', '白米（生）（每100g）', 6.4, 77.6, 0.2),
  ('2', '蒸煮麵（每份）', 5.7, 51.7, 0.8),
  ('3', '玉米罐頭（每罐）', 8, 60, 4),
  ('4', '生雞胸肉（每100g）', 22.4, 0, 0.9),
  ('5', '水煮蛋（每顆）', 6, 0, 5),
  ('6', '魚罐頭（每罐）', 30, 0, 10),
  ('7', '蝦子（每隻）', 1.9, 0, 0),
  ('8', '滷大黑豆干（每個）', 16.5, 8.8, 15.08),
  ('9', '滷小方豆干（每個）', 5.25, 2.8, 3.9),
  ('10', '蘭花干（每個）', 13, 0, 16),
  ('11', '鳥蛋（每顆 9g）', 1.1, 0.1, 1.2),
  ('13', '堅果(每1g)', 0.179, 0.22, 0.55),
  ('14', '豬後腿肉(每100g)', 20.4, 0.4, 4),
  ('15', '乳清蛋白(每1g)', 0.72, 0.15, 0.07),
  ('16', '燕麥(每1g)', 0.11, 0.61, 0.09),
  ('17', '自助餐(每100g)', 0, 0, 9),
  ('18', '去皮生雞腿肉(每100g)', 19, 0, 8.5),
  ('19', '調味料(純碳水)', 0, 10, 0),
  ('20', '毛豆仁(每10g)', 1.2, 1, 0.6),
  ('21', '鯛魚肉(每100g)', 18, 1.3, 3.6),
  ('22', '碳水自由度(每1g)', 0, 1, 0),
  ('23', '蛋白質自由度(每1g)', 1, 0, 0),
  ('24', '脂肪自由度(每1g)', 0, 0, 1),
  ('25', '兩隻滷雞腿便當(1個)', 46, 61, 30),
  ('26', '南瓜(每100g)', 1.4, 52.6, 0),
  ('27', '秋葵(每100g)', 1.7, 6.3, 0.3),
  ('28', '花椰菜(每100g)', 2.5, 4.4, 0.2),
  ('29', '菠菜(每100g)', 2.1, 2.9, 0),
  ('30', '鱸魚片(每100g)', 19.2, 0, 4.8)
ON CONFLICT (id) DO NOTHING;
