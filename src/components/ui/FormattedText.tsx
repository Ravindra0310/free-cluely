import React, { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check, Code } from "lucide-react"

export function detectLanguage(code: string, langHint?: string): string {
  if (langHint) {
    const hint = langHint.trim().toLowerCase()
    if (["cpp", "c++"].includes(hint)) return "cpp"
    if (["py", "python"].includes(hint)) return "python"
    if (["js", "javascript"].includes(hint)) return "javascript"
    if (["ts", "typescript"].includes(hint)) return "typescript"
    if (["java"].includes(hint)) return "java"
    if (["go", "golang"].includes(hint)) return "go"
    if (["rs", "rust"].includes(hint)) return "rust"
    if (["cs", "csharp", "c#"].includes(hint)) return "csharp"
    if (["c"].includes(hint)) return "c"
    if (["sql"].includes(hint)) return "sql"
    if (["json"].includes(hint)) return "json"
    if (["html"].includes(hint)) return "html"
    if (["css"].includes(hint)) return "css"
    if (["bash", "sh", "shell"].includes(hint)) return "bash"
    return hint
  }

  // Pattern detection fallback
  if (/#include\s*<|std::|vector<|cout\s*<<|cin\s*>>/.test(code)) return "cpp"
  if (/public\s+class|System\.out\.println|ArrayList<|public\s+static\s+void\s+main/.test(code)) return "java"
  if (/def\s+\w+\s*\(|import\s+\w+|self\.|print\s*\(/.test(code)) return "python"
  if (/const\s+\w+\s*=|let\s+\w+\s*=|function\s*\w*\(|console\.log/.test(code)) return "javascript"
  if (/package\s+main|func\s+\w+\s*\(|fmt\.Print/.test(code)) return "go"
  if (/fn\s+\w+\s*\(|let\s+mut\s+|println!/.test(code)) return "rust"

  return "clike"
}

export function getLanguageDisplayName(lang: string): string {
  const map: Record<string, string> = {
    cpp: "C++",
    python: "Python",
    java: "Java",
    javascript: "JavaScript",
    typescript: "TypeScript",
    go: "Go",
    rust: "Rust",
    csharp: "C#",
    c: "C",
    sql: "SQL",
    json: "JSON",
    html: "HTML",
    css: "CSS",
    bash: "Bash",
    shell: "Shell"
  }
  return map[lang.toLowerCase()] || (lang ? lang.toUpperCase() : "Code")
}

export function cleanCodeFence(code: string): { code: string; language: string } {
  let trimmed = code.trim()
  let language = ""

  // Check if code is wrapped in triple backticks
  const match = trimmed.match(/^```([a-zA-Z0-9_+#-]*)\n([\s\S]*?)\n?```$/)
  if (match) {
    language = match[1]
    trimmed = match[2].trim()
  } else if (trimmed.startsWith("```")) {
    const lines = trimmed.split("\n")
    const firstLine = lines[0].replace(/^```/, "").trim()
    if (lines[lines.length - 1].trim() === "```") {
      lines.pop()
    }
    lines.shift()
    language = firstLine
    trimmed = lines.join("\n").trim()
  }

  const detectedLang = detectLanguage(trimmed, language)
  return { code: trimmed, language: detectedLang }
}

interface CodeBlockProps {
  code: string
  language: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false)
  const displayLang = getLanguageDisplayName(language)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <div className="my-2 rounded-lg overflow-hidden border border-gray-700/60 bg-[#1e1e2e] shadow-md w-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181825] border-b border-gray-700/60 text-xs text-gray-300 select-none">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-blue-400">
          <Code className="w-3.5 h-3.5" />
          <span>{displayLang}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-[11px] font-medium"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-2 overflow-x-auto text-xs">
        <SyntaxHighlighter
          language={language || "clike"}
          style={dracula}
          showLineNumbers={code.split("\n").length > 1}
          customStyle={{
            margin: 0,
            padding: "0.5rem 0.75rem",
            background: "transparent",
            fontSize: "12px",
            lineHeight: "1.45"
          }}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

interface FormattedTextProps {
  text: string
  isUser?: boolean
  className?: string
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, isUser = false, className = "" }) => {
  if (!text) return null

  // Split text by markdown code blocks: ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_+#-]*)\n([\s\S]*?)```/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index)
    if (textBefore) {
      parts.push(renderInlineMarkdown(textBefore, isUser, `text-${lastIndex}`))
    }

    const langHint = match[1]
    const codeContent = match[2].trim()
    const detectedLang = detectLanguage(codeContent, langHint)

    parts.push(
      <CodeBlock key={`code-${match.index}`} code={codeContent} language={detectedLang} />
    )

    lastIndex = match.index + match[0].length
  }

  const remainingText = text.slice(lastIndex)
  if (remainingText) {
    parts.push(renderInlineMarkdown(remainingText, isUser, `text-${lastIndex}`))
  }

  return <div className={`formatted-text-container space-y-1 ${className}`}>{parts}</div>
}

function renderInlineMarkdown(rawText: string, isUser: boolean, keyPrefix: string): React.ReactNode {
  const lines = rawText.split("\n")

  return (
    <div key={keyPrefix} className="space-y-1">
      {lines.map((line, idx) => {
        const trimmedLine = line.trim()

        if (!trimmedLine) {
          return <div key={idx} className="h-1.5" />
        }

        // Headers
        if (line.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-semibold text-[13px] text-blue-300 mt-2 mb-1">
              {parseFormatting(line.replace(/^###\s+/, ""), isUser)}
            </h4>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-semibold text-sm text-blue-200 mt-2 mb-1">
              {parseFormatting(line.replace(/^##\s+/, ""), isUser)}
            </h3>
          )
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={idx} className="font-bold text-base text-white mt-2 mb-1">
              {parseFormatting(line.replace(/^#\s+/, ""), isUser)}
            </h2>
          )
        }

        // Bullet lists (- or * or 1.)
        const bulletMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/)
        if (bulletMatch) {
          const content = bulletMatch[3]
          return (
            <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
              <span className="text-blue-400 mt-1 shrink-0 text-[10px]">•</span>
              <div className="flex-1">{parseFormatting(content, isUser)}</div>
            </div>
          )
        }

        return (
          <p key={idx} className="leading-relaxed">
            {parseFormatting(line, isUser)}
          </p>
        )
      })}
    </div>
  )
}

function parseFormatting(text: string, isUser: boolean): React.ReactNode[] {
  // Matches inline code (`code`), bold (**text**), italics (*text*)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith("`") && token.endsWith("`")) {
      const codeContent = token.slice(1, -1)
      parts.push(
        <code
          key={match.index}
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
            isUser ? "bg-gray-800 text-gray-200" : "bg-gray-800/80 text-blue-300 border border-gray-700/50"
          }`}
        >
          {codeContent}
        </code>
      )
    } else if (token.startsWith("**") && token.endsWith("**")) {
      const boldContent = token.slice(2, -2)
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {boldContent}
        </strong>
      )
    } else if (token.startsWith("*") && token.endsWith("*")) {
      const italicContent = token.slice(1, -1)
      parts.push(
        <em key={match.index} className="italic text-gray-200">
          {italicContent}
        </em>
      )
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

export default FormattedText
