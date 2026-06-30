"use strict"
console.log('Node version:', process.version)
console.log('Electron version:', process.versions.electron)
try {
  const e = require('electron')
  console.log('electron type:', typeof e)
  console.log('has app:', typeof e.app)
  if (e.app) e.app.quit()
  else process.exit(0)
} catch(err) {
  console.log('require electron failed:', err.message)
  process.exit(0)
}
