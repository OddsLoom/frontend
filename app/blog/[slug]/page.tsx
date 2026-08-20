import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageIntro, SubpageShell } from '../../components/SubpageShell'

type Article = { title: string; description: string; answer: string; sections: Array<[string, string]> }

const articles: Record<string, Article> = {
  'sports-betting-markets-explained': {
    title: 'Every Sports Betting Market Explained',
    description: 'A plain-language guide to moneylines, spreads, totals, props, futures, and parlays.',
    answer: 'Sports betting markets are different ways to predict what will happen in a sporting event. A moneyline asks who wins, a spread asks who wins after a handicap, a total asks how much scoring occurs, and props focus on a specific player or event.',
    sections: [
      ['Moneyline, spread, and total', 'A moneyline bet requires only an outright win. A spread adds or subtracts points from the result, so a favorite can win and still fail to cover. A total, or over/under, predicts whether combined scoring finishes above or below a posted number.'],
      ['Props, futures, and parlays', 'Player props focus on statistics such as points, passing yards, or strikeouts. Game props cover events such as the first team to score. Futures are settled later, such as a championship or award market. Parlays combine selections; every leg generally must win.'],
      ['The price still matters', 'Every market includes a price and usually a sportsbook margin called vig or overround. Compare the exact number and price across available legal operators. A larger payout is not evidence of better value, and no market guarantees a result.'],
    ],
  },
  'live-betting-markets-explained': {
    title: 'Live Betting Markets Explained', description: 'What you can bet on after a game begins and why in-game odds move.',
    answer: 'Live betting markets are wagers placed after an event starts. Sportsbooks may offer live moneylines, spreads, totals, team totals, player props, and short-window game props. Prices can change after every score, possession, injury, or major game-state update.',
    sections: [['Live moneylines and spreads', 'A live moneyline prices the winner from the current state. A live spread estimates the remaining margin while accounting for the score already recorded. Time, possession, player availability, and matchup quality all matter.'], ['Live totals and props', 'A live total estimates remaining scoring plus the score already recorded. Live player props account for a player’s current statistics, expected opportunities, and playing time. Foul trouble, substitutions, injuries, and blowouts can change those expectations quickly.'], ['Why markets suspend', 'Markets commonly suspend after a score, replay review, injury, possession change, or data-feed delay. The displayed price is not final until the wager is accepted. Check the sportsbook rules for overtime, abandoned events, player participation, and statistical corrections.']],
  },
  'moneyline-vs-spread-vs-total': {
    title: 'Moneyline vs. Spread vs. Total', description: 'How the three core markets ask different questions.',
    answer: 'A moneyline predicts the winner, a spread predicts the winner after applying a points or goals adjustment, and a total predicts whether combined scoring lands over or under a posted number.',
    sections: [['Moneyline', 'The only requirement is that the selected team or player wins under the market rules. The size of the victory does not matter. Favorites usually have negative American odds and underdogs positive odds.'], ['Spread', 'A favorite listed at -3.5 must win by at least four points. An underdog at +3.5 can win outright or lose by three or fewer. The exact number matters: -3 and -3.5 are different bets.'], ['Total', 'An over/under market ignores the winner and focuses on combined scoring. A game can have a favorite that wins comfortably while still finishing under a high total. Keep the market question separate from your team prediction.']],
  },
  'player-props-vs-game-props': {
    title: 'Player Props vs. Game Props', description: 'The difference between athlete-level and game-level markets.',
    answer: 'Player props are wagers on an individual athlete’s performance, while game props are wagers on events or statistics involving the entire contest. Each market has different inputs and settlement rules.',
    sections: [['Player props', 'Examples include points, rebounds, receptions, passing yards, strikeouts, shots, or goals. Opportunity is crucial: minutes, snaps, targets, at-bats, and role can matter as much as ability. Injuries, foul trouble, substitutions, and coaching decisions can change the line.'], ['Game props', 'Game props include first team to score, winning margin, total touchdowns, overtime, or a segment result. They depend more on team-level environment, tactics, pace, weather, and the relative strength of the teams.'], ['Correlation and rules', 'A fast game may affect both a player points prop and the game total, but related selections are not automatically good combinations. Check participation, overtime, postponement, and official-statistics rules before publication or wagering.']],
  },
  'sharp-vs-recreational-sportsbooks': {
    title: 'Sharp vs. Recreational Sportsbooks', description: 'How pricing, limits, products, and market influence differ.',
    answer: 'A sharp sportsbook generally offers competitive prices and reacts quickly to market information. A recreational sportsbook emphasizes casual users, promotions, parlays, and product experience. Neither label is permanent: sharpness varies by sport, market, jurisdiction, and time.',
    sections: [['Pricing and vig', 'Compare equivalent lines at the same moment. A two-way -110/-110 market implies about 104.76% before removing margin, while -105/-105 implies about 102.44%. Lower vig is generally cheaper, but stale prices and low limits matter too.'], ['Limits and movement', 'Limits can signal market depth, but they vary by account, event, jurisdiction, and market. A book moving first may be informative, or it may simply be correcting a stale feed or managing its own risk. Track repeated behavior rather than relying on one move.'], ['How to compare', 'Record timestamped prices, exact lines, market status, eventual close, and legal jurisdiction. Measure best-price frequency, overround, movement, and closing-line value across a meaningful sample. Avoid permanent rankings without data.']],
  },
  'which-sportsbooks-have-the-sharpest-odds': {
    title: 'Which Sportsbooks Have the Sharpest Odds?', description: 'A framework for comparing odds without permanent rankings.',
    answer: 'There is no sportsbook with the sharpest odds in every sport, market, jurisdiction, and moment. Identify competitive pricing by comparing timestamped odds, vig, line movement, limits, and closing-line value.',
    sections: [['Measure the exact price', 'Compare the same event, market, and number. -110 at -3 is not the same quote as -105 at -3.5. Track whether the price was merely displayed or accepted, especially in live markets.'], ['Measure market quality', 'Calculate overround, record which book offers the best price, and track which book moves first and whether others follow. Separate major sides and totals from props, futures, and low-liquidity markets.'], ['Publish the method', 'A credible OddsLoom comparison should state the sport, market, jurisdiction, date range, sample size, closing definition, and treatment of suspended or missing prices. Use authorized services and do not imply that sharp odds eliminate risk.']],
  },
  'how-to-measure-sportsbook-quality': {
    title: 'How to Measure Sportsbook Quality', description: 'Vig, limits, line movement, and closing-line accuracy.',
    answer: 'Measure sportsbook quality with multiple metrics: equivalent-price competitiveness, vig, observable limits, line movement, market leadership, availability, and closing-line accuracy. Results should be specific to a sport, market, jurisdiction, and date range.',
    sections: [['Vig and price', 'Convert both sides to implied probability and add them. A -110/-110 market is about 104.76%; -105/-105 is about 102.44%. Record the exact handicap because a better price on a worse number is not an apples-to-apples comparison.'], ['Limits and availability', 'Limits vary by account and market, so report them as context rather than a universal quality score. Also track how often a quote is available, accepted, or suspended before a wager can be placed.'], ['Closing accuracy', 'Record the opening quote, snapshots during the event window, and a consistently defined closing consensus. A book that tracks the close may be a useful market reference, but historical accuracy is not a guarantee of future performance.']],
  },
  'which-sportsbook-moves-first': {
    title: 'Which Sportsbook Moves First?', description: 'How to identify market-making behavior with timestamps.',
    answer: 'The sportsbook that moves first varies by sport and market. To identify market-making behavior, collect timestamped odds from multiple legal sportsbooks, compare equivalent lines, and check whether one operator repeatedly moves before the market follows.',
    sections: [['Build comparable snapshots', 'Record event, market, exact line, odds, timestamp, time zone, market status, and whether the quote was accepted. Separate pregame and live observations, where latency and suspensions are more significant.'], ['Separate number and price', 'A spread moving from -3 at -110 to -3 at -125 is a price move. Moving to -3.5 at -105 changes the number as well. Totals and props need the same treatment.'], ['Confirm the signal', 'A repeated sequence in which one book moves, several books follow, and the closing market remains near the adjustment is stronger evidence than one alert. Explain missing data and avoid treating leadership as a prediction guarantee.']],
  },
  'american-vs-decimal-vs-fractional-odds': {
    title: 'American vs. Decimal vs. Fractional Odds', description: 'Three ways to display the same underlying betting price.',
    answer: 'American, decimal, and fractional odds are three display formats for the same price. American odds use positive or negative numbers, decimal odds show total return per unit staked, and fractional odds show profit relative to the stake.',
    sections: [['American odds', 'Positive +200 means a $100 stake earns $200 profit. Negative -150 means risking $150 earns $100 profit; a $100 stake earns about $66.67.'], ['Decimal odds', 'Decimal odds include the original stake in the total return. At 3.00, a $100 wager returns $300, including $200 profit. Decimal prices are convenient for payout and parlay calculations.'], ['Fractional odds', 'At 2/1, a $100 stake earns $200 profit and returns $300 total. At 1/2, a $100 stake earns $50 profit. The formats are equivalent: +200 = 3.00 = 2/1.']],
  },
  'how-to-convert-american-decimal-fractional-odds': {
    title: 'How to Convert American, Decimal, and Fractional Odds', description: 'Formulas and worked examples for all three major formats.',
    answer: 'Convert positive American odds to decimal with 1 + odds/100; convert negative American odds with 1 + 100/absolute odds. Convert fractional odds by dividing the numerator by the denominator and adding 1.',
    sections: [['American to decimal', 'For +200: 1 + (200 / 100) = 3.00. For -150: 1 + (100 / 150) = 1.6667, usually displayed as 1.67.'], ['Decimal and fractional', 'Decimal to fractional is decimal minus 1. Therefore 2.25 becomes 1.25, or 5/4. Fractional to decimal is numerator divided by denominator plus 1.'], ['Implied probability', 'Raw implied probability is 1 / decimal odds. For American odds, +200 implies 100/(200+100) = 33.33%; -150 implies 150/(150+100) = 60%. These percentages include vig when taken from a market, so they are not automatically fair probabilities.']],
  },
  'why-are-american-odds-positive-or-negative': {
    title: 'Why Are American Odds Positive or Negative?', description: 'What the plus and minus signs actually mean.',
    answer: 'American odds use $100 as a reference. Positive odds show the profit from a $100 stake; negative odds show how much must be risked to win $100 in profit. The sign describes payout, not certainty.',
    sections: [['Positive odds', 'At +200, $100 earns $200 profit and returns $300 total. Positive numbers commonly identify underdogs, but the sign is fundamentally a payout instruction.'], ['Negative odds', 'At -150, risking $150 earns $100 profit. A $100 stake earns about $66.67. Larger negative numbers such as -250 generally indicate shorter prices than -120.'], ['Why -110 appears everywhere', 'In a spread or total market, both sides can be -110. The handicap or total is the outcome condition; -110 is the price. A $100 stake earns $90.91 profit. The market’s combined implied probability is about 104.76%.']],
  },
  'history-of-american-decimal-fractional-odds': {
    title: 'The History of Betting Odds Formats', description: 'How regional betting cultures shaped modern odds displays.',
    answer: 'Fractional odds are strongly associated with British and Irish racing, decimal odds with continental European and digital betting markets, and American odds with US sportsbook conventions. They are different notation systems for the same underlying price.',
    sections: [['Fractional tradition', 'Fractions such as 5/1 and 4/5 became familiar through British and Irish bookmakers and horse racing. They show profit relative to the stake. The format developed gradually rather than through one universally documented invention.'], ['Decimal adoption', 'Decimal odds show total return and are convenient for online platforms, betting exchanges, and parlay multiplication. A 2.50 price returns $250 on a $100 stake.'], ['American convention', 'US odds use a $100 reference: positive numbers show profit on $100, while negative numbers show risk required to win $100. Historical claims about a specific inventor or launch date should be verified against archival sources before publication.']],
  },
  'straight-bets-vs-parlays-vs-same-game-parlays': {
    title: 'Straight Bets vs. Parlays vs. Same-Game Parlays', description: 'Payouts, correlation, and risk across bet formats.',
    answer: 'A straight bet is one wager on one outcome. A parlay combines selections from multiple events, while a same-game parlay combines selections from one event. Parlays can advertise larger payouts, but every leg must generally win.',
    sections: [['Straight bets', 'A single wager isolates one market and makes price comparison straightforward. A push or void is handled under the sportsbook’s rules.'], ['Parlays', 'If three independent selections each have a 60% chance of winning, all three win only 21.6% of the time under that simple assumption. Actual probabilities and prices may differ because selections can be correlated and margins are embedded.'], ['Same-game parlays', 'SGP legs may depend on the same game script. Sportsbooks can reprice or restrict correlated combinations. Evaluate the full ticket, not only the largest advertised payout.']],
  },
  'derivative-betting-markets': {
    title: 'What Are Derivative Betting Markets?', description: 'First halves, quarters, periods, innings, and team totals.',
    answer: 'Derivative markets are based on part of an event rather than the full game. They include first-half lines, quarter or period markets, first-five-inning bets, and team totals.',
    sections: [['Shorter segments', 'A team can win the first half and lose the game. Smaller windows are more sensitive to one unusual sequence, such as a turnover, power play, foul run, or shooting streak.'], ['Baseball examples', 'First-five markets emphasize starting pitchers and reduce bullpen effects. Full-game markets also depend on relief pitching and late-game strategy. Minimum-inning and postponement rules vary by operator.'], ['Use context carefully', 'Derivative markets may have wider prices, lower liquidity, and greater variance. Track a meaningful sample and check whether overtime, shortened events, player participation, and statistical corrections count.']],
  },
  'closing-line-value': {
    title: 'What Is Closing-Line Value?', description: 'How CLV measures entry price without guaranteeing results.',
    answer: 'Closing-line value compares the price accepted by a bettor with the final comparable market price before an event begins. Betting +120 and closing at +105 means the bettor obtained a better price than the close, but positive CLV is a process metric—not a guarantee of profit.',
    sections: [['Simple examples', 'Betting +3 and closing at +2.5 is favorable because the bettor received more points. Betting -110 and closing -125 is favorable because the bettor paid less for the same side.'], ['Measure consistently', 'Define the closing source, timestamp, market, treatment of vig, voids, pushes, and stale prices. Different books can close at different numbers, especially in less liquid markets.'], ['Know the limits', 'A bettor can have positive CLV and lose in a short sample, or win while having negative CLV. Track sport, market, price, timing, stake, closing source, and result over a substantial sample.']],
  },
  'how-to-read-line-movement-and-clv': {
    title: 'How to Read Line Movement and CLV', description: 'A practical framework for interpreting odds changes.',
    answer: 'Line movement is a change in a market’s number or price. Closing-line value compares your accepted price with the final market price. Both can provide context, but neither guarantees the eventual winner.',
    sections: [['Price versus number', 'A spread moving from -3 at -110 to -3 at -120 changes price. Moving to -3.5 at -105 changes the number and price. Record both because the bettor’s condition has changed.'], ['Why lines move', 'Injuries, lineups, weather, starting pitchers, rest, professional action, market consensus, risk management, and stale-data corrections can all move a line. “The line moved, so bet the other side” is not a reliable rule.'], ['Reverse movement and CLV', 'Reverse line movement is commonly used for movement against the apparent majority of tickets, but ticket data can be incomplete. Use it as context, then evaluate the exact number, price, liquidity, and closing result.']],
  },
}

export function generateStaticParams() { return Object.keys(articles).map(slug => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = articles[slug]
  return article ? { title: article.title, description: article.description } : {}
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles[slug]
  if (!article) notFound()
  return <SubpageShell>
    <PageIntro kicker="ODDSLOOM FIELD GUIDE" title={article.title}>{article.description}</PageIntro>
    <article className="narrow-prose">
      <p className="notice"><strong>QUICK ANSWER</strong><span>{article.answer}</span></p>
      {article.sections.map(([heading, copy]) => <section key={heading}><h2>{heading}</h2><p>{copy}</p></section>)}
      <section><h2>Keep the context in view</h2><p>Sports betting involves financial risk. These guides explain market mechanics, not guaranteed strategies or financial advice. Follow local laws, use authorized services, set a budget, and never chase losses.</p><Link className="docs-next" href="/blog"><span>ODDSLOOM FIELD GUIDE</span><strong>Back to all guides →</strong></Link></section>
    </article>
  </SubpageShell>
}
