'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return <button className="copy-code" type="button" onClick={copy} aria-label="Copy code to clipboard">
    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    {copied ? 'Copied' : 'Copy'}
  </button>
}
