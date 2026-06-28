export const meta = {
  name: 'sdlc-pipeline',
  description: 'Full SDLC pipeline: PA → BA → Dev Lead → Dev → Dev Lead review → QA Lead → QA Role → sign-off',
  phases: [
    { title: 'Requirements', detail: 'PA ตรวจ scope, BA ยืนยัน AC' },
    { title: 'Technical Planning', detail: 'Dev Lead วาง approach' },
    { title: 'Implementation', detail: 'Dev implement' },
    { title: 'Code Review', detail: 'Dev Lead review โค้ด' },
    { title: 'QA', detail: 'QA Lead มอบหมาย, QA Role audit, QA Lead sign-off' },
  ]
}

const task = (typeof args === 'object' && args !== null && args.task)
  ? args.task
  : typeof args === 'string' && args.length > 0
    ? args
    : 'ไม่ได้ระบุ task'

const phaseNum = (typeof args === 'object' && args !== null) ? args.phase || null : null

log(`เริ่ม SDLC Pipeline สำหรับ: ${task}`)

// ── Phase 1: Requirements ─────────────────────────────────────────────────────

phase('Requirements')

const paReview = await agent(
  `คุณเป็น Product Analyst (PA) ของโปรเจกต์ QADash

อ่านไฟล์เหล่านี้ก่อน:
- CLAUDE.md (กฎทั้งหมด)
- docs/mvp-1.0/PRD.md
- docs/mvp-1.0/user-stories.md

Task ที่ได้รับ: "${task}"

ตอบคำถามต่อไปนี้อย่างกระชับ:
1. Task นี้อยู่ใน MVP 1.0 scope หรือไม่? (ใช่/ไม่ใช่ พร้อมเหตุผล)
2. User Stories ไหนรองรับ task นี้? (ระบุ US-ID)
3. มี gap ใน User Stories ที่ต้องแจ้ง BA ไหม?
4. ข้อแนะนำก่อน BA เริ่มทำงาน

ถ้า task ไม่อยู่ใน scope ให้บอกชัดเจนและ STOP — อย่า implement`,
  { phase: 'Requirements', label: 'PA: ตรวจ scope' }
)

log(`PA: ${paReview.slice(0, 100)}...`)

if (paReview.toLowerCase().includes('stop') || paReview.includes('ไม่อยู่ใน scope')) {
  log('⛔ PA ตรวจพบว่า task ไม่อยู่ใน MVP scope — หยุด pipeline')
  return { status: 'STOPPED_BY_PA', reason: paReview }
}

const baReview = await agent(
  `คุณเป็น Business Analyst (BA) ของโปรเจกต์ QADash

อ่านไฟล์เหล่านี้ก่อน:
- docs/mvp-1.0/AC.md
- docs/mvp-1.0/user-stories.md
- CLAUDE.md

Task: "${task}"
PA Review: ${paReview}

ตอบคำถามต่อไปนี้:
1. AC ข้อไหนที่เกี่ยวข้องกับ task นี้? (ระบุ AC-ID ครบ)
2. AC เหล่านั้นครบถ้วนพอสำหรับ Dev implement ไหม?
3. มี AC ที่กำกวมหรือต้องการ clarify ไหม?
4. สิ่งที่ Dev Lead ต้องรู้ก่อนวาง technical approach`,
  { phase: 'Requirements', label: 'BA: ยืนยัน AC' }
)

log(`BA: ${baReview.slice(0, 100)}...`)

// ── Phase 2: Technical Planning ───────────────────────────────────────────────

phase('Technical Planning')

