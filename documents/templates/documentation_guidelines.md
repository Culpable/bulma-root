# Documentation Guidelines

<!-- ════════════════════════════════════════════════════════════════════════════════
     🚨 TEMPLATE METADATA - DELETE THIS ENTIRE SECTION WHEN USING THE TEMPLATE 🚨
     ════════════════════════════════════════════════════════════════════════════════ -->

## What This Template Is

This is a structured template for creating comprehensive technical documentation for features, systems, and processes. It emphasizes high information density, clear structure, and actionable details while eliminating redundancy.

IMPORTANT: Unless otherwise specified, save documentation created using this template to the `documents/guides/` folder using a descriptive filename with underscore prefix: `_feature_name.md`.

<important_note>

> 📝 **NOTE:** Documentation created using this template will be shown on ALL FILES mentioned in the documentation. The GOAL of the documentation is to provide a high-level overview of how the overall system works, that way a person can understand the system without having to read every single file, and prevents them from introducing bugs or errors.

Given this, the documentation must be comprehensive, but IMPORTANTLY: **information-dense**. Focus on technical functionality and observed behavior, not presentation or aesthetics. It should not be verbose or include anything other than the most essential details.

</important_note>

---

<!-- ════════════════════════════════════════════════════════════════════════════════
     🚨 END OF TEMPLATE METADATA - DELETE EVERYTHING ABOVE THIS LINE 🚨
     ════════════════════════════════════════════════════════════════════════════════ -->

Here is a template to guide the creation of documentation:
<documentation_guidelines>
# Documentation Guidelines

---

## 1. Overview 

- Summarise the feature or system's purpose and its core functionality in ≤ 3 sentences.
- Mention only the most critical technology, dependency, or constraint.
- **Focus on comprehensive coverage with maximum information density**—include all essential details but eliminate redundancy.
- Avoid implementation trivia—those belong in later sections.

> **Example**  
> "The **Database Upload Pipeline** ingests broker trail-report workbooks,  
> standardises them into canonical CSVs, validates column integrity, encrypts  
> sensitive fields, and bulk-inserts records into Postgres."

---

## 2. Content Density & Structure Principles

**Information Density Requirements:**
- Every sentence must contribute unique, actionable information
- Use tables for comparative data, configuration options, or structured relationships
- Group related concepts into logical sections with clear hierarchies
- Eliminate filler words and redundant explanations
- **Avoid redundancy**: Never repeat the same information unless it requires critical emphasis for safety or correctness
- Describe behaviour by naming the files, modules, or functions responsible rather than reproducing large sections of source code

<important_note>

> 📝 **NOTE:** Reference code symbols using double-colon notation (`filename.ext::symbolName`) to create durable links that survive file edits. After establishing the file structure, use filename-only references within the same section. For duplicate filenames, include the disambiguating parent directory.
>
> **Symbol reference format:**
> - First mention: `lib/ai/entitlements.ts::entitlementsByUserType`
> - Subsequent mentions: `entitlements.ts::entitlementsByUserType`
> - Duplicate filenames: `(chat)/page.tsx::Page` vs `login/page.tsx::LoginPage`
> - Multiple symbols: "The handler enforces quotas from `entitlements.ts::entitlementsByUserType`, validates access via `queries.ts::getChatById`, and creates rows using `actions.ts::generateTitleFromUserMessage`."

</important_note>

**When to Use Markdown Tables:**

| Use Case | Example | Benefit |
|----------|---------|---------|
| **Configuration options** | Environment variables, settings, flags | Quick reference and comparison |
| **API endpoints** | Routes, methods, parameters | Structured overview of interfaces |
| **File types & formats** | Extensions, purposes, handling rules | Clear categorization |
| **Error codes & meanings** | Status codes, descriptions, actions | Rapid troubleshooting |
| **Component relationships** | Dependencies, interactions, data flow | Visual hierarchy understanding |

---

## 3. File Location

