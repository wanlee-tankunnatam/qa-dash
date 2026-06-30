"use strict"
const Module = require('module')
// The patched Module._load calls t(e, ...r) where t is original
// Let's try to get t by creating a proxy
const patchedLoad = Module._load
// Temporarily patch to capture what 't' is
let capturedT = null
let capturedResult = null
Module._load = function(request, parent, isMain) {
  if (request === '__CAPTURE_TEST__') {
    // This should call t('__CAPTURE_TEST__', ...) which fails
    // But let's see what happens
    return 'captured'
  }
  return patchedLoad.call(this, request, parent, isMain)
}
Module._load = patchedLoad  // restore

// Actually, try calling the original patched function and see what 't' does
// for 'electron'
// We can't access t directly. But we can see what Module._load returns
// for 'electron' vs what the resolved path is

// Compare require.resolve vs what require() returns
const resolved = require.resolve('electron')
console.log('require.resolve("electron"):', resolved.slice(0, 80))

const actual = require('electron')
console.log('require("electron") type:', typeof actual)
console.log('require("electron") value:', String(actual).slice(0, 80))

// They should be the same module, meaning require is loading the npm package
// Let's see what require.cache says
const cached = require.cache[resolved]
console.log('cached.exports type:', typeof cached?.exports)
process.exit(0)
