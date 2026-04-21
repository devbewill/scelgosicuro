-- q_eta: diventa obbligatoria (raccolta nel questionario, non più nello step 1)
UPDATE sector_questions
SET is_required = true
WHERE key = 'q_eta'
  AND sector_id = 1;

-- q_attivita_struttura: solo 2 opzioni
-- L'unico effetto tariffario è lo sconto -15% quando value = 'una_struttura'.
-- Tutte le altre casistiche (studio, misto, più strutture) non cambiano il premio.
UPDATE sector_questions
SET options = '[
  {"label": "Sì, esclusivamente presso una struttura", "value": "una_struttura"},
  {"label": "No",                                       "value": "no"}
]'::jsonb
WHERE key = 'q_attivita_struttura'
  AND sector_id = 1;
