import * as electron from 'electron/main'
console.log('electron/main type:', typeof electron)
console.log('has app:', typeof electron.app)
electron.app.quit()
