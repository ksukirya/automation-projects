# CLAUDE.md - Project Instructions for Claude

## Project Overview

This repository contains n8n workflow automations designed for service businesses. Workflows handle common business processes like lead management, appointment scheduling, client communication, invoicing, and reporting.

## Development Guidelines

### Git Practices

- **Use atomic commits**: Each commit should represent a single logical change
- Commit messages should follow the format: `<type>: <description>`
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
  - Example: `feat: add lead capture webhook workflow`
- Commit early and often - don't bundle unrelated changes

### Code Quality

- Write clean, self-documenting code
- Add comments explaining **why**, not **what** (the code shows what)
- Use descriptive names for workflows, nodes, and variables
- Document any external dependencies or API requirements

### n8n Workflow Conventions

- Name workflows clearly: `[Category] - Action Description`
  - Example: `[Leads] - Capture Form Submission to CRM`
- Add sticky notes in workflows to explain complex logic
- Use error handling nodes for critical paths
- Store credentials securely using n8n's credential system

### n8n Workflow Building Skills

**IMPORTANT:** When building n8n workflows, use the built-in n8n skills from the n8n-mcp server:

- **n8n-expression-syntax**: Expression patterns and common mistakes
- **n8n-mcp-tools-expert**: MCP tool usage for node search and validation
- **n8n-code-javascript**: JavaScript in Code nodes
- **n8n-code-python**: Python in Code nodes
- **n8n-validation-expert**: Workflow validation and error fixing

Key patterns to follow:
- **Webhook data access**: Use `$json.body.field`, NOT `$json.field`
- **Code node return format**: Always return `[{ json: { ... } }]`
- **Expressions**: Use `{{ $json.field }}` syntax
- **Python in Code nodes**: Use `_` prefix instead of `$` (e.g., `_json`, `_input`)

### Obsidian Vault Skill

**IMPORTANT:** When reading or writing notes to Obsidian, always refer to the skill documentation at `skills/skills/obsidian-vault/SKILL.md`.

**Vault Location:** `C:\Users\Keshav\Documents\ObsidianVault`

Key patterns to follow:
- **Always include frontmatter**: Every note starts with YAML between `---` delimiters
- **Use backlinks**: Link to other notes with `[[Note Name]]` syntax
- **Use tags**: Categorize with `#tag` or nested `#category/subcategory`
- **Folder structure**: Inbox → Daily → Projects → Areas → Resources → Archive
- **File naming**: Daily notes as `YYYY-MM-DD.md`, descriptive names for others

### Subagent Orchestrator Skill

**IMPORTANT:** When delegating complex tasks, spawning background agents, or running parallel research, refer to `skills/skills/subagent-orchestrator/SKILL.md`.

Available agent templates:
- **Research Agent**: Deep investigation of topics, technologies, codebases
- **Documentation Agent**: Generate/update technical documentation
- **Code Review Agent**: Security, quality, and best practices review
- **n8n Workflow Builder Agent**: Autonomous workflow creation

Key patterns:
- Use `run_in_background: true` for long-running tasks
- Launch parallel agents in a single message for concurrent work
- Use `model: "opus"` for complex analysis, `"haiku"` for simple tasks
- Check results with `Read(output_file)` or `TaskOutput`

## Working With Claude

### Before Starting Complex Tasks

**Always ask clarifying questions** when:
- Requirements are ambiguous
- Multiple implementation approaches exist
- External services or APIs are involved
- The task affects existing workflows

### What I Need to Know

When requesting new automations, please provide:
1. The trigger event (webhook, schedule, manual, etc.)
2. Input data structure/source
3. Expected output or action
4. Any third-party services involved
5. Error handling requirements

## Decision Protocol

Before implementing any significant change, run `/council` with the proposed approach. Significant changes include:
- Architecture decisions
- New integrations or dependencies
- Database schema changes
- Security-related code
- Anything that would be hard to reverse

After receiving the council decision:
1. Note the consensus points
2. Address concerns raised by dissenting agents
3. Document the decision rationale in code comments
4. Proceed with implementation

Example: `/council Should we use Redis or PostgreSQL for session storage?`

## Quick Context Reference

**For fast project lookup, read these files:**
- `PROJECT_INDEX.md` - Full project documentation and directory structure
- `.claude/context/projects.md` - Active projects quick reference
- `.claude/context/file-locations.md` - Key file paths
- `.claude/context/clients.md` - Client information and data locations

## Project Structure

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
│   ├── CLAUDE.md                      # Main instructions (this file)
│   ├── PROJECT_INDEX.md               # Full project index
│   ├── docs/                          # Workflow documentation
│   └── memories/                      # Session memory files
│
├── DEVELOPMENT
│   ├── scripts/                       # Helper scripts (JS, Python, PS1)
│   ├── skills/                        # Claude Code skills & n8n docs
│   └── temp/                          # Temporary work files
│
├── CONTEXT (for Claude)
│   └── .claude/context/               # Quick reference files
│       ├── projects.md                # Active projects
│       ├── file-locations.md          # Key file paths
│       └── clients.md                 # Client information
│
└── ASSETS
    └── public/                        # Public assets (images, etc.)

Obsidian Vault (external):
C:\Users\Keshav\Documents\ObsidianVault/
├── 00-Inbox/           # New notes, unsorted
├── 01-Daily/           # Daily notes
├── 02-Projects/        # Active projects
├── 03-Areas/           # Ongoing responsibilities
├── 04-Resources/       # Reference material
├── 05-Archive/         # Completed items
├── Attachments/        # Images, PDFs
└── Templates/          # Note templates
```

## Common Service Business Integrations

Typical integrations for this project may include:
- CRM systems (HubSpot, Salesforce, Pipedrive)
- Scheduling tools (Calendly, Acuity, Cal.com)
- Communication (Twilio, SendGrid, Slack)
- Payment processing (Stripe, Square)
- Google Workspace (Sheets, Calendar, Gmail)
