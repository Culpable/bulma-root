# Bulma - AI Mortgage Broker Assistant

<policy_advisor_description>

Bulma is an **AI-driven web application** that assists Australian mortgage brokers with policy matching, lender selection, and exception handling. Brokers ask natural language questions about lender policies, and the AI retrieves current policy text from an authoritative database to deliver grounded, scenario-specific answers with source attribution—eliminating manual policy lookups and reducing time spent navigating lender portals.

Target Market: Australian mortgage brokers, credit advisers, and lending specialists.

---

## Core Value Proposition

| Challenge | Policy Advisor Solution |
|-----------|------------------------|
| Policy documents are lengthy and scattered across lender portals | Single conversational interface to query any lender's policies |
| Policy interpretations vary and memory is unreliable | Answers grounded in current policy text with source attribution |
| "Sticky deals" require knowledge of exception pathways | Exception logic layer surfaces known workarounds and conditional approvals |
| Policy updates occur frequently without notification | Database maintained with current policy revisions; "Last updated" timestamps visible |
| Comparing lenders requires opening multiple documents | Cross-lender queries return side-by-side comparisons in seconds |

---

## How It Works (Broker Workflow)

### 1. Ask a Policy Question

Type natural language questions the same way you'd ask a colleague:

- *"What's NAB's policy on casual PAYG income?"*
- *"Can CBA accept 10% genuine savings from a gift?"*
- *"Compare the big 4's LMI requirements for 95% LVR"*
- *"Does Westpac allow rental income shading for investment loans?"*

The system understands broker terminology, lender nicknames (e.g., "big 4", "majors"), and common policy categories without requiring exact phrasing.

### 2. Receive a Grounded Answer

The Policy Advisor retrieves relevant policy sections from its database and generates an answer that:

- **Cites only current policy text** — no hallucinated or outdated information
- **Attributes sources** — displays which lender(s) and policy category the answer draws from
- **Highlights conditions** — surfaces eligibility criteria, LVR thresholds, documentation requirements
- **Admits gaps** — explicitly states when policy coverage is incomplete rather than guessing

### 3. Follow Up Naturally

Continue the conversation to refine or expand:

- *"What about if they've been casual for 18 months?"*
- *"And what documentation would they need?"*
- *"Does the same apply for Macquarie?"*

The system maintains context across the conversation, understanding pronoun references and building on prior answers.

---

## Lender Policy Categories

The Policy Advisor covers the full spectrum of lending policy areas:

| Category | Example Questions |
|----------|-------------------|
| **Income & Employment** | PAYG, self-employed, casual/contract, commission, rental income, Centrelink, foreign income |
| **Servicing** | Living expenses, existing debts, HEM benchmarks, uncommitted monthly income |
| **Credit History** | Credit scores, defaults, judgments, bankruptcies, hardship arrangements |
| **Loan Purpose** | Owner-occupied, investment, construction, refinance, debt consolidation |
| **Security** | Property types, LVR limits, regional vs metro, unregistered land, strata |
| **LMI & Guarantees** | LMI thresholds, family guarantees, security guarantor requirements |
| **Genuine Savings** | Deposit sources, gift funds, first home buyer requirements |
| **Documentation** | Payslips, tax returns, BAS, bank statements, verification requirements |

---

## Policy Exceptions (Coming Soon)

> **Note:** The exception logic layer is under active development. The following describes the intended capability.

Beyond standard policy, the Policy Advisor surfaces **known lender exceptions**—approval pathways that exist outside published guidelines but have been granted in practice:

### Exception Types

| Exception Category | Example |
|--------------------|---------|
| **Conditional Approvals** | "CBA may accept <12 months PAYG with same industry + 2 years employment history" |
| **LVR-Gated Exceptions** | "NAB can consider this scenario if LVR ≤ 85% and ABN registered > 6 months" |
| **Credit Rep Discretion** | "Westpac credit managers have approved 90-day defaults under $500 with explanation letter" |
| **Alternative Documentation** | "Macquarie accepts 1 year's tax returns for self-employed with 3 years ABN history" |
| **Scenario-Specific Workarounds** | "ANZ policy exception available for contract workers with 2 years continuity in same field" |

