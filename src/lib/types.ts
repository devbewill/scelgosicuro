export type QuestionType =
  | "number"
  | "currency"
  | "dropdown"
  | "choice"
  | "multichoice"
  | "date"
  | "boolean"
  | "text"

export type QuestionOption = {
  value: string
  label: string
}

export type QuestionValidation = {
  required?: boolean
  min?: number
  max?: number
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

export type VisibleIfRule = {
  question_key: string
  operator: "equals" | "not_equals" | "in" | "not_in"
  value?: string | string[]
}

export type QuestionnaireItem = {
  question_key: string
  required?: boolean
  visible_if?: VisibleIfRule
}

export type QuestionnaireSection = {
  key: string
  title: string
  items: QuestionnaireItem[]
}

export type QuestionnaireDefinition = {
  title: string
  sections: QuestionnaireSection[]
}

export type Questionnaire = {
  id: string
  activityId: string
  version: number
  definition: QuestionnaireDefinition
}

export type QuoteSession = {
  id: string
  activityId: string
  questionnaireId: string | null
  answers: Record<string, unknown>
  status: string
}
