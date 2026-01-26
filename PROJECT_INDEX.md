# Project Index - Automation Projects

> **Quick Reference for Claude**: This file provides an overview of all projects, their purposes, and key files.
> Updated: 2026-01-25

---

## Directory Structure

```
automation-projects/
├── CLIENT PROJECTS
│   └── nate-jones-content-system/    # Reprise AI Content System
│
├── WORKFLOWS
│   └── workflows/                     # n8n workflow JSON exports
│
├── DATA & CONFIG
│   ├── client-data/                   # ClickUp exports, client task data
│   ├── data/                          # CSV data files, seeds
│   └── .env                           # Environment variables
│
├── DOCUMENTATION
│   ├── CLAUDE.md                      # Main instructions for Claude
│   ├── PROJECT_INDEX.md               # This file
│   ├── docs/                          # Workflow documentation
│   └── memories/                      # Session memory files
│
├── DEVELOPMENT
│   ├── scripts/                       # Helper scripts (JS, Python, PS1)
│   ├── skills/                        # Claude Code skills & n8n docs
│   └── temp/                          # Temporary work files
│
└── ASSETS
    └── public/                        # Public assets (images, etc.)
```

---

## Active Projects

### 1. Nate Jones Content System (Reprise AI)
**Location:** `nate-jones-content-system/`
**Status:** Active
**Type:** Full-stack application + n8n workflows

**Purpose:** Content management system for Reprise AI that pulls articles from Airtable, generates scripts, and manages content workflow.

**Key Components:**
- `dashboard/` - Next.js dashboard for content management
  - `src/app/page.tsx` - Main dashboard page
  - `src/lib/airtable.ts` - Airtable integration
- `AIRTABLE_SCHEMA.md` - Database schema documentation
- `README.md` - Project overview and setup
- `Reprise-AI-Content-System-Walkthrough.md` - System walkthrough

**Tech Stack:** Next.js, TypeScript, Airtable, Vercel

---

### 2. ClickUp-Obsidian Sync Workflow
**Location:** `workflows/clickup-obsidian-sync.json`
**Status:** Active
**Type:** n8n workflow

**Purpose:** Syncs ClickUp tasks to Obsidian notes for unified task management.

**Documentation:** `workflows/clickup-obsidian-sync.md`

---

### 3. Email Sync & Project Monitor
**Location:** `workflows/email-sync-project-monitor.json`
**Status:** In Development
**Type:** n8n workflow

**Purpose:** Monitors email for project updates and syncs to tracking system.

**Documentation:** `docs/email-sync-setup.md`
**Data:** `data/email-log-header.csv`, `data/projects-seed.csv`

---

### 4. Meeting Notes Processor
**Location:** Documentation only at `workflows/meeting-notes-processor.md`
**Status:** Planned
**Type:** n8n workflow (not yet built)

**Purpose:** Processes meeting recordings/notes and extracts action items.

---

## Client Data Files

| File | Client | Description |
|------|--------|-------------|
| `client-data/impact3_tasks.json` | Impact3 | ClickUp task export - CEO interview prep, pain points analysis |
| `client-data/zeeshan_helm_tasks.json` | STRDL/HELM | Sprint deliverables, fiduciary cockpit project |

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `.env` | API keys, credentials (Airtable, n8n, etc.) |
| `.mcp.json` | MCP server configuration |
| `CLAUDE.md` | Claude Code instructions and guidelines |

---

## Skills & Documentation

### Claude Skills (`skills/skills/`)
- `n8n-code-javascript/` - JavaScript in n8n Code nodes
- `n8n-code-python/` - Python in n8n Code nodes
- `n8n-expression-syntax/` - n8n expression patterns
- `n8n-mcp-tools-expert/` - MCP tool usage
- `n8n-node-configuration/` - Node configuration guidance
- `n8n-validation-expert/` - Workflow validation
- `n8n-workflow-patterns/` - Workflow architectural patterns
- `obsidian-vault/` - Obsidian note-taking integration
- `subagent-orchestrator/` - Background agent management
- `save-memory/` - Context memory saving

### n8n Documentation (`skills/n8n-docs/`)
Full n8n documentation reference for workflow building.

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/create_impact3_deck.js` | Generate Impact3 presentation deck (JS) |
| `scripts/create_impact3_deck.py` | Generate Impact3 presentation deck (Python) |
| `scripts/setup-notify.ps1` | Windows notification setup |

---

## Quick Commands

```bash
# Start Nate Jones dashboard
cd nate-jones-content-system/dashboard && npm run dev

# List all workflows
ls workflows/*.json

# View client data
ls client-data/
```

---

## Notes

- **Obsidian Vault Location:** `C:\Users\Keshav\Documents\ObsidianVault`
- **Temp files** are stored in `temp/` - safe to delete periodically
- **Session memories** are saved in `memories/` for context continuity
