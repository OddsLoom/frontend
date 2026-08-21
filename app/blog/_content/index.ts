import type { DeveloperArticle } from './types'
import { resilientLiveOddsClient } from './resilient-live-odds-client'

export const articles: DeveloperArticle[] = [resilientLiveOddsClient]

export function getArticle(slug: string) {
  return articles.find(article => article.slug === slug)
}

export type { DeveloperArticle } from './types'
