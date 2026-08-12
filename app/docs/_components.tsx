import type { ReactNode } from 'react'
import Link from 'next/link'
import { SubpageShell } from '../components/SubpageShell'

const sections = [
  ['/docs', 'Overview'],
  ['/docs/protocol', 'Protocol'],
  ['/docs/entities', 'Entity model'],
  ['/docs/payloads', 'Payload catalog'],
  ['/docs/reliability', 'Reliability'],
] as const

export function DocsPage({ title, lede, children, current = '/docs', next }: { title: string; lede: string; children: ReactNode; current?: string; next?: [string, string] }) {
  const chapter = sections.find(([href]) => href === current)?.[1] ?? 'Reference'
  return <SubpageShell>
    <div className="docs-layout docs-site-layout docs-reference-layout">
      <aside className="docs-nav docs-site-nav"><span>DOCUMENTATION</span>{sections.map(([href, label]) => <Link href={href} key={href} aria-current={href === current ? 'page' : undefined}>{label}</Link>)}<i /><small>Beta-0 contract<br />August 2026</small></aside>
      <article className="prose docs-content">
        <header className="docs-reference-header"><span>V1 / {chapter}</span><h1>{title}</h1><p>{lede}</p></header>
        {children}
        {next && <Link className="docs-next" href={next[0]}><span>CONTINUE</span><strong>{next[1]} →</strong></Link>}
      </article>
    </div>
  </SubpageShell>
}

export function FieldTable({ rows }: { rows: [string, string, string][] }) {
  return <div className="field-table">{rows.map(([field, type, meaning]) => <div key={field}><code>{field}</code><b>{type}</b><span>{meaning}</span></div>)}</div>
}

export function Code({ children }: { children: string }) {
  return <pre><code>{children}</code></pre>
}

export function ObjectLabel({ children }: { children: ReactNode }) {
  return <span className="doc-object-label">{children}</span>
}
