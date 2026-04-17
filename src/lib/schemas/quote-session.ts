import { z } from "zod"

export const phaseASchema = z.object({
  sectorId: z.string().min(1, "Seleziona un settore"),
  activityId: z.string().min(1, "Seleziona un'attività"),
  contactName: z
    .string()
    .trim()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(120),
  contactEmail: z.string().trim().toLowerCase().email("Email non valida"),
  contactPhone: z
    .string()
    .trim()
    .regex(/^(\+?\d[\d\s.-]{6,}\d)$/, "Numero di telefono non valido"),
})

export type PhaseAInput = z.infer<typeof phaseASchema>
