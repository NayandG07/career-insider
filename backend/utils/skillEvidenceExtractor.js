/**
 * Skill Evidence Extractor v2 (5-Dimension Deterministic Evidence Engine)
 * 
 * Extracts factual metrics from LeetCode, Codeforces, GitHub, and Projects.
 * Calculates deterministic Evidence Strength (0-100) across 5 standard dimensions:
 * 1. Breadth (20%) - Concept domain coverage against known reference sets
 * 2. Depth (30%) - Problem difficulty, rating benchmarks, diminishing-return saturation
 * 3. Recency / Consistency (15%) - Active days, recent submissions & commit recency
 * 4. Practical Application (20%) - Deduplicated project implementations & declared stacks
 * 5. Cross-Source Corroboration (15%) - Multi-source verification confidence bonus
 * 
 * Maps Evidence Strength to standard qualitative bands:
 * - 0–24: Insufficient Evidence
 * - 25–44: Emerging
 * - 45–64: Developing
 * - 65–84: Strong
 * - 85–100: Advanced Evidence
 */

export function extractSkillEvidence({ telemetry = {}, projects = [] }) {
  const leetcode = telemetry.leetcode || {};
  const codeforces = telemetry.codeforces || {};
  const github = telemetry.github || {};

  const evidenceItems = [];
  const skillEvidenceMap = {};

  // Deduplicate projects by repositoryUrl or title to prevent double-counting
  const seenProjectKeys = new Set();
  const dedupedProjects = [];
  for (const p of projects) {
    const key = (p.repositoryUrl || p.title || '').trim().toLowerCase();
    if (key && seenProjectKeys.has(key)) continue;
    if (key) seenProjectKeys.add(key);
    dedupedProjects.push(p);
  }

  // ─── 1. LeetCode Evidence Extraction ─────────────────────────────────────────
  const lcSolved = Number(leetcode.totalSolved) || 0;
  const lcEasy = Number(leetcode.easySolved) || 0;
  const lcMed = Number(leetcode.mediumSolved) || 0;
  const lcHard = Number(leetcode.hardSolved) || 0;
  const lcRating = Number(leetcode.contestRating) || null;
  const lcActiveDays = Number(leetcode.totalActiveDays) || 0;
  const lcTopicTags = Array.isArray(leetcode.topTopicTags) ? leetcode.topTopicTags : [];
  const lcLanguages = Array.isArray(leetcode.languageStats) ? leetcode.languageStats : [];

  if (lcSolved > 0) {
    evidenceItems.push({
      id: 'leetcode:summary',
      source: 'leetcode',
      label: 'LeetCode Problem Solving',
      value: `${lcSolved} solved (${lcEasy}E / ${lcMed}M / ${lcHard}H)`,
      weight: lcSolved,
    });
  }

  for (const topic of lcTopicTags) {
    const tagName = topic.tag;
    const count = Number(topic.solved) || 0;
    if (tagName && count > 0) {
      const refId = `leetcode:tag:${tagName.toLowerCase().replace(/\s+/g, '-')}`;
      const item = {
        id: refId,
        source: 'leetcode',
        skillName: tagName,
        metric: 'solvedProblems',
        value: `${count} problems solved`,
        count,
      };
      evidenceItems.push(item);
      if (!skillEvidenceMap[tagName]) skillEvidenceMap[tagName] = [];
      skillEvidenceMap[tagName].push(item);
    }
  }

  for (const lang of lcLanguages) {
    const langName = lang.languageName;
    const count = Number(lang.problemsSolved) || 0;
    if (langName && count > 0) {
      const refId = `leetcode:lang:${langName.toLowerCase()}`;
      const item = {
        id: refId,
        source: 'leetcode',
        skillName: langName,
        metric: 'languageSolutions',
        value: `${count} solutions solved`,
        count,
      };
      evidenceItems.push(item);
      if (!skillEvidenceMap[langName]) skillEvidenceMap[langName] = [];
      skillEvidenceMap[langName].push(item);
    }
  }

  // ─── 2. Codeforces Evidence Extraction ───────────────────────────────────────
  const cfRating = Number(codeforces.rating) || null;
  const cfMaxRating = Number(codeforces.maxRating) || null;
  const cfRank = codeforces.rank || null;
  const cfSolved = Number(codeforces.solvedCount) || 0;
  const cfContests = Number(codeforces.contestCount) || 0;
  const cfTags = Array.isArray(codeforces.topTags) ? codeforces.topTags : [];

  if (cfRating || cfSolved > 0) {
    evidenceItems.push({
      id: 'codeforces:summary',
      source: 'codeforces',
      label: 'Codeforces Competitive Rating',
      value: cfRating ? `${cfRating} Rating (${cfRank || 'Ranked'}) • ${cfSolved} solved • ${cfContests} contests` : `${cfSolved} solved`,
      weight: cfRating || cfSolved * 10,
    });
  }

  for (const tag of cfTags) {
    const tagName = tag.tag;
    const count = Number(tag.count) || 0;
    if (tagName && count > 0) {
      const refId = `codeforces:tag:${tagName.toLowerCase().replace(/\s+/g, '-')}`;
      const item = {
        id: refId,
        source: 'codeforces',
        skillName: tagName,
        metric: 'acceptedProblems',
        value: `${count} accepted submissions`,
        count,
      };
      evidenceItems.push(item);
      if (!skillEvidenceMap[tagName]) skillEvidenceMap[tagName] = [];
      skillEvidenceMap[tagName].push(item);
    }
  }

  // ─── 3. GitHub Evidence Extraction ───────────────────────────────────────────
  const ghRepos = Number(github.publicRepos || github.totalRepos) || 0;
  const ghLanguages = Array.isArray(github.topLanguages) ? github.topLanguages : [];
  const ghCommits = Number(github.totalCommitsRecent) || 0;

  if (ghRepos > 0) {
    evidenceItems.push({
      id: 'github:summary',
      source: 'github',
      label: 'GitHub Repositories & Activity',
      value: `${ghRepos} repositories • ${ghCommits} recent commits`,
      weight: ghRepos * 5,
    });
  }

  for (const lang of ghLanguages) {
    const langName = lang.name;
    const bytes = Number(lang.bytes) || 0;
    if (langName) {
      const refId = `github:lang:${langName.toLowerCase()}`;
      const kb = Math.round(bytes / 1024);
      const item = {
        id: refId,
        source: 'github',
        skillName: langName,
        metric: 'codeVolume',
        value: `${kb.toLocaleString()} KB codebase volume`,
        count: kb,
      };
      evidenceItems.push(item);
      if (!skillEvidenceMap[langName]) skillEvidenceMap[langName] = [];
      skillEvidenceMap[langName].push(item);
    }
  }

  // ─── 4. Project Declared Technologies ────────────────────────────────────────
  const projectTechCounts = {};
  for (const p of dedupedProjects) {
    for (const tech of p.technologies || []) {
      const cleanTech = tech.trim();
      if (!cleanTech) continue;
      projectTechCounts[cleanTech] = (projectTechCounts[cleanTech] || 0) + 1;
    }
  }

  for (const [tech, count] of Object.entries(projectTechCounts)) {
    const refId = `project:tech:${tech.toLowerCase().replace(/\s+/g, '-')}`;
    const item = {
      id: refId,
      source: 'project',
      skillName: tech,
      metric: 'appliedProject',
      value: `Implemented across ${count} showcase project${count > 1 ? 's' : ''}`,
      count,
    };
    evidenceItems.push(item);
    if (!skillEvidenceMap[tech]) skillEvidenceMap[tech] = [];
    skillEvidenceMap[tech].push(item);
  }

  // ─── 5. Deterministic Source Contribution Counts ─────────────────────────────
  let leetcodeEvidenceCount = 0;
  let codeforcesEvidenceCount = 0;
  let githubEvidenceCount = 0;
  let projectEvidenceCount = 0;

  for (const ev of evidenceItems) {
    if (ev.source === 'leetcode') leetcodeEvidenceCount++;
    else if (ev.source === 'codeforces') codeforcesEvidenceCount++;
    else if (ev.source === 'github') githubEvidenceCount++;
    else if (ev.source === 'project') projectEvidenceCount++;
  }

  const totalEvidenceCount = leetcodeEvidenceCount + codeforcesEvidenceCount + githubEvidenceCount + projectEvidenceCount;

  const sourceContributions = {
    leetcode: totalEvidenceCount > 0 ? Math.round((leetcodeEvidenceCount / totalEvidenceCount) * 100) : 0,
    codeforces: totalEvidenceCount > 0 ? Math.round((codeforcesEvidenceCount / totalEvidenceCount) * 100) : 0,
    github: totalEvidenceCount > 0 ? Math.round((githubEvidenceCount / totalEvidenceCount) * 100) : 0,
    project: totalEvidenceCount > 0 ? Math.round((projectEvidenceCount / totalEvidenceCount) * 100) : 0,
    counts: {
      leetcode: leetcodeEvidenceCount,
      codeforces: codeforcesEvidenceCount,
      github: githubEvidenceCount,
      project: projectEvidenceCount,
      total: totalEvidenceCount,
    },
  };

  // ─── 6. Multi-Dimensional Category Scoring Engine (20 / 30 / 15 / 20 / 15) ───

  const categoryDefinitions = [
    {
      name: 'Algorithms & Problem Solving',
      keywords: ['Dynamic Programming', 'Graph Theory', 'Binary Search', 'Trees', 'Arrays', 'Math', 'Greedy', 'Data Structures', 'Algorithms', 'dp', 'graphs', 'two-pointers', 'recursion', 'sorting', 'dfs and similar', 'data structures'],
      // Standard reference topics (8 key concept domains)
      referenceDomains: ['arrays', 'strings', 'trees', 'graphs', 'dp', 'binary-search', 'greedy', 'math'],
      calculateDimensions: () => {
        // 1. Breadth (20 pts): Distinct algorithmic tags demonstrated out of 8 standard reference domains
        const demonstratedDomains = new Set();
        for (const t of lcTopicTags) {
          const lower = (t.tag || '').toLowerCase();
          if (/array|two-pointer/i.test(lower)) demonstratedDomains.add('arrays');
          if (/string/i.test(lower)) demonstratedDomains.add('strings');
          if (/tree|bst/i.test(lower)) demonstratedDomains.add('trees');
          if (/graph|dfs|bfs/i.test(lower)) demonstratedDomains.add('graphs');
          if (/dp|dynamic/i.test(lower)) demonstratedDomains.add('dp');
          if (/binary search|search/i.test(lower)) demonstratedDomains.add('binary-search');
          if (/greedy/i.test(lower)) demonstratedDomains.add('greedy');
          if (/math|number theory/i.test(lower)) demonstratedDomains.add('math');
        }
        for (const t of cfTags) {
          const lower = (t.tag || '').toLowerCase();
          if (/data structures|sort/i.test(lower)) demonstratedDomains.add('arrays');
          if (/strings/i.test(lower)) demonstratedDomains.add('strings');
          if (/trees/i.test(lower)) demonstratedDomains.add('trees');
          if (/graphs|dfs/i.test(lower)) demonstratedDomains.add('graphs');
          if (/dp/i.test(lower)) demonstratedDomains.add('dp');
          if (/binary search/i.test(lower)) demonstratedDomains.add('binary-search');
          if (/greedy/i.test(lower)) demonstratedDomains.add('greedy');
          if (/math|number theory/i.test(lower)) demonstratedDomains.add('math');
        }
        const breadth = Math.min(20, Math.round((demonstratedDomains.size / 8) * 20));

        // 2. Depth (30 pts): Difficulty weighted solves + CF Rating Benchmark with diminishing returns
        const lcWeighted = (lcEasy * 0.2) + (lcMed * 0.8) + (lcHard * 2.0);
        // Saturated curve: 100 weighted solves approaches 20 pts
        const lcDepthComponent = Math.min(20, Math.round(20 * (1 - Math.exp(-lcWeighted / 50))));
        // CF Rating component: 1600 bar = 10 pts
        const cfRatingComponent = cfRating ? Math.min(10, Math.round(Math.min(1.0, cfRating / 1600) * 10)) : Math.min(5, cfSolved * 0.5);
        const depth = Math.min(30, lcDepthComponent + cfRatingComponent);

        // 3. Recency / Consistency (15 pts): Active days & contest participation
        const activeDaysScore = Math.min(10, Math.round((lcActiveDays / 30) * 10));
        const contestScore = Math.min(5, cfContests >= 5 ? 5 : cfContests * 1);
        const recency = Math.min(15, activeDaysScore + contestScore);

        // 4. Practical Application (20 pts): Algorithmic solutions applied or showcased
        const appScore = lcSolved > 50 ? 15 : lcSolved > 10 ? 10 : lcSolved > 0 ? 5 : 0;
        const application = Math.min(20, appScore);

        // 5. Cross-Source Corroboration (15 pts): Both LeetCode & Codeforces verified
        let sources = 0;
        if (lcSolved > 0) sources++;
        if (cfRating || cfSolved > 0) sources++;
        const corroboration = sources >= 2 ? 15 : sources === 1 ? 7 : 0;

        return { breadth, depth, recency, application, corroboration };
      },
    },
    {
      name: 'Programming Languages',
      keywords: ['JavaScript', 'TypeScript', 'Python', 'C++', 'Java', 'Go', 'Rust', 'C', 'HTML', 'CSS', 'PHP', 'Ruby', 'Swift', 'Kotlin'],
      referenceDomains: ['c++', 'python', 'javascript', 'typescript', 'java', 'go', 'rust', 'c'],
      calculateDimensions: () => {
        // 1. Breadth (20 pts): Languages used across LC + GitHub
        const langs = new Set();
        for (const l of lcLanguages) if (l.languageName) langs.add(l.languageName.toLowerCase());
        for (const l of ghLanguages) if (l.name) langs.add(l.name.toLowerCase());
        const breadth = Math.min(20, Math.round(Math.min(1.0, langs.size / 4) * 20));

        // 2. Depth (30 pts): Primary language volume & problem solutions
        const topGhKb = (ghLanguages[0]?.bytes || 0) / 1024;
        const ghDepth = Math.min(18, Math.round(18 * (1 - Math.exp(-topGhKb / 150))));
        const topLcCount = lcLanguages[0]?.problemsSolved || 0;
        const lcDepth = Math.min(12, Math.round(12 * (1 - Math.exp(-topLcCount / 30))));
        const depth = Math.min(30, ghDepth + lcDepth);

        // 3. Recency / Consistency (15 pts): GitHub commit recency
        const recency = Math.min(15, Math.round(Math.min(1.0, ghCommits / 40) * 15));

        // 4. Practical Application (20 pts): Declared technologies in showcase projects
        const projectTechs = Object.keys(projectTechCounts).length;
        const application = projectTechs >= 4 ? 20 : projectTechs >= 2 ? 15 : projectTechs >= 1 ? 10 : 0;

        // 5. Cross-Source Corroboration (15 pts): Languages appearing in both GitHub & LeetCode / Projects
        let multiVerifiedLangs = 0;
        for (const lang of langs) {
          const onGh = ghLanguages.some(l => l.name.toLowerCase() === lang);
          const onLc = lcLanguages.some(l => l.languageName.toLowerCase() === lang);
          const onProj = Object.keys(projectTechCounts).some(t => t.toLowerCase() === lang);
          if ((onGh && onLc) || (onGh && onProj) || (onLc && onProj)) multiVerifiedLangs++;
        }
        const corroboration = multiVerifiedLangs >= 2 ? 15 : multiVerifiedLangs === 1 ? 10 : 5;

        return { breadth, depth, recency, application, corroboration };
      },
    },
    {
      name: 'Backend Engineering',
      keywords: ['Node.js', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'REST APIs', 'GraphQL', 'Microservices', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL', 'Databases'],
      referenceDomains: ['api', 'database', 'caching', 'microservices', 'auth', 'orm'],
      calculateDimensions: () => {
        const backendProjects = dedupedProjects.filter(p => (p.technologies || []).some(t => /node|express|fastapi|django|flask|spring|sql|mongo|postgres|redis|api|backend/i.test(t)));
        const backendTechs = Object.keys(projectTechCounts).filter(t => /node|express|fastapi|django|flask|spring|sql|mongo|postgres|redis|api|backend/i.test(t));

        // 1. Breadth (20 pts): Distinct backend tech layers (API framework, DB, Cache, Auth)
        const layers = new Set();
        if (backendTechs.some(t => /express|node|fastapi|django|flask|spring/i.test(t))) layers.add('framework');
        if (backendTechs.some(t => /mongo|postgres|sql|database/i.test(t))) layers.add('database');
        if (backendTechs.some(t => /redis|cache/i.test(t))) layers.add('caching');
        if (backendTechs.some(t => /jwt|auth|bcrypt|oauth/i.test(t))) layers.add('auth');
        const breadth = Math.min(20, Math.round((layers.size / 4) * 20));

        // 2. Depth (30 pts): Production project complexity & stack depth
        const projCount = backendProjects.length;
        const depth = projCount >= 3 ? 30 : projCount === 2 ? 22 : projCount === 1 ? 14 : 0;

        // 3. Recency / Consistency (15 pts): GitHub commit activity & recent projects
        const recency = Math.min(15, ghCommits > 20 ? 15 : ghCommits > 5 ? 10 : 5);

        // 4. Practical Application (20 pts): Number of applied projects with diminishing returns
        const application = projCount >= 4 ? 20 : projCount === 3 ? 18 : projCount === 2 ? 15 : projCount === 1 ? 10 : 0;

        // 5. Cross-Source Corroboration (15 pts): Backend technologies corroborated on GitHub repos
        const hasGhBackendLang = ghLanguages.some(l => /javascript|typescript|python|java|go|rust/i.test(l.name));
        const corroboration = (projCount > 0 && hasGhBackendLang) ? 15 : projCount > 0 ? 8 : 0;

        return { breadth, depth, recency, application, corroboration };
      },
    },
    {
      name: 'Frontend Development',
      keywords: ['React', 'Next.js', 'Vue', 'Tailwind', 'CSS', 'HTML', 'Framer Motion', 'Redux', 'UI', 'Frontend', 'JavaScript', 'TypeScript'],
      referenceDomains: ['react', 'vue', 'css', 'state-management', 'animations'],
      calculateDimensions: () => {
        const frontendProjects = dedupedProjects.filter(p => (p.technologies || []).some(t => /react|next|vue|tailwind|css|html|ui|frontend|framer/i.test(t)));
        const frontendTechs = Object.keys(projectTechCounts).filter(t => /react|next|vue|tailwind|css|html|ui|frontend|framer/i.test(t));

        // 1. Breadth (20 pts): Framework + Styling + UI libraries
        const layers = new Set();
        if (frontendTechs.some(t => /react|next|vue/i.test(t))) layers.add('framework');
        if (frontendTechs.some(t => /tailwind|css/i.test(t))) layers.add('styling');
        if (frontendTechs.some(t => /motion|framer|redux/i.test(t))) layers.add('ui-lib');
        if (frontendTechs.some(t => /typescript|javascript/i.test(t))) layers.add('lang');
        const breadth = Math.min(20, Math.round((layers.size / 4) * 20));

        // 2. Depth (30 pts): JS/TS volume on GitHub + multi-project usage
        const jsKb = (ghLanguages.find(l => /javascript|typescript/i.test(l.name))?.bytes || 0) / 1024;
        const jsVolume = Math.min(15, Math.round(15 * (1 - Math.exp(-jsKb / 200))));
        const projDepth = frontendProjects.length >= 2 ? 15 : frontendProjects.length === 1 ? 10 : 0;
        const depth = Math.min(30, jsVolume + projDepth);

        // 3. Recency / Consistency (15 pts): Commits
        const recency = Math.min(15, ghCommits > 15 ? 15 : ghCommits > 0 ? 9 : 0);

        // 4. Practical Application (20 pts): Project applications
        const projCount = frontendProjects.length;
        const application = projCount >= 3 ? 20 : projCount === 2 ? 16 : projCount === 1 ? 10 : 0;

        // 5. Cross-Source Corroboration (15 pts): UI framework + GitHub repo confirmation
        const corroboration = (projCount > 0 && jsKb > 50) ? 15 : projCount > 0 ? 8 : 0;

        return { breadth, depth, recency, application, corroboration };
      },
    },
    {
      name: 'Systems & Developer Tools',
      keywords: ['Git', 'Docker', 'Linux', 'CI/CD', 'GitHub Actions', 'AWS', 'Kubernetes', 'Nginx', 'DevOps'],
      referenceDomains: ['git', 'docker', 'ci-cd', 'cloud', 'linux'],
      calculateDimensions: () => {
        // 1. Breadth (20 pts): Repos + declared tool technologies
        const sysTechs = Object.keys(projectTechCounts).filter(t => /git|docker|linux|ci|actions|aws|k8s|nginx/i.test(t));
        const breadth = Math.min(20, ghRepos >= 5 ? 15 : ghRepos >= 2 ? 10 : 5) + (sysTechs.length >= 2 ? 5 : 0);

        // 2. Depth (30 pts): Repo count saturation & commit density
        const repoDepth = Math.min(20, Math.round(20 * (1 - Math.exp(-ghRepos / 8))));
        const commitDepth = Math.min(10, Math.round(10 * (1 - Math.exp(-ghCommits / 30))));
        const depth = Math.min(30, repoDepth + commitDepth);

        // 3. Recency / Consistency (15 pts)
        const recency = Math.min(15, ghCommits >= 30 ? 15 : ghCommits >= 10 ? 10 : 5);

        // 4. Practical Application (20 pts): Declared CI/CD/Docker projects
        const sysProjects = dedupedProjects.filter(p => (p.technologies || []).some(t => /git|docker|linux|ci|aws|k8s|nginx/i.test(t))).length;
        const application = sysProjects >= 3 ? 20 : sysProjects === 2 ? 15 : sysProjects === 1 ? 10 : 4;

        // 5. Cross-Source Corroboration (15 pts)
        const corroboration = (ghRepos > 0 && ghCommits > 0) ? 15 : ghRepos > 0 ? 8 : 0;

        return { breadth, depth, recency, application, corroboration };
      },
    }
  ];

  const categories = categoryDefinitions.map(cat => {
    let matchedCount = 0;
    const matchedSkills = [];

    for (const [skillName, evList] of Object.entries(skillEvidenceMap)) {
      const matchesCategory = cat.keywords.some(kw => skillName.toLowerCase().includes(kw.toLowerCase()));
      if (matchesCategory) {
        matchedCount += evList.length;
        matchedSkills.push({
          name: skillName,
          evidenceCount: evList.length,
          evidenceRefs: evList.map(e => e.id),
        });
      }
    }

    const dims = cat.calculateDimensions();
    const totalScore = Math.max(0, Math.min(100, dims.breadth + dims.depth + dims.recency + dims.application + dims.corroboration));

    let level = 'Insufficient Evidence';
    if (totalScore >= 85) level = 'Advanced Evidence';
    else if (totalScore >= 65) level = 'Strong';
    else if (totalScore >= 45) level = 'Developing';
    else if (totalScore >= 25) level = 'Emerging';

    return {
      name: cat.name,
      score: totalScore,
      level,
      matchedCount,
      dimensions: dims,
      skills: matchedSkills.sort((a, b) => b.evidenceCount - a.evidenceCount),
    };
  }).filter(c => c.matchedCount > 0 || c.score > 0);

  return {
    scoringVersion: 2,
    scoringModel: 'v2-5dim',
    rawMetrics: {
      leetcode: {
        totalSolved: lcSolved,
        easySolved: lcEasy,
        mediumSolved: lcMed,
        hardSolved: lcHard,
        contestRating: lcRating,
        activeDays: lcActiveDays,
      },
      codeforces: {
        rating: cfRating,
        maxRating: cfMaxRating,
        rank: cfRank,
        solvedCount: cfSolved,
        contestCount: cfContests,
      },
      github: {
        repositories: ghRepos,
        recentCommits: ghCommits,
        topLanguages: ghLanguages.slice(0, 5),
      },
      projectsCount: dedupedProjects.length,
    },
    evidenceItems,
    skillEvidenceMap,
    sourceContributions,
    categories,
  };
}
