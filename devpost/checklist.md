---
doc: checklist
status: approved
approval_basis: "User explicitly delegated scenario selection and implementation on 2026-10-25; agent-selected plan, not a claim of a separate learner review."
---
# Build Checklist
Build mode: fast, autonomous implementation explicitly requested.
## Slices
- [x] **1. Paste logs and obtain a redacted incident brief**
  Becomes usable: Running one-screen tool with input, counts, grouped evidence and Markdown download.
  Why now: Proves the unique kernel end to end without a separate scaffolding stage.
  PRD ref: prd.md > The Core Journey; Evidence-backed analysis; Redacted output and export
  Spec ref: spec.md > Analyzer; Workspace; Local file server
  Build: Implement new product files, synthetic example and bounded parsing; no factory starter copy.
  Verify (mechanical): npm test and browser example/analyze/export/stale/reset/HTML-text behavior; desktop/mobile inspection.
  Learner check: Load example, analyze, inspect redacted source and download the report; report anything misleading or missing.
  Commit: Add local evidence-backed incident brief
## Hands-on Checkpoints
- [ ] Early usable behavior explored — shared final-review session for this single-slice PoC
- [ ] Final kick-the-tires exploration and feedback completed
## Final Review
- [ ] Feedback resolved and learner confirms readiness to ship
## Code Tour and App Map
- [ ] Learning activity complete
- [ ] Optional reflection addressed
- [x] devpost/app-map.html generated and statically checked; opening offered to participant
Activity and evidence: Agent implementation and mechanical verification do not count as learner hands-on review.
Route and stops: Reference-only app.js Analyze handler → analyzer.js analyzeLog/redact → app.js render/toMarkdown; not a completed learner tour.
Edit outcome: Not yet offered.
Reflection: Not yet offered.
Activity mode: Pending final review.
## Revisions
- Repeated planning-choice prompts replaced by recorded user delegation; no claim that a separate review or learner interview occurred.

- Verification refinement: preserve distinct HTTP status codes while grouping variable durations; mask JSON Authorization and truncated private-key blocks.
