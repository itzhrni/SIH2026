# DEV1 / M1 — LEAD INFRA & ASSESSMENT ENGINE

**Member ID:** M1  
**Write Zone:** `lib/assessment/`, `data/knowledge-graphs/`  
**Branch:** `feat/m1-assessment`  
**Read Access:** `lib/db.ts`, `types/index.ts`, `lib/assessment/llm-adapter.ts`

---

## Responsibilities

| Area                    | Details                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LLM Adapter**         | `lib/assessment/llm-adapter.ts` — All Anthropic API calls routed here. Must include 12s timeout wrapper, retry-on-parse-failure (max 1 retry), and safe fallback on timeout.          |
| **Question Generation** | Generate domain-specific questions from knowledge graph nodes. Prompt design: system prompt defines rubric criteria, user prompt injects context + conversation history.              |
| **Response Evaluation** | Evaluate student responses against multi-axis rubric: `correctness`, `depth`, `tradeoffAwareness`, `realWorldApplicability`. Output composite score + next_action.                    |
| **Knowledge Graphs**    | `data/knowledge-graphs/*.json` — Pre-built domain graphs (DSA, System Design, ML, Core CS, Ayurvedic Pharmacology, Clinical Practice). Read-only at runtime. Validate schema on load. |
| **Graph Loader**        | `lib/assessment/graph-loader.ts` — Loads knowledge graphs at session start. Validates against `KnowledgeGraph` interface via Zod. Throws on malformed graphs.                         |
| **Session Management**  | Coordinate with M3 on `AssessmentSession` model. Handle concurrent writes via Prisma atomic `turnIndex` increment.                                                                    |

---

## File-Level Ownership

| File                                   | Action                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `lib/assessment/llm-adapter.ts`        | **Create** — Anthropic message wrapper with timeout, retry, fallback            |
| `lib/assessment/question-generator.ts` | **Create** — Builds prompts from knowledge graph context                        |
| `lib/assessment/rubric-evaluator.ts`   | **Create** — Parses LLM JSON response, validates with Zod, applies scores       |
| `lib/assessment/graph-loader.ts`       | **Create** — Reads + validates knowledge graph JSON files                       |
| `data/knowledge-graphs/*.json`         | **Create** — 6 domain knowledge graphs conforming to `KnowledgeGraph` interface |
| `types/index.ts`                       | **Read-only** — Add assessment-related types only (additive)                    |
| `lib/db.ts`                            | **Read-only** — Import singleton, never re-instantiate                          |

---

## Key Constraints

1. **No direct Anthropic imports** outside `llm-adapter.ts`. All LLM calls go through the adapter.
2. **Model string is fixed:** `claude-sonnet-4-6`. `max_tokens: 1000`.
3. **Timeout:** 12s per call via `Promise.race()`. See `AGENTS.md` Section 7.1.
4. **Fallback on timeout/parse failure:**
   ```json
   {
     "evaluation": {
       "correctness": 0.5,
       "depth": 0.5,
       "tradeoffAwareness": 0.5,
       "realWorldApplicability": 0.5,
       "composite": 0.5,
       "status": "partial"
     },
     "next_action": "advance",
     "followup_question": null
   }
   ```
5. **Knowledge graphs are read-only** at runtime. No mutation.
6. **Concurrent writes:** Use Prisma `data: { turnIndex: { increment: 1 } }`. Never read-then-increment in app code.

---

## Integration Points

- **M3 (DB):** AssessmentSession, NodeResult, GapReport models — coordinate schema changes through M3.
- **M2 (Matching):** Skill profile data from assessment feeds into matching service.
- **M4 (Student UI):** Assessment Terminal component consumes assessment session API.
- **M6 (Auth):** Session auth protects assessment routes.

---

## Deliverables Checklist

- [ ] `lib/assessment/llm-adapter.ts` — timeout wrapper, retry logic, fallback
- [ ] `lib/assessment/question-generator.ts` — knowledge graph → prompt
- [ ] `lib/assessment/rubric-evaluator.ts` — Zod validation, scoring
- [ ] `lib/assessment/graph-loader.ts` — graph loading + validation
- [ ] 6 knowledge graph JSON files in `data/knowledge-graphs/`
- [ ] `lib/assessment/session-manager.ts` — session lifecycle (start, advance, complete)
- [ ] Unit tests for LLM adapter (mocked Anthropic calls)
- [ ] PR passes `pnpm type-check && pnpm lint`

---

_Refer to `docs/SCHEMA.md` for AssessmentSession, NodeResult, and GapReport field definitions. Refer to `AGENTS.md` Section 7.1 for LLM guardrails._
