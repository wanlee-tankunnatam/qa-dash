<template>
  <div class="px-3 py-2 border-b border-slate-700">
    <div class="flex items-center justify-between gap-2">
      <button
        @click="isOpen = !isOpen"
        class="flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors"
      >
        <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H4a1 1 0 1 1 0-2h3V2a1 1 0 0 1 1-1Z"/>
        </svg>
        <span class="truncate">{{ currentWorkspace?.name || 'No Workspace' }}</span>
        <svg class="w-4 h-4 ml-auto flex-shrink-0" :style="{ transform: isOpen ? 'rotate(180deg)' : '' }" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 11l-4-4h8l-4 4Z"/>
        </svg>
      </button>
      <button
        @click="showCreateDialog = true"
        title="New workspace"
        class="px-2 py-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
      >
        <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H2a1 1 0 1 1 0-2h5V2a1 1 0 0 1 1-1Z"/>
        </svg>
      </button>
    </div>

    <!-- Dropdown menu -->
    <Teleport to="body">
      <Transition
        name="fade"
        @after-leave="isOpen = false"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 z-40"
          @click="isOpen = false"
        />
      </Transition>
    </Teleport>

    <div
      v-if="isOpen"
      class="absolute left-3 right-3 mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50 overflow-y-auto"
      style="max-height: 300px"
    >
      <div
        class="divide-y divide-slate-700"
        @dragover.prevent="dragOverId = $event.dataTransfer?.effectAllowed"
        @drop.prevent="handleDrop"
        @dragleave.prevent="dragOverId = null"
      >
        <div
          v-for="(ws, index) in localWorkspaces"
          :key="ws.id"
          draggable="true"
          class="flex items-center justify-between px-3 py-2 hover:bg-slate-700 transition-colors group cursor-move"
          :class="{ 'bg-slate-700': dragOverId === ws.id }"
          @dragstart="handleDragStart($event, index)"
          @dragend="handleDragEnd"
          @dragover.prevent="dragOverId = ws.id"
          @dragleave.prevent="dragOverId = null"
        >
          <button
            @click="selectWorkspace(ws.id)"
            class="flex-1 text-left text-sm text-slate-200 hover:text-white"
            :class="{ 'text-white font-medium': currentWorkspaceId === ws.id }"
          >
            {{ ws.name }}
            <span class="text-xs text-slate-400 ml-1">({{ ws.projectIds.length }})</span>
          </button>
          <button
            @click="editWorkspace(ws)"
            title="Edit"
            class="p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.046 1.454a1.5 1.5 0 0 1 2.121 2.121L3.121 13.662a1.5 1.5 0 0 1-.637.343l-2.672.446a1 1 0 0 1-1.18-1.18l.446-2.672a1.5 1.5 0 0 1 .343-.637l10.525-10.525ZM2.34 12.593l.894-5.356 7.072-7.072 5.356.894-7.072 7.072-.894 5.356Z"/>
            </svg>
          </button>
          <button
            @click="deleteWorkspaceConfirm(ws)"
            title="Delete"
            class="p-1 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 1a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5ZM3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1H12v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4.5H3.5a.5.5 0 0 1-.5-.5ZM6 4v9a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V4H6Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit dialog -->
    <dialog
      v-if="showCreateDialog || showEditDialog"
      class="w-96 p-0 rounded-lg shadow-xl backdrop:bg-black/50"
      open
    >
      <form @submit.prevent="handleSave" class="p-6 space-y-4">
        <h2 class="text-lg font-semibold text-slate-900">
          {{ editingWorkspace ? 'Edit Workspace' : 'New Workspace' }}
        </h2>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">Name</label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="e.g., Frontend Team, QA Sprint 1"
            class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            autofocus
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">Description (optional)</label>
          <textarea
            v-model="formData.description"
            placeholder="e.g., Projects for Q4 testing"
            class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
          />
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSaving || !formData.name.trim()"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </dialog>

    <!-- Delete confirmation dialog -->
    <dialog
      v-if="showDeleteConfirm"
      class="w-96 p-0 rounded-lg shadow-xl backdrop:bg-black/50"
      open
    >
      <div class="p-6 space-y-4">
        <h2 class="text-lg font-semibold text-slate-900">Delete Workspace</h2>
        <p class="text-sm text-slate-600">
          Are you sure you want to delete "{{ workspaceToDelete?.name }}"? Projects in this workspace will not be deleted.
        </p>
        <div class="flex gap-2 justify-end pt-2">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            :disabled="isDeleting"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWorkspacesStore } from '@renderer/stores/workspaces'
