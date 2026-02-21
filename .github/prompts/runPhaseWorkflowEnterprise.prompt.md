---
name: runPhaseWorkflowEnterprise
description: Execute a phase with full governance evidence, validation gates, and formal documentation.
argument-hint: Phase scope, compliance constraints, environments, test commands, and review artifacts.
---
You are executing the **next roadmap phase** under enterprise delivery standards.

## Inputs
- Phase: **{{phase_name}}**
- Baseline completed phase: **{{completed_baseline}}**
- Target-state alignment objective: **{{target_state_goal}}**
- Parallel backend requirement: **{{backend_mode_1}}** and **{{backend_mode_2}}**
- Non-functional constraints: **{{nfrs}}**
- Compliance/quality constraints: **{{compliance_requirements}}**
- Environments:
  - Local instance
  - Fresh local container instance
- Commands:
  - Build: **{{build_command}}**
  - Unit: **{{unit_test_command}}**
  - E2E: **{{e2e_test_command}}**
  - Live: **{{live_test_command}}**
  - Local run: **{{local_run_command}}**
  - Container build/run: **{{container_build_command}}**, **{{container_run_command}}**

## Execution Policy
1. Implement phase scope only; avoid unrelated refactors.
2. Maintain behavior compatibility across both backend modes.
3. Fix at root cause; avoid workaround-only patches.
4. Keep changes auditable with clear mapping from requirement → code → tests.

## Delivery Workflow
1. **Gap & Impact Analysis**
   - Identify requirements in this phase and current implementation gaps.
   - Produce an explicit impact map: modules, data model, API surface, tests, docs.
2. **Implementation**
   - Apply source changes for this phase.
   - Add defensive checks and error handling where required by phase constraints.
3. **Testing Expansion**
   - Add missing tests for new behavior and edge cases:
     - Unit (logic, error paths, boundaries)
     - E2E (contract and externally visible behavior)
     - Live (runtime parity and operational checks)
4. **Validation Gates (must pass in order)**
   - Clean build
   - Unit tests
   - Current as-is E2E
   - Local running instance + current as-is live tests
   - Fresh latest container + current as-is live tests
5. **Failure Handling**
   - Diagnose precisely, document root cause, apply minimal robust fix, and re-run impacted gates.

## Required Documentation Pack
Create/update the following artifacts for this phase:

### A) Phase Implementation Report (Comprehensive)
Include:
- Executive summary
- Scope, assumptions, exclusions
- Before/after architecture and behavior
- File-level source change inventory (code, tests, docs)
- API and data-flow changes (headers, URLs, sample payloads)
- Diagrams: architecture, sequence, data-flow, failure-path
- JSON examples and representative request/response traces
- Test strategy and coverage deltas
- Validation evidence per gate (pass/fail with rerun notes)
- Risks, mitigations, and follow-up recommendations

### B) Issue RCA Report (Comprehensive)
For each issue encountered in this phase:
- Symptom and impact
- Detection path and diagnostics
- Root cause analysis
- Alternatives considered and trade-offs
- Selected solution and rationale
- Regression tests added
- Preventive guardrails
- Supporting diagrams/flows/examples/headers/URLs/sample data

## Change Control & Commit Prep
1. Analyze all staged + unstaged changes (source, tests, docs).
2. Produce grouped change summary by category and impact.
3. Draft a brief but accurate commit message for this phase.

## Program Alignment Check
1. Evaluate whether current phase output keeps the roadmap on track.
2. Verify requirements coverage and identify gaps.
3. Identify any missing tests across all levels; add and validate them.
4. Update phase docs with latest bugs found/fixed and final outcomes.

## Output Format
Return a structured handoff with:
- Scope delivered
- Source/test/doc changes
- Validation gate results
- Issues and RCAs
- Requirements coverage verdict
- On-track status
- Final commit message
- Residual risks and next-phase carry-overs
