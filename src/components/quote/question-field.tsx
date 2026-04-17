"use client"

import * as React from "react"
import { useFormContext, type Control } from "react-hook-form"

import { cn } from "@/lib/utils"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Question } from "@/lib/types"

type Values = Record<string, unknown>

export function QuestionField({
  question,
  required,
  control,
}: {
  question: Question
  required: boolean
  control: Control<Values>
}) {
  const label = required ? `${question.label} *` : question.label

  return (
    <FormField
      control={control}
      name={question.key}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <FieldInput question={question} field={field} />
          </FormControl>
          {question.helpText ? (
            <FormDescription>{question.helpText}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

type FieldRenderProps = {
  value: unknown
  onChange: (v: unknown) => void
  onBlur: () => void
  name: string
  ref: React.Ref<unknown>
}

function FieldInput({
  question,
  field,
}: {
  question: Question
  field: FieldRenderProps
}) {
  switch (question.type) {
    case "number":
    case "currency":
      return (
        <Input
          type="number"
          inputMode={question.type === "currency" ? "decimal" : "numeric"}
          step={question.type === "currency" ? "0.01" : "1"}
          name={field.name}
          onBlur={field.onBlur}
          value={
            typeof field.value === "number" || typeof field.value === "string"
              ? (field.value as number | string)
              : ""
          }
          onChange={(e) => {
            const raw = e.target.value
            field.onChange(raw === "" ? undefined : Number(raw))
          }}
        />
      )
    case "date":
      return (
        <Input
          type="date"
          name={field.name}
          onBlur={field.onBlur}
          value={typeof field.value === "string" ? field.value : ""}
          onChange={(e) => field.onChange(e.target.value)}
        />
      )
    case "text":
      return (
        <Input
          type="text"
          name={field.name}
          onBlur={field.onBlur}
          value={typeof field.value === "string" ? field.value : ""}
          onChange={(e) => field.onChange(e.target.value)}
        />
      )
    case "boolean":
      return (
        <Select
          value={
            field.value === true ? "true" : field.value === false ? "false" : null
          }
          onValueChange={(v) => field.onChange(v === "true")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Sì</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      )
    case "dropdown":
    case "choice":
      return (
        <Select
          value={typeof field.value === "string" && field.value ? field.value : null}
          onValueChange={(v) => field.onChange(v ?? "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona" />
          </SelectTrigger>
          <SelectContent>
            {(question.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "multichoice":
      return (
        <MultiCheckbox
          options={question.options ?? []}
          value={Array.isArray(field.value) ? (field.value as string[]) : []}
          onChange={field.onChange}
        />
      )
    default:
      return null
  }
}

function MultiCheckbox({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (v: string[]) => void
}) {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v))
    else onChange([...value, v])
  }
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className={cn(
              "size-4 rounded border border-input bg-transparent",
              "focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

export function QuestionFieldWithContext({
  question,
  required,
}: {
  question: Question
  required: boolean
}) {
  const { control } = useFormContext<Values>()
  return (
    <QuestionField question={question} required={required} control={control} />
  )
}
