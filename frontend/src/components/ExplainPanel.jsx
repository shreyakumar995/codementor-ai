import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function ExplainPanel({ explanation, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-800 bg-gray-950 p-4">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
          <span>AI is analysing your code...</span>
        </div>
      </div>
    )
  }

  if (!explanation) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-800 bg-gray-950 p-4">
        <p className="text-sm text-gray-500">
          AI explanation will appear here after debugging.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-[400px] rounded-lg border border-gray-800 bg-gray-950 p-4 text-sm text-gray-300">
      <ReactMarkdown
        components={{
          h2({ children }) {
            return (
              <h2 className="mb-3 mt-6 border-b border-gray-700 pb-2 text-lg font-semibold text-blue-400 first:mt-0">
                {children}
              </h2>
            )
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const codeText = String(children).replace(/\n$/, '')

            if (match) {
              return (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: '0.75rem 0',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  {codeText}
                </SyntaxHighlighter>
              )
            }

            return (
              <code
                className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-gray-200"
                {...props}
              >
                {children}
              </code>
            )
          },
          p({ children }) {
            return <p className="mb-3 leading-relaxed text-gray-300">{children}</p>
          },
          ul({ children }) {
            return (
              <ul className="mb-3 list-disc space-y-1 pl-5 text-gray-300">
                {children}
              </ul>
            )
          },
        }}
      >
        {explanation}
      </ReactMarkdown>
    </div>
  )
}
