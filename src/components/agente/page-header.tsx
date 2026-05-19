interface PageHeaderProps {
  eyebrow: string
  title: string
  subtitle: string
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8 border-b border-ink/10 pb-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted mb-1">{eyebrow}</p>
      <h1 className="text-3xl font-black tracking-tight text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
    </div>
  )
}
