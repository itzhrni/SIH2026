/**
 * lib/learning/resources.ts
 * Static learning resource mapping per concept node.
 * MVP Feature 3.2: For each concept node flagged as a gap, surface 2–3 pre-mapped resources.
 * Resources are NPTEL / official documentation links hardcoded per node.
 *
 * RULE LIB-01: Pure business logic — no framework imports.
 */

interface LearningResource {
  title: string;
  url: string;
}

/** Hardcoded resource map per concept node id.
 *  Key = concept node id (e.g. "load-balancing", "sorting-algorithms").
 *  Value = array of 2–3 learning resources.
 */
const RESOURCE_MAP: Record<string, LearningResource[]> = {
  // DSA nodes
  "sorting-algorithms": [
    {
      title: "NPTEL: Data Structures and Algorithms",
      url: "https://nptel.ac.in/courses/106104172",
    },
    {
      title: "GeeksforGeeks: Sorting Algorithms",
      url: "https://www.geeksforgeeks.org/sorting-algorithms/",
    },
  ],
  "linked-lists": [
    {
      title: "NPTEL: Data Structures",
      url: "https://nptel.ac.in/courses/106105085",
    },
    {
      title: "GeeksforGeeks: Linked List",
      url: "https://www.geeksforgeeks.org/linked-list-set-1-introduction/",
    },
  ],
  "binary-trees": [
    {
      title: "NPTEL: Data Structures and Algorithms",
      url: "https://nptel.ac.in/courses/106104172",
    },
    {
      title: "GeeksforGeeks: Binary Tree",
      url: "https://www.geeksforgeeks.org/binary-tree-data-structure/",
    },
  ],
  "dynamic-programming": [
    {
      title: "NPTEL: Design and Analysis of Algorithms",
      url: "https://nptel.ac.in/courses/106101060",
    },
    {
      title: "GeeksforGeeks: Dynamic Programming",
      url: "https://www.geeksforgeeks.org/dynamic-programming/",
    },
  ],
  graphs: [
    {
      title: "NPTEL: Graph Algorithms",
      url: "https://nptel.ac.in/courses/106106127",
    },
    {
      title: "GeeksforGeeks: Graph Data Structure",
      url: "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/",
    },
  ],
  hashing: [
    {
      title: "NPTEL: Data Structures",
      url: "https://nptel.ac.in/courses/106105085",
    },
    {
      title: "GeeksforGeeks: Hashing",
      url: "https://www.geeksforgeeks.org/hashing-data-structure/",
    },
  ],

  // System Design nodes
  "load-balancing": [
    {
      title: "System Design Primer: Load Balancing",
      url: "https://github.com/donnemartin/system-design-primer#load-balancer",
    },
    {
      title: "AWS: Elastic Load Balancing",
      url: "https://docs.aws.amazon.com/elasticloadbalancing/",
    },
  ],
  caching: [
    {
      title: "System Design Primer: Caching",
      url: "https://github.com/donnemartin/system-design-primer#cache",
    },
    { title: "Redis Documentation", url: "https://redis.io/docs/" },
  ],
  "database-sharding": [
    {
      title: "System Design Primer: Database Sharding",
      url: "https://github.com/donnemartin/system-design-primer#sharding-or-data-partitioning",
    },
    {
      title: "MongoDB Sharding",
      url: "https://www.mongodb.com/docs/manual/sharding/",
    },
  ],
  microservices: [
    {
      title: "System Design Primer: Microservices",
      url: "https://github.com/donnemartin/system-design-primer#microservices",
    },
    {
      title: "Martin Fowler: Microservices",
      url: "https://martinfowler.com/articles/microservices.html",
    },
  ],
  "message-queues": [
    {
      title: "System Design Primer: Message Queues",
      url: "https://github.com/donnemartin/system-design-primer#asynchronism",
    },
    {
      title: "RabbitMQ Tutorials",
      url: "https://www.rabbitmq.com/tutorials.html",
    },
  ],

  // Machine Learning nodes
  "neural-networks": [
    {
      title: "NPTEL: Deep Learning",
      url: "https://nptel.ac.in/courses/106106184",
    },
    {
      title: "Deep Learning Book (Goodfellow)",
      url: "https://www.deeplearningbook.org/",
    },
  ],
  "supervised-learning": [
    {
      title: "NPTEL: Machine Learning",
      url: "https://nptel.ac.in/courses/106104208",
    },
    {
      title: "Scikit-learn: Supervised Learning",
      url: "https://scikit-learn.org/stable/supervised_learning.html",
    },
  ],
  "model-evaluation": [
    {
      title: "Scikit-learn: Model Evaluation",
      url: "https://scikit-learn.org/stable/model_selection.html",
    },
    {
      title: "Google ML Crash Course",
      url: "https://developers.google.com/machine-learning/crash-course",
    },
  ],
  "feature-engineering": [
    {
      title: "NPTEL: Machine Learning",
      url: "https://nptel.ac.in/courses/106104208",
    },
    {
      title: "Kaggle: Feature Engineering",
      url: "https://www.kaggle.com/learn/feature-engineering",
    },
  ],

  // Core CS nodes
  "os-processes": [
    {
      title: "NPTEL: Operating Systems",
      url: "https://nptel.ac.in/courses/106105075",
    },
    {
      title: "GeeksforGeeks: Processes in OS",
      url: "https://www.geeksforgeeks.org/processes-in-linuxunix/",
    },
  ],
  "networking-basics": [
    {
      title: "NPTEL: Computer Networks",
      url: "https://nptel.ac.in/courses/106105081",
    },
    {
      title: "Cloudflare Learning: Networking",
      url: "https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/",
    },
  ],
  "database-normalization": [
    {
      title: "NPTEL: Database Management Systems",
      url: "https://nptel.ac.in/courses/106105175",
    },
    {
      title: "GeeksforGeeks: Database Normalization",
      url: "https://www.geeksforgeeks.org/introduction-of-database-normalization/",
    },
  ],

  // Ayurvedic Pharmacology nodes
  "dravya-guna": [
    {
      title: "CCRAS: Ayurvedic Pharmacopoeia of India",
      url: "https://www.ccras.nic.in/node/8",
    },
    {
      title: "Ministry of Ayush: Ayurveda Resources",
      url: "https://main.ayush.gov.in/education",
    },
  ],
  "rasa-shastra": [
    {
      title: "CCRAS: Rasa Shastra Resources",
      url: "https://www.ccras.nic.in/research/rasa-shastra",
    },
    {
      title: "AIIA: Research Publications",
      url: "https://www.aiia.gov.in/research",
    },
  ],
  "herbal-formulations": [
    {
      title: "Ayurvedic Pharmacopoeia of India",
      url: "https://www.ccras.nic.in/node/8",
    },
    {
      title: "Ministry of Ayush: Standards",
      url: "https://main.ayush.gov.in/schemes-programmes/standards-and-quality",
    },
  ],

  // Clinical Practice nodes
  "nadi-pariksha": [
    {
      title: "AIIA: Clinical Protocols",
      url: "https://www.aiia.gov.in/clinical-protocols",
    },
    {
      title: "Ministry of Ayush: Clinical Practice Guidelines",
      url: "https://main.ayush.gov.in/schemes-programmes/clinical-research",
    },
  ],
  panchakarma: [
    {
      title: "CCRAS: Panchakarma Research",
      url: "https://www.ccras.nic.in/research/panchakarma",
    },
    { title: "AIIA: Panchakarma Resources", url: "https://www.aiia.gov.in" },
  ],
  "dietary-management": [
    {
      title: "Ministry of Ayush: Ayurveda Diet",
      url: "https://main.ayush.gov.in",
    },
    { title: "CCRAS: Dietary Guidelines", url: "https://www.ccras.nic.in" },
  ],
};

/** Generic fallback resources shown when no node-specific resources exist. */
const FALLBACK_RESOURCES: LearningResource[] = [
  { title: "NPTEL: Free Online Courses", url: "https://nptel.ac.in/" },
  { title: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/" },
];

/**
 * Get learning resources for a list of concept node ids.
 * Returns resources for each node that has them; uses fallback otherwise.
 */
export function getResourcesForNodes(
  nodeIds: string[],
): { conceptNodeId: string; resources: LearningResource[] }[] {
  return nodeIds.map((nodeId) => ({
    conceptNodeId: nodeId,
    resources: RESOURCE_MAP[nodeId] ?? FALLBACK_RESOURCES,
  }));
}
