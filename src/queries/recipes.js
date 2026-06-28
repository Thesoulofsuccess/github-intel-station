// recipes.js — thin re-export of the canonical config.
// SINGLE SOURCE OF TRUTH is scripts/recipes.json (also consumed by run_pipeline.py).
// Do NOT hand-edit query lists here — edit recipes.json so the pipeline and UI never drift.

import cfg from '../../scripts/recipes.json';

export function lookbackDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export function resolveQuery(template, days = 30) {
  return template.replace(/{DATE}/g, lookbackDate(days));
}

export const DOMAINS = Object.keys(cfg.domains);
export const DOMAIN_META = cfg.domains;
export const QUERY_RECIPES = cfg.topic_queries;
export const KEYWORD_RECIPES = cfg.keyword_queries;
export const WILDCARD_RECIPES = cfg.wildcard_queries;