const devLeadPlan = await agent(
  `คุณเป็น Dev Lead (Technical Lead) ของโปรเจกต์ QADash

อ่านไฟล์เหล่านี้ก่อน:
- CLAUDE.md (กฎทั้งหมด + conventions)
- docs/mvp-1.0/architecture.md (IPC contract, data models, folder structure)
- docs/mvp-1.0/AC.md

Task: "${task}"
PA Review: ${paReview}
BA AC Verification: ${baReview}

วาง technical plan:
1. ไฟล์ที่ต้องสร้างหรือแก้ไข (ระบุ path เต็ม)
2. Approach สำหรับแต่ละไฟล์
3. IPC channels ที่ต้องเพิ่ม (ถ้ามี)
4. ความเสี่ยงหรือ tradeoffs
5. ลำดับการ implement ที่แนะนำ

ตรวจสอบกฎใน CLAUDE.md ก่อนเสนอ plan — ห้ามเสนอ approach ที่ละเมิดกฎ 5 ข้อ`,
  { phase: 'Technical Planning', label: 'Dev Lead: วาง plan' }
)

log(`Dev Lead Plan: ${devLeadPlan.slice(0, 100)}...`)

// ── Phase 3: Implementation (BE + FE parallel) ───────────────────────────────

phase('Implementation')

const [devBeResult, devFeResult] = await parallel([
  () => agent(
    `คุณเป็น Dev BE (Backend Developer) ของโปรเจกต์ QADash

อ่านไฟล์เหล่านี้ก่อน:
- CLAUDE.md (กฎทั้งหมด — ห้ามละเมิด)
- docs/mvp-1.0/be-spec.md (method signatures ทุก service)
- docs/mvp-1.0/architecture.md

Task: "${task}"
Dev Lead Plan: ${devLeadPlan}
AC ที่ต้องผ่าน: ${baReview}

Implement เฉพาะ src/main/, src/preload/, src/shared/ ตาม plan:
- เขียนโค้ดจริง ไม่ใช่ pseudo code
- ทุก method ต้อง complete ตรงกับ be-spec.md — ไม่มี stub
- ตรวจสอบกฎ 5 ข้อใน CLAUDE.md ทุกบรรทัดที่เขียน
- หลัง implement รัน \`npm run build\` และรายงานผล`,
    { phase: 'Implementation', label: 'Dev BE: main process', isolation: 'worktree' }
  ),
  () => agent(
    `คุณเป็น Dev FE (Frontend Developer) ของโปรเจกต์ QADash

อ่านไฟล์เหล่านี้ก่อน:
- CLAUDE.md (กฎทั้งหมด — ห้ามละเมิด)
- docs/mvp-1.0/fe-spec.md (component props/emits, store shape, IPC pattern)
- docs/mvp-1.0/architecture.md

Task: "${task}"
Dev Lead Plan: ${devLeadPlan}
AC ที่ต้องผ่าน: ${baReview}

Implement เฉพาะ src/renderer/ ตาม plan:
- เขียนโค้ดจริง ไม่ใช่ pseudo code
- ทุก component/store ต้อง complete ตรงกับ fe-spec.md
- ห้าม import จาก electron ใน renderer — ใช้แค่ window.qaApi
- ห้ามเก็บ credentials ใน Pinia
- หลัง implement รัน \`npm run build\` และรายงานผล`,
    { phase: 'Implementation', label: 'Dev FE: renderer', isolation: 'worktree' }
  ),
])

const devResult = `=== BE ===\n${devBeResult}\n\n=== FE ===\n${devFeResult}`
log(`Dev BE + FE: implement เสร็จ (parallel)`)

// ── Phase 4: Code Review ──────────────────────────────────────────────────────

phase('Code Review')

const codeReview = await agent(
  `คุณเป็น Dev Lead ของโปรเจกต์ QADash — กำลัง review โค้ดก่อนส่ง QA

Task: "${task}"
Dev Lead Original Plan: ${devLeadPlan}
Dev Implementation: ${devResult}

Review โค้ดและตอบ:
1. Implementation ตรงกับ plan ไหม?
2. กฎ 5 ข้อใน CLAUDE.md ถูก enforce ครบไหม?
   - ไม่มี auto-create Jira?
   - ไม่มี credentials ใน electron-store?
   - ไม่มี Anthropic SDK ใน renderer?
   - ไม่มี Jira writes?
   - contextIsolation: true, nodeIntegration: false?
3. Code conventions ถูกต้อง? (no any, no half-impl, IpcChannel enum)
4. ผลการ review: APPROVED หรือ NEEDS_REVISION
5. ถ้า NEEDS_REVISION: ระบุสิ่งที่ Dev ต้องแก้ไขก่อน QA`,
  { phase: 'Code Review', label: 'Dev Lead: review' }
)

