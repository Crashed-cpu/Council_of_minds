"""
Thinker Agent
=============
Each historical thinker responds to the debate topic using their
documented principles as grounding (supplied by the Research Agent).
Supports 3 rounds: opening, cross-response, rebuttal.
"""

import json
from agents.research import call_model


ROUND_INSTRUCTIONS = {
    1: "State your opening position on the topic. Ground every claim in your documented principles and works. Be direct and characteristic of your documented voice.",
    2: "Respond to the other thinkers' positions. Agree where your documented views align, challenge where they diverge. Reference your documented works and principles.",
    3: "Give your final rebuttal and synthesis. What has this debate clarified? What is your final verdict based on your documented philosophy?",
}


def get_position(
    thinker: dict,
    topic: str,
    grounded_context: dict,
    round_num: int,
    other_positions: list = None,
    sub_questions: list = None,
) -> dict:
    """
    Generate a thinker's position for a given debate round.
    Returns: { name, round, position, key_citation, agreement_with, challenge_to }
    """
    other_pos_text = ""
    if other_positions and round_num > 1:
        others = "\n".join([
            f"- {p['name']}: {p['position'][:300]}..."
            for p in other_positions if p.get("name") != thinker["name"]
        ])
        other_pos_text = f"\n\nOther thinkers have said:\n{others}"

    sub_q_text = ""
    if sub_questions:
        sub_q_text = f"\nKey sub-questions the council is exploring:\n" + "\n".join(f"- {q}" for q in sub_questions)

    system = f"""You are reasoning as {thinker['name']} ({thinker['era']}), {thinker['domain']}.
CRITICAL RULES:
1. Always preface with "Reasoning inspired by {thinker['name']}'s documented principles:"
2. Only reference positions and ideas documented in {thinker['name']}'s actual works
3. Speak in their documented tone: {thinker['tone']}
4. Cite specific works or documented quotes when making claims
5. Never invent positions they didn't hold
6. Be intellectually honest — acknowledge tensions in their own documented views

Return a JSON object with keys:
- position: your full statement (200-280 words)
- key_citation: one specific documented work or principle you relied on most
- one_line: a single memorable sentence summarising your stance
Return only valid JSON, no markdown."""

    user = f"""Debate topic: "{topic}"{sub_q_text}

Your grounded context (from knowledge retrieval):
{json.dumps(grounded_context, indent=2)}

Round {round_num} instruction: {ROUND_INSTRUCTIONS[round_num]}{other_pos_text}

Respond as {thinker['name']}."""

    result = call_model(system, user, max_tokens=600)

    try:
        clean = result.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        parsed = json.loads(clean)
        parsed["name"] = thinker["name"]
        parsed["thinker_id"] = thinker["id"]
        parsed["round"] = round_num
        return parsed
    except Exception:
        return {
            "name": thinker["name"],
            "thinker_id": thinker["id"],
            "round": round_num,
            "position": result[:500],
            "key_citation": thinker["key_works"][0] if thinker.get("key_works") else "",
            "one_line": f"{thinker['name']} brings a {thinker['domain']} perspective.",
        }
