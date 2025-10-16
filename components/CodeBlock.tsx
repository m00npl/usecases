'use client'
import { useState } from 'react'

export function CodeBlock({ code, lang }: { code: string; lang?: string }){
  const [copied, setCopied] = useState(false)
  return (
    <pre>
      <button className="copy-btn" onClick={()=>{navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false), 1200)}}>
        {copied ? "Copied" : "Copy"}
      </button>
      <code className={"language-"+(lang||"ts")}>{code}</code>
    </pre>
  )
}
