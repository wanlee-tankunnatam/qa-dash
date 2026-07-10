<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Toolbar -->
    <div class="flex items-center justify-end px-4 py-1.5 border-b border-slate-100">
      <button
        class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-all"
        :class="isStreaming
          ? 'border-slate-100 text-slate-300 cursor-not-allowed'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
        :disabled="isStreaming"
        @click="startMyDay"
      >
        <svg class="w-3 h-3" :class="isStreaming ? 'animate-spin' : ''" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1Z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466Z"/>
        </svg>
        {{ isStreaming ? 'กำลังคิด…' : 'Start My Day' }}
      </button>
    </div>

    <!-- Chat messages -->
    <div ref="chatRef" class="flex-1 overflow-auto px-6 py-4 space-y-4">
      <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
        <p class="text-sm text-slate-400 italic">กด "Start My Day" หรือพิมคำถามด้านล่าง</p>
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <!-- Claude -->
        <div v-if="msg.role === 'assistant'" class="flex items-start gap-2 max-w-[80%]">
          <div class="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Zm1 0v8h10V3H3Zm1 2h1v1H4V5Zm3 0h5v1H7V5ZM4 8h1v1H4V8Zm3 0h3v1H7V8Z"/>
            </svg>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 min-w-[60px]">
            <!-- Typing indicator — แสดงตอนรอคำตอบ (content ยังว่าง) -->
            <div v-if="isStreaming && i === messages.length - 1 && !msg.content" class="flex items-center gap-1 py-0.5">
              <span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 0ms" />
              <span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 150ms" />
              <span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 300ms" />
            </div>
            <!-- Text streaming — แสดงตอน content เริ่มออกมา -->
            <pre v-else class="text-sm text-slate-700 whitespace-pre-wrap break-words font-sans leading-relaxed">{{ msg.content }}<span v-if="isStreaming && i === messages.length - 1" class="inline-block w-1.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" /></pre>
          </div>
        </div>

        <!-- User -->
        <div v-else class="max-w-[80%]">
          <div class="bg-slate-800 text-white rounded-2xl rounded-tr-sm px-4 py-3">
            <p class="text-sm whitespace-pre-wrap break-words leading-relaxed">{{ msg.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="streamError" class="mx-6 mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ streamError }}
    </div>

    <!-- Input -->
    <div class="px-6 pb-5 pt-2 border-t border-slate-100">
      <!-- Image preview -->
      <div v-if="attachedImage" class="mb-2 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        <img v-if="isImageFile(attachedImageName)" :src="`file://${attachedImage}`" class="h-10 w-10 object-cover rounded flex-shrink-0" />
        <svg v-else class="w-8 h-8 text-slate-400 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0H4Zm0 1h5v3.5A1.5 1.5 0 0 0 10.5 6H14v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z"/></svg>
        <span class="text-xs text-slate-500 flex-1 truncate">{{ attachedImageName }}</span>
        <button class="text-slate-300 hover:text-slate-500 text-sm" @click="attachedImage = ''; attachedImageName = ''">✕</button>
      </div>
      <div class="flex gap-2 items-end">
        <!-- Attach button -->
        <button
          class="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all flex-shrink-0"
          title="แนบรูป"
          @click="pickImage"
        >
          <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
            <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2ZM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1ZM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.25.25 0 0 1 .63-.062l2.66 2.773 1.71-1.71a.25.25 0 0 1 .338-.012l2.964 2.776V5a1 1 0 0 0-1-1h-9Z"/>
          </svg>
        </button>
        <textarea
          ref="inputRef"
          v-model="userPrompt"
          placeholder="พิมคำถาม…"
          rows="1"
          class="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none leading-relaxed"
          @keydown.enter.exact.prevent="sendPrompt"
          @input="autoResize"
        />
        <button
          class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 bg-slate-800 hover:bg-slate-700 text-white"
          @click="sendPrompt"
        >Send</button>
      </div>
      <p class="text-[10px] text-slate-300 mt-1.5 pl-1">Enter ส่ง · Shift+Enter ขึ้นบรรทัดใหม่</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useProjectsStore } from '@renderer/stores/projects'
import { useTasksStore } from '@renderer/stores/tasks'
import { useJiraStore } from '@renderer/stores/jira'
import { useDangerZoneStore } from '@renderer/stores/dangerZone'

interface Message { role: 'user' | 'assistant'; content: string }

const props = defineProps<{
  pageLabel: string
  pagePath: string
}>()

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const jiraStore = useJiraStore()
const dangerZoneStore = useDangerZoneStore()

const messages = ref<Message[]>([])
const isStreaming = ref(false)
const streamError = ref<string | null>(null)
const userPrompt = ref('')
const chatRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const attachedImage = ref('')
const attachedImageName = ref('')

const cleanups: Array<() => void> = []

function scrollToBottom() {
  nextTick(() => {
    if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
  })
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function pushAssistant() {
  messages.value.push({ role: 'assistant', content: '' })
}

async function startMyDay() {
  if (isStreaming.value) return
  streamError.value = null
  isStreaming.value = true
  pushAssistant()
  scrollToBottom()

  const context = {
    projects: projectsStore.projects,
    allScanResults: projectsStore.projects.map((p) => ({
      projectId: p.id,
      untracked: tasksStore.getUntracked(p.id),
      linked: tasksStore.getLinked(p.id),
    })),
    jiraTickets: Object.values(jiraStore.tickets),
    date: new Date().toISOString().slice(0, 10),
    dangerZoneStates: dangerZoneStore.states, // Include danger zone snapshots for Top Risks analysis
  }

  try {
    await window.qaApi.startMyDay(JSON.parse(JSON.stringify(context)))
  } catch (e) {
    streamError.value = (e as Error).message
    isStreaming.value = false
  }
}

function isImageFile(name: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|bmp|tiff?)$/i.test(name)
}

function pickImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '*/*'
  input.style.display = 'none'
  document.body.appendChild(input)
  input.onchange = () => {
    const file = input.files?.[0]
    if (file) {
      attachedImage.value = (file as File & { path: string }).path
      attachedImageName.value = file.name
    }
    document.body.removeChild(input)
  }
  input.oncancel = () => document.body.removeChild(input)
  input.click()
}

