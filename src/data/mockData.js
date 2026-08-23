// Mock Data for CareerOS AI Career Operating System

export const initialUserData = {
  name: "Nayan",
  role: "Backend Engineer",
  targetRole: "Senior Backend Engineer",
  readinessScore: 72,
  targetScore: 90,
  weeklyGrowth: 4,
  connectedSources: {
    github: { connected: true, username: "nayan-dev", repos: 24, contributions: 342 },
    leetcode: { connected: true, username: "nayan_codes", solved: 184, ranking: 45200 },
    codeforces: { connected: false, username: "" },
    codechef: { connected: false, username: "" },
    kaggle: { connected: false, username: "" },
    resume: { connected: true, fileName: "Nayan_Resume_Backend_2026.pdf", parsedAt: "2026-08-20" }
  }
};

export const skillsData = [
  { subject: 'Backend', A: 85, B: 90, fullMark: 100, level: 85, evidence: '3 Projects', growth: 12 },
  { subject: 'Frontend', A: 60, B: 85, fullMark: 100, level: 60, evidence: '1 Project', growth: 5 },
  { subject: 'DevOps', A: 45, B: 80, fullMark: 100, level: 45, evidence: '2 Projects', growth: 15 },
  { subject: 'Cloud', A: 50, B: 80, fullMark: 100, level: 50, evidence: '1 Project', growth: 8 },
  { subject: 'DSA', A: 75, B: 90, fullMark: 100, level: 75, evidence: '184 Solved', growth: 4 },
  { subject: 'AI/ML', A: 30, B: 70, fullMark: 100, level: 30, evidence: 'Conceptual', growth: 0 },
  { subject: 'System Design', A: 55, B: 85, fullMark: 100, level: 55, evidence: '2 Studies', growth: 18 },
  { subject: 'Data Eng', A: 40, B: 75, fullMark: 100, level: 40, evidence: '1 Project', growth: 6 },
];

export const roadmapData = {
  blueprint: [
    { id: 1, name: "APIs & Protocols", status: "completed", type: "Backend", details: "REST, GraphQL, gRPC basics" },
    { id: 2, name: "SQL & Databases", status: "completed", type: "Backend", details: "PostgreSQL, Indexing, Transactions" },
    { id: 3, name: "Authentication & Security", status: "completed", type: "Backend", details: "JWT, OAuth2, Session management" },
    { id: 4, name: "Containerization (Docker)", status: "in-progress", type: "DevOps", details: "Dockerfile, Docker Compose, Multi-stage builds" },
    { id: 5, name: "Caching (Redis)", status: "locked", type: "System Design", details: "Redis data types, eviction policies, pub/sub" },
    { id: 6, name: "Message Brokers (Kafka)", status: "locked", type: "System Design", details: "Topics, partitions, consumer groups" },
    { id: 7, name: "Distributed Systems & Scalability", status: "locked", type: "System Design", details: "Load balancing, sharding, replication" },
  ],
  recommended: [
    {
      id: "action-1",
      title: "Learn Docker",
      description: "Understand image building, containers, and deployment automation.",
      impact: 4,
      time: "3 Days",
      difficulty: "Beginner",
      unlocks: "Containerized Projects",
      status: "in-progress"
    },
    {
      id: "action-2",
      title: "Redis Caching Essentials",
      description: "Implement high-performance read-aside and write-through caching.",
      impact: 3,
      time: "4 Days",
      difficulty: "Intermediate",
      unlocks: "High-Throughput APIs",
      status: "locked"
    },
    {
      id: "action-3",
      title: "Distributed Message Streams (Kafka)",
      description: "Implement asynchronous event-driven architectures with Apache Kafka.",
      impact: 5,
      time: "6 Days",
      difficulty: "Advanced",
      unlocks: "Real-time Event Systems",
      status: "locked"
    }
  ],
  progress: {
    completedItems: 9,
    totalItems: 14,
    percentage: 64,
    achievements: [
      { id: "ach-1", title: "API Architect Badge", date: "2 days ago" },
      { id: "ach-2", title: "Database Guru Certification", date: "1 week ago" }
    ]
  }
};

