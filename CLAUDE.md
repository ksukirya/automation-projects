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

### n8n Workflow Building Skill

**IMPORTANT:** When building n8n workflows, writing expressions, configuring webhooks, or working with Code nodes, always refer to the skill documentation at `skills/skills/n8n-workflow-builder/SKILL.md`.

Key patterns to follow:
- **Webhook data access**: Use `$json.body.field`, NOT `$json.field`
- **Code node return format**: Always return `[{ json: { ... } }]`
- **Expressions**: Use `{{ $json.field }}` syntax
- **Python in Code nodes**: Use `_` prefix instead of `$` (e.g., `_json`, `_input`)

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

## Project Structure

```
automation-projects/
├── workflows/          # Exported n8n workflow JSON files
├── docs/               # Documentation for workflows
├── scripts/            # Helper scripts (if any)
├── skills/             # Claude Code skills for n8n
│   ├── skills/n8n-workflow-builder/  # Workflow building skill
│   └── n8n-docs/       # n8n documentation reference
└── CLAUDE.md           # This file
```

## Common Service Business Integrations

Typical integrations for this project may include:
- CRM systems (HubSpot, Salesforce, Pipedrive)
- Scheduling tools (Calendly, Acuity, Cal.com)
- Communication (Twilio, SendGrid, Slack)
- Payment processing (Stripe, Square)
- Google Workspace (Sheets, Calendar, Gmail)
