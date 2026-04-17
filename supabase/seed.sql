-- Minimal seed for FASE A. Names are in Italian (user-facing).

insert into public.sectors (id, name, sort_order) values
  ('NL', 'Medici',            10),
  ('NA', 'Architetti',        20),
  ('NG', 'Avvocati',          30),
  ('NF', 'Freelance',         40),
  ('NR', 'Bar e Ristoranti',  50);

insert into public.activities (id, sector_id, name, sort_order) values
  ('NL07', 'NL', 'Chirurgo generale',          10),
  ('NL12', 'NL', 'Medico di base',             20),
  ('NL21', 'NL', 'Odontoiatra',                30),
  ('NA05', 'NA', 'Architetto libero prof.',    10),
  ('NA08', 'NA', 'Ingegnere strutturista',     20),
  ('NG03', 'NG', 'Avvocato civilista',         10),
  ('NG04', 'NG', 'Avvocato penalista',         20),
  ('NF01', 'NF', 'Consulente IT',              10),
  ('NR02', 'NR', 'Ristorante',                 10),
  ('NR05', 'NR', 'Bar / Caffetteria',          20);
