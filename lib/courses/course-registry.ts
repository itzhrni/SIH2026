// lib/courses/course-registry.ts
// In-Portal Course Registry delivering native curriculum directly in the portal.

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: {
    summary: string;
    keyPoints: string[];
    technicalDeepDive: string;
    tradeoffsDiscussion: string;
    codeSnippet?: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface InPortalCourse {
  id: string;
  title: string;
  domain: string;
  category: "ENGINEERING" | "AYUSH";
  level: "FOUNDATIONAL" | "INTERMEDIATE" | "ADVANCED";
  duration: string;
  modulesCount: number;
  lessonsCount: number;
  description: string;
  assessmentDomainId: string;
  skills: string[];
  instructor: {
    name: string;
    title: string;
    institution: string;
  };
  modules: CourseModule[];
}

export const IN_PORTAL_COURSES: InPortalCourse[] = [
  {
    id: "distributed-systems-arch",
    title: "Distributed Systems & Cloud-Native Architecture",
    domain: "System Design",
    category: "ENGINEERING",
    level: "ADVANCED",
    duration: "6 Weeks (Self-Paced)",
    modulesCount: 4,
    lessonsCount: 8,
    description:
      "Master scalable systems engineering: Layer 7 load balancing, distributed caching with Redis, consistent database sharding, and high-throughput Kafka event streaming.",
    assessmentDomainId: "system-design",
    skills: ["system-design", "caching", "db-sharding", "load-balancing"],
    instructor: {
      name: "Dr. Rajeshwar Iyer",
      title: "Senior Cloud Systems Architect",
      institution: "National Cloud Competency Center",
    },
    modules: [
      {
        id: "mod-1",
        title: "Module 1: High-Throughput Load Balancing & Traffic Routing",
        description: "Layer 4 vs Layer 7 load balancing algorithms, TLS termination, and health checks.",
        lessons: [
          {
            id: "les-1-1",
            title: "Layer 4 (Transport) vs Layer 7 (Application) Proxies",
            duration: "25 min",
            content: {
              summary: "Understanding how modern web scale balances millions of incoming TCP packets and HTTP requests.",
              keyPoints: [
                "Layer 4 (L4) operates on TCP/UDP IP and port headers with minimal CPU overhead.",
                "Layer 7 (L7) parses HTTP headers, cookies, and TLS, allowing smart path-based routing at the expense of higher compute cost.",
                "Algorithms: Least Connections is preferred over Round Robin when request processing durations vary significantly.",
              ],
              technicalDeepDive:
                "In high-concurrency microservices, an L7 proxy (such as NGINX or Envoy) performs SSL termination at the edge. By maintaining persistent keep-alive connections to backend pods, it prevents TCP connection exhaustion on upstream services.",
              tradeoffsDiscussion:
                "L7 load balancing provides intelligent canary routing and URL path splitting, but adds 1–3ms of serialization latency and requires dedicated CPU memory for TLS buffer handling.",
              codeSnippet: `// NGINX Upstream Configuration
upstream backend_cluster {
    least_conn;
    server 10.0.0.1:8080 max_fails=3 fail_timeout=10s;
    server 10.0.0.2:8080 max_fails=3 fail_timeout=10s;
    keepalive 32;
}`,
            },
          },
          {
            id: "les-1-2",
            title: "Consistent Hashing & Dynamic Ring Topologies",
            duration: "30 min",
            content: {
              summary: "How distributed systems route requests evenly across changing server clusters without remapping all keys.",
              keyPoints: [
                "Standard modulo hashing (hash(key) % N) causes massive cache invalidation when N changes.",
                "Consistent hashing places nodes and keys on a 360-degree integer ring.",
                "Virtual nodes (v-nodes) ensure uniform statistical distribution across physical nodes.",
              ],
              technicalDeepDive:
                "When a server fails in a consistent hash ring, only k/N keys need to be remapped to adjacent clockwise nodes. This ensures cache hit ratios remain above 95% during cluster resizing.",
              tradeoffsDiscussion:
                "Consistent hashing provides seamless scalability, but requires maintaining a sorted ring in memory (using binary search or tree maps) for key lookups.",
            },
          },
        ],
      },
      {
        id: "mod-2",
        title: "Module 2: Distributed In-Memory Caching & Resiliency",
        description: "Cache-Aside, Write-Through, and handling Cache Stampede / Thundering Herd.",
        lessons: [
          {
            id: "les-2-1",
            title: "Cache Invalidation Patterns: Cache-Aside vs Write-Through",
            duration: "35 min",
            content: {
              summary: "Designing predictable in-memory caching layers with Redis and Memcached.",
              keyPoints: [
                "Cache-Aside: Application reads from cache; on miss, reads from DB and writes to cache.",
                "Write-Through: Application writes to cache, which synchronously writes to the database.",
                "Write-Back (Write-Behind): Writes to cache and asynchronously flushes to DB in batches.",
              ],
              technicalDeepDive:
                "Cache-Aside minimizes write latency overhead on the main database path. However, in distributed pods, race conditions can cause stale reads if concurrent updates invalidate and re-populate the cache simultaneously.",
              tradeoffsDiscussion:
                "Write-Through guarantees 100% read consistency but doubles write latency. Write-Back offers maximum write throughput but risks data loss if the cache node crashes before flushing.",
            },
          },
          {
            id: "les-2-2",
            title: "Mitigating Cache Stampede & Thundering Herd",
            duration: "25 min",
            content: {
              summary: "Production techniques to prevent database outages when high-traffic cache keys expire.",
              keyPoints: [
                "Cache Stampede occurs when thousands of concurrent requests miss an expired key simultaneously.",
                "Probabilistic Early Expiration (XFetch algorithm) refreshes keys before they expire.",
                "Distributed Mutex Locks ensure only one worker recomputes the database query.",
              ],
              technicalDeepDive:
                "By adding randomized jitter (e.g. TTL = Base_TTL + rand(0, 60s)), key expirations are staggered smoothly across time, preventing instantaneous database connection spikes.",
              tradeoffsDiscussion:
                "Distributed locks protect the database but add Redis network round-trips; randomized jitter is zero-cost but permits minor TTL variance.",
            },
          },
        ],
      },
      {
        id: "mod-3",
        title: "Module 3: Horizontal Database Sharding & Partitioning",
        description: "Shard keys, cross-shard joins, two-phase commits, and CAP Theorem trade-offs.",
        lessons: [
          {
            id: "les-3-1",
            title: "Shard Key Selection & Horizontal Data Partitioning",
            duration: "40 min",
            content: {
              summary: "Scaling write-heavy databases across physical nodes using horizontal sharding.",
              keyPoints: [
                "High cardinality shard keys prevent hotspotting on specific database instances.",
                "User-based sharding groups all customer records on a single shard to avoid cross-node joins.",
                "Range-based sharding causes write bottlenecks on the most recent time-series partition.",
              ],
              technicalDeepDive:
                "In horizontal sharding, query routers direct SQL queries to specific shards based on the hash of the shard key. If a query does not include the shard key, it must broadcast (scatter-gather) across all shards, which significantly increases latency.",
              tradeoffsDiscussion:
                "Sharding provides infinite write scaling, but eliminates foreign key constraints across shards and complicates database backups.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "ayurvedic-pharmacology-dravya",
    title: "Ayurvedic Pharmacology & Dravya Guna Therapeutics",
    domain: "Ayurvedic Pharmacology",
    category: "AYUSH",
    level: "INTERMEDIATE",
    duration: "4 Weeks (Self-Paced)",
    modulesCount: 3,
    lessonsCount: 6,
    description:
      "Comprehensive digital mapping of classical Ayurvedic pharmacology: Rasa-Panchaka principles, herbal bioavailability vehicles (Anupana), purification protocols (Shodhana), and clinical contraindications.",
    assessmentDomainId: "ayurvedic-pharmacology",
    skills: ["ayurvedic-pharmacology", "dravya-guna", "rasa-shastra", "clinical-herbs"],
    instructor: {
      name: "Vaidya Dr. Ananya Sharma",
      title: "Professor of Dravyaguna Vigyana",
      institution: "All India Institute of Ayurveda (AIIA)",
    },
    modules: [
      {
        id: "ayush-mod-1",
        title: "Module 1: Fundamental Principles of Rasa-Panchaka",
        description: "Rasa (Taste), Guna (Qualities), Virya (Potency), Vipaka (Post-digestive effect), and Prabhava.",
        lessons: [
          {
            id: "ayush-1-1",
            title: "Rasa, Virya, and Vipaka Bio-Dynamics",
            duration: "30 min",
            content: {
              summary: "The foundational framework governing how Ayurvedic herbs interact with human doshas and metabolic tissues (Dhatus).",
              keyPoints: [
                "The 6 Rasas (Madhura, Amla, Lavana, Katu, Tikta, Kashaya) determine initial pharmacological action in the oral cavity and stomach.",
                "Virya represents active thermal potency (Ushna / Hot vs Sheeta / Cold).",
                "Vipaka governs long-term post-digestive transformation and cellular absorption.",
              ],
              technicalDeepDive:
                "In clinical pharmacology, herbs with Tikta (bitter) and Kashaya (astringent) rasa possess Katuvipaka and Sheeta virya, making them potent for pacifying aggravated Pitta and clearing Ama (endotoxins) without depleting bodily tissues.",
              tradeoffsDiscussion:
                "Potent heating herbs (Ushna Virya) rapidly stimulate metabolic Agni, but require careful balancing in patients with Pitta Prakriti or active inflammatory conditions.",
            },
          },
          {
            id: "ayush-1-2",
            title: "Pharmacokinetics of Withania Somnifera (Ashwagandha)",
            duration: "25 min",
            content: {
              summary: "Modern chemical profiling of withanolides aligned with classical Rasayana therapeutics.",
              keyPoints: [
                "Classification: Balya (strength-promoting), Rasayana (rejuvenator), and Medhya (nootropic).",
                "Balances Vata and Kapha; contains steroidal withanolides and alkaloids.",
                "Lipid solubility requires preparation with milk, ghee, or sesame oil (Anupana) for optimum blood-brain barrier penetration.",
              ],
              technicalDeepDive:
                "Active withanolides act on GABAergic and serotonergic receptors to modulate cortisol stress responses. Administering whole-root extract preserves natural steroidal lactones and prevents gastric irritation.",
              tradeoffsDiscussion:
                "Using synthetic isolated extracts guarantees standard mg dosage, but lacks the synergistic gut-protective polyphenols present in classical whole-root decoctions.",
            },
          },
        ],
      },
      {
        id: "ayush-mod-2",
        title: "Module 2: Formulations, Vehicles (Anupana) & Safety Protocols",
        description: "Selecting clinical carriers and adhering to Ayurvedic Pharmacopoeia (API) safety standards.",
        lessons: [
          {
            id: "ayush-2-1",
            title: "The Role of Anupana (Carrier Vehicles) in Bioavailability",
            duration: "20 min",
            content: {
              summary: "How therapeutic carriers direct active herbal constituents to target tissues.",
              keyPoints: [
                "Warm water acts as a universal vehicle for general metabolic clearance.",
                "Ghee (Ghrita) penetrates lipophilic neurological barriers for Medhya herbs.",
                "Honey (Madhu) acts as Yogavahi (catalytic transporter) for respiratory and anti-Kapha formulations.",
              ],
              technicalDeepDive:
                "Anupana alters gastric transit time and drug dissolution rates. Lipophilic active compounds bound to medium-chain fatty acids in Cow's Ghee bypass first-pass hepatic metabolism via lymphatic absorption.",
              tradeoffsDiscussion:
                "Honey must never be heated or mixed with boiling liquids according to classical toxicology (Charaka Samhita), as thermal degradation produces insoluble hydroxymethylfurfural compounds.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "advanced-dsa-optimization",
    title: "Advanced Data Structures & Algorithmic Optimization",
    domain: "Data Structures & Algorithms",
    category: "ENGINEERING",
    level: "INTERMEDIATE",
    duration: "5 Weeks (Self-Paced)",
    modulesCount: 3,
    lessonsCount: 6,
    description:
      "Deep-dive into dynamic programming, graph theory (Dijkstra, Tarjan SCC), tree indexing (B+ Trees, Tries), and amortized space-time complexity analysis.",
    assessmentDomainId: "dsa",
    skills: ["dsa", "dynamic-programming", "graphs", "trees", "complexity-analysis"],
    instructor: {
      name: "Prof. Sudhir Kulkarni",
      title: "Distinguished Algorithms Faculty",
      institution: "Institute of Computer Science",
    },
    modules: [
      {
        id: "dsa-mod-1",
        title: "Module 1: Advanced Tree Topologies & Indexing",
        description: "B+ Trees, Segment Trees, and Trie data structures for fast retrieval.",
        lessons: [
          {
            id: "dsa-1-1",
            title: "B+ Trees in Database Storage Engines",
            duration: "30 min",
            content: {
              summary: "Why database indices use B+ Trees instead of Binary Search Trees.",
              keyPoints: [
                "B+ Tree internal nodes store only keys and child pointers; all data records reside in leaf nodes.",
                "Leaf nodes are linked as a doubly-linked list for fast sequential range queries.",
                "High branching factor (fan-out) minimizes disk I/O seek operations.",
              ],
              technicalDeepDive:
                "Because disk reads occur in 4KB/8KB memory blocks, a B+ Tree node is sized to match a disk page. A tree of depth 3 with fan-out 100 can index 1,000,000 records with only 3 disk reads.",
              tradeoffsDiscussion:
                "B+ Trees provide O(log N) point queries and O(K) range scans, but require complex page-split rebalancing during random high-volume write operations.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "clinical-ayush-panchakarma",
    title: "Clinical Diagnosis & Panchakarma Protocols",
    domain: "Clinical Practice",
    category: "AYUSH",
    level: "ADVANCED",
    duration: "4 Weeks (Self-Paced)",
    modulesCount: 3,
    lessonsCount: 6,
    description:
      "Standardized clinical diagnostic methodology: Ashtavidha Pariksha, Panchakarma detoxification phases, and patient constitution (Prakriti) assessment.",
    assessmentDomainId: "clinical-practice",
    skills: ["clinical-practice", "panchakarma", "diagnostics", "dosha-analysis"],
    instructor: {
      name: "Dr. K. S. Murthy",
      title: "Chief Medical Officer (Ayurveda)",
      institution: "National Ayurvedic Healthcare Mission",
    },
    modules: [
      {
        id: "clin-mod-1",
        title: "Module 1: Eight-Fold Clinical Examination (Ashtavidha Pariksha)",
        description: "Nadi (Pulse), Mutra, Mala, Jihva, Shabda, Sparsha, Drik, and Akriti assessment.",
        lessons: [
          {
            id: "clin-1-1",
            title: "Standardized Nadi Pariksha & Pulse Diagnostics",
            duration: "35 min",
            content: {
              summary: "Clinical assessment of arterial radial pulse dynamics for systemic doshic balance.",
              keyPoints: [
                "Radial pulse examination at early morning hours before food intake.",
                "Index finger palpates Vata (Serpentine movement / Sarpa Gati).",
                "Middle finger palpates Pitta (Frog-like bounding / Manduka Gati).",
                "Ring finger palpates Kapha (Swan-like smooth / Hamsa Gati).",
              ],
              technicalDeepDive:
                "Palpation pressure is applied in three discrete depths: superficial (organ function), intermediate (dosha state), and deep (structural Prakriti/tissue vitality).",
              tradeoffsDiscussion:
                "Pulse diagnostics is non-invasive and provides instantaneous systemic signals, but requires clinical calibration and correlation with tongue (Jihva) and digestive history.",
            },
          },
        ],
      },
    ],
  },
];
