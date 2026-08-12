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
  X,
  Zap,
} from 'lucide-react'

const feedPreview = [
  { channel: 'odds.update', event: 'NBA:MIN@DEN', market: 'spread', source: 'book_a', sequence: '018492', price: '-105' },
  { channel: 'odds.update', event: 'MLB:CHC@STL', market: 'total', source: 'book_b', sequence: '018493', price: '+102' },
  { channel: 'odds.update', event: 'WNBA:NYL@PHX', market: 'moneyline', source: 'book_c', sequence: '018494', price: '-120' },
]

const faqs = [
  ['Who is OddsLoom built for?', 'Developers and teams building automated betting systems, quantitative models, odds comparison products, analytics tools, and other data-driven applications.'],
  ['How will data be delivered?', 'The beta provides a versioned REST snapshot followed by authenticated, ordered WebSocket deltas. After a reconnect or sequence gap, clients obtain a fresh snapshot before deltas resume.'],
  ['Which books and markets will be covered?', 'The live manifest lists every release-gated actively ingested sportsbook, its represented jurisdictions, and every ingested sport and league. Within that coverage, OddsLoom publishes every observed canonical market; provider-specific and unresolved markets are excluded.'],
  ['Can I integrate before launch?', 'Qualified design partners may receive sample payloads, sandbox access, or a beta key as validation permits. Historical data and production access are not part of the beta promise.'],
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
          <a href="#method" onClick={() => setMenuOpen(false)}>Pipeline</a>
          <a href="/docs" onClick={() => setMenuOpen(false)}>API docs</a>
          <a href="/coverage" onClick={() => setMenuOpen(false)}>Coverage</a>
          <a className="nav-cta" href="/beta" onClick={() => setMenuOpen(false)}>Request API access <ArrowRight size={15} /></a>
        </div>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy reveal visible">
          <div className="eyebrow"><span className="live-dot" /> Real-time odds infrastructure</div>
          <h1>Every update.<br />One <em>live feed.</em></h1>
          <p className="hero-sub">Normalized sportsbook odds delivered for automated systems. Subscribe once, process a consistent schema, and react as the market moves.</p>
          <div className="hero-actions">
            <a className="button primary" href="/beta">Request beta access <ArrowRight size={18} /></a>
            <a className="button secondary" href="#method">Explore the pipeline</a>
          </div>
          <p className="microcopy"><ShieldCheck size={14} /> Normalized schema <span /> WebSocket delivery</p>
        </div>

        <div className="terminal-wrap reveal visible">
          <div className="terminal-glow" />
          <div className="terminal">
            <div className="terminal-head">
              <div><span className="status-dot" /> FEED PREVIEW</div>
              <span>WSS / CONNECTED</span>
            </div>
            <div className="signal-summary">
              <div><span>DELIVERY</span><strong>WS</strong></div>
              <div><span>PAYLOAD</span><strong className="lime">JSON</strong></div>
              <div className="pulse"><Radio size={16} /> STREAMING</div>
            </div>
            <div className="pick-label"><span>INCREMENTAL UPDATES</span><span>PRICE</span></div>
            {feedPreview.map((update, index) => (
              <div className="pick-row" key={update.sequence}>
                <span className="pick-index">0{index + 1}</span>
                <div className="pick-main">
                  <span><b>{update.channel}</b> seq:{update.sequence}</span>
                  <strong>{update.event} <small>{update.market}</small></strong>
                  <span>source:{update.source}</span>
                </div>
                <span className="edge">{update.price}</span>
              </div>
            ))}
            <div className="terminal-foot"><Zap size={14} /> Illustrative schema preview — not a production feed.</div>
          </div>
        </div>
      </section>

      <div className="ticker" aria-label="Market coverage">
        <div className="ticker-track">
          {[0, 1].map(copy => (
            <div className="ticker-set" key={copy}>
              <span>ALL INGESTED SPORTS &amp; LEAGUES</span><i /> <span>EVERY CANONICAL MARKET</span><i /> <span>RELEASE-GATED LIVE MANIFEST</span><i />
            </div>
          ))}
        </div>
      </div>

      <section className="statement reveal" id="method">
        <span className="section-kicker">The pipeline</span>
        <h2>Stop adapting to every book.<br />Build against <em>one feed.</em></h2>
        <p>Sportsbook data arrives in different shapes and changes continuously. OddsLoom is being built to turn those updates into a consistent stream for software—not another betting dashboard.</p>
      </section>

      <section className="method-cards reveal">
        <article>
          <span className="card-number">01</span>
          <div className="icon-box"><BarChart3 /></div>
          <h3>Ingest continuously</h3>
          <p>Source updates enter a persistent collection pipeline designed around live sportsbook market changes.</p>
          <div className="mini-chart"><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="featured-card">
          <span className="card-number">02</span>
          <div className="icon-box"><Sparkles /></div>
          <h3>Normalize once</h3>
          <p>Events, participants, markets, outcomes, prices, and source timestamps map into a versioned common schema.</p>
          <div className="gauge"><span>SCHEMA</span><strong>VERSIONED</strong><div><i /></div></div>
        </article>
        <article>
          <span className="card-number">03</span>
          <div className="icon-box"><TimerReset /></div>
          <h3>Stream the deltas</h3>
          <p>Consumers receive a snapshot, then ordered incremental updates built for stateful automated systems.</p>
          <div className="alert-pill"><Zap size={14} /> DELTA EMITTED <span>SEQ +1</span></div>
        </article>
      </section>

      <section className="results" id="results">
        <div className="results-copy reveal">
          <span className="section-kicker">The data contract</span>
          <h2>Predictable inputs for automated systems.</h2>
          <p>A live feed is only useful when consumers can build state safely. The approved beta contract defines explicit ordering, timing, and recovery semantics; implementation and measured coverage remain under validation.</p>
          <div className="principles">
            <div><Check size={17} /><span><strong>Stable identifiers</strong>Canonical IDs connect events, markets, outcomes, and sources across updates.</span></div>
            <div><Check size={17} /><span><strong>Source-aware timestamps</strong>Payloads distinguish observed, ingested, and emitted time where available.</span></div>
            <div><Check size={17} /><span><strong>Snapshot recovery</strong>Reconnect behavior is designed to restore state before deltas resume.</span></div>
          </div>
        </div>
        <div className="scorecard reveal">
          <div className="scorecard-head"><span>PROTOCOL / PREVIEW</span><span>DESIGN TARGET</span></div>
          <div className="score-grid">
            <div><span>TRANSPORT</span><strong>WS</strong><small>Real-time stream</small></div>
            <div><span>ENCODING</span><strong>JSON</strong><small>Typed payloads</small></div>
            <div><span>STATE</span><strong>S+D</strong><small>Snapshot + deltas</small></div>
            <div><span>ORDERING</span><strong>SEQ</strong><small>Sequence-aware</small></div>
          </div>
          <div className="chart-placeholder">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d7ff46" stopOpacity=".26" /><stop offset="1" stopColor="#d7ff46" stopOpacity="0" /></linearGradient></defs>
              <path className="area" d="M0,130 C40,125 50,108 80,114 S125,95 155,100 S200,68 225,80 S270,62 295,66 S335,35 360,49 S405,30 430,35 S470,12 500,18 L500,150 L0,150Z" />
              <path className="line" d="M0,130 C40,125 50,108 80,114 S125,95 155,100 S200,68 225,80 S270,62 295,66 S335,35 360,49 S405,30 430,35 S470,12 500,18" />
            </svg>
            <span className="sample-badge">DESIGN PREVIEW</span>
          </div>
          <p className="score-note">Protocol details and performance guarantees will be published after production validation.</p>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="pricing-heading reveal">
          <span className="section-kicker">Design partner beta</span>
          <h2>Build against the feed early.</h2>
          <p>Tell us where your system overlaps the release-gated manifest and help validate the beta delivery.</p>
        </div>
        <div className="price-card reveal">
          <div className="popular">PRIVATE BETA</div>
          <div className="price-top">
            <div><span>ODDSLOOM / DEVELOPER ACCESS</span><h3>BETA</h3></div>
            <div className="price-mark"><Radio /></div>
          </div>
          <ul>
            <li><Check /> Real-time normalized odds feed</li>
            <li><Check /> Snapshot and incremental updates</li>
            <li><Check /> Direct input on validation priorities</li>
            <li><Check /> Sample payloads and integration guidance</li>
            <li><Check /> Pricing shared before any paid conversion</li>
          </ul>
          <a className="button primary full" href="/beta">Request API beta access <ArrowRight size={18} /></a>
          <p className="price-note">No payment required · Qualified design partners only</p>
        </div>
      </section>

      <section className="faq reveal">
        <div><span className="section-kicker">Technical questions</span><h2>Before you integrate.</h2></div>
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
        <span className="section-kicker">Built for machines, not tabs</span>
        <h2>One connection.<br />Every update.</h2>
        <a className="button primary" href="/beta">Request beta access <ArrowRight size={18} /></a>
      </section>

      <footer>
        <div><Logo /><p>Real-time odds infrastructure.</p></div>
        <div className="footer-links"><a href="/about">About</a><a href="/docs">Docs</a><a href="/coverage">Coverage</a><a href="/privacy">Privacy</a></div>
        <div className="legal">© {new Date().getFullYear()} OddsLoom. All rights reserved.<br />Odds data infrastructure for developers and automated systems.</div>
      </footer>
    </main>
  )
}

export default App
