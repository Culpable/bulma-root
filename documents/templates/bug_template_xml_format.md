<!-- ════════════════════════════════════════════════════════════════════════════════
     🚨 TEMPLATE METADATA - DELETE THIS ENTIRE SECTION WHEN USING THE TEMPLATE 🚨
     ════════════════════════════════════════════════════════════════════════════════ -->

## What This Template Is

This is a structured template for documenting bugs, defects, and technical issues discovered in software systems. It provides a systematic framework to capture bug details, analyze impact, and guide resolution efforts. The template emphasises precision and actionable information to accelerate bug fixing.

Unless otherwise specified, save details of a specific bug created using this template to the `documents/todo/` folder.

---

## Template Usage Notes

### When to Use This Template

- Documenting newly discovered bugs during testing or code review
- Creating bug tickets for issue tracking systems
- Building a knowledge base of known issues and their fixes
- Performing systematic bug audits or security reviews
- Documenting bugs found in production systems

### Required Sections (In Order)

1. `<summary>` — include `<title>` and `<one_line_description>`
2. `<file_locations>` — complete file paths, function references, and line numbers
3. `<issue_description>` — include `<description>`, `<code_example>`, `<expected_vs_actual>`
- `<bug_categories_reference>` is **reference-only**. Do not include it in your final bug document or example output; use it solely while drafting to pick the right category.

### XML Content Rules (NO CDATA)

- Multi-line values are allowed (especially for `<description>`, `<file_locations>`, `<code_example>`, and `<expected_vs_actual>`). Keep them readable with left-aligned Markdown formatting (lists, tables, fenced code blocks) directly inside the tags.

```xml
<!-- ✅ CORRECT: plain text (no CDATA wrappers) -->
<title>[Component] Button does not show pointer cursor</title>
<one_line_description>Clickable triggers render with default cursor, weakening affordance.</one_line_description>

<!-- ❌ WRONG: CDATA is not part of this format -->
<title><![CDATA[[Component] Button does not show pointer cursor]]></title>
```

### Whitespace Rules (NO INDENTATION)

