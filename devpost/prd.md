---
doc: prd
status: approved
approval_basis: "User explicitly delegated scenario selection and implementation on 2026-10-25; agent-selected plan, not a claim of a separate learner review."
---
# Incident Brief — Product Requirements
Source: scope.md > The Core Loop, The Unique Kernel, The POC Boundary.
## The Core Journey
1. Open a single workspace with an empty log editor and a synthetic-example action.
2. Paste or load an example, then select Analyze logs.
3. Read severity totals and grouped findings, each carrying frequency, redacted example and original line numbers.
4. Inspect the sanitized source, then download a Markdown incident brief.
## Screens and Layout
Single responsive surface: editor on the left, report on the right; stacked on small screens. Header gives the privacy boundary.
## Look and Feel
Agent-selected under delegation: operational notebook, cream background, dark ink, orange primary action, large serif title and monospace evidence. Keyboard-visible focus.
## Features and Behavior
### Log input and limits
Empty input gives an inline message. Reject more than 200 KiB or 2000 non-empty lines. All content remains in browser memory. Editing invalidates the previous report and disables export.
### Evidence-backed analysis
Recognize explicit DEBUG/INFO/WARN/WARNING/ERROR/FATAL/CRITICAL tokens or JSONL level/severity fields. Unknown lines remain unknown, not errors.
Normalize timestamps and variable request IDs/durations to group repeated messages without combining different severities.
Show at most the top 8 groups and a maximum 3 source-line examples per group; totals cover all lines.
Keep observations separate from possible diagnostic next checks. Do not assert root cause.
### Redacted output and export
Mask common credential assignments, Authorization bearer/basic values, URL userinfo, email, IPv4/IPv6 and recognizable private-key blocks before displaying any report evidence.
Redaction is best-effort: show a manual-review reminder, do not promise arbitrary PII removal.
Render all log-derived strings as text, including HTML payloads.
Markdown export uses the analyzed snapshot, never fresh unchecked input.
### Reset and accessible feedback
Reset clears editor, report and in-memory snapshot. Analysis status is announced; download is disabled without a current report.
## States and Boundaries
Empty / invalid / current report / stale report after edit. No storage, analytics, external resources, remediation actions or uploads.
## Product Decisions
Solo and 8-hour limit are user choices. Scenario, layout and implementation are agent-selected by explicit delegation.
The working technical label is not a learner-written submission title.
## What We're Building
The complete paste → group → redact → inspect → export loop.
## Deferred From the POC
Server log ingestion and integrations: these would expand access and scope.
## Non-Goals
No inference model, guaranteed diagnosis, comprehensive secret detection or production management.
## Open Questions
Human final exploration is pending and must not be represented as completed.
