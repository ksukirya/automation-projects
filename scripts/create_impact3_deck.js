const pptxgen = require("pptxgenjs");
const path = require("path");

// Create presentation
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Reprise AI";
pres.title = "Impact3 AI & Automation Audit";
pres.subject = "Discovery Findings & Strategic Recommendations";

// Define master slide style
const TITLE_STYLE = { fontSize: 32, bold: true, color: "1a1a2e" };
const SUBTITLE_STYLE = { fontSize: 20, color: "4169e1" };
const BODY_STYLE = { fontSize: 16, color: "333333" };
const HEADING_STYLE = { fontSize: 18, bold: true, color: "1a1a2e" };

function addTitleSlide(title, subtitle) {
  const slide = pres.addSlide();
  slide.addText(title, {
    x: 0.5, y: 2.5, w: "90%", h: 1,
    fontSize: 44, bold: true, align: "center", color: "1a1a2e"
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 3.8, w: "90%", h: 1,
      fontSize: 24, align: "center", color: "666666"
    });
  }
  return slide;
}

function addContentSlide(title, bullets) {
  const slide = pres.addSlide();
  slide.addText(title, {
    x: 0.5, y: 0.3, w: "90%", h: 0.8,
    ...TITLE_STYLE
  });

  const textItems = bullets.map(b => {
    if (b.startsWith("## ")) {
      return { text: b.replace("## ", ""), options: { ...HEADING_STYLE, bullet: false, paraSpaceBefore: 14 } };
    }
    return { text: b, options: { ...BODY_STYLE, bullet: { type: "bullet" }, paraSpaceBefore: 6 } };
  });

  slide.addText(textItems, {
    x: 0.5, y: 1.2, w: "90%", h: 5.5,
    valign: "top"
  });
  return slide;
}

function addTwoColumnSlide(title, leftContent, rightContent) {
  const slide = pres.addSlide();
  slide.addText(title, {
    x: 0.5, y: 0.3, w: "90%", h: 0.8,
    ...TITLE_STYLE
  });

  const leftItems = leftContent.map(b => {
    if (b.startsWith("## ")) {
      return { text: b.replace("## ", ""), options: { ...HEADING_STYLE, bullet: false, paraSpaceBefore: 10 } };
    }
    return { text: b, options: { fontSize: 14, bullet: { type: "bullet" }, paraSpaceBefore: 4 } };
  });

  const rightItems = rightContent.map(b => {
    if (b.startsWith("## ")) {
      return { text: b.replace("## ", ""), options: { ...HEADING_STYLE, bullet: false, paraSpaceBefore: 10 } };
    }
    return { text: b, options: { fontSize: 14, bullet: { type: "bullet" }, paraSpaceBefore: 4 } };
  });

  slide.addText(leftItems, { x: 0.5, y: 1.2, w: "45%", h: 5.5, valign: "top" });
  slide.addText(rightItems, { x: 6.8, y: 1.2, w: "45%", h: 5.5, valign: "top" });
  return slide;
}

// SLIDE 1: Title
addTitleSlide(
  "Impact3 AI & Automation Audit",
  "Discovery Findings & Strategic Recommendations\n\nPrepared by Reprise AI | January 2026"
);

// SLIDE 2: Agenda
addContentSlide("Agenda", [
  "Executive Summary",
  "Your Team's Voice - Interview Insights",
  "Pain Points Matrix",
  "Automation Opportunities",
  "Recommended Solutions",
  "Implementation Roadmap",
  "ROI Projections",
  "Next Steps"
]);

// SLIDE 3: Executive Summary
addContentSlide("Executive Summary", [
  "## Goal",
  "Scale from $3M to $6M ARR without doubling headcount (40 → 60 people)",
  "## Interviews Completed",
  "10/10 departments fully interviewed",
  "## Key Finding",
  "Communication overhead and manual data workflows are primary scaling blockers",
  "## Opportunity",
  "70%+ efficiency gains possible in critical areas",
  "## Recommendation",
  "Phased automation rollout starting with Discord intelligence and report automation"
]);

