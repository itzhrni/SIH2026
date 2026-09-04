"""
Knowledge Graph Registry and Loader.
"""
import os
import json
from typing import Dict, List, Optional, Any
from ai_assessment_engine.knowledge_graph.schema import KnowledgeGraphDomain

class KnowledgeGraphRegistry:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            data_dir = os.path.dirname(__file__)
        self.data_dir = data_dir
        self.domains: Dict[str, KnowledgeGraphDomain] = {}
        self._load_all_domains()

    def _load_all_domains(self):
        for filename in os.listdir(self.data_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(self.data_dir, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        domain = KnowledgeGraphDomain(**data)
                        self.domains[domain.domain_id] = domain
                except Exception as e:
                    print(f"Error loading graph {filename}: {e}")

    def get_domain(self, domain_id: str) -> Optional[KnowledgeGraphDomain]:
        return self.domains.get(domain_id)

    def list_domains(self) -> List[Dict[str, Any]]:
        return [
            {
                "domain_id": d.domain_id,
                "domain_name": d.domain_name,
                "sector": d.sector,
                "description": d.description,
                "concept_count": len(d.concepts),
                "concept_names": [c.name for c in d.concepts]
            }
            for d in self.domains.values()
        ]

registry = KnowledgeGraphRegistry()