log(`Code Review: ${codeReview.includes('APPROVED') ? '✅ APPROVED' : '⚠️ NEEDS REVISION'}`)

if (codeReview.includes('NEEDS_REVISION')) {
  log('⚠️ Dev Lead ไม่ approve — หยุดก่อน QA')
  return { status: 'NEEDS_REVISION', codeReview, devResult }
}

// ── Phase 5: QA ───────────────────────────────────────────────────────────────

phase('QA')

const qaLeadAssign = await agent(
  `คุณเป็น QA Lead ของโปรเจกต์ QADash

Task: "${task}"
Dev Lead Code Review: ${codeReview}
BA AC List: ${baReview}

มอบหมาย audit task ให้ QA Role:
1. ระบุ AC IDs ที่ QA Role ต้อง audit (จาก baReview)
2. ความเสี่ยงหรือจุดที่ควรให้ความสนใจเป็นพิเศษ
3. Test scenarios ที่แนะนำ
4. Sign-off criteria สำหรับ task นี้`,
  { phase: 'QA', label: 'QA Lead: มอบหมาย' }
)

const qaAudit = await agent(
  `คุณเป็น QA Role ของโปรเจกต์ QADash — กำลัง audit implementation

Task: "${task}"
QA Lead Assignment: ${qaLeadAssign}
Implementation: ${devResult}

อ่าน docs/mvp-1.0/AC.md และ audit:

**AC Coverage:**
สำหรับแต่ละ AC ที่ QA Lead ระบุ ให้รายงาน:
| AC ID | สถานะ | หลักฐาน / เหตุผล |
|---|---|---|
| AC-XXX-XX | ✅/❌/⚠️ | ... |

**กฎ Security:**
| กฎ | สถานะ | หลักฐาน |
|---|---|---|
| ไม่มี auto-create Jira | ✅/❌ | ... |
| ไม่มี credentials ใน store | ✅/❌ | ... |
| ไม่มี Anthropic ใน renderer | ✅/❌ | ... |
| ไม่มี Jira writes | ✅/❌ | ... |
| contextIsolation + nodeIntegration | ✅/❌ | ... |

**Bugs พบ:**
(ระบุ file:line, severity, expected vs actual)

**สรุป:** PASS หรือ FAIL`,
  { phase: 'QA', label: 'QA Role: audit' }
)

log(`QA Audit: ${qaAudit.includes('PASS') ? '✅ PASS' : '❌ FAIL'}`)

const qaSignoff = await agent(
  `คุณเป็น QA Lead ของโปรเจกต์ QADash — กำลังตัดสิน sign-off

Task: "${task}"
QA Role Audit Report: ${qaAudit}

ประเมิน DoD (Definition of Done):
- [ ] AC ทุกข้อที่เกี่ยวข้อง: PASS
- [ ] ไม่มี Critical/High severity bugs
- [ ] กฎ security 5 ข้อ: ไม่มีละเมิด
- [ ] npm run build: ผ่าน
- [ ] Electron เปิดได้

ตัดสินใจ:
- **SIGNED_OFF**: task นี้ผ่านทุกเกณฑ์ พร้อม deploy
- **REJECTED**: ระบุสิ่งที่ Dev ต้องแก้ไขก่อน sign-off ได้`,
  { phase: 'QA', label: 'QA Lead: sign-off' }
)

const passed = qaSignoff.includes('SIGNED_OFF')

log(passed ? '🎉 QA Lead SIGNED OFF — pipeline เสร็จสมบูรณ์' : '❌ QA Lead REJECTED — ต้องแก้ไขก่อน')

return {
  status: passed ? 'SIGNED_OFF' : 'REJECTED',
  task,
  summary: {
    paReview,
    baReview,
    devLeadPlan,
    codeReview,
    qaAudit,
    qaSignoff,
  }
}
