// scout.js — Agent 1: The Scout
// Job: Search GitHub across all 4 domain query recipes IN PARALLEL,
// return a deduplicated raw repo list. No scoring here — that's the Analyst's job.

import { searchRepos, fetchReadmeExcerpt } from '../api/github.js';
import { QUERY_RECIPES, resolveQuery, DOMAINS } from '../queries/recipes.js';

/**
 * Run the Scout across all domains in parallel.
 * Returns { repos: [...], queriesRun: n, byDomain: {...} }
 */
export async function runScout(token, { maxPerDomain = 10, lookbackDays = 30 } = {}) {
  // Build one flat list of {domain, query} tasks across all recipes
  const tasks = [];
  for (const domain of DOMAINS) {
    for (const template of QUERY_RECIPES[domain]) {
      tasks.push({ domain, query: resolveQuery(template, lookbackDays) });
    }
  }

  // Execute ALL searches in parallel (performance rule PRF-001)
  const results = await Promise.allSettled(
    tasks.map((t) => searchRepos(t.query, token, maxPerDomain))
  );

  // Merge + dedupe by repo id, tagging each repo with the domain that found it
  const seen = new Map();
  results.forEach((result, i) => {
    if (result.status !== 'fulfilled') return;
    const { domain } = tasks[i];
    for (const repo of result.value) {
      if (!seen.has(repo.id)) {
        seen.set(repo.id, { ...repo, found_via: [domain] });
      } else {
        const existing = seen.get(repo.id);
        if (!existing.found_via.includes(domain)) existing.found_via.push(domain);
      }
    }
  });

  let repos = Array.from(seen.values());

  // Trim to a sane total, prioritizing repos surfaced by multiple domains, then stars
  repos.sort((a, b) => (b.found_via.length - a.found_via.length) || (b.stars - a.stars));
  repos = repos.slice(0, maxPerDomain * DOMAINS.length);

  // Enrich top repos with README excerpts (also in parallel)
  await Promise.allSettled(
    repos.map(async (repo) => {
      repo.readme_excerpt = await fetchReadmeExcerpt(repo.id, token);
    })
  );

  const byDomain = {};
  for (const d of DOMAINS) byDomain[d] = repos.filter((r) => r.found_via.includes(d)).length;

  return { repos, queriesRun: tasks.length, byDomain };
}
