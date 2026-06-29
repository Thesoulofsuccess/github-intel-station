# Adoption Sheet — 2026-06-29

_Vikash's stack lacks a unified memory/learning layer across agents and has no token-cost optimization—adopting ECC for persistent skills/memory and RTK for token compression would compound efficiency gains across GitHub Intelligence, Redpin Ops, and all Claude-powered workflows._

## AI code generation minimalism/laziness enforcement  ·  HIGH
**Upgrades:** Automation Stack  
**Gap today:** No mechanism to enforce minimal, senior-dev-style code output from AI agents—Claude Code and Codex generate verbose solutions without 'lazy minimalism' constraints  
**Do this:** Add Ponytail plugin to force AI agents to produce the smallest possible diff, reducing code bloat and maintenance overhead across all automation work  
**Evidence:** DietrichGebert/ponytail

- **Claude Code:** `/plugin marketplace add DietrichGebert/ponytail && /plugin install ponytail`
- **Codex:** `Add to codex config under plugins: {"name": "ponytail", "source": "DietrichGebert/ponytail"} or prepend system prompt with 'Apply lazy senior dev minimalism: smallest possible change, no over-engineering'`
- **Any tool:** `git clone https://github.com/DietrichGebert/ponytail && npm install && follow plugin integration docs`

## Agent harness with skills, instincts, memory, and security  ·  HIGH
**Upgrades:** Automation Stack  
**Gap today:** No unified harness for Claude Code skills, persistent memory, or security guardrails—each tool operates in isolation without shared instincts or cross-session learning  
**Do this:** Install ECC to get a structured skills/instincts/memory layer across Claude Code sessions, enabling persistent context and research-first workflows for Redpin ops and GitHub Intelligence  
**Evidence:** affaan-m/ECC

- **Claude Code:** `git clone https://github.com/affaan-m/ECC ~/.claude/skills/ecc && follow ECC setup to register skills and memory providers`
- **Codex:** `Clone ECC, add its MCP servers to codex config: {"mcpServers": {"ecc-memory": {"command": "node", "args": ["~/.ecc/servers/memory.js"]}}}`
- **Any tool:** `git clone https://github.com/affaan-m/ECC && npm install && node setup.js`

## Self-improving agent with persistent growth  ·  HIGH
**Upgrades:** GitHub Intelligence Station  
**Gap today:** 5-agent pipeline lacks feedback loops or self-improvement—no mechanism for the system to learn from past picks or grow its own taxonomy  
**Do this:** Integrate Hermes Agent's growth/memory architecture to enable GitHub Intelligence Station to learn from analyst feedback and autonomously expand topic discovery  
**Evidence:** NousResearch/hermes-agent

- **Claude Code:** `claude mcp add hermes-agent -- python -m hermes_agent.mcp_server`
- **Codex:** `Add to codex MCP config: {"mcpServers": {"hermes": {"command": "python", "args": ["-m", "hermes_agent.mcp_server"]}}} and wire growth hooks into pipeline`
- **Any tool:** `git clone https://github.com/NousResearch/hermes-agent && pip install -e . && python -m hermes_agent`

## MCP server ecosystem catalog  ·  MEDIUM
**Upgrades:** Automation Stack  
**Gap today:** No systematic awareness of available MCP servers—missing payments-specific, reconciliation, or workflow automation servers that could wire into n8n or Claude Code  
**Do this:** Use awesome-mcp-servers as a discovery layer to find and integrate specialized MCP servers for payments ops, data reconciliation, and workflow triggers  
**Evidence:** punkpeye/awesome-mcp-servers

- **Claude Code:** `Review https://github.com/punkpeye/awesome-mcp-servers for payments/finance MCPs, then: claude mcp add <server-name> -- npx <package> for each relevant server`
- **Codex:** `Browse repo for relevant servers, add to codex config mcpServers section with appropriate command/args per server README`
- **Any tool:** `git clone https://github.com/punkpeye/awesome-mcp-servers && grep -i 'payment\|finance\|reconcil' README.md to find relevant servers`

## LLM token cost reduction proxy  ·  HIGH
**Upgrades:** GitHub Intelligence Station  
**Gap today:** 5-agent pipeline runs full token context on every call—no compression or caching layer, leading to high Claude API costs at scale  
**Do this:** Insert RTK as a CLI proxy between your Python pipeline and Claude API to achieve 60-90% token reduction on repeated discovery/analysis patterns  
**Evidence:** rtk-ai/rtk

- **Claude Code:** `Download RTK binary, set ANTHROPIC_API_BASE to localhost RTK proxy, RTK forwards to Claude with compression`
- **Codex:** `Install RTK (cargo install rtk or download binary), configure codex to route API calls through rtk proxy endpoint`
- **Any tool:** `curl -fsSL https://rtk.ai/install.sh | sh && rtk start --port 8080 && export ANTHROPIC_API_BASE=http://localhost:8080`

## Autonomous multi-step agent orchestration  ·  MEDIUM
**Upgrades:** Redpin Payments Ops  
**Gap today:** Manual exception handling for BACS/CHAPS/TT cases—no autonomous agent that can chain investigative steps, pull data, and resolve or escalate without human intervention  
**Do this:** Deploy AutoGPT agents to autonomously handle payment exception workflows: investigate mismatch, query internal systems, attempt resolution, escalate only when stuck  
**Evidence:** Significant-Gravitas/AutoGPT

- **Claude Code:** `AutoGPT runs separately; expose its API as an MCP server: claude mcp add autogpt -- python -m autogpt.mcp_bridge`
- **Codex:** `Clone AutoGPT, configure payment-ops agent profile, add to codex as external tool with webhook triggers`
- **Any tool:** `git clone https://github.com/Significant-Gravitas/AutoGPT && pip install -e . && python -m autogpt --profile payments-exception-handler`

## Native MCP client/server in terminal agent  ·  LOW
**Upgrades:** Automation Stack  
**Gap today:** Claude Code is primary terminal agent but lacks native cross-model fallback—no Gemini integration for cost arbitrage or capability diversity  
**Do this:** Add Gemini CLI as a secondary terminal agent with MCP support, enabling model arbitrage (use Gemini for cheaper tasks, Claude for complex ones) in your automation stack  
**Evidence:** google-gemini/gemini-cli

- **Claude Code:** `Not directly applicable—Gemini CLI is a parallel agent. Use for tasks where Claude quota is exhausted or Gemini excels`
- **Codex:** `Install Gemini CLI alongside Codex: npm install -g @anthropic/gemini-cli && configure shared MCP servers in both tools`
- **Any tool:** `npm install -g @anthropic/gemini-cli && gemini-cli init && gemini-cli mcp add <your-servers>`

## Local LLM runtime for sensitive workloads  ·  MEDIUM
**Upgrades:** Redpin Payments Ops  
**Gap today:** All LLM calls go to cloud APIs—no local inference option for sensitive payment data that shouldn't leave the network  
**Do this:** Deploy Ollama locally to run Qwen/DeepSeek for sensitive reconciliation and exception-handling tasks where data cannot be sent to external APIs  
**Evidence:** ollama/ollama

- **Claude Code:** `claude mcp add ollama -- ollama serve (exposes local models as MCP tools for Claude Code to delegate to)`
- **Codex:** `Add to codex config: {"mcpServers": {"ollama": {"command": "ollama", "args": ["serve"]}}} then reference ollama models in prompts`
- **Any tool:** `curl -fsSL https://ollama.ai/install.sh | sh && ollama pull qwen:7b && ollama serve`
