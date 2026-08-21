export type ArticleBlock =
  | { type: 'paragraphs'; body: string[] }
  | { type: 'bullets'; items: string[] }
  | { type: 'steps'; items: Array<{ title: string; body: string }> }
  | { type: 'code'; language: string; filename: string; code: string; caption?: string }
  | { type: 'callout'; title: string; body: string; tone?: 'note' | 'warning' }
  | { type: 'table'; headers: string[]; rows: string[][]; caption?: string }

export type ArticleSection = {
  id: string
  title: string
  lede?: string
  blocks: ArticleBlock[]
}

export type DeveloperArticle = {
  slug: string
  title: string
  description: string
  summary: string
  seriesPosition: number
  readingMinutes: number
  updatedAt: string
  prerequisites: string[]
  outcomes: string[]
  sections: ArticleSection[]
}
