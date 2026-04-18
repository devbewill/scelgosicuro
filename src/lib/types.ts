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

export type Question = {
  key: string
  label: string
  helpText: string | null
  type: QuestionType
  options: QuestionOption[] | null
  validation: QuestionValidation | null
}

export type SectorQuestion = {
  question: Question
  position: number
  section: string | null
  isRequired: boolean
  visibleIf: Record<string, unknown> | null
}

export type QuoteSession = {
  id: string
  sectorId: string
  answers: Record<string, unknown>
  status: string
}

export type QuoteResult = {
  id: string
  productId: string
  productName: string
  productSlug: string
  insurerName: string
  insurerLogoUrl: string | null
  premiumTotal: number | null
  premiumBreakdown: Record<string, unknown> | null
  manualQuote: boolean
  exclusionReason: string | null
  slot: "safe" | "economic" | null
}
