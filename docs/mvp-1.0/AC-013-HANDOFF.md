# [BA→DEV-LEAD] AC-013: AI ร่าง Test Case จาก Requirement (US-019)

**Status:** AC-013 เขียนเสร็จ (9 criteria) — พร้อม handoff ให้ Dev Lead  
**Date:** 2026-07-10  
**Reference:** [AC.md](./AC.md#ac-013-ai-ร่าง-test-case-us-019) | [user-stories.md](./user-stories.md#us-019--ai-ร่าง-test-case-จาก-requirement)

---

## Summary

US-019 ต้องการให้ QA สามารถใช้ AI ร่าง Test Case จาก Jira Ticket หรือ `.md` file ใน local repo ได้
- **Input:** Jira key หรือ markdown checklist item
- **Output:** JSON array ของ TestCaseDraft (scenario, testData, expectedResult, type)
- **Pattern:** Non-streaming, copy-out draft only (ไม่มี submit to Jira button)

---

## AC-013 Overview (9 Criteria)

| # | Criterion | Key Points |
|---|-----------|-----------|
| 1 | **Input Source** | Button "Draft Test Cases with AI" บน TaskRow + file-level; click → navigate `/test-cases-draft/:taskId` |
| 2 | **AI Call (Non-Streaming)** | IPC `ai:draft-test-cases` → main process AIService; single response (ไม่ stream) |
| 3 | **Prompt Context** | Jira key/summary (linked) หรือ file path + line + surrounding ±5 lines + checklist text |
| 4 | **Test Case Format** | JSON array; each item: `{scenario, testData, expectedResult, type}` + scenario มี Given-When-Then |
| 5 | **Output Display** | Review page แสดง test cases พร้อมแต่ละ field; icon ของ type (Boundary/E2E/Edge/Functional) |
| 6 | **Read-Only Draft** | Fields editable ในหน้า review เท่านั้น; ไม่ auto-save; ไม่ update .md ไม่ touch Jira |
| 7 | **No Jira Writes** | ไม่มีปุ่ม submit/push; copy ไม่เรียก Jira API; ไม่มี side effect to ticket |
| 8 | **Model Constant** | ใช้ `claude-sonnet-4-6` (constant ใน shared/constants.ts) ไม่ hardcode |
| 9 | **Error Handling** | API error → error banner (ไม่ crash); invalid JSON → "format ไม่ถูกต้อง"; missing key → "configure ใน Settings" |

---

## Implementation Checklist (Dev Lead → Dev)

### Frontend (Dev FE)

- [ ] Create `DraftTestCasesPage.vue` (route `/test-cases-draft/:taskId`)
- [ ] Add button "Draft Test Cases with AI" to:
  - [ ] `TaskItem.vue` (untracked + linked tasks)
  - [ ] File-level component (หัวไฟล์ `.md`)
- [ ] Button click → emit IPC `ai:draft-test-cases` with `{ sourceId, sourceType }` (task ID / file path)
- [ ] Render response JSON as list of TestCaseCards
  - [ ] Each card: scenario (Given-When-Then), testData (collapsible), expectedResult, type badge
  - [ ] Editable inputs (ทุก field)
  - [ ] "Copy" button คัดลอก as Markdown/plain text
  - [ ] Warning text: "Test case เหล่านี้เป็นเพียงร่าง — ตรวจสอบก่อนใช้งานจริง"
- [ ] Loading state (spinner) ระหว่างรอ AI response
- [ ] Error banner ถ้า API error, invalid JSON, หรือ missing credentials

### Backend (Dev BE)

- [ ] Add IPC handler `ipcMain.handle('ai:draft-test-cases', async (event, { sourceId, sourceType }) => {...})`
- [ ] Create `AIService.testCaseDraft()` method
  - [ ] Accept: sourceId (task ID หรือ file path), sourceType ('task' | 'file')
  - [ ] Load context:
    - [ ] Linked task: fetch Jira ticket (key + summary)
    - [ ] Untracked task: read file, extract line + ±5 context
  - [ ] Build prompt with requirement context + instructions for Given-When-Then format + type enum
  - [ ] Call Anthropic `claude-sonnet-4-6` (non-streaming)
  - [ ] Parse response as JSON array → validate shape
  - [ ] Return: `TestCaseDraft[]` หรือ error
- [ ] Store draft ใน `electron-store` ภายใต้ key: `testCases/{sourceId}`
  - [ ] ไว้ให้ Coverage View (US-020) อ้างอิง
- [ ] Error handling:
  - [ ] Anthropic API error → throw with readable message
  - [ ] Invalid JSON → throw "format ไม่ถูกต้อง"
  - [ ] Missing API key → throw "configure ใน Settings"

### Types & Constants

- [ ] Define `TestCaseDraft` interface:
  ```ts
  interface TestCaseDraft {
    scenario: string;      // Given-When-Then format
    testData: Record<string, any>;
    expectedResult: string;
    type: 'Boundary' | 'E2E' | 'Edge' | 'Functional';
  }
  ```
- [ ] Update `shared/constants.ts`:
  ```ts
  export const AI_MODEL = 'claude-sonnet-4-6';
  ```
- [ ] Define IPC channel ใน `shared/types/ipc.ts`:
  ```ts
  enum IpcChannel {
    // ...
    AI_DRAFT_TEST_CASES = 'ai:draft-test-cases',
  }
  ```

### Testing (QA Lead → QA Role)

All AC-013-01 through AC-013-09 must pass:

1. **AC-013-01** — Button appears + navigate
2. **AC-013-02** — Non-streaming response, main-process-only
3. **AC-013-03** — Prompt มี source context ครบ
4. **AC-013-04** — Response shape + Given-When-Then validation
5. **AC-013-05** — UI display ชัดเจน + icon type
6. **AC-013-06** — Editable, no auto-save, ไม่ touch .md/Jira
7. **AC-013-07** — No submit button, copy ไม่เรียก Jira
8. **AC-013-08** — Model constant verified
9. **AC-013-09** — Error handling flows (API error, invalid JSON, missing key, retry)

---

## Dependencies

- **US-007**: Jira integration (fetch ticket data)
- **US-004**: Repo scan (get file + line number)
- **US-020**: Coverage View (อ้าง draft store)

---

## Gating & Scope

- **Freeze Gate:** ห้าม implement จนกว่า MVP 1.3 ship + QA sign-off ✅
- **Implement Order (PM):** US-021 → US-018 → **US-019** → US-020
- **Philosophy:** Read-only sentinel — ไม่ auto-create Jira, ไม่ submit, copy-out เท่านั้น

---

## Notes for Dev Lead

1. **Prompt Engineering:** Ensure Claude understands:
   - Each test case must have clear Given-When-Then scenario
   - Test data should be realistic + include edge cases
   - Expected result ต้องระบุชัดเจน (ไม่ใช่ "should work")

2. **Non-Streaming Behavior:** ต่างจาก US-010 (Start My Day) ที่ stream
   - US-019: single API call → wait for full JSON response
   - UI แสดง loading state จนกว่า response มา

3. **Copy Format:** Markdown format พร้อมใช้งาน (ไม่ใช่ raw JSON)
   ```
   ## Test Case 1: Boundary
   **Scenario:** Given user logs in with valid credentials / When user enters dashboard / Then see task list
   **Test Data:** username=qa@test.com, password=test123
   **Expected Result:** Dashboard displays 5+ tasks
   ---
   ```

4. **Store Key Consistency:** electron-store key ต้องตรงกับ AC-014 (Coverage View) ที่อ้าง:
   - Key: `testCases/{taskId}` (stable)
   - Value: `TestCaseDraft[]`

5. **Security Check:** ก่อน commit ต้อง verify:
   - No Anthropic SDK ใน renderer
   - No hardcoded `"claude-sonnet-4-6"`
   - keytar ใน asarUnpack ของ electron-builder

---

## Review Criteria (QA Lead)

AC-013 passed ⟺ ทั้ง 9 criteria ผ่าน + DoD ครบ:
1. All AC-013-01 to AC-013-09 ✅
2. No TypeScript errors (`tsc --noEmit`)
3. Electron app opens + no console errors
4. Manual UI test on macOS arm64
5. No auto-create Jira ticket ไม่เกิด

---

**Next:** Dev Lead review AC-013 → plan technical approach → pass to Dev BE + Dev FE
