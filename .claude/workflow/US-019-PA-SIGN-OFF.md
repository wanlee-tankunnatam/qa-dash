# US-019 PA Sign-Off: AI ร่าง Test Case จาก Requirement

**Date:** 2026-07-10  
**PA Role:** Product Analyst  
**Status:** ✅ APPROVED (Handoff to BA)  
**Dependency:** US-018 (AI Gap Check) — SIGNED_OFF

---

## Scope Confirmation

### Story Summary
**US-019: AI ร่าง Test Case จาก Requirement**

- **As a** QA Engineer
- **I want** Claude to draft test cases (scenario + test data + expected result) from a requirement document or Jira task
- **So that** I have a starting point for writing tests without starting from scratch

---

## Scope Validation ✅

| Dimension | Status | Details |
|-----------|--------|---------|
| **Input Source** | ✅ Clear | Jira ticket (linked task) OR .md file (untracked task) — reuses US-018 pattern |
| **Output Format** | ✅ Clear | JSON array: `TestCaseDraft[]` with scenario, testData, expectedResult, type (Boundary/E2E/Edge/Functional) |
| **Streaming** | ✅ Clear | **Non-streaming** (unlike US-010) — returns full JSON response at once |
| **Architecture** | ✅ Clear | Reuses US-018/AIService pattern: IPC channel `ai:draft-test-cases` → main process → AIService.ts → Anthropic SDK |
| **Read-Only Enforcement** | ✅ Clear | Copy-out only; no Jira writes; no .md file edits — aligns with sentinel philosophy |
| **AC Coverage** | ✅ Complete | AC-013-01 through AC-013-09 fully specified (input, AI call, prompt, format, display, read-only, no writes, model, error handling) |

---

## Key Constraints Confirmed (กฎที่ยึด)

1. **No Auto-Jira-Create:** ✅ (NEVER #1) — Only copy-out; no Submit button anywhere  
2. **AI from Main Process Only:** ✅ (NEVER #3) — Anthropic SDK in `src/main/services/AIService.ts`  
3. **Read-Only Draft:** ✅ (NEVER #4) — User edits draft in review page, but no auto-persist to store; copy explicit only  
4. **No .md File Edit:** ✅ — Source requirement stays untouched  
5. **Non-Streaming Response:** ✅ (Unlike US-010/US-021) — IPC returns full JSON, no event chunks  
6. **Copy-Out Pattern:** ✅ (AC-013-06, AC-013-07) — Buttons: [Copy Markdown] only; no Submit/Push/Sync  
7. **Model Constant:** ✅ — Reuse `claude-sonnet-4-6` (AC-013-08)

---

## Dependencies

### Must Be Done First
- **US-018 (AI Gap Check):** ✅ SIGNED_OFF  
  - Establishes AIService architecture  
  - Defines IPC pattern for AI calls  
  - Sets up prompt context-gathering pattern (file excerpt + Jira context)  
  - Defines error handling framework

### Parallel/No Conflict
- US-019 and US-020 (Coverage View) can develop in parallel  
- US-019 does NOT depend on US-020  
- US-021 (Analysis Report) depends on US-019 (to reference test case drafts in risk analysis)

---

## AC Map (For BA Review)

BA should review each AC-013 subsection and create implementation spec:

| AC Group | Focus Areas |
|----------|-------------|
| **AC-013-01** | Button placement on TaskItem.vue, LinkedTaskItem.vue, file-level UI |
| **AC-013-02** | IPC channel naming, non-streaming single response, loading state UI |
| **AC-013-03** | Prompt engineering: context (Jira key + summary vs. file path + excerpt + context) |
| **AC-013-04** | TestCaseDraft TypeScript interface: scenario (Given-When-Then), testData object, expectedResult string, type enum |
| **AC-013-05** | Review page layout: card/row per test case, pagination if >5, clear field separation |
| **AC-013-06** | Editable fields in review page (NOT auto-save), Copy button triggers explicit save |
| **AC-013-07** | NO submit/push buttons; copy-to-clipboard only |
| **AC-013-08** | Constant `AI_MODEL = 'claude-sonnet-4-6'` in AIService.ts |
| **AC-013-09** | Error paths: API error, invalid JSON, missing Anthropic key, transient errors + retry (optional) |

---

## Edge Cases & Clarifications for BA

1. **Multiple Test Cases:** What if AI returns 10+ test cases?  
   → AC-013-05 suggests pagination or scroll; BA should specify UX (paginated list, load-more, etc.)

2. **testData Type:** AC-013-04 says `testData: object` — BA should define:  
   - Is it always `{ [key: string]: string | number | boolean }`?  
   - Can it be nested objects?  
   - UI: how to display object in review page (JSON editor vs. key-value form)?

3. **Copy Format:** AC-013-06 mentions "Copy Jira Markup" from US-012 — BA should clarify:  
   - Format for copied test cases: Markdown? Plain text? HTML?  
   - Should it include scenario, test data, expected result, type separately or merged?

4. **Draft Persistence:** AC-013-06 says "ไม่ auto-save" — BA should clarify:  
   - Does draft exist only in memory during review?  
   - Or save to electron-store if user closes/reopens?  
   - How long do drafts persist?

5. **Jira Ticket as Source:** For LinkedTask with Jira key:  
   - Should we fetch full ticket body from Jira, or use summary + description from cache?  
   - Prompt size limit? (AC-016-02 for US-022 mentions ~50KB; should US-019 have similar?)

6. **Error Recovery:** AC-013-09 mentions retry for transient errors — BA should spec:  
   - Retry count and backoff strategy?  
   - Should user be able to retry manually if AI fails?

---

## QA Testing Notes for Later

When QA Lead reviews, focus on:
- ✅ AC-013-01: Buttons render on correct UI elements  
- ✅ AC-013-02: IPC channel works (mock Anthropic if needed)  
- ✅ AC-013-04: testData object structure is valid JSON  
- ✅ AC-013-06: Fields are editable; un-edited copy preserves AI response  
- ✅ AC-013-07: No Jira API calls from copy button (mock Jira, verify no requests)  
- ✅ AC-013-09: Error paths are graceful (no crash on API error, malformed response, missing key)  

---

## Handoff Checklist

- ✅ Story is clear: Input source, output format, architecture pattern all defined  
- ✅ AC is comprehensive: 9 subsections cover input, AI, prompt, format, display, constraints, model, errors  
- ✅ No scope creep: Stays within read-only sentinel philosophy  
- ✅ Dependency verified: US-018 SIGNED_OFF; architecture reused  
- ✅ Engineering alignment: Reuses AIService, IPC pattern, copy-out workflow from US-018/US-012  
- ✅ Flow is sound: Aligns with Draft Ticket (US-011/US-012) and Gap Check (US-018) patterns  

---

## Recommendation to BA

**Write BA acceptance criteria mapping** with special attention to:
1. **AC-013-03 (Prompt Context):** Exactly what fields go into the prompt for each source type (Jira vs. .md)? Context window size limit?  
2. **AC-013-04 (TestCaseDraft Type):** Define TypeScript interface precisely; spec testData structure (flat object vs. nested vs. schema)?  
3. **AC-013-05 (Display):** Define exact layout for review page — card vs. table? Pagination? Copy button placement?  
4. **AC-013-06 (Draft Lifecycle):** Clarify memory vs. store persistence and user flow for editing → copying.  

---

## PA Sign-Off

**✅ US-019 scope is APPROVED and ready for BA.**

Ready for: **[PA→BA] Handoff**

Next step: BA writes detailed acceptance criteria mapping and clarification notes.
