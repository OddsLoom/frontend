import type { DeveloperArticle } from './types'

export const articles: DeveloperArticle[] = []

export function getArticle(slug: string) {
  return articles.find(article => article.slug === slug)
}

export type { DeveloperArticle } from './types'
