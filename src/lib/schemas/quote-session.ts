import { z } from "zod"

export const phaseASchema = z.object({
  sectorId: z.string().uuid("Settore non valido"),
  age: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number({ error: "Inserisci la tua età" }).int().min(18, "Età minima 18 anni").max(99, "Età massima 99 anni")
  ),
  contactName: z
    .string()
    .trim()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(120),
  contactEmail: z.string().trim().toLowerCase().email("Email non valida"),
  contactPhone: z
    .string()
    .trim()
    .regex(/^(\+?\d[\d\s.\-]{6,}\d)$/, "Numero di telefono non valido"),
})

export type PhaseAInput = z.infer<typeof phaseASchema>
