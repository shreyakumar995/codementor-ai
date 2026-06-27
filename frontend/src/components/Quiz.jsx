import { useState } from 'react'

function getScoreMessage(score, total) {
  if (score === total) return 'Perfect! You nailed every question.'
  if (score === total - 1) return 'Good job! One more review and you will have it.'
  return 'Keep reviewing — practice makes progress.'
}

export default function Quiz({ questions, onComplete, onSkip }) {
  const [selected, setSelected] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const totalQuestions = questions.length
  const allAnswered =
    totalQuestions > 0 &&
    questions.every((_, index) => selected[index] !== undefined)

  const handleSelect = (questionIndex, optionIndex) => {
    if (submitted) return
    setSelected((prev) => ({ ...prev, [questionIndex]: optionIndex }))
  }

  const handleSubmit = () => {
    if (!allAnswered || submitted) return

    const calculatedScore = questions.reduce((count, question, index) => {
      return selected[index] === question.correct_index ? count + 1 : count
    }, 0)

    setScore(calculatedScore)
    setSubmitted(true)
    onComplete(calculatedScore)
  }

  const getOptionClasses = (questionIndex, optionIndex, correctIndex) => {
    const isSelected = selected[questionIndex] === optionIndex
    const isCorrect = optionIndex === correctIndex

    if (!submitted) {
      return isSelected
        ? 'border-blue-500 bg-blue-600/20 text-blue-100'
        : 'border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500 hover:bg-gray-800'
    }

    if (isCorrect) {
      return 'border-green-500 bg-green-600/20 text-green-100'
    }

    if (isSelected) {
      return 'border-red-500 bg-red-600/20 text-red-100'
    }

    return 'border-gray-800 bg-gray-950 text-gray-500'
  }

  if (totalQuestions === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 text-sm text-gray-400">
        No quiz questions available.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">Quick Quiz</h3>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-400 hover:text-gray-200"
        >
          Skip
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((question, questionIndex) => (
          <div
            key={questionIndex}
            className="rounded-lg border border-gray-800 bg-gray-950 p-4"
          >
            <p className="mb-3 text-sm font-medium text-gray-100">
              {questionIndex + 1}. {question.q}
            </p>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  type="button"
                  onClick={() => handleSelect(questionIndex, optionIndex)}
                  disabled={submitted}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition disabled:cursor-default ${getOptionClasses(
                    questionIndex,
                    optionIndex,
                    question.correct_index,
                  )}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="mt-5 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          Submit
        </button>
      ) : (
        <div className="mt-5 rounded-lg border border-gray-700 bg-gray-950 p-4">
          <p className="text-lg font-semibold text-gray-100">
            Score: {score}/{totalQuestions}
          </p>
          <p className="mt-2 text-sm text-gray-300">
            {getScoreMessage(score, totalQuestions)}
          </p>
        </div>
      )}
    </div>
  )
}
