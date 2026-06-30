import { BrowserWindow } from 'electron'
import { join } from 'path'

const isDev = process.env['NODE_ENV'] === 'development'

export function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']!)
    // DevTools เปิดผ่านปุ่มใน UI แทน
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}
