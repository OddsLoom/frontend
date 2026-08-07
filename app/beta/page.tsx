'use client'

import { FormEvent, useState } from 'react'
import { Check, LoaderCircle } from 'lucide-react'
import { PageIntro, SubpageShell } from '../components/SubpageShell'

const startedAt = Date.now()

export default function BetaPage() {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('submitting')
    setError('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    payload.startedAt = String(startedAt)

    try {
      const response = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Unable to submit your application.')
      setState('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to submit your application.')
      setState('error')
    }
  }

  if (state === 'success') {
    return <SubpageShell><section className="form-success"><div className="success-mark"><Check /></div><span className="section-kicker">Application received</span><h1>Thanks for building with us.</h1><p>We’ll review your requirements and reach out when there is a useful next step—whether that is a schema conversation, sandbox access, or the private beta.</p><div><a className="button primary" href="/docs">Review the draft docs</a><a className="button secondary" href="/">Back to OddsLoom</a></div></section></SubpageShell>
  }

  return (
    <SubpageShell>
      <PageIntro kicker="Private design-partner beta" title="Tell us what your system needs.">
        <p>We’re selecting early partners based on technical fit and coverage requirements. There is no payment required and no production-access promise.</p>
      </PageIntro>
      <section className="application-wrap">
        <div className="application-context"><span className="section-kicker">What happens next</span><ol><li><b>01</b><span><strong>We review the fit.</strong>Your use case and required coverage help prioritize the feed.</span></li><li><b>02</b><span><strong>We compare requirements.</strong>If there is a match, we’ll schedule a technical conversation.</span></li><li><b>03</b><span><strong>We integrate deliberately.</strong>Selected partners may receive sample payloads, replay access, or a beta key.</span></li></ol></div>
        <form className="beta-form" onSubmit={submit}>
          <div className="form-row"><label>Full name<input name="name" required maxLength={100} autoComplete="name" /></label><label>Work email<input name="email" required type="email" maxLength={200} autoComplete="email" /></label></div>
          <label>Company or project<input name="company" required maxLength={160} autoComplete="organization" /></label>
          <label>What are you building?<textarea name="useCase" required maxLength={1200} rows={4} placeholder="Automated system, analytics product, odds screen, research platform…" /></label>
          <label>Required sports, books, and markets<textarea name="coverage" required maxLength={1200} rows={3} placeholder="NBA main markets across…" /></label>
          <div className="form-row"><label>Current provider <span>(optional)</span><input name="provider" maxLength={160} /></label><label>Monthly data budget <span>(optional)</span><select name="budget" defaultValue=""><option value="">Prefer not to say</option><option>Under $250</option><option>$250–$1,000</option><option>$1,000–$5,000</option><option>$5,000+</option></select></label></div>
          <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <label className="consent"><input name="consent" type="checkbox" value="yes" required /><span>I agree that OddsLoom may store this application and contact me about product development and beta access. See the <a href="/privacy">privacy notice</a>.</span></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button primary full" disabled={state === 'submitting'}>{state === 'submitting' ? <><LoaderCircle className="spin" size={17} /> Submitting…</> : 'Submit beta application →'}</button>
        </form>
      </section>
    </SubpageShell>
  )
}
