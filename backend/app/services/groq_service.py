import json
import os
import re

from groq import Groq
_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set")
        _client = Groq(api_key=api_key)
    return _client

SYSTEM_PROMPT = """You are CodeMentor, a patient beginner-friendly coding tutor.
Always explain clearly and avoid jargon when possible.
You MUST respond using this exact 4-section structure and headings:

## What is wrong
- Explain the bug in plain English.

## Why it happens
- Explain the conceptual root cause.

## The fix
- Provide corrected code with comments.

## What you learned
- Give a one-sentence takeaway.
"""

QUIZ_SYSTEM_PROMPT = """You are CodeMentor, a patient beginner-friendly coding tutor.
Generate quiz questions to reinforce what the student learned from a bug explanation.

You MUST return ONLY valid JSON with no markdown, no backticks, and no preamble.
Use this exact schema:
{
  "questions": [
    {
      "q": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_index": 0
    }
  ]
}

Rules:
- Return 3 to 5 questions.
- Each question must have exactly 4 options.
- correct_index must be 0, 1, 2, or 3.
- Output JSON only. No extra text before or after the JSON.
"""


def get_code_explanation(code, language, error_message=""):
    user_message = (
        f"Language: {language}\n\n"
        f"Code:\n{code}\n\n"
        f"Error message:\n{error_message if error_message else 'Not provided'}"
    )

    completion = _get_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    return completion.choices[0].message.content


def get_quiz_questions(bug_type, language, explanation):
    user_message = (
        f"Bug type: {bug_type}\n\n"
        f"Language: {language}\n\n"
        f"Explanation:\n{explanation}"
    )

    completion = _get_client().chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": QUIZ_SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.4,
        max_tokens=600,
    )

    raw_response = completion.choices[0].message.content
    cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw_response).strip()

    try:
        data = json.loads(cleaned)
        return data.get("questions", [])
    except json.JSONDecodeError:
        print(raw_response)
        return []
        