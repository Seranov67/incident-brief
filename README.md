# Incident Brief — local proof of concept

Working technical label, not participant-authored submission copy.

## Run
Node.js 22+. No runtime dependencies or install step.
Run npm start, then open http://127.0.0.1:4317.
Run npm test for the built-in Node tests.

Load the synthetic example → Analyze logs → inspect evidence → Download .md.
Expected: 6 lines, 2 errors, 1 warning, one repeated timeout group.

## Behavior and limits
Plain text with explicit uppercase level tokens or JSONL level/severity fields.
200 KiB / 2,000 non-empty lines. Top eight groups displayed; totals/source cover all input.
Original source lines remain traceable. Common secrets/addresses are masked in output.
All input remains in browser memory; editing invalidates export, reload/clear loses input.
Raw input stays visible in the editor: use synthetic logs for recordings.
Pattern matching is not a diagnosis or a comprehensive secret detector. Review exports.

## Provenance
New code created during Build With AI: Basics 2026 using the official Devpost Learn Skill Pack.
Scenario and implementation explicitly delegated by the participant; planning artifacts in devpost/.
AI coding assistance used for planning, implementation and tests. No inference model runs on logs.
No existing product or factory-starter code reused. No runtime dependencies or external calls.
Official course material is installed locally and excluded from publication.

## Submission
Not submitted. Public repository, demo video, participant-authored text and final hands-on review remain.
