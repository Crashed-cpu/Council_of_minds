"""
Moderator Agent
===============
Breaks a debate topic into structured sub-questions and selects
the 4 most relevant thinkers from the roster for this specific topic.
"""

import json
from agents.research import call_model


def moderate(topic: str, all_thinkers: list) -> dict:
    """
    Analyse the topic, produce sub-questions, and select best thinkers.
    Returns: { sub_questions, selected_thinker_ids, framing, opening_statement }
    """
    thinker_summary = [
        {"id": t["id"], "name": t["name"], "domain": t["domain"],
         "era": t["era"], "known_positions": list(t.get("known_positions", {}).keys())}
        for t in all_thinkers
    ]

    system = """You are a debate moderator selecting the ideal council of historical thinkers for a topic.
Analyse the topic, break it into 4 sub-questions that expose real tensions, then select the 4 most
relevant thinkers from the roster. Return a JSON object with keys:
- sub_questions: array of 4 strings
- selected_thinker_ids: array of 4 thinker id strings from the roster
- framing: one sentence explaining why this topic matters now
- opening_statement: a dramatic 2-sentence moderator intro for the debate
Return only valid JSON, no markdown."""

    user = f"""Debate topic: "{topic}"

Available thinkers:
{json.dumps(thinker_summary, indent=2)}

Select the 4 thinkers whose documented domain and known positions make them most relevant
to this specific topic. Return the structured JSON."""

    result = call_model(system, user, max_tokens=700)

    try:
        clean = result.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(clean)
    except Exception:
        # Sensible fallback
        return {
            "sub_questions": [
                f"What are the core benefits of {topic}?",
                f"What are the primary risks of {topic}?",
                f"Who should govern or guide {topic}?",
                f"How should humanity adapt to {topic}?",
            ],
            "selected_thinker_ids": [t["id"] for t in all_thinkers[:4]],
            "framing": f"The question of {topic} touches on technology, ethics, and human values.",
            "opening_statement": f"The Council is convened to examine: {topic}. History's greatest minds will now deliberate.",
        }