// SLIDE 4: Company at a Glance
addContentSlide("Your Company at a Glance", [
  "## Current State",
  "ARR: $3M | Team Size: 40 | Manual Hours/Week: 20-40",
  "## Target State",
  "ARR: $6M | Team Size: 60 (with efficiency) | Manual Hours: 50% reduction",
  "## Services",
  "Social Media, Content, PR, Paid Growth for Web3/Crypto clients",
  "## Tools in Use",
  "Notion, Discord, n8n, Typefully, Figma, Toggle",
  "## Existing Automation",
  "Zapier + n8n (scoreboards, analytics → Google Sheets)"
]);

// SLIDE 5: Interview Coverage
addContentSlide("Interview Coverage - 10 Departments", [
  "Raul (CEO) - Scaling, Discord overload",
  "Jeff (CSO) - Multi-platform coordination",
  "Matt (Social Media) - Content discovery, research",
  "Leah (Copywriting) - Asset findability",
  "Jess (Visual Production) - Incomplete briefs",
  "Joe (Paid Growth) - Competitor analysis",
  "Kyle R (Sales/Co-Owner) - Pipeline automation",
  "Kyle H + Patrick (PR) - Placement tracking",
  "Diana + team (Account Mgmt) - Report compilation",
  "Gonzalo (KOL) - Influencer coordination"
]);

// SLIDE 6: Pain Points Header
addTitleSlide("Pain Points Matrix", "Critical Priority Issues");

// SLIDE 7: Discord Overload
addContentSlide("CRITICAL: Discord Communication Overload", [
  "## Who",
  "CEO + entire team",
  "## Scale",
  "50+ messages/day for CEO alone (20 morning + 30-40 throughout day)",
  "## Impact",
  "\"Shit ton of hours\" - CEO quote",
  "## Scaling Risk",
  "\"Adding 20-40 people, I don't know how anyone will keep up with Discord\"",
  "## Target",
  "70% reduction in back-and-forth communication"
]);

// SLIDE 8: Research Inefficiency
addContentSlide("CRITICAL: Research Inefficiency", [
  "## Who",
  "Social Media, PR, Strategy",
  "## Scale",
  "10-20 hrs/week on manual research (PR alone)",
  "## Current Tool",
  "Internal AI research tool \"not fully working right now\"",
  "## Goal",
  "10-minute morning scroll = all client research done",
  "## CEO's #1 Automation Wish",
  "\"What would you automate across Impact3? Research.\""
]);

// SLIDE 9: High Priority Pain Points
addTwoColumnSlide("HIGH PRIORITY Pain Points",
  [
    "## Incomplete Creative Briefs",
    "Who: Visual Production (Jess)",
    "Impact: 5 min → 2+ HOURS delay",
    "Root Cause: Missing references, platforms, copy, dimensions",
    "Solution: Required field forms"
  ],
  [
    "## Manual Report Compilation",
    "Who: Account Managers (Diana)",
    "Time Cost: 2-4 hrs/week aggregating",
    "Connection: CEO's primary visibility",
    "Raul: \"If we can automate that, that's even better\""
  ]
);

// SLIDE 10: Medium Priority
addTwoColumnSlide("MEDIUM PRIORITY Pain Points",
  [
    "## Reply Gang Content Discovery",
    "Who: Social Media team",
    "Challenge: Finding relevant tweets",
    "Tool: X Radar (no API)",
    "Matt: \"If you can scrape X Radar, that would be crazy\""
  ],
  [
    "## Cross-Platform Fragmentation",
    "Who: All client-facing teams",
    "Issue: Slack + Telegram + Teams + Discord",
    "Impact: Context switching, missed messages",
    "Solution: Unified inbox or routing"
  ]
);

// SLIDE 11: Cross-Department Patterns
addContentSlide("Cross-Department Patterns", [
  "## Recurring Themes Across All 10 Interviews",
  "Discord overload → CEO, Social (100 msgs), CSO (6 platforms), KOL",
  "Research time sink → Social, PR (10-20 hrs), Paid Growth",
  "Manual reporting → AMs, PR (placement tracking), CEO visibility",
  "Notion adoption friction → Copywriting, AMs, Visual Production",
  "Tool fragmentation → All client-facing roles",
  "## Key Insight",
  "Solutions addressing Discord + Notion + Reporting have compounding impact across 8+ departments"
]);

