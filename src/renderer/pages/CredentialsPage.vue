<template>
  <div class="flex flex-col h-full bg-slate-50">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
      <div>
        <h1 class="text-base font-semibold text-slate-800">Credentials</h1>
        <p class="text-xs text-slate-400 mt-0.5">เก็บ username/password ของ service ต่างๆ ไว้ใน macOS Keychain</p>
      </div>
      <button
        class="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        @click="openForm()"
      >+ เพิ่ม</button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-6">
      <!-- Search -->
      <div v-if="credList.length || query" class="mb-4">
        <input
          v-model="query"
          type="text"
          placeholder="ค้นหา service หรือ username…"
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Empty state -->
      <div v-if="!credList.length && !form" class="flex flex-col items-center justify-center mt-20 gap-2 text-center">
        <svg class="w-10 h-10 text-slate-200" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clip-rule="evenodd"/>
        </svg>
        <p class="text-sm font-medium text-slate-500">ยังไม่มี credential</p>
        <p class="text-xs text-slate-400">กด + เพิ่ม เพื่อเพิ่ม service แรก</p>
      </div>

      <!-- No results -->
      <div v-else-if="query && !filtered.length" class="text-center mt-16 text-sm text-slate-400">
        ไม่พบ "{{ query }}"
      </div>

      <!-- Cards -->
      <div v-if="filtered.length" class="grid grid-cols-2 gap-3">
        <div
          v-for="c in filtered" :key="c.id"
          class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 group hover:shadow-sm transition-shadow"
        >
          <!-- Card header -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 text-xs font-bold">
                {{ c.service.slice(0, 2).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-700 truncate">{{ c.service }}</p>
                <a v-if="c.url" class="text-xs text-indigo-400 hover:text-indigo-600 hover:underline truncate cursor-pointer block" @click="window.qaApi.openExternal(c.url!)">{{ c.url }}</a>
              </div>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button class="text-xs text-slate-400 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 transition-colors" @click="openForm(c)">แก้ไข</button>
              <button class="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors" @click="deleteCred(c.id)">ลบ</button>
            </div>
          </div>

          <!-- Fields -->
          <div class="flex flex-col gap-1 border-t border-slate-50 pt-2">
            <div v-if="c.email" class="grid items-center gap-x-1" style="grid-template-columns: 2.5rem auto 1fr">
              <span class="text-xs text-slate-400">email:</span>
              <button class="w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors" :class="copied[c.id] === 'email' ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'" @click="copyText(c.id, 'email', c.email)">
                <span v-if="copied[c.id] === 'email'" class="text-[10px]">✓</span>
                <svg v-else class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z"/><path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z"/></svg>
              </button>
              <span class="text-xs text-slate-600 font-mono truncate">{{ c.email }}</span>
            </div>
            <div class="grid items-center gap-x-1" style="grid-template-columns: 2.5rem auto 1fr">
              <span class="text-xs text-slate-400">user:</span>
              <button class="w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors" :class="copied[c.id] === 'user' ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'" @click="copyText(c.id, 'user', c.username)">
                <span v-if="copied[c.id] === 'user'" class="text-[10px]">✓</span>
                <svg v-else class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z"/><path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z"/></svg>
              </button>
              <span class="text-xs text-slate-600 font-mono truncate">{{ c.username }}</span>
            </div>
            <div class="grid items-center gap-x-1" style="grid-template-columns: 2.5rem auto 1fr">
              <span class="text-xs text-slate-400">pass:</span>
              <button v-if="c.hasPassword" class="w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors" :class="copied[c.id] === 'pass' ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'" @click="copyPass(c)">
                <span v-if="copied[c.id] === 'pass'" class="text-[10px]">✓</span>
                <svg v-else class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z"/><path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z"/></svg>
              </button>
              <div v-else class="w-5 h-5"></div>
              <span v-if="c.hasPassword" class="text-xs text-slate-300 font-mono tracking-widest">••••••</span>
              <span v-else class="text-xs text-slate-200">—</span>
            </div>
            <div v-if="c.hasToken" class="grid items-center gap-x-1" style="grid-template-columns: 2.5rem auto 1fr">
              <span class="text-xs text-slate-400">token:</span>
              <button class="w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors" :class="copied[c.id] === 'token' ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'" @click="copyToken(c)">
                <span v-if="copied[c.id] === 'token'" class="text-[10px]">✓</span>
                <svg v-else class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z"/><path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z"/></svg>
              </button>
              <span class="text-xs text-slate-300 font-mono tracking-widest">••••••</span>
            </div>
            <div v-if="c.clientId" class="grid items-center gap-x-1" style="grid-template-columns: 2.5rem auto 1fr">
              <span class="text-xs text-slate-400">id:</span>
              <button class="w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors" :class="copied[c.id] === 'clientId' ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'" @click="copyText(c.id, 'clientId', c.clientId)">
                <span v-if="copied[c.id] === 'clientId'" class="text-[10px]">✓</span>
                <svg v-else class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z"/><path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z"/></svg>
              </button>
              <span class="text-xs text-slate-600 font-mono truncate">{{ c.clientId }}</span>
            </div>
            <div v-if="c.hasSecret" class="grid items-center gap-x-1" style="grid-template-columns: 2.5rem auto 1fr">
              <span class="text-xs text-slate-400">secret:</span>
              <button class="w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors" :class="copied[c.id] === 'secret' ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'" @click="copySecret(c)">
                <span v-if="copied[c.id] === 'secret'" class="text-[10px]">✓</span>
                <svg v-else class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z"/><path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z"/></svg>
              </button>
              <span class="text-xs text-slate-300 font-mono tracking-widest">••••••</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer terminal input -->
    <div v-if="form" class="border-t border-slate-200 bg-white px-5 py-3 flex-shrink-0">
      <div class="border border-slate-200 rounded-lg overflow-hidden">
        <!-- Row 1: service + url -->
        <div class="flex items-center border-b border-slate-200">
          <div class="flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 flex-1">
            <span class="text-xs text-slate-400 font-mono flex-shrink-0">service:</span>
            <input ref="serviceInput" v-model="form.service" type="text" placeholder="GitLab…"
              class="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
              @keydown.enter="focusNext('url')" @keydown.esc="form = null" />
          </div>
          <div class="flex items-center gap-1.5 px-3 py-2 flex-1">
            <span class="text-xs text-slate-400 font-mono flex-shrink-0">url:</span>
            <input ref="urlInput" v-model="form.url" type="text" placeholder="https://…"
              class="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
              @keydown.enter="focusNext('username')" @keydown.esc="form = null" />
          </div>
        </div>
        <!-- Row 2: username + email -->
        <div class="flex items-center border-b border-slate-200">
          <div class="flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 flex-1">
            <span class="text-xs text-slate-400 font-mono flex-shrink-0">user:</span>
            <input ref="usernameInput" v-model="form.username" type="text" placeholder="username"
              class="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
              @keydown.enter="focusNext('email')" @keydown.esc="form = null" />
          </div>
          <div class="flex items-center gap-1.5 px-3 py-2 flex-1">
            <span class="text-xs text-slate-400 font-mono flex-shrink-0">email:</span>
            <input ref="emailInput" v-model="form.email" type="email" placeholder="you@example.com"
              class="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
              @keydown.enter="focusNext('password')" @keydown.esc="form = null" />
          </div>
        </div>
        <!-- Row 3: password + token -->
        <div class="flex items-center border-b border-slate-200">
          <div class="flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 flex-1">
            <span class="text-xs text-slate-400 font-mono flex-shrink-0">pass:</span>
            <input ref="passwordInput" v-model="form.password" type="password"
              :placeholder="form.isNew ? '••••••••' : 'เว้นว่างถ้าไม่เปลี่ยน'"
              class="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
              @keydown.enter="focusNext('token')" @keydown.esc="form = null" />
          </div>
          <div class="flex items-center gap-1.5 px-3 py-2 flex-1">
            <span class="text-xs text-slate-400 font-mono flex-shrink-0">token:</span>
            <input ref="tokenInput" v-model="form.token" type="password"
              :placeholder="form.isNew ? 'API token…' : 'เว้นว่างถ้าไม่เปลี่ยน'"
              class="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
              @keydown.enter="focusNext('clientId')" @keydown.esc="form = null" />
          </div>
        </div>
        <!-- Row 4: client id + secret -->
        <div class="flex items-center">
          <div class="flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 flex-1">
            <span class="text-xs text-slate-400 font-mono flex-shrink-0">id:</span>
            <input ref="clientIdInput" v-model="form.clientId" type="text" placeholder="client_id…"
              class="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
              @keydown.enter="focusNext('secret')" @keydown.esc="form = null" />
          </div>
          <div class="flex items-center gap-1.5 px-3 py-2 flex-1">
            <span class="text-xs text-slate-400 font-mono flex-shrink-0">secret:</span>
            <input ref="secretInput" v-model="form.secret" type="password"
              :placeholder="form.isNew ? 'client_secret…' : 'เว้นว่างถ้าไม่เปลี่ยน'"
              class="flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300"
              @keydown.enter="save" @keydown.esc="form = null" />
          </div>
        </div>
      </div>
      <div class="flex gap-2 mt-2">
        <button
          class="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          :class="form.service && form.username ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'"
          :disabled="!form.service || !form.username"
          @click="save"
        >บันทึก</button>
        <button
          class="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          @click="form = null"
        >ยกเลิก</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'

interface ServiceCredential {
  id: string
  service: string
  url?: string
  username: string
  email?: string
  clientId?: string
  hasPassword?: boolean
  hasToken?: boolean
  hasSecret?: boolean
}
interface FormState extends ServiceCredential {
  password: string
  token: string
  secret: string
  isNew: boolean
}

type CopiedField = 'user' | 'email' | 'pass' | 'token' | 'clientId' | 'secret'

const credList = ref<ServiceCredential[]>([])
const form = ref<FormState | null>(null)
const query = ref('')
const copied = ref<Record<string, CopiedField>>({})

async function copyText(id: string, field: CopiedField, text?: string) {
  await navigator.clipboard.writeText(text ?? '')
  copied.value = { ...copied.value, [id]: field }
  setTimeout(() => { const r = { ...copied.value }; delete r[id]; copied.value = r }, 1500)
}

async function copyPass(c: ServiceCredential) {
  const pass = await window.qaApi.getCredentialPassword(c.id)
  if (!pass) return
  await copyText(c.id, 'pass', pass)
}

async function copyToken(c: ServiceCredential) {
  const token = await window.qaApi.getCredentialToken(c.id)
  if (!token) return
  await copyText(c.id, 'token', token)
}

async function copySecret(c: ServiceCredential) {
  const secret = await window.qaApi.getCredentialSecret(c.id)
  if (!secret) return
  await copyText(c.id, 'secret', secret)
}

const serviceInput = ref<HTMLInputElement | null>(null)
const urlInput = ref<HTMLInputElement | null>(null)
const usernameInput = ref<HTMLInputElement | null>(null)
const emailInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)
const tokenInput = ref<HTMLInputElement | null>(null)
const clientIdInput = ref<HTMLInputElement | null>(null)
const secretInput = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  const list = [...credList.value].reverse()
  if (!query.value.trim()) return list
  const q = query.value.toLowerCase()
  return list.filter(c =>
    c.service.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)
  )
})

