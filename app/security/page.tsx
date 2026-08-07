import type { Metadata } from 'next'
import { PageIntro, SubpageShell } from '../components/SubpageShell'

export const metadata: Metadata = { title: 'Security', description: 'OddsLoom pre-production security practices and disclosure guidance.' }

export default function SecurityPage() {
  return <SubpageShell><PageIntro kicker="Security" title="Security starts before launch."><p>OddsLoom is pre-production and does not yet claim certifications or audited controls. The practices below describe the current direction, not a formal compliance guarantee.</p></PageIntro><article className="prose narrow-prose"><h2>Current practices</h2><ul><li>Production traffic is encrypted with HTTPS through Vercel.</li><li>Beta applications are written server-side to private object storage.</li><li>Application records are not exposed through a public read endpoint.</li><li>Secrets and local deployment metadata are excluded from source control.</li><li>Access to infrastructure is limited through provider authentication.</li></ul><h2>Planned feed controls</h2><ul><li>Per-customer credentials and revocable access</li><li>Documented rate and connection limits</li><li>Structured operational logging</li><li>Dependency and vulnerability monitoring</li><li>Incident response and customer notification procedures</li></ul><h2>Report a concern</h2><p>Please report suspected vulnerabilities privately to <a href="mailto:security@oddsloom.com">security@oddsloom.com</a>. Do not include sensitive customer data in the initial message.</p></article></SubpageShell>
}
