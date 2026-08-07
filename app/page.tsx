'use client'

import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Menu,
  Radio,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'

const picks = [
  { league: 'NBA', matchup: 'MIN @ DEN', market: 'MIN +5.5', odds: '-110', edge: '+4.8%', time: '7:10 PM' },
  { league: 'MLB', matchup: 'CHC @ STL', market: 'Under 8.5', odds: '+102', edge: '+3.9%', time: '7:45 PM' },
  { league: 'WNBA', matchup: 'NYL @ PHX', market: 'NYL ML', odds: '-125', edge: '+3.4%', time: '9:00 PM' },
]

const faqs = [
  ['What exactly do I get?', 'Every active pick includes the market, target price, unit size, and a concise explanation of the edge. Alerts arrive before the line has time to drift.'],
  ['Which sportsbooks do you track?', 'We compare prices across major legal sportsbooks and identify the strongest available number. Book coverage will vary by state.'],
  ['How many picks are sent?', 'We only publish when the data supports a real edge. Expect selectivity—not a daily quota or forced action.'],
  ['Can I cancel anytime?', 'Yes. Your membership can be canceled at any time, with access continuing through the end of your billing period.'],
]

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="OddsLoom home">
      <span className="logo-mark"><i /><i /><i /></span>
      <span>ODDSLOOM</span>
    </a>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const reveal = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('visible')),
      { threshold: 0.12 },
    )
    document.querySelectorAll('.reveal').forEach(element => reveal.observe(element))
    return () => reveal.disconnect()
  }, [])

  return (
    <main id="top">
      <nav>
        <Logo />
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#method" onClick={() => setMenuOpen(false)}>The method</a>
          <a href="#results" onClick={() => setMenuOpen(false)}>Results</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a className="nav-cta" href="#pricing" onClick={() => setMenuOpen(false)}>Join the loom <ArrowRight size={15} /></a>
        </div>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy reveal visible">
          <div className="eyebrow"><span className="live-dot" /> Data-backed picks. No noise.</div>
          <h1>Find the edge<br />before it <em>moves.</em></h1>
          <p className="hero-sub">Sharp sports picks woven from live market data, price movement, and disciplined analysis—delivered straight to you.</p>
          <div className="hero-actions">
            <a className="button primary" href="#pricing">Get the next pick <ArrowRight size={18} /></a>
            <a className="button secondary" href="#method">See how it works</a>
          </div>
          <p className="microcopy"><ShieldCheck size={14} /> Cancel anytime <span /> No long-term contracts</p>
        </div>

        <div className="terminal-wrap reveal visible">
          <div className="terminal-glow" />
          <div className="terminal">
            <div className="terminal-head">
              <div><span className="status-dot" /> LIVE BOARD</div>
              <span>UPDATED 14s AGO</span>
            </div>
            <div className="signal-summary">
              <div><span>MARKETS SCANNED</span><strong>1,248</strong></div>
              <div><span>EDGES FOUND</span><strong className="lime">03</strong></div>
              <div className="pulse"><Radio size={16} /> SCANNING</div>
            </div>
            <div className="pick-label"><span>TONIGHT'S BOARD</span><span>EDGE</span></div>
            {picks.map((pick, index) => (
              <div className="pick-row" key={pick.matchup}>
                <span className="pick-index">0{index + 1}</span>
                <div className="pick-main">
                  <span><b>{pick.league}</b> {pick.matchup}</span>
                  <strong>{pick.market} <small>{pick.odds}</small></strong>
                  <span>{pick.time} CT</span>
                </div>
                <span className="edge">{pick.edge}</span>
              </div>
            ))}
            <div className="terminal-foot"><Zap size={14} /> Members receive picks the moment they clear our threshold.</div>
          </div>
        </div>
      </section>

      <div className="ticker" aria-label="Market coverage">
        <div className="ticker-track">
          {[0, 1].map(copy => (
            <div className="ticker-set" key={copy}>
              <span>NBA</span><i /> <span>NFL</span><i /> <span>MLB</span><i /> <span>NHL</span><i /> <span>NCAAB</span><i /> <span>WNBA</span><i /> <span>UFC</span><i />
            </div>
          ))}
        </div>
      </div>

      <section className="statement reveal" id="method">
        <span className="section-kicker">The philosophy</span>
        <h2>Most bettors chase winners.<br />We chase <em>mispriced numbers.</em></h2>
        <p>Odds are moving markets. We find where the price and probability disagree—and act while the gap is still there.</p>
      </section>

      <section className="method-cards reveal">
        <article>
          <span className="card-number">01</span>
          <div className="icon-box"><BarChart3 /></div>
          <h3>Scan the market</h3>
          <p>We monitor books and markets continuously, tracking odds, movement, and discrepancies in real time.</p>
          <div className="mini-chart"><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="featured-card">
          <span className="card-number">02</span>
          <div className="icon-box"><Sparkles /></div>
          <h3>Isolate the edge</h3>
          <p>Each opportunity is filtered through our models and reviewed against context before it earns a play.</p>
          <div className="gauge"><span>ODDSLOOM EDGE</span><strong>+4.8%</strong><div><i /></div></div>
        </article>
        <article>
          <span className="card-number">03</span>
          <div className="icon-box"><TimerReset /></div>
          <h3>Move with precision</h3>
          <p>You get the bet, the target price, and the reasoning—delivered while the number is still playable.</p>
          <div className="alert-pill"><Zap size={14} /> NEW PICK DELIVERED <span>NOW</span></div>
        </article>
      </section>

      <section className="results" id="results">
        <div className="results-copy reveal">
          <span className="section-kicker">Track record</span>
          <h2>Process over promises.</h2>
          <p>We don’t sell locks. We document every play, publish the price, and let the record speak for itself.</p>
          <div className="principles">
            <div><Check size={17} /><span><strong>Every pick tracked</strong>Wins, losses, odds, and closing line—all visible.</span></div>
            <div><Check size={17} /><span><strong>Flat, disciplined staking</strong>No chasing. No wild parlays. No gimmicks.</span></div>
            <div><Check size={17} /><span><strong>Transparent reporting</strong>Monthly reports shared with every member.</span></div>
          </div>
        </div>
        <div className="scorecard reveal">
          <div className="scorecard-head"><span>PERFORMANCE / SAMPLE</span><span>LAST 90 DAYS</span></div>
          <div className="score-grid">
            <div><span>RECORD</span><strong>—</strong><small>Connect your real data</small></div>
            <div><span>UNITS</span><strong>—</strong><small>Verified performance</small></div>
            <div><span>ROI</span><strong>—</strong><small>All tracked plays</small></div>
            <div><span>AVG. CLV</span><strong>—</strong><small>Closing line value</small></div>
          </div>
          <div className="chart-placeholder">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d7ff46" stopOpacity=".26" /><stop offset="1" stopColor="#d7ff46" stopOpacity="0" /></linearGradient></defs>
              <path className="area" d="M0,130 C40,125 50,108 80,114 S125,95 155,100 S200,68 225,80 S270,62 295,66 S335,35 360,49 S405,30 430,35 S470,12 500,18 L500,150 L0,150Z" />
              <path className="line" d="M0,130 C40,125 50,108 80,114 S125,95 155,100 S200,68 225,80 S270,62 295,66 S335,35 360,49 S405,30 430,35 S470,12 500,18" />
            </svg>
            <span className="sample-badge">SAMPLE DATA</span>
          </div>
          <p className="score-note">Performance fields are ready for your verified results.</p>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="pricing-heading reveal">
          <span className="section-kicker">Membership</span>
          <h2>One plan. Every edge.</h2>
          <p>Everything you need to bet smarter—without the noise.</p>
        </div>
        <div className="price-card reveal">
          <div className="popular">FOUNDING MEMBER RATE</div>
          <div className="price-top">
            <div><span>ODDSLOOM / ALL ACCESS</span><h3>$49<small>/month</small></h3></div>
            <div className="price-mark"><TrendingUp /></div>
          </div>
          <ul>
            <li><Check /> Every official OddsLoom pick</li>
            <li><Check /> Instant pick alerts</li>
            <li><Check /> Target odds and unit sizing</li>
            <li><Check /> Full performance dashboard</li>
            <li><Check /> Member-only analysis</li>
          </ul>
          <a className="button primary full" href="mailto:hello@oddsloom.com?subject=OddsLoom%20early%20access">Start your membership <ArrowRight size={18} /></a>
          <p className="price-note">7-day money-back guarantee · Cancel anytime</p>
        </div>
      </section>

      <section className="faq reveal">
        <div><span className="section-kicker">Good questions</span><h2>Before you join.</h2></div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
            <button className={`faq-item ${openFaq === index ? 'active' : ''}`} key={question} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
              <span>{question}</span><ChevronDown />
              <p>{answer}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="final-cta reveal">
        <div className="loom-lines" />
        <span className="section-kicker">The market won't wait</span>
        <h2>Get there before<br />the number does.</h2>
        <a className="button primary" href="#pricing">Join OddsLoom <ArrowRight size={18} /></a>
      </section>

      <footer>
        <div><Logo /><p>Sharp data. Clear decisions.</p></div>
        <div className="footer-links"><a href="#method">Method</a><a href="#results">Results</a><a href="#pricing">Pricing</a></div>
        <div className="legal">© {new Date().getFullYear()} OddsLoom. All rights reserved.<br />Must be 21+. Please bet responsibly.</div>
      </footer>
    </main>
  )
}

export default App