async function load() {
  credList.value = await window.qaApi.listCredentials()
}

function focusNext(field: 'url' | 'username' | 'email' | 'password' | 'token' | 'clientId' | 'secret') {
  nextTick(() => {
    if (field === 'url') urlInput.value?.focus()
    else if (field === 'username') usernameInput.value?.focus()
    else if (field === 'email') emailInput.value?.focus()
    else if (field === 'password') passwordInput.value?.focus()
    else if (field === 'token') tokenInput.value?.focus()
    else if (field === 'clientId') clientIdInput.value?.focus()
    else secretInput.value?.focus()
  })
}

async function openForm(existing?: ServiceCredential) {
  if (existing) {
    form.value = { ...existing, password: '', token: '', secret: '', isNew: false }
  } else {
    form.value = { id: crypto.randomUUID(), service: '', username: '', password: '', token: '', secret: '', isNew: true }
  }
  await nextTick()
  serviceInput.value?.focus()
}

async function save() {
  if (!form.value) return
  const { password, token, secret, isNew: _, ...entry } = form.value
  entry.hasPassword = form.value.isNew ? !!password : (entry.hasPassword || !!password)
  entry.hasToken = form.value.isNew ? !!token : (entry.hasToken || !!token)
  entry.hasSecret = form.value.isNew ? !!secret : (entry.hasSecret || !!secret)
  await window.qaApi.upsertCredential(entry, password, token, secret)
  await load()
  form.value = null
}

async function deleteCred(id: string) {
  await window.qaApi.deleteCredential2(id)
  await load()
}

onMounted(load)
</script>
