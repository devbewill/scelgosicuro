-- ─────────────────────────────────────────────────────────────────────────────
-- 1. q_eta → sector_questions (sector_id = 1 = medici)
--    Raccolta età necessaria per i 3 moltiplicatori: under35 -7%, 35-40 -5%, 70+ +3%
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO sector_questions
  (sector_id, key, label, help_text, type, options, validation, position, section, is_required, visible_if)
VALUES
  (1, 'q_eta', 'Quanti anni hai?', null, 'number', null,
   '{"min": 18, "max": 99}', 7, null, false, null)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. q_franchigia: visible_if solo se nessun sinistro pregresso
--    (il tariffario dice: selezionabile "in assenza di sinistri pregressi")
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE sector_questions
SET visible_if = '{"op": "equals", "key": "q_sinistri_5_anni", "value": 0}'
WHERE key = 'q_franchigia'
  AND sector_id = 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Domande add-on → product_questions (product_id = 1 = AmTrust Medico Protetto)
--    Non sono domande di settore ma domande specifiche del prodotto.
--    phase = 'B' → mostrate nel questionario dopo le domande di settore
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO product_questions
  (product_id, key, label, help_text, type, options, validation, position, section, is_required, visible_if, phase)
VALUES
  (1, 'q_addon_ruolo_apicale',
   'Vuoi aggiungere la copertura Ruolo Apicale e Direzione Sanitaria – Perdite Patrimoniali?',
   'Sovrappremio fisso: €450. Copre la responsabilità derivante da ruoli dirigenziali o apicali in strutture sanitarie.',
   'dropdown',
   '[{"label": "Sì (+€450)", "value": "si"}, {"label": "No", "value": "no"}]',
   null, 10, 'Garanzie Aggiuntive', false, null, 'addon'),

  (1, 'q_addon_rct_rco',
   'Vuoi aggiungere la copertura Perdite Patrimoniali e conduzione dello studio (RCT-RCO)?',
   'Sovrappremio fisso: €100. Copre la responsabilità civile verso terzi e verso i dipendenti dello studio.',
   'dropdown',
   '[{"label": "Sì (+€100)", "value": "si"}, {"label": "No", "value": "no"}]',
   null, 11, 'Garanzie Aggiuntive', false, null, 'addon'),

  (1, 'q_addon_ecm',
   'Vuoi aggiungere la copertura Omesso Adempimento Crediti ECM?',
   'Sovrappremio fisso: €40. Copre le sanzioni per mancato conseguimento dei crediti ECM obbligatori.',
   'dropdown',
   '[{"label": "Sì (+€40)", "value": "si"}, {"label": "No", "value": "no"}]',
   null, 12, 'Garanzie Aggiuntive', false, null, 'addon')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Eligibility rule: Ortopedia non-chir + massimale 1M → exclude
--    Il tariffario non ha rate_row per questa combinazione; meglio un messaggio
--    esplicito che un silenzioso "nessun prezzo trovato"
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO product_eligibility_rules
  (product_id, name, condition, action, reason, priority)
VALUES
  (1,
   'Ortopedia – massimale minimo 2 milioni',
   '{
     "all": [
       {"op": "equals", "key": "q_professione", "value": "ortopedia"},
       {"op": "equals", "key": "q_massimale_rc",  "value": 1000000}
     ]
   }',
   'exclude',
   'Per Ortopedia il massimale minimo richiesto è €2.000.000',
   5)
ON CONFLICT DO NOTHING;
