import { createHmac, randomUUID } from 'node:crypto'
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type Application = Record<string, unknown>

const limits: Record<string, number> = { name: 100, email: 200, company: 160, useCase: 1200, coverage: 1200, provider: 160, budget: 40 }
const notificationEmail = 'contact@oddsloom.com'

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

async function notifyContact(application: Record<string, string>) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !fromEmail) {
    console.warn('Beta application notification skipped: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured')
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: [notificationEmail],
      reply_to: application.email,
      subject: `New OddsLoom beta application from ${application.name}`,
      text: [
        `Name: ${application.name}`,
        `Email: ${application.email}`,
        `Company or project: ${application.company}`,
        `What they are building: ${application.useCase}`,
        `Required coverage: ${application.coverage}`,
        `Current provider: ${application.provider || 'Not provided'}`,
        `Monthly data budget: ${application.budget || 'Not provided'}`,
      ].join('\n'),
    }),
  })

  if (!response.ok) throw new Error(`Resend returned HTTP ${response.status}`)
}

export async function POST(request: Request) {
  let body: Application
  try { body = await request.json() as Application } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }

  if (clean(body.website, 200)) return NextResponse.json({ ok: true }, { status: 201 })

  const application = Object.fromEntries(Object.entries(limits).map(([key, max]) => [key, clean(body[key], max)]))
  const required = ['name', 'email', 'company', 'useCase', 'coverage']
  if (required.some(key => !application[key]) || body.consent !== 'yes') return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })

  const startedAt = Number(body.startedAt)
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1800) return NextResponse.json({ error: 'Please review the form and try again.' }, { status: 400 })

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const hashKey = process.env.APPLICATION_HASH_SALT ?? process.env.BLOB_READ_WRITE_TOKEN ?? 'local-development'
  const ipHash = createHmac('sha256', hashKey).update(forwardedFor).digest('hex')
  const submittedAt = new Date().toISOString()
  const record = { id: randomUUID(), ...application, submittedAt, ipHash, userAgent: clean(request.headers.get('user-agent'), 300) }

  try {
    await put(`applications/${submittedAt.slice(0, 10)}/${record.id}.json`, JSON.stringify(record), { access: 'private', contentType: 'application/json', addRandomSuffix: false })
  } catch (error) {
    console.error('Unable to persist beta application', error)
    return NextResponse.json({ error: 'The application service is temporarily unavailable. Please try again.' }, { status: 503 })
  }

  try {
    await notifyContact(application as Record<string, string>)
  } catch (error) {
    console.error('Unable to notify contact about beta application', error)
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
