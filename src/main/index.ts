import { app, BrowserWindow } from 'electron'
import { createWindow } from './window.js'
import { KeychainService } from './services/KeychainService.js'
import { ConfigStore } from './services/ConfigStore.js'
import { IgnoreStore } from './services/IgnoreStore.js'
import { RepoScanner } from './services/RepoScanner.js'
import { JiraClient } from './services/JiraClient.js'
import { DangerZoneTracker } from './services/DangerZoneTracker.js'
import { DraftService } from './services/DraftService.js'
import { Scheduler } from './services/Scheduler.js'
import { SprintStatusReader } from './services/SprintStatusReader.js'
import { registerHandlers } from './ipc/handlers.js'

let mainWindow: BrowserWindow | null = null

app.whenReady().then(async () => {
  // 1. สร้าง services
  const keychainService = new KeychainService()
  const configStore = new ConfigStore()
  const ignoreStore = new IgnoreStore()
  const repoScanner = new RepoScanner(ignoreStore)
  const jiraClient = new JiraClient(keychainService)
  const dangerZoneTracker = new DangerZoneTracker(configStore)
  const draftService = new DraftService()
  const sprintStatusReader = new SprintStatusReader()

  // 2. สร้าง window
  mainWindow = createWindow()

  // 3. สร้าง scheduler — ส่ง getter function ไม่ใช่ direct ref เพื่อป้องกัน stale reference
  const scheduler = new Scheduler(
    configStore,
    repoScanner,
    jiraClient,
    dangerZoneTracker,
    () => mainWindow
  )

  // 4. Register IPC handlers
  registerHandlers(
    configStore,
    repoScanner,
    jiraClient,
    dangerZoneTracker,
    draftService,
    ignoreStore,
    keychainService,
    scheduler,
    sprintStatusReader,
    () => mainWindow!
  )

  // 5. Start scheduler (US-013: 09:00 sync, US-017: 09:10 focus)
  scheduler.start()
})

// macOS: เปิด window ใหม่เมื่อ click dock icon
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow()
  }
})

// macOS: ไม่ quit เมื่อปิด window — process ยังรัน scheduler ต่อได้
// AC-011-04: ถ้า window ปิด scheduler fires แต่ getAllWindows() = [] → no-op
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  // บน macOS: ไม่ quit — ปล่อย process รัน เพื่อให้ scheduler ทำงานได้ต่อ
  // เมื่อ window ถูกปิด mainWindow เป็น null และ getAllWindows() คืน []
  // focusWindow() จะ no-op ตาม AC-011-04
  mainWindow = null
})
