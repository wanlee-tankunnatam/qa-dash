try {
  const fs = require('fs')
  fs.writeFileSync('/tmp/asar-v3.txt', 'step1\n')
} catch(e) {
  // Can't write to file - try console
  console.error('STEP1 ERROR:', e.message)
}
process.exit(42)