function buildContextPrefix(): string {
  return `[Context: ผู้ใช้กำลังอยู่ที่หน้า "${props.pageLabel}" (path: ${props.pagePath}) ใน QADash — Personal QA Sentinel app]\n\n`
}

async function sendPrompt() {
  const prompt = userPrompt.value.trim()
  const image = attachedImage.value
  if (!prompt && !image) return
  streamError.value = null
  const displayContent = prompt + (image ? `\n📎 ${attachedImageName.value}` : '')
  messages.value.push({ role: 'user', content: displayContent })
  pushAssistant()
  userPrompt.value = ''
  attachedImage.value = ''
  attachedImageName.value = ''
  if (inputRef.value) { inputRef.value.style.height = 'auto' }
  isStreaming.value = true
  scrollToBottom()
  const fullPrompt = buildContextPrefix() + (prompt || `อ่านและอธิบายไฟล์นี้: ${image}`)
  try {
    await window.qaApi.ask(fullPrompt, image || undefined)
  } catch (e) {
    streamError.value = (e as Error).message
    isStreaming.value = false
  }
}

onMounted(() => {
  cleanups.push(window.qaApi.onStreamChunk((chunk) => {
    const last = messages.value[messages.value.length - 1]
    if (last?.role === 'assistant') last.content += chunk
    scrollToBottom()
  }))
  cleanups.push(window.qaApi.onStreamEnd(() => { isStreaming.value = false }))
  cleanups.push(window.qaApi.onStreamError((msg) => {
    streamError.value = msg
    isStreaming.value = false
  }))
})

onUnmounted(() => { cleanups.forEach((fn) => fn()); cleanups.length = 0 })
</script>