### How Exceptions Are Surfaced

When answering a policy question, the system:

1. **Checks standard policy first** — determines if the scenario fits within published guidelines
2. **Queries exception database** — searches for known workarounds matching the scenario
3. **Ranks lender options** — presents lenders as:
   - **Primary fit:** Scenario meets standard policy
   - **Secondary (with conditions):** Scenario may be approved with specific conditions or exceptions
   - **Tertiary (outside policy):** Exception required, historically granted

### Exception Confidence Levels

| Level | Meaning |
|-------|---------|
| **Documented** | Exception pathway explicitly noted in policy addendums or BDM communications |
| **Precedented** | Multiple confirmed approvals for similar scenarios |
| **Reported** | Anecdotal success from broker community; not independently verified |

The system discloses the confidence level alongside each exception so brokers can assess reliability.

---

## Source Attribution & Transparency

Every policy answer includes:

- **Lender name** — which lender(s) the policy information comes from
- **Policy category** — the specific policy area referenced (e.g., "Income - Self Employed")
- **Last updated** — when the policy was last reviewed in the database

This transparency allows brokers to:

- Verify answers against source documents when needed
- Understand the recency of policy information
- Identify which lender/category combinations lack coverage

---

## Cross-Lender Comparisons

The Policy Advisor excels at comparative queries:

| Query Type | Example |
|------------|---------|
| **Big 4 comparison** | "Compare CBA, NAB, Westpac, and ANZ on first home buyer genuine savings" |
| **Policy vs policy** | "What's the difference between Macquarie and ING on non-resident borrowers?" |
| **Best fit** | "Which lenders accept Uber income as primary employment?" |
| **Threshold comparison** | "What LVR limit does each major apply to inner-city apartments?" |

Results are structured for quick scanning, highlighting key differences and conditions.

---

## What Policy Advisor Does NOT Do

To set accurate expectations:

| Out of Scope | Reason |
|--------------|--------|
| **Provide legal or credit advice** | Brokers remain responsible for suitability assessments |
| **Submit loan applications** | Policy Advisor is for research and scenario planning only |
| **Guarantee approval** | Policy compliance ≠ credit approval; assessor discretion applies |
| **Replace lender relationships** | BDM confirmation recommended for exceptions and edge cases |
| **Access live lender systems** | Answers are based on database snapshots, not real-time portal data |

---

## Example Conversation

```
Broker: Can you check if a borrower with 6 months casual employment would 
        work with CBA for an 80% LVR owner-occupied purchase?

Policy Advisor: Based on CBA's current policy:

**Standard Policy:** CBA requires casual employees to have a minimum of 
12 months continuous employment with the same employer for income to be 
fully assessed.

**For your scenario (6 months casual):**
- The borrower would not meet standard casual employment requirements
- However, if the borrower has prior employment history in the same 
  industry totalling 24+ months, CBA may consider the application under 
  their industry continuity exception

**Documentation typically required:**
- Current employment contract or letter
- 2 recent payslips showing YTD earnings
- Evidence of prior industry employment (references, employment letters)

Would you like me to check other lenders that may have more flexible 
casual employment policies?

---
Used 1 source
- CBA - Income & Employment (Last updated: 15 Nov 2025)
```

---

## Technical Notes (For Integration)

- **Model:** Policy Advisor (`policy-model`) is the default chat model
- **Response Time:** Typically 3-8 seconds depending on query complexity
- **Grounding:** All policy claims are grounded in retrieved policy text; no fabrication
- **Context Window:** Maintains full conversation history for follow-up questions
- **Source Display:** Collapsible "Used N sources" appears below each answer

</policy_advisor_description>