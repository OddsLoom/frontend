import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Article } from '../_components/Article'
import { articles, getArticle } from '../_content'

export function generateStaticParams() {
  return articles.map(article => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  return article ? {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: { type: 'article', title: article.title, description: article.description, url: `/blog/${article.slug}` },
  } : {}
}

export default async function ArticleRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()
  return <Article article={article} />
}
