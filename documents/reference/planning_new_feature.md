# Planning New Feature Guidance

## Purpose
This document explains how to create a new feature plan without copying template guidance into the plan itself. Use the plan skeleton in `documents/templates/plan_template.md`. Create your plan in `documents/todo/` as `<feature>_plan.md` in a NEW FILE unless instructed otherwise.

IMPORTANT: The purpose of this template is to help you understand the desired format for planning new features, but ensure you use the plan skeleton in `documents/templates/plan_template.md` to create your plan.

## Source Files
- Plan template: `documents/templates/plan_template.md` <- use this to create your plan.

<critical_warning>
> **CRITICAL WARNING:** Any `<important_note>` or `<critical_warning>` block in a plan must contain plan-specific content. If you do not have a real note or warning, delete the block.
</critical_warning>

## Template Usage Notes
- Always create or edit a plan file; do not respond only in chat.
- Save plans in `documents/todo/` as `<feature>_plan.md` unless instructed otherwise.
- Replace every bracketed placeholder with plan-specific content.
- Remove any section that is not applicable; do not leave "N/A" or "Not applicable".
- Keep headings clean; do not append "(Optional)" to any heading.
- Maintain information density; the plan must stand alone.

## When to Use This Template
- Planning new features requiring cross-functional changes
- Refactoring existing features with breaking changes
- Implementing complex user-facing functionality

## Required Sections (Never Skip)
1. Goal
2. Current State Analysis
3. Desired State
4. Implementation Plan
5. Testing Plan

## Section Importance Hierarchy
| Section | Importance | Purpose |
| --- | --- | --- |
| Goal | High | Define success so the implementer can adapt while achieving the same outcome |
| Current State | High | Complete context for autonomous decision-making during implementation |
| Desired State | High | Checkable requirements list that defines "done" |
| Implementation Plan | Medium | Suggested approach that can adapt based on discoveries |
| Testing Plan | Medium | Key scenarios to validate success |
| API/Database/UI | Low | Technical contracts and surface changes when applicable |

## Optional Sections (Delete Entirely If Not Relevant)
<important_note>
> **IMPORTANT NOTE:** Optional sections must be removed if they do not apply. Do not keep them with placeholder content.
</important_note>

- API Changes
- Database Changes
- UI/UX Changes

## Writing Great Plans
### Clarity
- The reader immediately understands what will be built
- Each step has a clear purpose
- There is no ambiguity about what "done" means

### Completeness
- Nothing is left implicit
- All files to touch are identified
- All dependencies are acknowledged

### Verifiability
- Each step can be checked
- Acceptance criteria are testable
- Integration points are explicit

## Information Highlighting Guidelines
Use XML tags with proper spacing to highlight plan-specific risks or dependencies.

**Breaking Changes**
```markdown
<critical_warning>
> **CRITICAL WARNING:** [Describe the breaking change and the required coordination.]
</critical_warning>
```

**Implementation Dependencies**
```markdown
<important_note>
> **IMPORTANT NOTE:** [Describe the dependency and why it blocks or gates other work.]
</important_note>
```

## Content Standards
### Goal
Explain the objective, user pain points, expected outcome, and success criteria.

### Current State Analysis
Describe how the system works today, where it fails, why it fails, and who is affected.

### Desired State
Use MUST/SHOULD/MUST NOT requirements. Include defaults and fallback order if applicable.

### Implementation Plan
Describe the major steps, key files, and important trade-offs. Focus on outcomes, not line-by-line code.

### Testing Plan
List unit and integration coverage that proves each requirement is met.

## Mermaid Guidance (If Used)
- Avoid using "end" as a classDef name.
- Avoid escaped quotes inside square bracket labels.
- Keep diagrams minimal and accurate.

## Template Prohibitions
- No dates or timestamps
- Avoid speculation; document only concrete implementation details
- Skip unit-test specifics; reference test files if needed
- Eliminate redundant explanations; say it once, clearly and completely
- Do not include the following sections:
  - Edge Cases and Error Handling (unless critical to the feature)
  - Performance Tests
  - Rollout Strategy
  - Performance Considerations
  - Estimated Timeline
  - Success Metrics
  - Future Enhancements

## Markdown Table Formatting
Tables MUST be formatted with **no blank lines between rows**. All rows (header, separator, data) must be consecutive.

**Correct:**
```markdown
| Header | Header |
|--------|--------|
| Cell   | Cell   |
```

**WRONG (breaks rendering):**
```markdown
| Header | Header |

|--------|--------|
```

## Template Hygiene Checklist
- No guidance text such as "GUIDANCE" or "CRITICAL GUIDANCE" remains in the plan
- All `<important_note>` and `<critical_warning>` blocks contain plan-specific content
- No bracketed placeholders remain
- No "(Optional)" appears in headings
- No wrapper tags such as `<planning_template>` appear in the plan
- All markdown tables have consecutive rows with no blank lines between them