// github.js — GitHub Search + REST API helpers with caching

const GH_API = 'https://api.github.com';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours per performance rules

/** Simple in-memory + localStorage cache. */
const cache = {
  get(key) {
    try {
      const raw = localStorage.getItem(`gh_cache_${key}`);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL_MS) return null;
      return data;
    } catch {
      return null;
    }
  },
  set(key, data) {
    try {
      localStorage.setItem(`gh_cache_${key}`, JSON.stringify({ ts: Date.now(), data }));
    } catch {
      /* localStorage full or unavailable — fail silently */
    }
  },
};

/** Build auth headers. Token is required to avoid 60 req/hr limit. */
function headers(token) {
  const h = { Accept: 'application/vnd.github+json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** Search repositories. Returns normalized repo objects. */
export async function searchRepos(query, token, perPage = 10) {
  const cacheKey = `search_${query}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = `${GH_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`;
  const res = await fetch(url, { headers: headers(token) });
  if (!res.ok) {
    throw new Error(`GitHub search failed (${res.status}): ${res.statusText}`);
  }
  const json = await res.json();
  const repos = (json.items || []).map(normalizeRepo);
  cache.set(cacheKey, repos);
  return repos;
}

/** Fetch a README excerpt (first 500 chars of decoded content). */
export async function fetchReadmeExcerpt(fullName, token) {
  const cacheKey = `readme_${fullName}`;
  const cached = cache.get(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await fetch(`${GH_API}/repos/${fullName}/readme`, { headers: headers(token) });
    if (!res.ok) {
      cache.set(cacheKey, '');
      return '';
    }
    const json = await res.json();
    const decoded = json.content ? atob(json.content.replace(/\n/g, '')) : '';
    const excerpt = decoded.slice(0, 500);
    cache.set(cacheKey, excerpt);
    return excerpt;
  } catch {
    return '';
  }
}

/** Normalize a GitHub API repo object into our internal shape. */
function normalizeRepo(r) {
  return {
    id: r.full_name,
    name: r.name,
    owner: r.owner?.login || '',
    description: r.description || '',
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    last_pushed: r.pushed_at || '',
    topics: r.topics || [],
    language: r.language || '',
    url: r.html_url || '',
    readme_excerpt: '', // filled in by fetchReadmeExcerpt when needed
  };
}
