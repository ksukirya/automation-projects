# Memory: Building Context Memory Hook System

**Date:** 2026-01-19 19:45
**Session Duration:** ~20 minutes
**Context Used:** Manual save (testing system)

---

## Summary

Built a Claude Code hook system that automatically triggers when context capacity is high (PreCompact event), prompting to save conversation insights to dated markdown files in a memories folder.

## Key Topics

- Claude Code hooks configuration
- PreCompact event for context capacity detection
- PowerShell scripting for Windows hooks
- Memory extraction and persistence patterns

## Decisions Made

- **Hook Event:** Used `PreCompact` - triggers when auto-compaction is about to occur (closest equivalent to 80% threshold)
- **Storage Location:** `memories/` folder in project root with dated markdown filenames
- **Configuration:** Shareable `settings.json` for hook config, `settings.local.json` for machine-specific permissions
- **Script Format:** PowerShell with JSON output containing `additionalContext` field

## Technical Solutions

### PreCompact Hook Configuration

Added to `.claude/settings.json`:
```json
{
  "hooks": {
    "PreCompact": [{
      "matcher": "auto",
      "hooks": [{
        "type": "command",
        "command": "powershell -ExecutionPolicy Bypass -File \".claude/hooks/context-memory-prompt.ps1\"",
        "timeout": 10
      }]
    }]
  }
}
```

### Hook Script Output Pattern

The PowerShell script outputs JSON with `additionalContext` containing XML-tagged instructions that Claude receives as context, prompting to ask the user about saving memory.

## Files Created

- `.claude/hooks/context-memory-prompt.ps1` - Hook script
- `.claude/settings.json` - Shareable hook configuration
- `memories/.gitkeep` - Folder readme
- `memories/_TEMPLATE.md` - Memory file template
- `skills/skills/save-memory/SKILL.md` - Skill documentation (in nested repo, not tracked)

## Problems Solved

- **Problem:** No native "80% context threshold" hook event in Claude Code
  - **Solution:** Used `PreCompact` which triggers when compaction is imminent at high capacity

- **Problem:** skills/ folder is a nested git repository (cloned n8n-skills)
  - **Solution:** Core hook functionality doesn't require the skill file; it's reference documentation

## Learnings & Discoveries

- Claude Code provides 10 hook events: PreToolUse, PostToolUse, Notification, Stop, SubagentStop, PreCompact, SessionStart, SessionEnd, UserPromptSubmit, PermissionRequest
- Hook scripts output JSON with `additionalContext` field to inject context into conversation
- `settings.local.json` is for machine-specific settings; `settings.json` for shareable project config
- Nested git repositories prevent parent repo from tracking their files

## Code References

- `.claude/settings.json:1-16` - Hook configuration
- `.claude/hooks/context-memory-prompt.ps1:1-29` - PowerShell hook script
- `memories/_TEMPLATE.md` - Memory file template structure

## Git Activity

- Commit `d45d552`: feat: add memory save hook for high context capacity
- Pushed to origin/main

---

*Memory saved by Claude Code - manual test of memory system*
