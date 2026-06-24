import os

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
