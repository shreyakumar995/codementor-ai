import MonacoEditor from '@monaco-editor/react'

const LANGUAGES = ['python', 'javascript', 'java', 'cpp']

export default function Editor({
  value,
  onChange,
  language,
  onLanguageChange,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center">
        <label htmlFor="editor-language" className="mr-2 text-sm text-gray-300">
          Language
        </label>
        <select
          id="editor-language"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {LANGUAGES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <MonacoEditor
        height="400px"
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}
