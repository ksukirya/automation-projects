# Subagent Orchestrator Skill

Orchestrate background Task subagents for parallel and asynchronous work. This skill provides patterns and templates for spawning specialized agents that work autonomously and report results back.

## Core Concepts

### When to Use Subagents

- **Parallel work**: Multiple independent tasks that can run simultaneously
- **Background processing**: Long-running tasks that shouldn't block conversation
- **Specialized expertise**: Tasks requiring focused context (research, review, building)
- **Context preservation**: Offload work to preserve main conversation context

### Subagent Types Available

| Type | Use Case | Tools Available |
|------|----------|-----------------|
| `general-purpose` | Multi-step tasks, research, code | All tools |
| `Explore` | Codebase exploration, file search | Read-only tools |
| `Bash` | Git operations, shell commands | Bash only |
| `Plan` | Architecture design, planning | Read-only + planning |

### Key Parameters

```javascript
{
  subagent_type: "general-purpose",  // Agent specialization
  prompt: "...",                      // Detailed instructions (CRITICAL)
  run_in_background: true,            // Don't block main conversation
  description: "3-5 word summary",    // For tracking
  model: "haiku" | "sonnet" | "opus"  // Optional, defaults to parent
}
```

## Orchestration Patterns

### Pattern 1: Fire and Forget

Launch agent and continue without waiting.

```
1. Spawn agent with run_in_background: true
2. Continue main conversation
3. Results appear in task notification when complete
```

### Pattern 2: Parallel Execution

Launch multiple agents simultaneously in a single message.

```
1. Send ONE message with MULTIPLE Task tool calls
2. All agents start concurrently
3. Collect results as they complete
```

### Pattern 3: Sequential Pipeline

Chain agents where each depends on previous results.

```
1. Spawn Agent A, wait for completion
2. Use Agent A results in Agent B prompt
3. Continue chain as needed
```

### Pattern 4: Check and Continue

Launch background agent, do other work, check later.

```
1. Spawn agent with run_in_background: true
2. Note the output_file path
3. Do other work
4. Use Read tool or TaskOutput to check results
```

## Prompt Engineering for Subagents

### Critical Rules

1. **Include ALL context** - Subagents have NO conversation history
2. **Be explicit about output** - Specify exactly what to return/write
3. **Define scope clearly** - What to do AND what NOT to do
4. **Specify file paths** - Use absolute paths when writing files

### Prompt Structure Template

```markdown
## Task
[One sentence describing the goal]

## Context
[All relevant background information - the agent knows NOTHING else]

## Instructions
1. [Specific step]
2. [Specific step]
3. [Specific step]

## Output Requirements
- [What to return/write]
- [Format specifications]
- [Where to save if applicable]

## Constraints
- [What NOT to do]
- [Scope limitations]
```

## Collecting Results

### From Background Agents

When `run_in_background: true`, results come via:

1. **Task notification** - Automatic when agent completes
2. **TaskOutput tool** - Explicitly check status
3. **Read output_file** - Read the full transcript

```javascript
// Check agent status
TaskOutput({ task_id: "agent-id", block: false })

// Wait for completion
TaskOutput({ task_id: "agent-id", block: true, timeout: 60000 })
```

### From Foreground Agents

When `run_in_background: false` (default):
- Tool call blocks until agent completes
- Results returned directly in tool response

## Available Templates

See the `templates/` folder for ready-to-use agent prompts:

- `research-agent.md` - Web research and information gathering
- `documentation-agent.md` - Writing docs, READMEs, guides
- `code-review-agent.md` - Code analysis and review
- `n8n-workflow-agent.md` - Building n8n workflows

## Example: Parallel Research + Documentation

```javascript
// Single message with two Task calls - runs in parallel
Task({
  subagent_type: "general-purpose",
  description: "Research OAuth patterns",
  run_in_background: true,
  prompt: `## Task
Research OAuth 2.0 implementation patterns for Node.js APIs.

## Context
Building a REST API that needs OAuth authentication.

## Instructions
1. Search for current OAuth 2.0 best practices
2. Find recommended Node.js libraries
3. Identify common security pitfalls

## Output Requirements
Return a structured summary with:
- Recommended libraries with pros/cons
- Implementation checklist
- Security considerations`
})

Task({
  subagent_type: "general-purpose",
  description: "Draft API auth docs",
  run_in_background: true,
  prompt: `## Task
Draft authentication documentation outline.

## Context
Creating API docs for a new authentication system.

## Instructions
1. Create documentation structure
2. List all sections needed
3. Write placeholder descriptions

## Output Requirements
Return markdown outline for auth documentation.`
})
```

## Tips

1. **Use haiku for simple tasks** - Faster and cheaper
2. **Parallelize when possible** - Multiple Task calls in one message
3. **Check agent descriptions** - Match task to right agent type
4. **Include examples in prompts** - Show expected output format
5. **Set reasonable timeouts** - Default is usually fine
