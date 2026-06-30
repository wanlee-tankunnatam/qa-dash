import * as electron from "electron/main"
console.log("type:", typeof electron)
console.log("keys:", Object.keys(electron).slice(0,5).join(","))
electron.app.quit()
