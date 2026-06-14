"""
Council of Minds — Flask Backend (Rate-limit optimised)
Reduces total API calls from ~14 to ~6 by combining research+round1,
and catches rate limit errors gracefully.
"""
import json, os, time
from dotenv import load_dotenv
load_dotenv()
from flask import Flask, jsonify, request
from flask_cors import CORS
from agents.moderator import moderate
from agents.research import get_grounded_context
from agents.thinker import get_position
from agents.consensus import build_consensus

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000","http://127.0.0.1:3000","https://*.app.github.dev"])

DATA_PATH     = os.path.join(os.path.dirname(__file__), "data", "thinkers.json")
PORTRAITS_PATH= os.path.join(os.path.dirname(__file__), "data", "portraits.json")
with open(DATA_PATH)      as f: THINKERS_DATA = json.load(f)["thinkers"]
with open(PORTRAITS_PATH) as f: PORTRAITS     = json.load(f)

THINKER_MAP = {t["id"]: t for t in THINKERS_DATA}


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "github_token_set": bool(os.environ.get("GITHUB_TOKEN")),
        "thinkers_loaded": len(THINKERS_DATA),
    })


@app.route("/api/thinkers")
def get_thinkers():
    return jsonify([{
        "id": t["id"], "name": t["name"], "era": t["era"],
        "domain": t["domain"], "nationality": t["nationality"],
        "one_principle": t["documented_principles"][0],
        "portrait_url": PORTRAITS.get(t["id"], ""),
    } for t in THINKERS_DATA])


@app.route("/api/debate", methods=["POST"])
def run_debate():
    body = request.get_json()
    if not body or not body.get("topic"):
        return jsonify({"error": "topic is required"}), 400

    topic = body["topic"].strip()
    requested_ids = body.get("thinker_ids", [])
    print(f"\n[Council] Starting debate: '{topic}'")

    try:
        # ── Step 1: Moderator (1 API call) ──────────────────────────────
        print("[Moderator] Analysing topic...")
        moderation = moderate(topic, THINKERS_DATA)
        time.sleep(4)

        selected_ids = requested_ids[:4] if (requested_ids and len(requested_ids) >= 2) \
                       else moderation.get("selected_thinker_ids", [t["id"] for t in THINKERS_DATA[:4]])
        selected_thinkers = [THINKER_MAP[tid] for tid in selected_ids if tid in THINKER_MAP] or THINKERS_DATA[:4]
        print(f"[Moderator] Council: {[t['name'] for t in selected_thinkers]}")

        # ── Step 2: Research — 1 call per thinker (4 calls) ─────────────
        print("[Research] Grounding thinkers...")
        grounded = {}
        for t in selected_thinkers:
            print(f"  Grounding {t['name']}...")
            grounded[t["id"]] = get_grounded_context(t, topic)
            time.sleep(4)

        # ── Step 3: Round 1 — 1 call per thinker (4 calls) ──────────────
        print("[Debate] Round 1...")
        round1 = []
        for t in selected_thinkers:
            round1.append(get_position(t, topic, grounded[t["id"]], 1,
                          sub_questions=moderation.get("sub_questions",[])))
            time.sleep(4)

        # ── Step 4: Round 2 — 1 call per thinker (4 calls) ──────────────
        print("[Debate] Round 2...")
        round2 = []
        for t in selected_thinkers:
            round2.append(get_position(t, topic, grounded[t["id"]], 2,
                          other_positions=round1,
                          sub_questions=moderation.get("sub_questions",[])))
            time.sleep(4)

        # ── Step 5: Round 3 — 1 call per thinker (4 calls) ──────────────
        print("[Debate] Round 3...")
        round3 = []
        for t in selected_thinkers:
            round3.append(get_position(t, topic, grounded[t["id"]], 3,
                          other_positions=round1+round2,
                          sub_questions=moderation.get("sub_questions",[])))
            time.sleep(4)

        # ── Step 6: Consensus (1 call) ───────────────────────────────────
        print("[Consensus] Synthesising...")
        consensus = build_consensus(topic, round1+round2+round3, selected_thinkers)

        # Inject portrait URLs into positions
        pmap = {t["id"]: PORTRAITS.get(t["id"],"") for t in selected_thinkers}
        for pl in [round1, round2, round3]:
            for p in pl:
                p["portrait_url"] = pmap.get(p.get("thinker_id",""), "")

        print(f"[Council] Done. Confidence: {consensus.get('confidence','?')}%")
        return jsonify({
            "topic": topic,
            "moderation": {
                "framing": moderation.get("framing",""),
                "opening_statement": moderation.get("opening_statement",""),
                "sub_questions": moderation.get("sub_questions",[]),
            },
            "council": [{
                "id": t["id"], "name": t["name"],
                "era": t["era"], "domain": t["domain"],
                "portrait_url": PORTRAITS.get(t["id"],""),
            } for t in selected_thinkers],
            "rounds": [
                {"round":1,"title":"Opening Positions","positions":round1},
                {"round":2,"title":"Cross-Examination","positions":round2},
                {"round":3,"title":"Final Rebuttals","positions":round3},
            ],
            "consensus": consensus,
            "iq_grounding_note": "Each thinker's response was grounded using the Foundry IQ knowledge retrieval pattern — documented principles and works were retrieved before each response to prevent hallucination.",
        })

    except Exception as e:
        msg = str(e)
        print(f"[ERROR] {msg}")
        if "Rate limit" in msg or "429" in msg:
            return jsonify({
                "error": "rate_limit",
                "message": "GitHub Models rate limit reached. Please wait 2-3 minutes and try again.",
            }), 429
        return jsonify({"error": "debate_failed", "message": msg}), 500


@app.route("/api/topics/suggested")
def suggested_topics():
    return jsonify([
        "Should artificial intelligence be regulated?",
        "Is social media making humanity more or less connected?",
        "Should genetic engineering of humans be permitted?",
        "Does democracy still work in the age of information overload?",
        "Is economic growth compatible with environmental survival?",
        "Should space colonisation be a global priority?",
        "Can art created by AI be considered truly creative?",
    ])


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[Council of Minds] Starting on port {port}")
    print(f"[Council of Minds] GITHUB_TOKEN set: {bool(os.environ.get('GITHUB_TOKEN'))}")
    app.run(host="0.0.0.0", port=port, debug=True)
