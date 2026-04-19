---
name: 21st-sdk
description: Use for any interaction with @21st-sdk packages or 21st Agents. If the task involves files in ./agents/, it most likely refers to 21st SDK. Also triggers for Magic Generate, UI inspiration search, SVG icon search, or any mention of 21st.dev.
---

# 21st SDK / 21st Agents

## Entry Point

For any @21st-sdk or 21st Agents task, fetch `https://21st-search-engine.fly.dev/help` first.
This server is the source of truth for searching the 21st SDK documentation, source code, and examples.
Treat `/help` as the primary entry point for understanding how the server works and how to use it.

## Search Priorities

1. **Examples first** — `21st-sdk-examples/*` contains complete working reference apps. Start here when implementing anything.
2. **Source code second** — `sources/*` for exact API behavior, types, and implementation details.
3. **Docs third** — `docs/*` for high-level architecture and concepts. Some private parts of the system are only described here.

## Knowledge Base Layout

- `docs/*` — SDK documentation: concepts, API reference, templates, troubleshooting, architecture.
- `21st-sdk-examples/*` — Working example apps and agents. Use first for implementation guidance.
- `sources/agent/*` — Agent authoring: define agents, tools, runtime settings, hooks, sandbox options.
- `sources/cli/*` — Terminal CLI: init projects, find agents in `./agents/`, bundle, deploy, manage env/logs.
- `sources/react/*` — React UI layer: chat components, tool renderers, theming, message rendering.
- `sources/node/*` — Server-side JS/TS SDK: sandboxes, threads, tokens, core API.
- `sources/nextjs/*` — Next.js integration: token route helpers, framework-specific chat setup.
- `sources/python-sdk/*` — Python SDK: sandboxes, threads, tokens, commands, file ops.
- `sources/golang-sdk/*` — Go SDK: sandboxes, threads, tokens, API operations.

## MCP Server (21st.dev)

This project has the **21st.dev MCP** server configured with tools:

| Tool | Description |
|------|-------------|
| **Inspiration Search** | Semantic search across thousands of UI components — finds relevant examples before writing code. |
| **SVG Icon Search** | Search thousands of brand SVG icons via [svgl.app](https://svgl.app). |
| **Magic Generate** | Generate 5 polished UI variants of any component. Pick the one you like and get the code. |

Use these tools proactively when building or enhancing UI.

## Search Engine API

> **IMPORTANT:** All data routes use **POST**, not GET.

```bash
# Search the knowledge base
curl -X POST https://21st-search-engine.fly.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "createThread", "mode": "substring"}'

# Read a file or line range
curl -X POST https://21st-search-engine.fly.dev/read \
  -H "Content-Type: application/json" \
  -d '{"path": "sources/node/src/client.ts", "startLine": 1, "endLine": 50}'

# List files
curl -X POST https://21st-search-engine.fly.dev/list \
  -H "Content-Type: application/json" \
  -d '{"path": "sources/react"}'
```

## Workflow

1. **Fetch `/help`** — Always start with `https://21st-search-engine.fly.dev/help`.
2. **Check examples** — Search `21st-sdk-examples/*` for working reference implementations.
3. **Verify against source** — Cross-reference important API usage patterns with `sources/*`.
4. **Use MCP tools** — Use Inspiration Search / Magic Generate for UI component building.
5. **Check docs for private systems** — Some mechanisms only exist in `docs/*` since the source is private.