import type { Workspace } from '@shared/types/workspace'

const workspacesStore = useWorkspacesStore()

const isOpen = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteConfirm = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

const localWorkspaces = ref<Workspace[]>([])
const editingWorkspace = ref<Workspace | null>(null)
const workspaceToDelete = ref<Workspace | null>(null)
const dragOverId = ref<string | null>(null)
let draggedIndex: number | null = null

const formData = ref({
  name: '',
  description: '',
})

const currentWorkspace = computed(() => workspacesStore.current)
const currentWorkspaceId = computed(() => workspacesStore.currentWorkspaceId)

watch(
  () => workspacesStore.sorted,
  (newVal) => {
    localWorkspaces.value = JSON.parse(JSON.stringify(newVal))
  },
  { immediate: true }
)

async function selectWorkspace(id: string) {
  try {
    await workspacesStore.setCurrentWorkspace(id)
    isOpen.value = false
  } catch (e) {
    console.error('Failed to select workspace:', e)
  }
}

function editWorkspace(ws: Workspace) {
  editingWorkspace.value = ws
  formData.value = {
    name: ws.name,
    description: ws.description || '',
  }
  showEditDialog.value = true
}

function deleteWorkspaceConfirm(ws: Workspace) {
  workspaceToDelete.value = ws
  showDeleteConfirm.value = true
}

async function handleSave() {
  if (!formData.value.name.trim()) return

  isSaving.value = true
  try {
    if (editingWorkspace.value) {
      await workspacesStore.updateWorkspace(
        editingWorkspace.value.id,
        formData.value.name,
        formData.value.description || undefined
      )
      showEditDialog.value = false
    } else {
      await workspacesStore.createWorkspace(
        formData.value.name,
        formData.value.description || undefined
      )
      showCreateDialog.value = false
    }
    formData.value = { name: '', description: '' }
    editingWorkspace.value = null
  } catch (e) {
    console.error('Failed to save workspace:', e)
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  showCreateDialog.value = false
  showEditDialog.value = false
  editingWorkspace.value = null
  formData.value = { name: '', description: '' }
}

async function handleDelete() {
  if (!workspaceToDelete.value) return

  isDeleting.value = true
  try {
    await workspacesStore.deleteWorkspace(workspaceToDelete.value.id)
    showDeleteConfirm.value = false
    workspaceToDelete.value = null
  } catch (e) {
    console.error('Failed to delete workspace:', e)
  } finally {
    isDeleting.value = false
  }
}

async function onReorder() {
  const orderedIds = localWorkspaces.value.map((w) => w.id)
  try {
    await workspacesStore.reorderWorkspaces(orderedIds)
  } catch (e) {
    console.error('Failed to reorder workspaces:', e)
    // Revert on error
    localWorkspaces.value = JSON.parse(JSON.stringify(workspacesStore.sorted))
  }
}

function handleDragStart(e: DragEvent, index: number) {
  draggedIndex = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function handleDragEnd() {
  dragOverId.value = null
}

async function handleDrop() {
  if (draggedIndex === null || dragOverId.value === null) return

  const draggedWs = localWorkspaces.value[draggedIndex]
  const targetWs = localWorkspaces.value.find((w) => w.id === dragOverId.value)
  if (!draggedWs || !targetWs) return

  const targetIndex = localWorkspaces.value.indexOf(targetWs)

  // Reorder locally
  localWorkspaces.value.splice(draggedIndex, 1)
  localWorkspaces.value.splice(targetIndex, 0, draggedWs)

  // Persist
  const orderedIds = localWorkspaces.value.map((w) => w.id)
  try {
    await workspacesStore.reorderWorkspaces(orderedIds)
  } catch (e) {
    console.error('Failed to reorder workspaces:', e)
    // Revert on error
    localWorkspaces.value = JSON.parse(JSON.stringify(workspacesStore.sorted))
  }

  draggedIndex = null
}

// Initialize workspaces on mount
onMounted(async () => {
  if (!workspacesStore.workspaces.length) {
    try {
      await workspacesStore.fetchWorkspaces()
      await workspacesStore.fetchCurrentWorkspacePreference()
    } catch (e) {
      console.error('Failed to load workspaces:', e)
    }
  }
})

import { onMounted } from 'vue'
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