- Do **NOT** indent anything in the bug report file. Treat this as a line-oriented format.
- Every line must start at column 1 (no leading spaces, no tabs), including nested tags and all content under them (lists, tables, paragraphs).
- The only exception is indentation *inside fenced code blocks* (e.g., the code within ```), where indentation can be required for correct code examples (especially Python).


```xml
<!-- ✅ CORRECT: no indentation anywhere -->
<bug_1>
<summary>
<title>[Chat UI] React.memo comparators break memoization</title>
<one_line_description>...</one_line_description>
</summary>
<file_locations>
- components/messages.tsx – `Messages` memo comparator, Lines 119-141
</file_locations>
</bug_1>

<!-- ❌ WRONG: indented tags/content -->
<bug_1>
    <summary>
      <title>[Chat UI] React.memo comparators break memoization</title>
      <one_line_description>...</one_line_description>
    </summary>
    <file_locations>
- components/messages.tsx – `Messages` memo comparator, Lines 119-141
    </file_locations>
</bug_1>
```
---

## Bug Numbering Convention

<critical_warning>

> 🚨 **CRITICAL:** Each bug MUST be wrapped in a numbered tag: `<bug_1>`, `<bug_2>`, `<bug_3>`, etc.
> 
> **NEVER** use `<bug_n>` as the wrapper tag — that is only shown below as a structural reference.
> 
> ✅ CORRECT: `<bug_1>...</bug_1>`, `<bug_2>...</bug_2>`
> ❌ WRONG: `<bug_n>...</bug_n>`

</critical_warning>

### Example Structure

```xml
<bug_1>
<summary>
<title>[Component] First bug description</title>
<one_line_description>Summary of first bug</one_line_description>
</summary>
<file_locations>
- path/to/file.py – Lines 10-20
</file_locations>
<issue_description>
<description></description>
<code_example></code_example>
<expected_vs_actual></expected_vs_actual>
</issue_description>
</bug_1>

<bug_2>
<summary>
<title>[Component] Second bug description</title>
<one_line_description>Summary of second bug</one_line_description>
</summary>
<file_locations>
- path/to/other_file.js – Lines 55-60
</file_locations>
<issue_description>
<description></description>
<code_example></code_example>
<expected_vs_actual></expected_vs_actual>
</issue_description>
</bug_2>
```

---
<!-- ════════════════════════════════════════════════════════════════════════════════
     🚨 END OF TEMPLATE METADATA - DELETE EVERYTHING ABOVE THIS LINE 🚨
     ════════════════════════════════════════════════════════════════════════════════ -->

Here is a template to guide the creation of bug documentation:

<!-- ════════════════════════════════════════════════════════════════════════════════
     IMPORTANT: Replace <bug_n> with the actual bug number, e.g. <bug_1>, <bug_2>
     DO NOT use <bug_n> as the actual tag name when documenting real bugs!
     ════════════════════════════════════════════════════════════════════════════════ -->

<bug_n>
<!-- ↑↑↑ REPLACE "n" WITH THE BUG NUMBER: <bug_1>, <bug_2>, <bug_3>, etc. ↑↑↑ -->

<summary>

<title>
Provide a concise, descriptive title that captures the essence of the bug in ≤ 10 words.

Format: [Component] Brief description of incorrect behavior
Example: [Authentication] Session tokens persist after logout
</title>

<one_line_description>
Summarise the bug's impact in a single sentence for quick understanding.

Example: "User sessions remain valid after logout, allowing unauthorised access to protected resources."
</one_line_description>

</summary>

---

<file_locations>
List all files where the bug exists with specific file paths, function references, and line numbers.

ALWAYS include COMPLETE file paths relative to the workspace root. Never use partial paths or filenames without directory structure.

```
# ✅ CORRECT - Complete paths from workspace root:
server/routes.ts – function: `authenticateUser`, Lines 1063, 1075, 1087
server/auth.ts – function: `authenticateUser`, Lines 59-62
client/src/hooks/use-upload.ts – function: `useUpload`, Lines 173-175

# ❌ INCORRECT - Avoid these formats:
routes.ts – Lines 1063  # Missing directory path
/auth.ts – function: `authenticateUser`, Lines 59-62  # Unclear root location
use-upload.ts – function: `useUpload`, Lines 173  # No path context
```
</file_locations>

---

<issue_description>
<!-- ════════════════════════════════════════════════════════════════════════════════
     ⚠️  CRITICAL: The issue description must be COMPREHENSIVE and INFORMATION-DENSE.
     
     It must clearly explain:
     • WHAT is broken (observable symptoms)
     • WHY it is a bug (violation of contract, spec, or reasonable expectation)
     • HOW the bug manifests (execution path, trigger conditions)
     • WHAT the consequences are (data corruption, security exposure, UX degradation)
     
     A developer reading this section should understand the full context without
     needing to inspect the code themselves. Be precise, be thorough, but avoid
     redundancy — every sentence should add new information.
     ════════════════════════════════════════════════════════════════════════════════ -->

<description>
Describe what is happening incorrectly, focusing on observable behaviour and technical details.

This section must be comprehensive enough that a developer understands:
1. The exact nature of the defect and why it constitutes a bug
2. The conditions under which the bug occurs
3. The technical mechanism causing the incorrect behaviour
4. The downstream effects on users, data, or system integrity

Be information-dense: every sentence should contribute new facts. Avoid vague language like "sometimes fails" — specify when, why, and how.
</description>

<code_example>

```typescript
// File: server/auth.ts, lines 59-62  ← ALWAYS include complete path from workspace root
// BUG: Authentication completely bypassed in development

// Skip authentication entirely in development mode
if (process.env.NODE_ENV === 'development') {
  return next();  // <-- This bypasses ALL security checks
}
```

</code_example>

<expected_vs_actual>

| Aspect | Expected | Actual |
|--------|----------|--------|
| **Behaviour** | Authentication required for all protected routes | All routes accessible without login |
| **Data State** | Session validated before access | No session validation performed |
| **Error Handling** | 401 returned for unauthorised | 200 returned for all requests |

</expected_vs_actual>

</issue_description>

</bug_n>
<!-- ↑↑↑ REPLACE "n" WITH THE BUG NUMBER: </bug_1>, </bug_2>, </bug_3>, etc. ↑↑↑ -->

---

<!-- REFERENCE-ONLY: Remove this entire block from any real bug document. Do NOT include it in example outputs. -->
<bug_categories_reference>

<common_bug_types>
Use these categories to classify bugs consistently:

| Category | Description | Common Causes |
|----------|-------------|---------------|
| **Security** | Authentication, authorisation, data exposure | Missing validation, hardcoded credentials |
| **Memory Leak** | Memory not released, growing consumption | Event listeners, circular references |
| **Race Condition** | Timing-dependent incorrect behaviour | Async operations, shared state |
| **Data Corruption** | Incorrect data storage or retrieval | Type mismatches, encoding issues |
| **Logic Error** | Incorrect business logic implementation | Edge cases, assumptions |
| **Performance** | Slow response, high resource usage | Inefficient algorithms, missing indexes |
| **UI/UX** | Display issues, interaction problems | CSS conflicts, state management |
| **Integration** | Third-party service failures | API changes, network issues |
| **Configuration** | Environment-specific problems | Missing variables, incorrect values |
</common_bug_types>

</bug_categories_reference>
