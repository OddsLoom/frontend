import type { ReactNode } from 'react'
import Link from 'next/link'

function Mark() {
  return <span className="logo-mark"><i /><i /><i /></span>
}

export function SubpageShell({ children }: { children: ReactNode }) {
  return (
    <main className="subpage-shell">
      <header className="subpage-nav">
        <Link className="logo" href="/"><Mark /><span>ODDSLOOM</span></Link>
        <nav aria-label="Primary navigation">
          <Link href="/docs">API docs</Link>
          <Link href="/coverage">Coverage</Link>
          <Link href="/status">Status</Link>
          <Link className="nav-cta" href="/beta">Request access</Link>
        </nav>
      </header>
      {children}
      <footer className="subpage-footer">
        <div><Link className="logo" href="/"><Mark /><span>ODDSLOOM</span></Link><p>Real-time odds infrastructure.</p></div>
        <div className="footer-links"><Link href="/about">About</Link><Link href="/docs">Docs</Link><Link href="/security">Security</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
        <div className="legal">© {new Date().getFullYear()} OddsLoom.<br />Pre-production service.</div>
      </footer>
    </main>
  )
}

export function PageIntro({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="page-intro">
      <span className="section-kicker">{kicker}</span>
      <h1>{title}</h1>
      <div className="page-lede">{children}</div>
    </section>
  )
}