- Unless specified otherwise, new documentation for new features should be saved at `documents/guides/`
- Use a descriptive filename with underscore prefix: `_feature_name.md`

---

## 4. Markdown Formatting Standards

- **Lists**: Use dashes (`-`) for unordered lists, not asterisks (`*`) or bullet points (`•`)
  ```markdown
  ✓ Correct:
  - First item
  - Second item
  
  ✗ Incorrect:
  • First item
  * Second item
  ```
- **Code blocks**: Use triple backticks with language specification **only when exact syntax materially clarifies behaviour** (e.g., concise payload schemas, CLI commands, short illustrative snippets ≤ 15 lines)
  - Introduce each snippet with a one-sentence caption explaining why it is included
  - Prefer pseudo-code or diff-style excerpts when highlighting logic; link to the canonical file for full context
  - Avoid embedding generated HTML, large template fragments, or entire functions—summarise their effect in prose instead
- **Headers**: Use consistent header levels with proper spacing
- **Tables**: Use for comparative data; aligned columns with headers
- **Line breaks**: Add blank lines between sections for readability

### Code Block Usage Checklist

- Confirm the snippet is the smallest excerpt that communicates the insight; if prose or a diagram suffices, choose that instead
- Keep blocks ≤ 15 lines and avoid chaining multiple snippets back-to-back
- Cite the source immediately after the block (`module.py:function_name`) so readers can inspect the implementation directly
- Remove boilerplate or duplicated context already described elsewhere in the document

---

## 5. Information Highlighting Guidelines

Use XML tags with proper spacing to highlight critical information or important notes.

**Critical Issues**
```markdown
<critical_warning>

> 🚨 **CRITICAL:** This action will cause data loss or system failure, or is a common source of error that requires additional emphasis.

</critical_warning>
```

**Important Information**
```markdown
<important_note>

> 📝 **NOTE:** This step is essential for proper functionality.

</important_note>
```

**Usage:**
- **CRITICAL**: Reserved for actions causing irreversible damage, data loss, or security vulnerabilities
- **NOTE**: Essential information affecting functionality or user experience
- Do not wrap large code excerpts inside notes or warnings; restate the intent succinctly and reference the owning component instead

Always include blank lines before and after XML tags.

---

## 6. File Structure Diagram

<important_note>

> 📝 **NOTE:** File structure diagrams are ESSENTIAL for understanding which files are affected by issues or features. Without them, readers must search and guess file locations, significantly reducing documentation usefulness and increasing debugging time. Unless specified, all file structure diagrams should be included in the documentation.

</important_note>

- Render a concise tree using ASCII characters (`├──`, `│`, `└──`).
- Show every *logical* layer: package, sub-package, and key files.
- Append a one-line description **per file** (max. 80 chars).
- **Single-file directories**: Inline the file on the same line (e.g., `constants/plan_messages.py`).
- **Multi-file directories**: Expand the tree to show each file on its own line.
- Collapse very deep trees with an ellipsis (`…`) to preserve readability.

> **Example**
> ```
> trailtracker/
> ├── routes/
> │   └── database/
> │       ├── db_upload_router.py       # /upload-to-history route handler
> │       ├── db_confirmation_router.py # /confirm-upload route handler
> │       └── standardise_pre_commit/   # Validation pipeline
> │           └── …                     # See Workflow section for full path
> ├── constants/plan_messages.py        # Single file: inline with parent
> └── models.py                         # SQLAlchemy models, encryption helpers
> ```

<important_note>

> 📝 **NOTE:** File structure diagrams should only include production files and permanent components. Do not reference test files, temporary scripts, setup documentation, or files marked for deletion. Focus on the core system architecture that maintainers will encounter in the long term.

</important_note>

---

## 7. Workflow Diagram

- Use **Mermaid diagrams** for all workflow and architectural documentation
- Choose the appropriate diagram type based on what you're documenting:

