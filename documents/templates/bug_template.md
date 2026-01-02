<!-- ════════════════════════════════════════════════════════════════════════════════
     🚨 TEMPLATE METADATA - DELETE THIS ENTIRE SECTION WHEN USING THE TEMPLATE 🚨
     ════════════════════════════════════════════════════════════════════════════════ -->

## What This Template Is

This is a structured template for documenting bugs, defects, and technical issues discovered in software systems. It provides a systematic framework to capture bug details, analyze impact, provide reproduction steps, and guide resolution efforts. The template emphasizes precision and actionable information to accelerate bug fixing.

Unless otherwise specified, save details of a specific bug created using this template to the `documents/todo/` folder.

---

## Template Usage Notes

<important_note>

> 📝 **NOTE:** This template is for documenting confirmed bugs. For unresolved errors requiring investigation, use the Error Documentation Template instead.

</important_note>

### When to Use This Template

- Documenting newly discovered bugs during testing or code review
- Creating bug tickets for issue tracking systems
- Building a knowledge base of known issues and their fixes
- Performing systematic bug audits or security reviews
- Documenting bugs found in production systems

### Required Sections (Never Skip)

1. Bug Summary
2. Severity & Priority
3. Affected Components
4. Issue Description
5. Recommendation

### Optional Sections (Include Only If Relevant)

- Steps to Reproduce (if reproducible)
- Root Cause Analysis (if investigated)
- Workaround (if temporary solution exists)
- Related Bugs (if part of a pattern)
- Test Cases (for verification after fix)

### Required Heading Structure (Do Not Change Levels)

- Use `#` only once for the document title. For consolidated reports, use `#` for the file title, then `## Bug X: ...` for each bug.
- Keep all numbered template sections at `##` (1–10). Sub-sections under a section stay at `###` (e.g., "Bug Title", "One-Line Description"). Nested details under those use `####` (e.g., "The Problem", "Code Example").
- Never place a higher-level heading (`##`) beneath a bug entry (`###`). Child content must always be LOWER level than its parent to preserve TOC order and screen reader clarity.
- Heading depth offsets (apply per bug): pick the bug heading level as **Hn** (H2 in a single-bug doc, H3 when grouped under a category like "Access Control Bugs"), then use `H(n+1)` for numbered sections, `H(n+2)` for their sub-headings (Bug Title, Dependencies, The Problem), and `H(n+3)` for nested details (Code Example, Expected vs Actual).
- Category example: `# Report Title` → `## Access Control Bugs` → `### Bug 1` → `#### Affected Components` → `##### Dependencies`.

## Heading Structure Examples
❌ WRONG
```markdown
## Team Access Bugs
## Bug 1: Invite acceptance ignores subscription gating
### Bug Summary
```

✅ RIGHT
```markdown
## Team Access Bugs
### Bug 1: Invite acceptance ignores subscription gating
#### Bug Summary
```

❌ WRONG
```markdown
## Bug 1: Invite acceptance ignores subscription gating
## Bug Summary
### One-Line Description
```

✅ RIGHT
```markdown
## Bug 1: Invite acceptance ignores subscription gating
### Bug Summary
#### One-Line Description
```

---

## Information Highlighting Guidelines

Use XML tags with proper spacing to highlight critical bug characteristics.

**Security Vulnerability**
```markdown
<critical_warning>

> 🚨 **SECURITY VULNERABILITY:** This bug creates a security risk. Immediate patching required.

</critical_warning>
```

**Data Loss Risk**
```markdown
<critical_warning>

> 🚨 **DATA LOSS RISK:** This bug can cause permanent data loss or corruption.

</critical_warning>
```

**Performance Impact**
```markdown
<important_note>

> 📝 **PERFORMANCE:** This bug significantly degrades system performance under [specific conditions].

</important_note>
```

**Regression Risk**
```markdown
<important_note>

> 📝 **REGRESSION:** This bug was previously fixed in version X.Y.Z and has reappeared.

</important_note>
```

---
<!-- ════════════════════════════════════════════════════════════════════════════════
     🚨 END OF TEMPLATE METADATA - DELETE EVERYTHING ABOVE THIS LINE 🚨
     ════════════════════════════════════════════════════════════════════════════════ -->