// SLIDE 12: Automation Tiers
addContentSlide("Automation Opportunities - Tiered Approach", [
  "## Tier 1: Quick Wins (Week 1-2)",
  "Discord Daily Digest, Notion Forms, Task Notifications",
  "## Tier 2: Core Automation (Week 3-6)",
  "Report Automation, Research Briefs, Calendar Sync",
  "## Tier 3: Intelligence Layer (Month 2-3)",
  "MCP Servers, Reply Finder, Sentiment Analysis"
]);

// SLIDE 13: Tier 1 Detail
addContentSlide("Tier 1: Quick Wins (Week 1-2)", [
  "## 1. Discord Daily Digest",
  "AI summarizes key messages by channel, highlights action items",
  "Impact: 70% reduction in CEO Discord time",
  "## 2. Notion Forms with Required Fields",
  "Mandatory fields for creative briefs (platform, dimensions, references)",
  "Impact: Eliminate 2+ hour delays on tickets",
  "## 3. Auto-Create Tasks on Assignment",
  "Personal calendar sync when assigned in Notion",
  "Impact: Reduce \"did you see my message?\" pings"
]);

// SLIDE 14: Tier 2 Detail
addContentSlide("Tier 2: Core Automation (Week 3-6)", [
  "## 4. Automated W/M/Q Reports",
  "Pull data from content calendars, AI generates summaries",
  "Impact: Save Diana 2-4 hrs/week, scale to all AMs",
  "## 5. Research Brief Generator",
  "Morning briefs per client niche, aggregate crypto news",
  "Impact: 10-min scroll = daily research done",
  "## 6. Content Calendar Automation",
  "\"Done\" status → auto-sync to calendar, auto-populate links"
]);

// SLIDE 15: Tier 3 Detail
addContentSlide("Tier 3: Intelligence Layer (Month 2-3)", [
  "## 7. Reply Opportunity Finder",
  "Monitor conversations, AI suggests 5 reply angles",
  "Impact: Solve \"biggest time sink\" for social team",
  "## 8. VP Performance Feedback Loop",
  "Notify creators when content performs well",
  "## 9. Client Communication Intelligence",
  "Sentiment analysis across Slack/Telegram/Discord",
  "Impact: Proactive client management"
]);

// SLIDE 16: Technical Architecture
addContentSlide("Technical Architecture", [
  "## AI Layer",
  "Claude / GPT for intelligence and summarization",
  "## MCP Servers (Custom Built)",
  "Discord Intel | Notion Ops | Research Hub",
  "## n8n Workflow Engine",
  "Orchestration & Automation (already in use)",
  "## Integrations",
  "Discord | Notion | X/Twitter APIs | Google Workspace"
]);

// SLIDE 17: MCP Components
addContentSlide("MCP Server Components", [
  "## 1. Discord Intelligence MCP",
  "Channel summarization, action item extraction, priority filtering, @mention analytics",
  "## 2. Notion Operations MCP",
  "Required field validation, stage change triggers, report data aggregation",
  "## 3. Research Hub MCP",
  "Multi-source news aggregation, client profile matching, trend detection"
]);

// SLIDE 18: Implementation Roadmap
addContentSlide("12-Week Implementation Roadmap", [
  "## Phase 1: Foundation (Weeks 1-2)",
  "Discord digest, Notion forms, n8n setup",
  "## Phase 2: Core Automation (Weeks 3-6)",
  "Report automation, research briefs, calendar sync",
  "## Phase 3: Intelligence (Weeks 7-10)",
  "MCP servers, reply finder, sentiment analysis",
  "## Phase 4: Optimization (Weeks 11-12)",
  "Training, refinement, documentation"
]);

// SLIDE 19: Phase 1 Detail
addContentSlide("Phase 1: Foundation (Weeks 1-2)", [
  "## Deliverables",
  "n8n instance configured, Discord bot deployed, daily digest live, Notion forms",
  "## Success Metrics",
  "CEO Discord time reduced by 50%+",
  "Zero incomplete creative briefs",
  "Team adoption > 80%",
  "## Investment",
  "$5,000 - $8,000"
]);

