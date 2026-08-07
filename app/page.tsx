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

const oddsBoard = [
  { league: 'NBA', matchup: 'MIN @ DEN', market: 'MIN +5.5', price: '-105', book: 'BOOK A', time: '7:10 PM' },
  { league: 'MLB', matchup: 'CHC @ STL', market: 'Under 8.5', price: '+102', book: 'BOOK B', time: '7:45 PM' },
  { league: 'WNBA', matchup: 'NYL @ PHX', market: 'NYL ML', price: '-120', book: 'BOOK C', time: '9:00 PM' },
]

const faqs = [
  ['What exactly do I get?', 'You get access to current sportsbook odds in one clean view, including the event, market, price, book, and update time.'],
  ['Which sportsbooks do you cover?', 'OddsLoom is designed to aggregate major legal sportsbooks. Final book and market coverage will be listed clearly before launch and may vary by state.'],
  ['Are these betting picks?', 'No. OddsLoom sells access to odds and market data. We show you the numbers; we do not tell you what to bet.'],
  ['Can I cancel anytime?', 'Yes. Your subscription can be canceled at any time, with access continuing through the end of your billing period.'],
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
          <a href="#method" onClick={() => setMenuOpen(false)}>Coverage</a>
          <a href="#results" onClick={() => setMenuOpen(false)}>Data quality</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a className="nav-cta" href="#pricing" onClick={() => setMenuOpen(false)}>Get odds access <ArrowRight size={15} /></a>
        </div>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy reveal visible">
          <div className="eyebrow"><span className="live-dot" /> Live odds. One clear view.</div>
          <h1>Every line.<br />As it <em>moves.</em></h1>
          <p className="hero-sub">Real-time sportsbook odds woven into one fast, focused feed. Compare prices, follow movement, and stop jumping between books.</p>
          <div className="hero-actions">
            <a className="button primary" href="#pricing">Get odds access <ArrowRight size={18} /></a>
            <a className="button secondary" href="#method">See how it works</a>
          </div>
          <p className="microcopy"><ShieldCheck size={14} /> Multiple books <span /> Markets in one place</p>
        </div>

        <div className="terminal-wrap reveal visible">
          <div className="terminal-glow" />
          <div className="terminal">
            <div className="terminal-head">
              <div><span className="status-dot" /> LIVE BOARD</div>
              <span>UPDATED 14s AGO</span>
            </div>
            <div className="signal-summary">
              <div><span>MARKETS TRACKED</span><strong>1,248</strong></div>
              <div><span>PRICE UPDATES</span><strong className="lime">LIVE</strong></div>
              <div className="pulse"><Radio size={16} /> SCANNING</div>
            </div>
            <div className="pick-label"><span>TONIGHT&apos;S ODDS</span><span>BEST PRICE</span></div>
            {oddsBoard.map((line, index) => (
              <div className="pick-row" key={line.matchup}>
                <span className="pick-index">0{index + 1}</span>
                <div className="pick-main">
                  <span><b>{line.league}</b> {line.matchup}</span>
                  <strong>{line.market} <small>{line.book}</small></strong>
                  <span>{line.time} CT</span>
                </div>
                <span className="edge">{line.price}</span>
              </div>
            ))}
            <div className="terminal-foot"><Zap size={14} /> Prices update as new sportsbook odds arrive.</div>
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
        <span className="section-kicker">The product</span>
        <h2>The odds are everywhere.<br />Now they’re <em>in one place.</em></h2>
        <p>Sportsbook prices move independently. OddsLoom brings the market together so you can compare the number you want without the tab overload.</p>
      </section>

      <section className="method-cards reveal">
        <article>
          <span className="card-number">01</span>
          <div className="icon-box"><BarChart3 /></div>
          <h3>Collect the market</h3>
          <p>We monitor supported sportsbooks and organize incoming odds by league, event, and market.</p>
          <div className="mini-chart"><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="featured-card">
          <span className="card-number">02</span>
          <div className="icon-box"><Sparkles /></div>
          <h3>Compare every price</h3>
          <p>See the available lines together and identify the strongest displayed price without checking each book manually.</p>
          <div className="gauge"><span>BOOK COVERAGE</span><strong>CONNECTED</strong><div><i /></div></div>
        </article>
        <article>
          <span className="card-number">03</span>
          <div className="icon-box"><TimerReset /></div>
          <h3>Follow every move</h3>
          <p>Watch prices refresh and track market movement from one focused, consistent interface.</p>
          <div className="alert-pill"><Zap size={14} /> ODDS UPDATED <span>NOW</span></div>
        </article>
      </section>

      <section className="results" id="results">
        <div className="results-copy reveal">
          <span className="section-kicker">Data quality</span>
          <h2>Clean data. Clear market.</h2>
          <p>Odds are only useful when they are organized, timely, and easy to compare. That is the product.</p>
          <div className="principles">
            <div><Check size={17} /><span><strong>Consistent market structure</strong>Events, markets, books, and prices in a normalized format.</span></div>
            <div><Check size={17} /><span><strong>Visible timestamps</strong>Know when each displayed price was last refreshed.</span></div>
            <div><Check size={17} /><span><strong>No manufactured advice</strong>Market data without locks, touting, or betting recommendations.</span></div>
          </div>
        </div>
        <div className="scorecard reveal">
          <div className="scorecard-head"><span>DATA FEED / PREVIEW</span><span>LIVE STATUS</span></div>
          <div className="score-grid">
            <div><span>SPORTS</span><strong>7+</strong><small>Coverage preview</small></div>
            <div><span>BOOKS</span><strong>—</strong><small>Final list coming soon</small></div>
            <div><span>MARKETS</span><strong>LIVE</strong><small>Continuously refreshed</small></div>
            <div><span>FORMAT</span><strong>1</strong><small>Normalized view</small></div>
          </div>
          <div className="chart-placeholder">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d7ff46" stopOpacity=".26" /><stop offset="1" stopColor="#d7ff46" stopOpacity="0" /></linearGradient></defs>
              <path className="area" d="M0,130 C40,125 50,108 80,114 S125,95 155,100 S200,68 225,80 S270,62 295,66 S335,35 360,49 S405,30 430,35 S470,12 500,18 L500,150 L0,150Z" />
              <path className="line" d="M0,130 C40,125 50,108 80,114 S125,95 155,100 S200,68 225,80 S270,62 295,66 S335,35 360,49 S405,30 430,35 S470,12 500,18" />
            </svg>
            <span className="sample-badge">FEED PREVIEW</span>
          </div>
          <p className="score-note">Final sportsbook coverage and refresh specifications will be published before launch.</p>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="pricing-heading reveal">
          <span className="section-kicker">Odds access</span>
          <h2>One plan. Every line.</h2>
          <p>The market in one place, without the noise.</p>
        </div>
        <div className="price-card reveal">
          <div className="popular">FOUNDING MEMBER RATE</div>
          <div className="price-top">
            <div><span>ODDSLOOM / ODDS ACCESS</span><h3>$49<small>/month</small></h3></div>
            <div className="price-mark"><TrendingUp /></div>
          </div>
          <ul>
            <li><Check /> Live sportsbook odds</li>
            <li><Check /> Side-by-side price comparison</li>
            <li><Check /> Line movement visibility</li>
            <li><Check /> Multi-sport market coverage</li>
            <li><Check /> A fast, distraction-free dashboard</li>
          </ul>
          <a className="button primary full" href="mailto:hello@oddsloom.com?subject=OddsLoom%20odds%20access">Get odds access <ArrowRight size={18} /></a>
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
        <h2>See the whole market.<br />In one place.</h2>
        <a className="button primary" href="#pricing">Get odds access <ArrowRight size={18} /></a>
      </section>

      <footer>
        <div><Logo /><p>Every line. One clear view.</p></div>
        <div className="footer-links"><a href="#method">Coverage</a><a href="#results">Data quality</a><a href="#pricing">Pricing</a></div>
        <div className="legal">© {new Date().getFullYear()} OddsLoom. All rights reserved.<br />OddsLoom provides market data, not betting advice. Must be 21+.</div>
      </footer>
    </main>
  )
}

export default App
