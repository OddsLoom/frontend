import type { Metadata } from 'next'
import { PageIntro, SubpageShell } from '../components/SubpageShell'

export const metadata: Metadata = { title: 'Service Status', description: 'OddsLoom service availability and production readiness status.' }

export default function StatusPage() {
  return <SubpageShell><PageIntro kicker="Service status" title="Pre-production."><p>OddsLoom does not currently offer a production API or service-level agreement. This page will become the public operational record when beta infrastructure opens.</p></PageIntro><section className="status-board"><div className="status-banner"><i /><span><strong>Development in progress</strong>No customer-facing feed is currently available.</span><b>PRE-PRODUCTION</b></div><div className="status-row"><span>Marketing site</span><b className="operational">OPERATIONAL</b></div><div className="status-row"><span>Beta application service</span><b className="operational">OPERATIONAL</b></div><div className="status-row"><span>Replay sandbox</span><b>PLANNED</b></div><div className="status-row"><span>Production odds feed</span><b>NOT LAUNCHED</b></div><div className="status-row"><span>Public API documentation</span><b className="preview">DRAFT</b></div></section></SubpageShell>
}
