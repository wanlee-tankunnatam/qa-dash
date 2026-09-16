import { spawn } from 'child_process'
import { homedir } from 'os'

// เรียก `claude` CLI แบบ headless (-p) เพื่อเรียบเรียงข้อความ — ใช้ auth ที่ผู้ใช้ล็อกอินไว้แล้ว
// ไม่ต้องใส่ API key (ตรงกับดีไซน์ของแอปที่ Settings ระบุว่า "เรียก claude CLI โดยตรง")
export class ClaudeCliService {
  // เติม path ที่ claude มักถูกติดตั้ง เผื่อ PATH ของ Electron ไม่ครบ
  private readonly env = {
    ...process.env,
    PATH: [
      `${homedir()}/.local/bin`,
      '/opt/homebrew/bin',
      '/usr/local/bin',
      process.env.PATH ?? '',
    ].join(':'),
  }

  /** ส่ง prompt เข้า stdin, คืน stdout เป็น text — reject ถ้า claude ไม่มี/exit ไม่ใช่ 0/timeout */
  async run(prompt: string, timeoutMs = 90_000): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('claude', ['-p'], { env: this.env })
      let out = ''
      let err = ''
      const timer = setTimeout(() => {
        child.kill('SIGKILL')
        reject(new Error('claude CLI timeout'))
      }, timeoutMs)

      child.stdout.on('data', (d) => (out += d.toString()))
      child.stderr.on('data', (d) => (err += d.toString()))
      child.on('error', (e) => {
        clearTimeout(timer)
        reject(e)
      })
      child.on('close', (code) => {
        clearTimeout(timer)
        if (code === 0) resolve(out.trim())
        else reject(new Error(err.trim() || `claude CLI exited ${code}`))
      })

      child.stdin.write(prompt)
      child.stdin.end()
    })
  }
}