// SLIDE 20: Phase 2 Detail
addContentSlide("Phase 2: Core Automation (Weeks 3-6)", [
  "## Deliverables",
  "W/M/Q report automation, research brief generator, content calendar sync",
  "## Success Metrics",
  "Report generation: 4 hrs → 15 mins",
  "Research time: 50% reduction",
  "Calendar adoption > 90%",
  "## Investment",
  "$12,000 - $18,000"
]);

// SLIDE 21: Phase 3 Detail
addContentSlide("Phase 3: Intelligence Layer (Weeks 7-10)", [
  "## Deliverables",
  "Discord MCP server, Notion MCP server, Research Hub MCP, reply finder",
  "## Success Metrics",
  "AI-assisted responses in < 2 min",
  "Proactive client issue detection",
  "Social team efficiency +40%",
  "## Investment",
  "$15,000 - $25,000"
]);

// SLIDE 22: ROI Projections
addContentSlide("ROI Projections - Conservative Estimates", [
  "## Weekly Time Savings → Annual Value (@$50/hr)",
  "Discord Digest: 10 hrs/week → $26,000/year",
  "Report Automation: 8 hrs/week → $20,800/year",
  "Research Briefs: 15 hrs/week → $39,000/year",
  "Brief Validation: 5 hrs/week → $13,000/year",
  "Calendar Sync: 3 hrs/week → $7,800/year",
  "## TOTAL: 41 hrs/week → $106,600/year",
  "## Payback Period: 3-4 months"
]);

// SLIDE 23: Scaling Impact
addContentSlide("The Real Value: Enabling Growth", [
  "## Without Automation",
  "$3M → $6M requires 40 → 80+ people",
  "Discord becomes unusable at scale",
  "## With Automation",
  "$3M → $6M with 40 → 60 people",
  "20 fewer hires needed",
  "At $60K avg salary = $1.2M annual savings",
  "## Total First-Year Value: $1.3M+"
]);

// SLIDE 24: Risk Mitigation
addTwoColumnSlide("Risk Mitigation",
  [
    "## Team adoption",
    "Phased rollout, champions per dept",
    "## Tool fatigue",
    "Integrate into existing tools",
    "## AI accuracy",
    "Human-in-loop for critical decisions"
  ],
  [
    "## Data security",
    "Self-hosted n8n, data stays in your systems",
    "## Vendor lock-in",
    "Open-source stack, portable workflows",
    "## Complexity",
    "Start simple, iterate based on feedback"
  ]
);

// SLIDE 25: Engagement Options
addContentSlide("Engagement Options", [
  "## Option A: Foundation Only",
  "Weeks 1-2 deliverables | Discord digest + Notion forms | $5,000 - $8,000",
  "## Option B: Core Package (Recommended)",
  "Phases 1 + 2 | Full report + research automation | $17,000 - $26,000",
  "## Option C: Complete Transformation",
  "All 3 phases + MCP ecosystem | $32,000 - $51,000"
]);

// SLIDE 26: Next Steps
addContentSlide("Next Steps", [
  "## Today",
  "Select engagement option",
  "## This Week",
  "Kick-off meeting, access provisioning",
  "## Week 1",
  "Foundation deployment begins",
  "## Week 2",
  "First results visible (Discord digest live)",
  "## Ongoing",
  "Bi-weekly progress reviews"
]);

// SLIDE 27: Q&A
addTitleSlide("Questions & Discussion", "Priority adjustments? | Specific integrations?\nTeam members for pilot? | Timeline constraints?");

// SLIDE 28: Contact
addTitleSlide("Ready to Scale Impact3 Intelligently", "Reprise AI\nkeshav@reprisesai.com");

// Save presentation
const outputPath = path.join(process.env.USERPROFILE || "C:\\Users\\Keshav", "Documents", "Impact3_AI_Audit_Presentation.pptx");
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✓ Presentation saved successfully!`);
    console.log(`  Location: ${outputPath}`);
  })
  .catch(err => {
    console.error("✗ Error creating presentation:", err.message);
    process.exit(1);
  });