export const companyMatchesData = [
  {
    id: "comp-1",
    name: "Razorpay",
    logo: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=80&h=80&fit=crop&q=80",
    matchScore: 84,
    strong: ["Backend Development", "SQL Databases", "API Protocols"],
    weak: ["System Design", "Caching (Redis)"],
    missing: ["Redis Caching", "Docker Containerization"],
    hiringInsights: "Hiring for Backend Engineer II. Emphasizes highly scalable database design, transactional consistency, and APIs handling 10k+ Req/sec.",
    tier: "Target"
  },
  {
    id: "comp-2",
    name: "Google",
    logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=80&h=80&fit=crop&q=80",
    matchScore: 68,
    strong: ["DSA", "Backend Development"],
    weak: ["System Design", "Cloud Architecture"],
    missing: ["Advanced Distributed Systems", "Kubernetes Orchestration"],
    hiringInsights: "Hiring L4 Software Engineer. Focuses heavily on algorithms, system scalability, and low-latency network design.",
    tier: "Dream"
  },
  {
    id: "comp-3",
    name: "Uber",
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=80&h=80&fit=crop&q=80",
    matchScore: 72,
    strong: ["Backend Core", "DSA", "SQL Databases"],
    weak: ["DevOps", "Event-Driven Dev"],
    missing: ["Apache Kafka", "Docker Containerization"],
    hiringInsights: "Hiring SE II. High scale APIs and real-time streaming architectures are critical for matching algorithms.",
    tier: "Dream"
  },
  {
    id: "comp-4",
    name: "Atlassian",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&h=80&fit=crop&q=80",
    matchScore: 79,
    strong: ["Backend Core", "SQL Databases", "Authentication"],
    weak: ["System Design"],
    missing: ["Docker Containerization", "Kubernetes"],
    hiringInsights: "Focus on Jira Cloud scale, microservice communication, and resilience patterns.",
    tier: "Dream"
  },
  {
    id: "comp-5",
    name: "PhonePe",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aba9?w=80&h=80&fit=crop&q=80",
    matchScore: 80,
    strong: ["Backend Core", "SQL Databases"],
    weak: ["System Design", "Caching"],
    missing: ["Redis Caching", "Apache Kafka"],
    hiringInsights: "High-scale payment gateway systems, transactional consistency, and distributed storage.",
    tier: "Target"
  },
  {
    id: "comp-6",
    name: "Groww",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop&q=80",
    matchScore: 82,
    strong: ["Backend Core", "APIs & Protocols"],
    weak: ["DevOps"],
    missing: ["Docker Containerization"],
    hiringInsights: "Fintech order book scaling, container deployment, microservice pipeline automation.",
    tier: "Target"
  }
];

export const weeklyProgressData = [
  { week: 'Wk 1', score: 60 },
  { week: 'Wk 2', score: 62 },
  { week: 'Wk 3', score: 65 },
  { week: 'Wk 4', score: 68 },
  { week: 'Wk 5', score: 68 },
  { week: 'Wk 6', score: 72 },
];

export const initialConversation = [
  {
    sender: "ai",
    text: "Good morning, Nayan! I've reviewed your latest GitHub commits and LeetCode updates. Your backend score has increased, bringing your overall Career Readiness to **72%** (+4% this week). You're making excellent progress towards your **90% target** for senior backend roles. Let's work on closing the remaining gaps."
  },
  {
    sender: "user",
    text: "What should I learn next to maximize my readiness score?"
  },
  {
    sender: "ai",
    text: "Based on your target companies (**Razorpay**, **Uber**, and **PhonePe**), your single biggest missing competency is **Containerization (Docker)**, which currently blocks **84%** match readiness at Razorpay. Learning Docker will unlock Containerized Projects and instantly boost your overall Career Readiness score by **+4%**.\n\nWould you like me to generate a tailored 3-day roadmap for Docker, or should we look into System Design prep for Google?",
    suggestedActions: [
      "Generate 3-day Docker Roadmap",
      "Prepare System Design for Google",
      "Show missing skills for Uber",
      "How to reach 80% readiness?"
    ]
  }
];

export const reportsData = {
  weekly: {
    readinessGrowth: "+4% (Current: 72%)",
    skillGrowth: "System Design (+18%), DevOps (+15%)",
    achievements: "Completed API protocols module & built 1 containerized service",
    companyProgress: "Match score at Razorpay increased from 80% to 84%"
  },
  monthly: {
    skillChanges: [
      { skill: "Backend", before: 80, after: 85 },
      { skill: "DSA", before: 70, after: 75 },
      { skill: "System Design", before: 40, after: 55 },
      { skill: "DevOps", before: 30, after: 45 }
    ],
    roadmapCompletion: "6 roadmap sub-modules completed",
    companyMatchChanges: [
      { company: "Razorpay", before: 76, after: 84 },
      { company: "Uber", before: 66, after: 72 },
      { company: "PhonePe", before: 74, after: 80 }
    ],
    trajectory: "On track to hit 90% Readiness score in 5 weeks (ahead of target by 10 days)"
  },
  wrapped: {
    mostImprovedSkill: "System Design (+18% growth)",
    topLanguage: "NodeJS / TypeScript",
    biggestAchievement: "Designed and benchmarked a distributed rate limiter matching Razorpay's scale requirement",
    careerGrowth: "+22% overall Career Readiness score this year",
    newOpportunitiesUnlocked: "Unlocked 4 new Match Tiers at Razorpay, Groww, and PhonePe"
  }
};
