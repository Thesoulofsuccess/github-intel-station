// claude.js — Anthropic Claude API helper
//
// NOTE ON MODEL: The in-artifact API binds to 'claude-sonnet-4-20250514'.
// When running this project via Claude Code on your own ANTHROPIC_API_KEY,
// change MODEL below to your Opus 4.8 model string. The orchestration logic
// is fully model-agnostic — only this constant changes.
const MODEL = 'claude-sonnet-4-20250514';

/** Call Claude with a system prompt + user content. Returns raw text. */
export async function callClaude(systemPrompt, userContent, maxTokens = 1000) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Claude API failed (${res.status})`);
  }
  const data = await res.json();
  return data.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}

/** Call Claude and parse a strict JSON response (strips markdown fences). */
export async function callClaudeJSON(systemPrompt, userContent, maxTokens = 1500) {
  const text = await callClaude(systemPrompt, userContent, maxTokens);
  const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    throw new Error(`Failed to parse Claude JSON response: ${err.message}`);
  }
}
