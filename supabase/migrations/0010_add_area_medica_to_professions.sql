-- Migration 0010: aggiungi area_medica alle professioni mediche
-- Valori: 'non_chirurgica' | 'chirurgica'
-- Usato per determinare il sovrappremio retroattività illimitata (q_tipo_area_medica)

ALTER TABLE professions
  ADD COLUMN area_medica text CHECK (area_medica IN ('non_chirurgica', 'chirurgica'));

-- ── Non chirurgiche ──────────────────────────────────────────────────────────
UPDATE professions SET area_medica = 'non_chirurgica'
WHERE slug IN (
  -- Gruppo 1
  'mmg', 'medico_comunita', 'pediatra_libera_scelta', 'medicine_non_convenzionali',
  'medico_abilitato', 'scienze_alimentazione', 'medicina_termale',
  -- Gruppo 2
  'audiologia', 'farmacologia', 'genetica_medica', 'microbiologia', 'patologia_clinica',
  -- Gruppo 3
  'medicina_legale',
  -- Gruppo 4
  'neuropsichiatria', 'psichiatria', 'psicologia_clinica',
  -- Gruppo 5
  'allergologia', 'angiologia', 'diabetologia', 'endocrinologia', 'malattie_infettive',
  -- Gruppo 6
  'oculistica',
  -- Gruppo 7
  'medicina_nucleare',
  -- Gruppo 8
  'diagnostica_ecografica', 'epatologia', 'gastroenterologia', 'geriatria',
  'medicina_emergenza', 'medicina_interna', 'nefrologia', 'pneumologia', 'visite_preoperatorie',
  -- Gruppo 9
  'patologia', 'dermatologia', 'ematologia', 'oncologia',
  -- Gruppo 10
  'pediatra_specialista',
  -- Gruppo 11
  'terapia_dolore',
  -- Gruppo 12
  'fisiatria', 'neurofisiopatologia', 'neurologia',
  -- Gruppo 13
  'igiene_medicina_preventiva', 'medicina_aeronautica', 'medicina_del_lavoro', 'statistica_sanitaria',
  -- Gruppo 14
  'radioterapia',
  -- Gruppo 15
  'otorinolaringoiatria',
  -- Gruppo 16
  'radiodiagnostica',
  -- Gruppo 17
  'cardiologia',
  -- Gruppo 18
  'ortopedia',
  -- Gruppo 19
  'reumatologia',
  -- Gruppo 20
  'medicina_dello_sport',
  -- Gruppo 21
  'andrologia', 'urologia',
  -- Gruppo 29
  'ginecologia'
);

-- ── Chirurgiche ──────────────────────────────────────────────────────────────
UPDATE professions SET area_medica = 'chirurgica'
WHERE slug IN (
  -- Gruppo 22
  'oculistica_chirurgica',
  -- Gruppo 23
  'anestesia_rianimazione',
  -- Gruppo 24
  'otorinolaringoiatria_chir',
  -- Gruppo 25
  'cardiologia_interventistica',
  -- Gruppo 26
  'oculistica_chirurgica_estetica',
  -- Gruppo 27
  'otorinolaringoiatria_chir_estetica',
  -- Gruppo 28
  'chirurgia_oncologica_ortopedica', 'chirurgia_ricostruttiva', 'chirurgia_oncologica_senologica',
  -- Gruppo 30
  'ginecologia_invasiva', 'ginecologia_fecondazione',
  -- Gruppo 31
  'chirurgia_maxillo_facciale',
  -- Gruppo 32
  'chirurgia_andrologica', 'chirurgia_urologica',
  -- Gruppo 33
  'chirurgia_maxillo_facciale_estetica',
  -- Gruppo 34
  'chirurgia_addominale', 'chirurgia_bariatrica', 'chirurgia_generale', 'chirurgo_pediatrico',
  'chirurgia_proctologica', 'chirurgia_toracica', 'endocrinochirurgia',
  'chirurgia_apparato_digerente', 'nefrologia_chirurgica',
  -- Gruppo 35
  'chirurgia_ginecologica',
  -- Gruppo 36
  'chirurgia_fetale', 'pediatra_neonatologia',
  -- Gruppo 37
  'chirurgia_mano', 'ortopedia_traumatologia',
  -- Gruppo 38
  'chirurgia_d_urgenza', 'chirurgia_vascolare',
  -- Gruppo 39
  'cardiochirurgia',
  -- Gruppo 40
  'chirurgia_estetica_plastica',
  -- Gruppo 41
  'ginecologia_ostetricia_parto',
  -- Gruppo 42
  'ortopedia_spinale',
  -- Gruppo 43
  'neurochirurgia'
);
