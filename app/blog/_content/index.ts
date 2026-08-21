import type { DeveloperArticle } from './types'
import { canonicalIdsCrossBookMarkets } from './canonical-ids-cross-book-markets'
import { resilientLiveOddsClient } from './resilient-live-odds-client'
import { sequenceGapsAndBackpressure } from './sequence-gaps-and-backpressure'

export const articles: DeveloperArticle[] = [
  resilientLiveOddsClient,
  sequenceGapsAndBackpressure,
  canonicalIdsCrossBookMarkets,
]

export function getArticle(slug: string) {
  return articles.find(article => article.slug === slug)
}

export type { DeveloperArticle } from './types'
