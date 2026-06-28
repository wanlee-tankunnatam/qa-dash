// Logger utility — wraps console for now; can be extended with electron-log
const prefix = '[QADash]'

export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    console.log(`${prefix} [INFO] ${message}`, ...args)
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`${prefix} [WARN] ${message}`, ...args)
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`${prefix} [ERROR] ${message}`, ...args)
  },
}
