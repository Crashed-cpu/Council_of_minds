"""
Consensus Agent
===============
Synthesises all debate rounds into agreements, disagreements,
a final verdict, and a confidence score.
"""

import json
from agents.research import call_model


def build_consensus(topic: str, all_rounds: list, thinkers: list) -> dict:
    """
    Build a consensus from all debate rounds.
    Returns: { agreements, disagreements, verdict, confidence, recommended_action, quote }
    """
    rounds_summary = json.dumps([
        {"round": r["round"], "name": r["name"], "one_line": r.get("one_line", ""), "position_excerpt": r.get("position", "")[:200]}
        for r in all_rounds
    ], indent=2)

    thinker_names = [t["name"] for t in thinkers]

    system = """You are a neutral consensus-building agent synthesising a multi-round debate.
Analyse all positions and produce a structured synthesis. Return a JSON object with keys:
- agreements: array of 3 strings (points all or most thinkers converged on)
- disagreements: array of 3 strings (genuine points of contention)
- verdict: a 3-sentence synthesis of what the council collectively concluded
- confidence: integer 0-100 (how strongly the council converged)
- recommended_action: one practical sentence on what this means for humanity
- memorable_quote: the single most powerful one-liner from the entire debate (attribute it)
Return only valid JSON, no markdown."""

    user = f"""Topic debated: "{topic}"
Council members: {', '.join(thinker_names)}

All debate positions:
{rounds_summary}

Synthesise the council's collective wisdom."""

    result = call_model(system, user, max_tokens=700)

    try:
        clean = result.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(clean)
    except Exception:
        return {
            "agreements": ["Technology must serve human dignity", "Ethical frameworks are needed", "Oversight is necessary"],
            "disagreements": ["Speed of implementation", "Role of governments", "Definition of progress"],
            "verdict": f"The Council examined '{topic}' from multiple philosophical traditions and found significant common ground around human dignity, while disagreeing on mechanisms of change.",
            "confidence": 65,
            "recommended_action": "Proceed with caution, prioritising human welfare over speed.",
            "memorable_quote": f"The question is not whether we can, but whether we should. — The Council",
        }
