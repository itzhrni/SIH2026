"""
Centralized Hybrid LLM Client Layer for Adaptive Assessment.
Supports:
- Google GenAI (gemini-3.6-flash by default) - Primary Live AI Provider with Retry & Fallback
- OpenAI (gpt-4o-mini by default) - Optional Live Provider
- Deterministic Semantic MOCK Backend (Offline Fallback)
"""
import os
import sys
import json
import re
import time
import warnings
from typing import Dict, List, Optional, Any

# Suppress noisy SDK deprecation warnings for clean CLI output
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

from ai_assessment_engine.ai.structured_outputs import (
    LLMEvaluationOutput,
    LLMQuestionOutput,
    LLMFollowUpOutput
)
from ai_assessment_engine.ai.prompts import (
    SYSTEM_ASSESSOR_PROMPT,
    EVALUATION_PROMPT_TEMPLATE,
    INITIAL_QUESTION_PROMPT_TEMPLATE,
    FOLLOW_UP_PROMPT_TEMPLATE
)


def load_dotenv_if_exists():
    """Zero-dependency .env loader."""
    for path in [".env", os.path.join("..", ".env"), os.path.join(os.path.dirname(__file__), "..", "..", ".env")]:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass


load_dotenv_if_exists()


# ============================================================================
# CENTRALIZED MODEL CONFIGURATION (Single Source of Truth)
# ============================================================================
DEFAULT_GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
DEFAULT_OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")


class LiveAIError(RuntimeError):
    """Raised when an active Live AI API call fails, preventing silent fallback to mock."""
    pass


def _is_transient_error(e: Exception) -> bool:
    """Detects transient 503/429/overload errors that warrant retry."""
    err_str = str(e).lower()
    transient_indicators = [
        "503", "unavailable", "429", "resource_exhausted", "quota", 
        "rate limit", "high demand", "overloaded", "capacity", 
        "500", "502", "504", "internal server error", "service unavailable",
        "deadline_exceeded", "timeout", "temporarily"
    ]
    return any(ind in err_str for ind in transient_indicators)


def _is_auth_error(e: Exception) -> bool:
    """Detects fatal authentication / key errors."""
    err_str = str(e).lower()
    auth_indicators = [
        "401", "403", "api_key_invalid", "invalid api key", 
        "invalid_api_key", "permission_denied", "unauthenticated", 
        "api key not valid"
    ]
    return any(ind in err_str for ind in auth_indicators)


