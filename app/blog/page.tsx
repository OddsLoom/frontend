import type { Metadata } from 'next'
import Link from 'next/link'
import { SubpageShell, PageIntro } from '../components/SubpageShell'

export const metadata: Metadata = {
  title: 'Sports Betting Guides',
  description: 'Plain-language guides to sports betting markets, live odds, sportsbook pricing, and betting odds formats.',
}

const articles = [
  ['sports-betting-markets-explained', 'Every Sports Betting Market Explained', 'Moneylines, spreads, totals, props, futures, and parlays.'],
  ['live-betting-markets-explained', 'Live Betting Markets Explained', 'What you can bet on after a game begins and why prices move.'],
  ['moneyline-vs-spread-vs-total', 'Moneyline vs. Spread vs. Total', 'How the three core markets ask different questions.'],
  ['player-props-vs-game-props', 'Player Props vs. Game Props', 'The difference between athlete-level and game-level markets.'],
  ['sharp-vs-recreational-sportsbooks', 'Sharp vs. Recreational Sportsbooks', 'How pricing, limits, products, and market influence differ.'],
  ['which-sportsbooks-have-the-sharpest-odds', 'Which Sportsbooks Have the Sharpest Odds?', 'A framework for comparing odds without permanent rankings.'],
  ['how-to-measure-sportsbook-quality', 'How to Measure Sportsbook Quality', 'Vig, limits, line movement, and closing-line accuracy.'],
  ['which-sportsbook-moves-first', 'Which Sportsbook Moves First?', 'How to identify market-making behavior with timestamps.'],
  ['american-vs-decimal-vs-fractional-odds', 'American vs. Decimal vs. Fractional Odds', 'Three ways to display the same underlying betting price.'],
  ['how-to-convert-american-decimal-fractional-odds', 'How to Convert Betting Odds', 'Formulas and worked examples for all three major formats.'],
  ['why-are-american-odds-positive-or-negative', 'Why Are American Odds Positive or Negative?', 'What the plus and minus signs actually mean.'],
  ['history-of-american-decimal-fractional-odds', 'The History of Betting Odds Formats', 'How regional betting cultures shaped modern odds displays.'],
  ['straight-bets-vs-parlays-vs-same-game-parlays', 'Straight Bets vs. Parlays vs. Same-Game Parlays', 'Payouts, correlation, and risk across bet formats.'],
  ['derivative-betting-markets', 'What Are Derivative Betting Markets?', 'First halves, quarters, periods, innings, and team totals.'],
  ['closing-line-value', 'What Is Closing-Line Value?', 'How CLV measures entry price without guaranteeing results.'],
  ['how-to-read-line-movement-and-clv', 'How to Read Line Movement and CLV', 'A practical framework for interpreting odds changes.'],
]

export default function BlogIndex() {
  return <SubpageShell>
    <PageIntro kicker="ODDSLOOM FIELD GUIDE" title="Understand the market before you read the number.">
      These guides explain the mechanics behind sportsbook markets, live odds, pricing, and line movement in plain language. They are educational resources, not betting advice or guarantees.
    </PageIntro>
    <div className="content-grid">
      {articles.map(([slug, title, description], index) => <Link className="content-card" href={`/blog/${slug}`} key={slug}>
        <span>{String(index + 1).padStart(2, '0')} / GUIDE</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <p><span>READ GUIDE →</span></p>
      </Link>)}
    </div>
  </SubpageShell>
}
