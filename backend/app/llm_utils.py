from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_pre_visit_summary(symptoms: str):
    try:
        prompt = f"""Analyse these symptoms and return ONLY a JSON object (no other text, no markdown) with exactly these keys:
"urgency_level" (one of: Low, Medium, High),
"chief_complaint" (short string),
"suggested_questions" (array of exactly 3 short strings, questions the doctor should ask).

Symptoms: {symptoms}"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            timeout=15
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(raw)

        return {
            "urgency_level": parsed.get("urgency_level", "Medium"),
            "summary": json.dumps(parsed)
        }
    except Exception as e:
        print(f"Pre-visit LLM summary failed: {e}")
        return {
            "urgency_level": "Medium",
            "summary": "Summary unavailable — doctor will review symptoms manually before the visit."
        }


def generate_post_visit_summary(clinical_notes: str):
    try:
        prompt = f"""Convert these clinical notes into a patient-friendly summary with a medication schedule and follow-up steps. Write in plain, warm, simple language a patient without medical training can understand. Return plain text only, no markdown.

Clinical notes: {clinical_notes}"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            timeout=15
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Post-visit LLM summary failed: {e}")
        return "Summary unavailable at this time. Please contact your doctor's office for details on your visit notes and prescription."