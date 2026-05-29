// learner.js — Agent 5: The Learner
// Job: Update domain scoring weights based on Vikash's thumbs up/down feedback.
// Weights persist in localStorage. Every signal makes the next brief smarter.

const STORAGE_KEY = 'gis_learner_weights';
const FEEDBACK_KEY = 'gis_feedback_log';

const DEFAULT_WEIGHTS = {
  fintech:   1.0,
  dev:       1.0,
  trading:   1.0,
  marketing: 1.0,
};

const LEARNING_RATE = 0.08; // how much each signal nudges weights
const MIN_WEIGHT    = 0.4;  // floor — never ignore a domain entirely
const MAX_WEIGHT    = 2.0;  // ceiling — prevent runaway amplification

/** Load current weights from localStorage, fallback to defaults. */
export function loadWeights() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_WEIGHTS };
    return { ...DEFAULT_WEIGHTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_WEIGHTS };
  }
}

/** Save weights to localStorage. */
function saveWeights(weights) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
  } catch { /* storage full — fail silently */ }
}

/** Load feedback log. */
export function loadFeedbackLog() {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/** Save a feedback event and update weights. */
export function recordFeedback(repoId, signal, primaryDomain, domainScore) {
  // Load current state
  const weights = loadWeights();
  const log     = loadFeedbackLog();

  // Nudge: thumbs up → boost primary domain, thumbs down → reduce it
  const direction = signal === 'up' ? 1 : -1;
  const delta = LEARNING_RATE * direction * (domainScore / 100);
  weights[primaryDomain] = Math.min(MAX_WEIGHT,
    Math.max(MIN_WEIGHT, (weights[primaryDomain] || 1.0) + delta));

  // Persist
  saveWeights(weights);
  log.push({
    repo_id: repoId,
    signal,
    domain: primaryDomain,
    score_at_feedback: domainScore,
    delta: parseFloat(delta.toFixed(4)),
    weights_after: { ...weights },
    ts: new Date().toISOString(),
  });
  try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(log.slice(-200))); } catch {}

  return { weights, log };
}

/** Apply weights to a set of analyses — returns adjusted scores. */
export function applyWeights(analyses, weights) {
  return analyses.map(a => {
    const adjusted = {};
    for (const domain of Object.keys(a.scores)) {
      const w = weights[domain] || 1.0;
      adjusted[domain] = {
        ...a.scores[domain],
        score: Math.round(Math.min(100, a.scores[domain].score * w)),
        weighted: true,
      };
    }
    return { ...a, scores: adjusted };
  });
}

/** Reset weights to default. */
export function resetWeights() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FEEDBACK_KEY);
  } catch {}
  return { ...DEFAULT_WEIGHTS };
}

/** Summarise what the Learner has learned (for UI display). */
export function learningSummary(weights, log) {
  const dominant = Object.entries(weights)
    .sort((a,b) => b[1] - a[1])[0];
  const suppressed = Object.entries(weights)
    .sort((a,b) => a[1] - b[1])[0];
  return {
    feedback_count: log.length,
    dominant_domain: dominant[0],
    dominant_weight: parseFloat(dominant[1].toFixed(2)),
    suppressed_domain: suppressed[0],
    suppressed_weight: parseFloat(suppressed[1].toFixed(2)),
    weights,
  };
}