class MockLLMBackend:
    """
    Deterministic semantic evaluator for offline development & tests.
    Evaluates arbitrary student answers against rubric criteria
    without hardcoded string lookups.
    """

    @staticmethod
    def _extract_tokens(text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        return [w for w in cleaned.split() if len(w) > 2]

    @classmethod
    def evaluate(cls, concept: Any, question: str, student_answer: str) -> LLMEvaluationOutput:
        ans_text = student_answer.strip()
        ans_tokens = set(cls._extract_tokens(ans_text))
        word_count = len(ans_text.split())

        rubric = concept.rubric
        c_tokens = set(cls._extract_tokens(rubric.correctness_criteria))
        d_tokens = set(cls._extract_tokens(rubric.depth_criteria))
        t_tokens = set(cls._extract_tokens(rubric.tradeoff_criteria))
        r_tokens = set(cls._extract_tokens(rubric.applicability_criteria))

        c_overlap = len(ans_tokens.intersection(c_tokens))
        d_overlap = len(ans_tokens.intersection(d_tokens))
        t_overlap = len(ans_tokens.intersection(t_tokens))
        r_overlap = len(ans_tokens.intersection(r_tokens))

        # 1. Correctness (0-100)
        c_score = 45.0 + min(c_overlap * 14.0, 42.0) + (10.0 if word_count >= 15 else 0.0)
        c_score = min(max(c_score, 15.0), 96.0)

        # 2. Depth (0-100)
        d_score = 30.0 + min(d_overlap * 16.0, 50.0) + (12.0 if word_count >= 25 else 0.0)
        d_score = min(max(d_score, 10.0), 92.0)

        # 3. Trade-off Awareness (0-100)
        tradeoff_signals = ["tradeoff", "trade-off", "latency", "overhead", "consistency", "bottleneck", "failure", "cost", "vs", "split-brain", "loss", "downtime", "concurrency"]
        t_hits = sum(1 for s in tradeoff_signals if s in ans_text.lower())
        t_score = 25.0 + min((t_overlap * 10.0) + (t_hits * 18.0), 65.0)
        t_score = min(max(t_score, 10.0), 95.0)

        # 4. Real-World Applicability (0-100)
        real_signals = ["scale", "production", "microservice", "redis", "nginx", "kafka", "circuit", "breaker", "adulteration", "gmp", "who", "fda", "path", "shakshuka", "citus", "resilience4j"]
        r_hits = sum(1 for s in real_signals if s in ans_text.lower())
        r_score = 25.0 + min((r_overlap * 10.0) + (r_hits * 18.0), 65.0)
        r_score = min(max(r_score, 10.0), 92.0)

        if word_count < 14:
            c_score = min(c_score, 45.0)
            d_score = min(d_score, 30.0)
            t_score = min(t_score, 20.0)
            r_score = min(r_score, 25.0)

        strengths = []
        if c_score >= 65:
            strengths.append(f"Clear grasp of fundamental {concept.name} definitions")
        if d_score >= 65:
            strengths.append("Demonstrated mechanical depth on underlying algorithms")
        if t_score >= 65:
            strengths.append("Articulated operational and performance trade-offs")
        if r_score >= 65:
            strengths.append("Connected theory to realistic production architectures")
        if not strengths:
            strengths.append(f"Basic familiarity with {concept.name} vocabulary")

        weaknesses = []
        missing_concepts = []
        if d_score < 60:
            weaknesses.append(f"Superficial explanation of {concept.name} internal mechanics")
            missing_concepts.append(f"{concept.name} internal execution & state flow")
        if t_score < 60:
            weaknesses.append("Did not evaluate latency, bottleneck, or consistency trade-offs")
            missing_concepts.append("Operational trade-offs and failure modes")
        if r_score < 60:
            weaknesses.append("Missing concrete real-world edge-case and failover handling")
            missing_concepts.append("Production failover and mitigation strategies")

        if rubric.sub_gaps_taxonomy and len(missing_concepts) > 0:
            missing_concepts.append(rubric.sub_gaps_taxonomy[0].replace("_", " "))

        reasoning = (
            f"[MOCK ENGINE] Evaluated response on {concept.name} ({word_count} words). "
            f"Correctness: {c_score:.1f}%, Depth: {d_score:.1f}%, "
            f"Trade-offs: {t_score:.1f}%, Applicability: {r_score:.1f}%."
        )

        return LLMEvaluationOutput(
            correctness=round(c_score, 1),
            depth=round(d_score, 1),
            tradeoff_awareness=round(t_score, 1),
            real_world_applicability=round(r_score, 1),
            strengths=strengths,
            weaknesses=weaknesses,
            missing_concepts=missing_concepts,
            reasoning=reasoning
        )

    @staticmethod
    def generate_initial_question(concept: Any, prerequisites: List[str], history_context: str) -> LLMQuestionOutput:
        return LLMQuestionOutput(
            question=concept.foundational_question,
            focus_concept=concept.name,
            expected_depth_areas=[concept.rubric.correctness_criteria[:50] + "..."]
        )

    @staticmethod
    def generate_follow_up_question(concept: Any, student_answer: str, missing_concepts: List[str]) -> LLMFollowUpOutput:
        missing_target = missing_concepts[0] if missing_concepts else f"{concept.name} trade-offs"
        if concept.targeted_probes:
            probe_q = concept.targeted_probes[0]
        else:
            probe_q = f"How would you address the trade-offs regarding {missing_target} when deploying {concept.name} in a high-concurrency production system?"
        
        return LLMFollowUpOutput(
            follow_up_question=probe_q,
            targeted_missing_concept=missing_target,
            rationale=f"Probing {missing_target} because the initial response omitted trade-off depth."
        )


class LLMClient:
    """Unified Hybrid LLM Client supporting Gemini (with Dynamic Discovery, Retry & Fallback), OpenAI, and Deterministic Mock."""

    def __init__(self, api_key: Optional[str] = None, provider: Optional[str] = None, model_name: Optional[str] = None):
        self.provider = "MOCK"
        self.model_name = "mock-semantic-evaluator"
        self.client_instance = None
        self.sdk_type = "mock"
        self._discovered_gemini_models: Optional[List[str]] = None
        self._init_provider(api_key, provider, model_name)

    def _init_provider(self, api_key: Optional[str] = None, provider: Optional[str] = None, model_name: Optional[str] = None):
        # 1. Primary: Google Gemini
        gemini_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if (provider == "GEMINI" or provider is None) and gemini_key:
            active_model = model_name or os.environ.get("GEMINI_MODEL", DEFAULT_GEMINI_MODEL)
            
            # Try google.genai SDK
            try:
                from google import genai
                self.client_instance = genai.Client(api_key=gemini_key)
                self.provider = "GEMINI"
                self.model_name = active_model
                self.sdk_type = "google-genai"
                return
            except Exception:
                pass

            # Try google.generativeai (legacy)
            try:
                import google.generativeai as genai_legacy
                genai_legacy.configure(api_key=gemini_key)
                self.client_instance = genai_legacy.GenerativeModel(active_model)
                self.provider = "GEMINI"
                self.model_name = active_model
                self.sdk_type = "google-generativeai"
                return
            except Exception as e:
                print(f"[LLMClient] Failed to initialize Gemini client: {e}")

        # 2. Secondary: OpenAI
        openai_key = api_key or os.environ.get("OPENAI_API_KEY")
        if (provider == "OPENAI" or (provider is None and not gemini_key)) and openai_key:
            active_model = model_name or os.environ.get("OPENAI_MODEL", DEFAULT_OPENAI_MODEL)
            try:
                import openai
                self.client_instance = openai.OpenAI(api_key=openai_key)
                self.provider = "OPENAI"
                self.model_name = active_model
                self.sdk_type = "openai"
                return
            except Exception as e:
                print(f"[LLMClient] Failed to initialize OpenAI client: {e}")

        # 3. Fallback: MOCK / OFFLINE
        self.provider = "MOCK"
        self.model_name = "mock-semantic-evaluator"
        self.sdk_type = "mock"

    def discover_available_gemini_models(self) -> List[str]:
        """
        Dynamically discovers models available to the current API key/project
        using the Google GenAI SDK's models.list() and filters for models
        that actually support text generation (excluding TTS, Audio-only, Image, Embedding).
        """
        if self._discovered_gemini_models is not None:
            return self._discovered_gemini_models

        discovered = []
        excluded_keywords = ["tts", "audio", "imagen", "image", "embedding", "embed", "aqa", "realtime", "robotics"]

        if self.provider == "GEMINI" and self.client_instance:
            try:
                if self.sdk_type == "google-genai":
                    pager = self.client_instance.models.list()
                    for m in pager:
                        m_name = getattr(m, "name", "") or ""
                        m_id = m_name.replace("models/", "").strip()
                        if not m_id:
                            continue

                        # Exclude specialized non-text models
                        if any(k in m_id.lower() for k in excluded_keywords):
                            continue

                        # Check supported actions / generation methods
                        actions = getattr(m, "supported_actions", []) or []
                        gen_methods = getattr(m, "supported_generation_methods", []) or []
                        all_methods = [str(x).lower() for x in list(actions) + list(gen_methods)]

                        # Filter for models supporting generateContent
                        supports_gen = any("generatecontent" in x or "generate_content" in x for x in all_methods)
                        if not all_methods and "gemini" in m_id.lower():
                            supports_gen = True

                        if supports_gen and m_id not in discovered:
                            discovered.append(m_id)

                elif self.sdk_type == "google-generativeai":
                    import google.generativeai as genai_legacy
                    for m in genai_legacy.list_models():
                        m_name = getattr(m, "name", "") or ""
                        m_id = m_name.replace("models/", "").strip()
                        if any(k in m_id.lower() for k in excluded_keywords):
                            continue
                        methods = [str(x).lower() for x in (getattr(m, "supported_generation_methods", []) or [])]
                        if any("generatecontent" in x for x in methods) and m_id not in discovered:
                            discovered.append(m_id)

            except Exception:
                pass

        # Sort discovered models: prioritize Flash models first, then other text generation models
        flash_models = [m for m in discovered if "flash" in m.lower() and not any(k in m.lower() for k in excluded_keywords)]
        other_models = [m for m in discovered if "flash" not in m.lower() and not any(k in m.lower() for k in excluded_keywords)]
        self._discovered_gemini_models = flash_models + other_models
        return self._discovered_gemini_models

    def get_candidate_gemini_models(self) -> List[str]:
        """
        Builds candidate Gemini model list:
        1. Configured primary model (e.g. gemini-3.6-flash).
        2. Followed ONLY by models dynamically confirmed by models.list().
        Zero hardcoded deprecated models.
        """
        discovered = self.discover_available_gemini_models()
        candidates = []
        excluded_keywords = ["tts", "audio", "imagen", "image", "embedding", "embed", "aqa", "realtime", "robotics"]

        # 1. Configured primary model
        if self.model_name:
            clean_primary = self.model_name.replace("models/", "").strip()
            if not any(k in clean_primary.lower() for k in excluded_keywords):
                candidates.append(clean_primary)

        # 2. Append dynamically discovered models from models.list()
        for m in discovered:
            if m not in candidates and not any(k in m.lower() for k in excluded_keywords):
                candidates.append(m)

        return candidates

    def get_current_mode(self) -> str:
        if self.provider == "GEMINI":
            return f"LIVE GEMINI (Model: {self.model_name})"
        elif self.provider == "OPENAI":
            return f"LIVE OPENAI (Model: {self.model_name})"
        return "MOCK / OFFLINE"

    def get_mode_description(self) -> str:
        if self.provider == "GEMINI":
            return f"LIVE GEMINI (Model: {self.model_name}, SDK: {self.sdk_type})"
        elif self.provider == "OPENAI":
            return f"LIVE OPENAI (Model: {self.model_name}, SDK: {self.sdk_type})"
        return "MOCK / OFFLINE (Deterministic fallback - Set GEMINI_API_KEY for Live AI)"

    @staticmethod
    def _extract_json(text: str) -> Dict[str, Any]:
        """Extracts clean JSON from LLM text response."""
        text = text.strip()
        match = re.search(r"```(?:json)?(.*?)```", text, re.DOTALL)
        if match:
            text = match.group(1).strip()
        return json.loads(text)

    def _call_gemini_raw(self, prompt: str) -> str:
        """
        Executes a live Gemini generate_content call with:
        1. Exponential backoff retries for transient 503/429 overload errors.
        2. Dynamic fallback ONLY to discovered models from models.list() if primary model is exhausted.
        3. Zero silent fallback to mock.
        """
        candidate_models = self.get_candidate_gemini_models()
        last_error = None
        max_retries = 3

        for model_idx, model_to_try in enumerate(candidate_models):
            for attempt in range(1, max_retries + 1):
                print(f"   [API INVOCATION] -> Provider: {self.provider} | Model: {model_to_try} | Action: generate_content (Attempt {attempt}/{max_retries})")

                try:
                    if self.sdk_type == "google-genai":
                        from google.genai import types
                        config = types.GenerateContentConfig(
                            response_mime_type="application/json",
                            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
                        )
                        response = self.client_instance.models.generate_content(
                            model=model_to_try,
                            contents=prompt,
                            config=config
                        )
                        # Success - update model_name if fallback was used
                        if self.model_name != model_to_try:
                            print(f"   [LIVE MODEL RESOLVED] -> Switched to dynamically discovered model '{model_to_try}'")
                            self.model_name = model_to_try
                        return response.text
                    else:
                        response = self.client_instance.generate_content(
                            prompt,
                            generation_config={"response_mime_type": "application/json"}
                        )
                        if self.model_name != model_to_try:
                            print(f"   [LIVE MODEL RESOLVED] -> Switched to dynamically discovered model '{model_to_try}'")
                            self.model_name = model_to_try
                        return response.text

                except Exception as e:
                    last_error = e
                    if _is_auth_error(e):
                        # Non-retryable key error
                        print("\n" + "=" * 60)
                        print("LIVE AI ERROR: Authentication / API Key Error")
                        print(f"Provider: {self.provider}")
                        print(f"Model: {model_to_try}")
                        print(f"Reason: {e}")
                        print("=" * 60 + "\n")
                        raise LiveAIError(f"Live Gemini authentication failed: {e}") from e

                    if _is_transient_error(e):
                        if attempt < max_retries:
                            delay = 2 ** attempt  # 2s, 4s, 8s
                            print(f"   ⚠️  [TRANSIENT 503/429] Model '{model_to_try}' is under high demand / overloaded. Retrying in {delay}s...")
                            time.sleep(delay)
                            continue
                        else:
                            print(f"   ⚠️  [MODEL EXHAUSTED] Model '{model_to_try}' unavailable after {max_retries} attempts.")
                            if model_idx + 1 < len(candidate_models):
                                next_mod = candidate_models[model_idx + 1]
                                print(f"   🔄 [LIVE MODEL FALLBACK] Switching to dynamically discovered Live Gemini model '{next_mod}'...")
                            break
                    else:
                        # 400, 404, not supported, modality mismatch, or other non-transient model error -> try next candidate model
                        err_str = str(e).lower()
                        incompatible_indicators = ["404", "400", "not found", "not supported", "invalid_argument", "modalities", "modality"]
                        if any(ind in err_str for ind in incompatible_indicators):
                            print(f"   ⚠️  [MODEL INCOMPATIBLE/UNAVAILABLE] Model '{model_to_try}' not available or incompatible for text generation. Trying next dynamically discovered model...")
                            break
                        # If more candidate models exist, try them before giving up
                        if model_idx + 1 < len(candidate_models):
                            print(f"   ⚠️  [MODEL ERROR] Encountered error on '{model_to_try}': {e}. Trying next dynamically discovered model...")
                            break
                        # Unexpected fatal error
                        raise LiveAIError(f"Live AI call to Gemini failed: {e}") from e

        # If all candidate models and retries failed
        print("\n" + "=" * 60)
        print("LIVE AI ERROR")
        print(f"Provider: {self.provider}")
        print(f"Model: {self.model_name}")
        print("Reason: Gemini temporarily unavailable after retries. This is a provider availability issue, not an API-key/configuration failure.")
        print(f"Details: {last_error}")
        print("=" * 60 + "\n")
        raise LiveAIError(
            f"Gemini temporarily unavailable after retries. This is a provider availability issue, not an API-key/configuration failure. Details: {last_error}"
        ) from last_error

    def _call_openai_raw(self, prompt: str) -> str:
        print(f"   [API INVOCATION] -> Provider: {self.provider} | Model: {self.model_name} | Action: chat.completions.create")
        resp = self.client_instance.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": SYSTEM_ASSESSOR_PROMPT},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        return resp.choices[0].message.content

    def generate_initial_question(
        self,
        concept: Any,
        domain_name: str,
        prerequisites: List[str],
        history_context: str = "None",
        prior_weaknesses: str = "None"
    ) -> LLMQuestionOutput:
        if self.provider == "MOCK":
            return MockLLMBackend.generate_initial_question(concept, prerequisites, history_context)

        prompt = INITIAL_QUESTION_PROMPT_TEMPLATE.format(
            concept_name=concept.name,
            domain_name=domain_name,
            concept_description=concept.description,
            prerequisites=", ".join(prerequisites) if prerequisites else "None",
            correctness_rubric=concept.rubric.correctness_criteria,
            depth_rubric=concept.rubric.depth_criteria,
            tradeoff_rubric=concept.rubric.tradeoff_criteria,
            applicability_rubric=concept.rubric.applicability_criteria,
            history_context=history_context,
            prior_weaknesses=prior_weaknesses
        )

        try:
            if self.provider == "GEMINI":
                raw = self._call_gemini_raw(f"{SYSTEM_ASSESSOR_PROMPT}\n\n{prompt}")
                data = self._extract_json(raw)
                return LLMQuestionOutput(**data)
            elif self.provider == "OPENAI":
                raw = self._call_openai_raw(prompt)
                data = json.loads(raw)
                return LLMQuestionOutput(**data)
        except LiveAIError:
            raise
        except Exception as e:
            raise LiveAIError(f"Live AI Question Generation failed for provider '{self.provider}' (Model: '{self.model_name}'): {e}") from e

    def evaluate_answer(
        self,
        concept: Any,
        domain_name: str,
        question: str,
        student_answer: str
    ) -> LLMEvaluationOutput:
        if self.provider == "MOCK":
            return MockLLMBackend.evaluate(concept, question, student_answer)

        prompt = EVALUATION_PROMPT_TEMPLATE.format(
            concept_name=concept.name,
            domain_name=domain_name,
            concept_description=concept.description,
            correctness_rubric=concept.rubric.correctness_criteria,
            depth_rubric=concept.rubric.depth_criteria,
            tradeoff_rubric=concept.rubric.tradeoff_criteria,
            applicability_rubric=concept.rubric.applicability_criteria,
            sub_gaps_taxonomy=", ".join(concept.rubric.sub_gaps_taxonomy),
            question=question,
            student_answer=student_answer
        )

        try:
            if self.provider == "GEMINI":
                raw = self._call_gemini_raw(f"{SYSTEM_ASSESSOR_PROMPT}\n\n{prompt}")
                data = self._extract_json(raw)
                return LLMEvaluationOutput(**data)
            elif self.provider == "OPENAI":
                raw = self._call_openai_raw(prompt)
                data = json.loads(raw)
                return LLMEvaluationOutput(**data)
        except LiveAIError:
            raise
        except Exception as e:
            raise LiveAIError(f"Live AI Evaluation failed for provider '{self.provider}' (Model: '{self.model_name}'): {e}") from e

    def generate_follow_up_question(
        self,
        concept: Any,
        original_question: str,
        student_answer: str,
        strengths: List[str],
        weaknesses: List[str],
        missing_concepts: List[str]
    ) -> LLMFollowUpOutput:
        if self.provider == "MOCK":
            return MockLLMBackend.generate_follow_up_question(concept, student_answer, missing_concepts)

        prompt = FOLLOW_UP_PROMPT_TEMPLATE.format(
            concept_name=concept.name,
            original_question=original_question,
            student_answer=student_answer,
            strengths=", ".join(strengths) if strengths else "None",
            weaknesses=", ".join(weaknesses) if weaknesses else "None",
            missing_concepts=", ".join(missing_concepts) if missing_concepts else "Depth on mechanics & trade-offs",
            tradeoff_rubric=concept.rubric.tradeoff_criteria
        )

        try:
            if self.provider == "GEMINI":
                raw = self._call_gemini_raw(f"{SYSTEM_ASSESSOR_PROMPT}\n\n{prompt}")
                data = self._extract_json(raw)
                return LLMFollowUpOutput(**data)
            elif self.provider == "OPENAI":
                raw = self._call_openai_raw(prompt)
                data = json.loads(raw)
                return LLMFollowUpOutput(**data)
        except LiveAIError:
            raise
        except Exception as e:
            raise LiveAIError(f"Live AI Follow-Up Generation failed for provider '{self.provider}' (Model: '{self.model_name}'): {e}") from e


# Global singleton
llm_client = LLMClient()