Here is a template to guide the creation of bug documentation:
<bug_template>
# Bug Documentation Template

## 1. Bug Summary

### Bug Title
Provide a concise, descriptive title that captures the essence of the bug in ≤ 10 words.

> **Format:** `[Component] Brief description of incorrect behavior`  
> **Example:** `[Authentication] Session tokens persist after logout`

### One-Line Description
Summarize the bug's impact in a single sentence for quick understanding.

> **Example:** "User sessions remain valid after logout, allowing unauthorized access to protected resources."

---

## 2. Severity & Priority

### Severity Classification

| Level | Description | Example |
|-------|-------------|---------|
| **Critical** | System unusable, data loss, security breach | Authentication bypass, database corruption |
| **High** | Major feature broken, significant performance impact | Memory leaks, payment processing errors |
| **Medium** | Feature partially broken, workaround available | UI rendering issues, validation gaps |
| **Low** | Minor inconvenience, cosmetic issues | Typos, alignment problems |

**Assigned Severity:** [Critical/High/Medium/Low]

### Priority Factors

| Factor | Assessment | Impact on Priority |
|--------|------------|-------------------|
| **User Impact** | [# affected users or %] | [High/Medium/Low] |
| **Business Impact** | [Revenue/operations effect] | [High/Medium/Low] |
| **Fix Complexity** | [Simple/Moderate/Complex] | [High/Medium/Low] |

**Assigned Priority:** [P1/P2/P3/P4]

---

## 3. Affected Components

<critical_warning>

> 🚨 **CRITICAL:** Always include COMPLETE file paths relative to the workspace root. Never use partial paths or filenames without directory structure. This is essential for developers to quickly locate and fix bugs.

</critical_warning>

### File Locations

List all files where the bug exists with specific line numbers.

```
# ✅ CORRECT - Complete paths from workspace root:
server/routes.ts - Lines 1063, 1075, 1087
server/auth.ts - Lines 59-62
client/src/hooks/use-upload.ts - Lines 173-175

# ❌ INCORRECT - Avoid these formats:
routes.ts - Lines 1063  # Missing directory path
/auth.ts - Lines 59-62  # Unclear root location
use-upload.ts - Lines 173  # No path context
```

### System Components

| Component | Version | Role in Bug |
|-----------|---------|-------------|
| Backend API | v2.1.0 | Contains flawed logic |
| Database Layer | v1.5.0 | Executes invalid queries |
| Frontend UI | v3.0.0 | Displays incorrect data |

### Dependencies

List any third-party libraries or services involved.

```yaml
Affected Dependencies:
  - express: 4.18.2 (middleware bypass)
  - postgres: 3.4.0 (connection pooling issue)
  - react-query: 5.0.0 (cache invalidation bug)
```

> Heading reminder: If this template sits under a grouped bug heading (e.g., `### Bug 1`), demote this dependency heading to `H(n+2)` relative to the bug (e.g., use `##### Dependencies` when the bug title is `###`).

---

## 4. Issue Description

### The Problem

Describe what is happening incorrectly, focusing on observable behavior and technical details.

### Code Example

```typescript
// File: server/auth.ts, lines 59-62  ← ALWAYS include complete path from workspace root
// BUG: Authentication completely bypassed in development

// Skip authentication entirely in development mode
if (process.env.NODE_ENV === 'development') {
  return next();  // <-- This bypasses ALL security checks
}
```

### Expected vs Actual Behavior

| Aspect | Expected | Actual |
|--------|----------|--------|
| **Behavior** | Authentication required for all protected routes | All routes accessible without login |
| **Data State** | Session validated before access | No session validation performed |
| **Error Handling** | 401 returned for unauthorized | 200 returned for all requests |

### Impact Analysis

| Impact Area | Description | Severity |
|-------------|-------------|----------|
| **Security** | Exposes all user data without authentication | Critical |
| **Data Integrity** | Allows unauthorized data modifications | High |
| **User Experience** | May expose features not ready for users | Medium |
| **Performance** | Skips validation overhead (minor positive) | Low |

---

## 5. Steps to Reproduce (Optional)

### Prerequisites
```bash
# Environment setup required
NODE_ENV=development
DATABASE_URL=postgresql://localhost/testdb
```

### Reproduction Steps

1. **Setup**: Start the application in development mode
   ```bash
   NODE_ENV=development npm run dev
   ```

2. **Trigger**: Access protected endpoint without authentication
   ```bash
   curl http://localhost:5000/api/users/profile
   ```

3. **Observe**: Note successful response without login
   ```json
   {
     "user": { "id": 1, "email": "test@example.com" }
   }
   ```

**Reproduction Rate:** 100% in development environment

---

## 6. Recommendation

### Immediate Fix

Provide specific code changes to resolve the bug.

```typescript
// File: server/auth.ts
// Replace lines 59-62 with:

// Use explicit flag for auth bypass, not NODE_ENV
if (process.env.SKIP_AUTH === 'true' && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  Authentication bypassed - development only');
  return next();
}
```

### Implementation Notes

- **Backward Compatibility**: Requires adding SKIP_AUTH to dev environment
- **Testing Required**: Verify all auth flows after change
- **Deployment**: No database migration needed

### Alternative Solutions

| Approach | Pros | Cons |
|----------|------|------|
| Remove bypass entirely | Most secure | Slows development |
| IP-based bypass | Flexible | Complex to maintain |
| Token-based bypass | Granular control | Requires setup |

---

## 7. Root Cause Analysis (Optional)

### Primary Cause

Explain the fundamental reason this bug exists.

> **Example:** "Developer convenience feature (auth bypass) was implemented without considering security implications or proper environment isolation."

### Contributing Factors

1. **Code Review Gap**: Security implications not caught in review
2. **Documentation**: No warning about development mode behavior
3. **Configuration**: NODE_ENV used for both optimization and security

### Prevention Strategies

- Implement security linting rules
- Require security review for auth changes
- Use feature flags instead of environment variables

---

## 8. Workaround (Optional)

### Temporary Solution

<important_note>

> 📝 **TEMPORARY:** This workaround should only be used until the proper fix is deployed.

</important_note>

```bash
# For immediate protection in development:
unset NODE_ENV  # Forces production behavior
# OR
NODE_ENV=production npm run dev  # Explicit production mode
```

### Workaround Limitations

- Disables all development features (hot reload, debug info)
- May cause unexpected behavior in development tools
- Not suitable for active development work

---

## 9. Related Bugs (Optional)

Link to similar or related issues for pattern recognition.

| Bug ID/Title | Relationship | Status |
|--------------|--------------|--------|
| #123 "Memory leak in session storage" | Same component | Open |
| #456 "Auth tokens not expiring" | Related security issue | Fixed in v2.0.1 |

### Pattern Analysis

If this bug is part of a larger pattern, describe it:

> "This is the third authentication-related bug this quarter. Consider a comprehensive security audit of the auth system."

---

## 10. Test Cases (Optional)

Define tests to verify the bug is fixed.

### Unit Test

```typescript
describe('Authentication Middleware', () => {
  it('should require authentication even in development', () => {
    process.env.NODE_ENV = 'development';
    const result = authMiddleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });
});
```

### Integration Test

```yaml
Test Case: Development Authentication
Given: Application running with NODE_ENV=development
When: Unauthenticated request to /api/protected
Then: Should return 401 Unauthorized
```

### Regression Test

Add this scenario to the regression test suite to prevent reoccurrence.

---

## Bug Categories Reference

### Common Bug Types

Use these categories to classify bugs consistently:

| Category | Description | Common Causes |
|----------|-------------|---------------|
| **Security** | Authentication, authorization, data exposure | Missing validation, hardcoded credentials |
| **Memory Leak** | Memory not released, growing consumption | Event listeners, circular references |
| **Race Condition** | Timing-dependent incorrect behavior | Async operations, shared state |
| **Data Corruption** | Incorrect data storage or retrieval | Type mismatches, encoding issues |
| **Logic Error** | Incorrect business logic implementation | Edge cases, assumptions |
| **Performance** | Slow response, high resource usage | Inefficient algorithms, missing indexes |
| **UI/UX** | Display issues, interaction problems | CSS conflicts, state management |
| **Integration** | Third-party service failures | API changes, network issues |
| **Configuration** | Environment-specific problems | Missing variables, incorrect values |

---

</bug_template>