| Diagram Type | Use For | Key Elements |
|--------------|---------|--------------|
| `flowchart` | Logic flows and processes | Decision points, actions, branches |
| `sequenceDiagram` | Component interactions | Messages, lifelines, timing |
| `classDiagram` | Object structures | Relationships, inheritance, methods |
| `graph TD` | Top-down directional flows | Dependencies, hierarchies |

- **Essential diagram elements**: Clear node labels, meaningful connection labels, decision points with labeled branches, start/end points
- **Mermaid syntax requirements**: Double quotes around text with spaces, `<br/>` for line breaks, darker colors for contrast
- **Color coding for key components**:

| Component Type | Color Code | Usage |
|----------------|------------|-------|
| Entry/start points | `fill:#1e40af` (dark blue) | Process initiation |
| Decision points | `fill:#b91c1c` (dark red) | Conditionals, branches |
| Critical processing | `fill:#047857` (dark green) | Core business logic |
| End points/outputs | `fill:#92400e` (dark brown) | Final results |

> **Example Flowchart**
> ```mermaid
> flowchart TD
>     START["START"]
>     START --> saveFiles["save_uploaded_files"]
>     saveFiles --> isExcel{"Is Excel?"}
>     isExcel -->|"Yes"| preProcess["upload_aggregator_pre_processing()"]
>     isExcel -->|"No"| bypass["bypass_conversion"]
>     preProcess --> buildResponse["build_response_to_frontend"]
>     bypass --> buildResponse
>     buildResponse --> END["END"]
>     
>     style START fill:#1e40af,color:#ffffff
>     style isExcel fill:#b91c1c,color:#ffffff
>     style preProcess fill:#047857,color:#ffffff
>     style END fill:#92400e,color:#ffffff
> ```

- When a diagram already captures control flow or data movement, reference the relevant nodes and source files in prose instead of duplicating the same logic with full code listings

<important_note>

> 📝 **NOTE:** DO NOT use `end` as a classDef name (reserved keyword). DO NOT use escaped quotes `\"` within square bracket node labels. Use alternative names like `endpoint` and plain text without quotes.

</important_note>

---

## 8. Optional Deep-Dive Sections (include when relevant)

- **Data Structures** – SQLAlchemy models, config dicts, or custom classes.
- **Key Functions** – Signature, parameters, side-effects, and caveats.
- **Integration Points** – External API calls, CLI entry points, Celery jobs.
- **Error Handling & Edge Cases** – Enumerate known pitfalls, linked
  exceptions, and how the system recovers or fails fast.
- Keep any supporting snippets minimal; prefer summaries, pseudo-code, or bullet lists and link to the implementation for full detail

---

## 9. Subtle Nuances & Points of Error

Document *anything* that frequently trips up maintainers:

- Hidden dependencies (e.g., "Requires Flask *application* context, not just
  request context – see `routes/__init__.py` for initialisation order.")
- Non-obvious ordering constraints (e.g., "Duplicate check **must** run after
  standardisation to ensure canonical IDs.")
- Environment-specific pitfalls (e.g., "SQLite in development lacks pgcrypto, so
  encryption helpers silently no-op.")
- Performance land-mines (e.g., "Loading entire XLSX sheets into memory may
  exceed the 512 MB Heroku dyno limit for large LMG files.")
- Focus on what to observe or adjust rather than pasting the code that implements the safeguard; reference logging, monitoring, or tests that expose the issue

---

## 10. Prohibitions

**Unless requested:**

✘ Do **not** include time estimates, owners, sprint tasks, or "future improvements".
✘ Avoid speculation—document observed behaviour only.  
✘ Skip unit-test details; link to the test suite if essential.  
✘ Eliminate redundant explanations—say it once, clearly and completely (except for critical warnings or points of failure that require emphasis).
✘ Do **not** include line numbers in the documentation, since line numbers are subject to change and will become inaccurate over time. Instead refer to file and function names.
✘ Do **not** embed lengthy HTML, template, JavaScript, or Python excerpts; summarise the effect and cite the owning component instead.

</documentation_guidelines>