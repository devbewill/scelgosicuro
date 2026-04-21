export type QuestionType =
  | "number"
  | "dropdown"
  | "text"
  | "boolean"
  | "date"
  | "multiselect"

export type QuestionOption = {
  value: string | number
  label?: string
}

export type QuestionValidation = {
  min?: number
  max?: number
  step?: number
  regex?: string
}

export type SectorQuestion = {
  id: number
  sectorId: number
  key: string
  label: string
  helpText: string | null
  type: QuestionType
  options: QuestionOption[] | null
  validation: QuestionValidation | null
  position: number
  section: string | null
  isRequired: boolean
  visibleIf: Record<string, unknown> | null
}

export type ProductQuestion = {
  id: number
  productId: number
  key: string
  label: string
  helpText: string | null
  type: QuestionType
  options: QuestionOption[] | null
  validation: QuestionValidation | null
  position: number
  section: string | null
  isRequired: boolean
  visibleIf: Record<string, unknown> | null
  phase: "eligibility" | "pricing" | "addon"
}

export type Profession = {
  id: number
  sectorId: number
  slug: string
  name: string
  displayOrder: number
  isActive: boolean
}

export type QuoteSession = {
  id: number
  sectorId: number
  answers: Record<string, unknown>
  status: string
}

export type QuoteResult = {
  id: number
  productId: number
  productName: string
  productSlug: string
  insurerName: string
  insurerLogoUrl: string | null
  premiumTotal: number | null
  premiumBreakdown: Record<string, unknown> | null
  manualQuote: boolean
  exclusionReason: string | null
  slot: "safe" | "economic" | null
  isEstimate: boolean
  availableOptions: Record<string, unknown[]> | null
}
