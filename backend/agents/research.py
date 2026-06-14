"""
Research Agent — Microsoft Azure AI Foundry Integration
Primary: Azure AI Foundry (gpt-4o-mini) — 1M tokens/min, no rate limits
Fallback: GitHub Models
"""
import os, json, time, requests
from dotenv import load_dotenv
load_dotenv()

AZURE_API_KEY  = os.environ.get("AZURE_API_KEY", "")
AZURE_ENDPOINT = os.environ.get("AZURE_ENDPOINT", "").rstrip("/")
AZURE_MODEL    = os.environ.get("AZURE_MODEL", "gpt-4o-mini")
GITHUB_TOKEN   = os.environ.get("GITHUB_TOKEN", "")
GITHUB_MODEL   = os.environ.get("GITHUB_MODEL", "openai/gpt-4o-mini")


def call_model(system_prompt: str, user_prompt: str, max_tokens: int = 800) -> str:
    if AZURE_API_KEY and AZURE_ENDPOINT:
        # ── Azure AI Foundry (primary) ──────────────────────────────────
        # Strip /openai/v1 or /openai suffix the portal sometimes adds
        base = AZURE_ENDPOINT
        for suffix in ["/openai/v1", "/openai"]:
            if base.endswith(suffix):
                base = base[:-len(suffix)]
        url = f"{base}/openai/deployments/{AZURE_MODEL}/chat/completions?api-version=2024-08-01-preview"
        headers = {"api-key": AZURE_API_KEY, "Content-Type": "application/json"}
        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.4,
        }
        print(f"  [Foundry] Calling Azure AI Foundry → {AZURE_MODEL}")
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()

    else:
        # ── GitHub Models fallback ──────────────────────────────────────
        print(f"  [GitHub Models] Calling {GITHUB_MODEL} (no Azure key found)")
        url = "https://models.github.ai/inference/chat/completions"
        headers = {
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": GITHUB_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.4,
        }
        for attempt in range(4):
            resp = requests.post(url, headers=headers, json=payload, timeout=60)
            if resp.status_code == 429:
                wait = (attempt + 1) * 15
                print(f"  [429] Waiting {wait}s (retry {attempt+1}/4)...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
        raise Exception("GitHub Models rate limit exceeded. Set AZURE_API_KEY in .env to use Azure Foundry instead.")


def get_grounded_context(thinker: dict, topic: str) -> dict:
    """Foundry IQ Pattern — grounds each thinker in documented knowledge."""
    system = """You are a historical research agent implementing the Microsoft Foundry IQ knowledge grounding pattern.
Retrieve documented facts about a historical figure's known positions on a topic.
Only use verifiable information. Return JSON with keys:
relevant_principles, applicable_works, historical_context, predicted_stance.
Return only valid JSON, no markdown."""

    user = f"""Figure: {thinker['name']} ({thinker['era']})
Domain: {thinker['domain']}
Principles: {json.dumps(thinker['documented_principles'])}
Works: {json.dumps(thinker['key_works'])}
Known positions: {json.dumps(thinker.get('known_positions', {}))}
Topic: {topic}
Return grounded context JSON."""

    result = call_model(system, user, max_tokens=600)
    try:
        clean = result.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(clean)
    except Exception:
        return {
            "relevant_principles": thinker["documented_principles"][:3],
            "applicable_works": thinker["key_works"][:2],
            "historical_context": f"{thinker['name']} ({thinker['era']}) — {thinker['domain']}",
            "predicted_stance": f"{thinker['name']} would approach this through {thinker['domain']}.",
        }
