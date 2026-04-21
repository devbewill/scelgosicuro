-- Migration 0009: unifica is_mandatory in is_required, elimina is_mandatory

UPDATE sector_questions SET is_required = is_mandatory;

ALTER TABLE sector_questions DROP COLUMN is_mandatory;
