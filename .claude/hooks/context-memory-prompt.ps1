# Context Memory Prompt Hook
# Triggered when context is nearing capacity (PreCompact event)
# Outputs a message prompting Claude to ask about saving memories

$output = @{
    additionalContext = @"
<memory-save-reminder>
CONTEXT CAPACITY HIGH - Context compaction is about to occur.

Before compacting, ask the user: "Context is at high capacity. Would you like me to save a memory of this conversation before compacting? I can extract key insights, decisions, and learnings to a dated markdown file in the memories folder."

If the user says yes:
1. Extract key insights from this conversation including:
   - Main topics discussed
   - Key decisions made
   - Technical solutions implemented
   - Problems solved
   - Important learnings or discoveries
   - Any unfinished tasks or next steps
2. Spawn a background agent to write the memory file to: memories/YYYY-MM-DD_HH-MM_topic.md
3. Use a descriptive topic slug based on the main subject of the conversation

If the user says no, proceed with compaction normally.
</memory-save-reminder>
"@
}

# Output as JSON
$output | ConvertTo-Json -Compress
