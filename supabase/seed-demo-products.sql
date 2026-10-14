-- supabase/seed-demo-products.sql
-- OPTIONAL. Copies the 13 sample products from js/data.js into the products table,
-- so you can edit, hide or delete them in the admin panel.
-- Run it once, AFTER setup-products.sql. Products with the same name are skipped.
--
-- Why: as soon as the products table has any row, the website shows ONLY the table (not js/data.js).
-- Run this first if you want to keep the sample products.

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Essential Tee', 990, 40, array['t-shirts','essentials']::text[], array['Black','Purple','Off-white']::text[], '{"Black":"#18140F","Purple":"#6A1B9A","Off-white":"#F3EEE4"}'::jsonb, array['S','M','L','XL','XXL']::text[], 1, true
where not exists (select 1 from public.products where name = 'Essential Tee');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Boxy Graphic', 1150, 22, array['t-shirts','oversized','graphic']::text[], array['Black','Brown']::text[], '{"Black":"#18140F","Brown":"#7C6A55"}'::jsonb, array['M','L','XL']::text[], 2, true
where not exists (select 1 from public.products where name = 'Boxy Graphic');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'After Dark Tee', 1290, 18, array['t-shirts','oversized','graphic','new-arrivals']::text[], array['Black','Purple']::text[], '{"Black":"#18140F","Purple":"#6A1B9A"}'::jsonb, array['S','M','L','XL']::text[], 3, true
where not exists (select 1 from public.products where name = 'After Dark Tee');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Layer Tee', 1050, 30, array['t-shirts','essentials']::text[], array['Charcoal','Off-white']::text[], '{"Charcoal":"#3A352D","Off-white":"#F3EEE4"}'::jsonb, array['S','M','L','XL','XXL']::text[], 4, true
where not exists (select 1 from public.products where name = 'Layer Tee');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Oversized Fit Tee', 1190, 25, array['t-shirts','oversized','new-arrivals']::text[], array['Black']::text[], '{"Black":"#18140F"}'::jsonb, array['M','L','XL','XXL']::text[], 5, true
where not exists (select 1 from public.products where name = 'Oversized Fit Tee');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Statement Graphic', 1250, 14, array['t-shirts','graphic']::text[], array['Purple','Black']::text[], '{"Purple":"#6A1B9A","Black":"#18140F"}'::jsonb, array['S','M','L']::text[], 1, true
where not exists (select 1 from public.products where name = 'Statement Graphic');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Studio Tee', 950, 35, array['t-shirts','essentials','new-arrivals']::text[], array['Off-white','Brown']::text[], '{"Off-white":"#F3EEE4","Brown":"#7C6A55"}'::jsonb, array['S','M','L','XL']::text[], 2, true
where not exists (select 1 from public.products where name = 'Studio Tee');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Limited Drop 01', 1390, 6, array['t-shirts','graphic','limited-drop']::text[], array['Black']::text[], '{"Black":"#18140F"}'::jsonb, array['M','L','XL']::text[], 3, true
where not exists (select 1 from public.products where name = 'Limited Drop 01');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Daylight Oversized', 1230, 20, array['t-shirts','oversized']::text[], array['Off-white','Charcoal']::text[], '{"Off-white":"#F3EEE4","Charcoal":"#3A352D"}'::jsonb, array['M','L','XL','XXL']::text[], 4, true
where not exists (select 1 from public.products where name = 'Daylight Oversized');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Plain Black Tee', 890, 60, array['t-shirts','essentials']::text[], array['Black']::text[], '{"Black":"#18140F"}'::jsonb, array['S','M','L','XL','XXL']::text[], 5, true
where not exists (select 1 from public.products where name = 'Plain Black Tee');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Drop 01 Back Print', 1450, 0, array['t-shirts','graphic','limited-drop']::text[], array['Black','Purple']::text[], '{"Black":"#18140F","Purple":"#6A1B9A"}'::jsonb, array['M','L']::text[], 1, true
where not exists (select 1 from public.products where name = 'Drop 01 Back Print');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Slow Burn Tee', 1190, 16, array['t-shirts','graphic','new-arrivals']::text[], array['Purple','Charcoal']::text[], '{"Purple":"#6A1B9A","Charcoal":"#3A352D"}'::jsonb, array['S','M','L','XL']::text[], 2, true
where not exists (select 1 from public.products where name = 'Slow Burn Tee');

insert into public.products (name, price, stock, tags, colors, color_hex, sizes, tex, active)
select 'Midnight Run Tee', 1490, 4, array['t-shirts','graphic','limited-drop']::text[], array['Black','Charcoal']::text[], '{"Black":"#18140F","Charcoal":"#3A352D"}'::jsonb, array['M','L','XL']::text[], 3, true
where not exists (select 1 from public.products where name = 'Midnight Run Tee');

