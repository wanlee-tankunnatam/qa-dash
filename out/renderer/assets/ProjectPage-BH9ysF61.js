import { d as defineComponent, r as ref, b as openBlock, c as createElementBlock, m as withDirectives, E as vModelCheckbox, e as createBaseVNode, t as toDisplayString, n as normalizeClass, x as computed, g as createBlock, s as createCommentVNode, u as useProjectsStore, a as useTasksStore, B as useJiraStore, o as onMounted, z as unref, F as Fragment, f as createTextVNode, j as renderList, G as useRoute, D as useRouter } from "./index-Bq_91m8v.js";
import { u as useDraftStore } from "./draft-CU4AYu-k.js";
import { _ as _sfc_main$6 } from "./LoadingSpinner.vue_vue_type_script_setup_true_lang-BGG7VSfd.js";
import { _ as _sfc_main$5 } from "./ErrorMessage.vue_vue_type_script_setup_true_lang-DfzIRCNA.js";
const _hoisted_1$2 = { class: "flex items-start gap-3 py-3 border-b border-gray-100 last:border-0" };
const _hoisted_2$2 = { class: "flex-1 min-w-0" };
const _hoisted_3$2 = { class: "text-sm text-gray-700 break-words" };
const _hoisted_4$2 = { class: "text-[10px] text-gray-300 font-mono mt-0.5" };
const _hoisted_5$2 = { class: "flex-shrink-0 flex items-center gap-2" };
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "TaskItem",
  props: {
    task: {},
    projectId: {}
  },
  emits: ["ignore", "draft"],
  setup(__props, { emit: __emit }) {
    function stripMd(text) {
      const clean = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/~~(.+?)~~/g, "$1").replace(/^\s*#+\s*/, "").trim();
      let s = clean.replace(/\s*\(AC[\d,\s:]+\)\s*$/i, "").trim();
      const dashIdx = s.indexOf(" — ");
      if (dashIdx > 15) s = s.slice(0, dashIdx);
      const parenIdx = s.search(/\s\(/);
      if (parenIdx > 20) s = s.slice(0, parenIdx);
      return s;
    }
    const props = __props;
    const emit = __emit;
    const localChecked = ref(props.task.isChecked);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        withDirectives(createBaseVNode("input", {
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => localChecked.value = $event),
          type: "checkbox",
          class: "mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
        }, null, 512), [
          [vModelCheckbox, localChecked.value]
        ]),
        createBaseVNode("div", _hoisted_2$2, [
          createBaseVNode("p", _hoisted_3$2, toDisplayString(stripMd(__props.task.rawText)), 1),
          createBaseVNode("p", _hoisted_4$2, toDisplayString(__props.task.fileRelativePath) + ":" + toDisplayString(__props.task.lineNumber), 1)
        ]),
        createBaseVNode("div", _hoisted_5$2, [
          createBaseVNode("button", {
            class: "text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100",
            onClick: _cache[1] || (_cache[1] = ($event) => emit("ignore", __props.task.id))
          }, " Ignore "),
          createBaseVNode("button", {
            class: "text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 font-medium",
            onClick: _cache[2] || (_cache[2] = ($event) => emit("draft", __props.task))
          }, " Draft ticket ")
        ])
      ]);
    };
  }
});
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "StatusBadge",
  props: {
    status: {}
  },
  setup(__props) {
    const props = __props;
    const colorClass = computed(() => {
      const map = {
        TODO: "bg-gray-100 text-gray-700",
        IN_PROGRESS: "bg-blue-100 text-blue-700",
        IN_REVIEW: "bg-purple-100 text-purple-700",
        DONE: "bg-green-100 text-green-700",
        BLOCKED: "bg-orange-100 text-orange-700",
        FAILED: "bg-red-100 text-red-700"
      };
      return map[props.status] ?? "bg-gray-100 text-gray-700";
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", {
        class: normalizeClass(["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colorClass.value])
      }, toDisplayString(__props.status), 3);
    };
  }
});
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "PriorityBadge",
  props: {
    priority: {}
  },
  setup(__props) {
    const props = __props;
    const colorClass = computed(() => {
      const map = {
        Blocker: "bg-red-100 text-red-700",
        Critical: "bg-red-100 text-red-700",
        Major: "bg-orange-100 text-orange-700",
        Minor: "bg-yellow-100 text-yellow-700",
        Trivial: "bg-blue-100 text-blue-700"
      };
      return map[props.priority] ?? "bg-gray-100 text-gray-700";
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", {
        class: normalizeClass(["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colorClass.value])
      }, toDisplayString(__props.priority), 3);
    };
  }
});
const _hoisted_1$1 = { class: "flex items-start gap-3 py-3 border-b border-gray-100 last:border-0" };
const _hoisted_2$1 = { class: "flex-1 min-w-0" };
const _hoisted_3$1 = { class: "flex items-center gap-2 flex-wrap" };
const _hoisted_4$1 = {
  key: 1,
  class: "text-xs font-mono text-gray-400"
};
const _hoisted_5$1 = { class: "text-sm text-gray-700 mt-1 break-words" };
const _hoisted_6$1 = { class: "text-[10px] text-gray-300 font-mono mt-0.5" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "LinkedTaskItem",
  props: {
    task: {},
    ticket: {}
  },
  setup(__props) {
    function stripMd(text) {
      const clean = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/~~(.+?)~~/g, "$1").replace(/^\s*#+\s*/, "").trim();
      let s = clean.replace(/\s*\(AC[\d,\s:]+\)\s*$/i, "").trim();
      const dashIdx = s.indexOf(" — ");
      if (dashIdx > 15) s = s.slice(0, dashIdx);
      const parenIdx = s.search(/\s\(/);
      if (parenIdx > 20) s = s.slice(0, parenIdx);
      return s;
    }
    const props = __props;
    const localChecked = ref(props.task.isChecked);
    function openTicket() {
      if (props.ticket?.url) {
        window.qaApi.openExternal(props.ticket.url);
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        withDirectives(createBaseVNode("input", {
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => localChecked.value = $event),
          type: "checkbox",
          class: "mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
        }, null, 512), [
          [vModelCheckbox, localChecked.value]
        ]),
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("div", _hoisted_3$1, [
            __props.ticket ? (openBlock(), createElementBlock("button", {
              key: 0,
              class: "text-xs font-mono font-medium text-blue-600 hover:underline",
              onClick: openTicket
            }, toDisplayString(__props.task.jiraKey), 1)) : (openBlock(), createElementBlock("span", _hoisted_4$1, toDisplayString(__props.task.jiraKey), 1)),
            __props.ticket ? (openBlock(), createBlock(_sfc_main$3, {
              key: 2,
              status: __props.ticket.status
            }, null, 8, ["status"])) : createCommentVNode("", true),
            __props.ticket ? (openBlock(), createBlock(_sfc_main$2, {
              key: 3,
              priority: __props.ticket.priority
            }, null, 8, ["priority"])) : createCommentVNode("", true)
          ]),
          createBaseVNode("p", _hoisted_5$1, toDisplayString(__props.ticket?.summary ?? stripMd(__props.task.rawText)), 1),
          createBaseVNode("p", _hoisted_6$1, toDisplayString(__props.task.fileRelativePath) + ":" + toDisplayString(__props.task.lineNumber), 1)
        ])
      ]);
    };
  }
});
const _hoisted_1 = { class: "flex flex-col h-full overflow-auto p-6" };
const _hoisted_2 = { class: "flex items-center gap-4 mb-6" };
const _hoisted_3 = { class: "text-xl font-bold text-gray-800" };
const _hoisted_4 = ["disabled"];
const _hoisted_5 = { class: "mb-6" };
const _hoisted_6 = { class: "text-base font-semibold text-gray-700 mb-3" };
const _hoisted_7 = { class: "ml-2 text-sm font-normal text-gray-400" };
const _hoisted_8 = {
  key: 0,
  class: "text-sm text-gray-400"
};
const _hoisted_9 = {
  key: 1,
  class: "bg-white rounded-xl border border-gray-200 px-4 divide-y divide-gray-100"
};
const _hoisted_10 = { class: "text-base font-semibold text-gray-700 mb-3" };
const _hoisted_11 = { class: "ml-2 text-sm font-normal text-gray-400" };
const _hoisted_12 = {
  key: 0,
  class: "text-sm text-gray-400"
};
const _hoisted_13 = {
  key: 1,
  class: "bg-white rounded-xl border border-gray-200 px-4 divide-y divide-gray-100"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProjectPage",
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const projectsStore = useProjectsStore();
    const tasksStore = useTasksStore();
    const jiraStore = useJiraStore();
    const draftStore = useDraftStore();
    const projectId = route.params.id;
    const project = computed(() => projectsStore.getById(projectId));
    const visibleUntracked = computed(
      () => tasksStore.getUntracked(projectId).filter((t) => !t.isIgnoredToday)
    );
    const linkedTasks = computed(() => tasksStore.getLinked(projectId));
    async function rescan() {
      await tasksStore.scanProject(projectId);
      const keys = linkedTasks.value.map((t) => t.jiraKey);
      if (keys.length > 0) {
        jiraStore.fetchTickets(keys, projectId);
      }
    }
    async function handleIgnore(taskId) {
      await tasksStore.ignoreTask(taskId, projectId);
    }
    async function handleDraft(task) {
      await draftStore.draftTicket(task, projectId, []);
      router.push("/draft");
    }
    onMounted(async () => {
      if (projectsStore.projects.length === 0) {
        await projectsStore.fetchProjects();
      }
      await tasksStore.scanProject(projectId);
      const keys = linkedTasks.value.map((t) => t.jiraKey);
      if (keys.length > 0) {
        jiraStore.fetchTickets(keys, projectId);
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("button", {
            class: "text-sm text-gray-500 hover:text-gray-700",
            onClick: _cache[0] || (_cache[0] = ($event) => unref(router).back())
          }, " ← Back "),
          createBaseVNode("h1", _hoisted_3, toDisplayString(project.value?.name ?? "Project"), 1),
          createBaseVNode("button", {
            class: "ml-auto text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50",
            disabled: unref(tasksStore).scanning[unref(projectId)],
            onClick: rescan
          }, toDisplayString(unref(tasksStore).scanning[unref(projectId)] ? "Scanning..." : "Re-scan"), 9, _hoisted_4)
        ]),
        unref(tasksStore).scanning[unref(projectId)] ? (openBlock(), createBlock(_sfc_main$6, {
          key: 0,
          size: "lg",
          class: "mx-auto mt-12"
        })) : unref(tasksStore).error ? (openBlock(), createBlock(_sfc_main$5, {
          key: 1,
          message: unref(tasksStore).error,
          retryable: true,
          onRetry: rescan
        }, null, 8, ["message"])) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          createBaseVNode("section", _hoisted_5, [
            createBaseVNode("h2", _hoisted_6, [
              _cache[1] || (_cache[1] = createTextVNode(" Untracked Tasks ", -1)),
              createBaseVNode("span", _hoisted_7, " (" + toDisplayString(visibleUntracked.value.length) + ") ", 1)
            ]),
            visibleUntracked.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_8, " No untracked tasks. ")) : (openBlock(), createElementBlock("div", _hoisted_9, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(visibleUntracked.value, (task) => {
                return openBlock(), createBlock(_sfc_main$4, {
                  key: task.id,
                  task,
                  "project-id": unref(projectId),
                  onIgnore: handleIgnore,
                  onDraft: handleDraft
                }, null, 8, ["task", "project-id"]);
              }), 128))
            ]))
          ]),
          createBaseVNode("section", null, [
            createBaseVNode("h2", _hoisted_10, [
              _cache[2] || (_cache[2] = createTextVNode(" Linked Tasks ", -1)),
              createBaseVNode("span", _hoisted_11, " (" + toDisplayString(linkedTasks.value.length) + ") ", 1)
            ]),
            linkedTasks.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_12, " No linked tasks. ")) : (openBlock(), createElementBlock("div", _hoisted_13, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(linkedTasks.value, (task) => {
                return openBlock(), createBlock(_sfc_main$1, {
                  key: task.id,
                  task,
                  ticket: unref(jiraStore).getTicket(task.jiraKey) ?? null
                }, null, 8, ["task", "ticket"]);
              }), 128))
            ]))
          ])
        ], 64))
      ]);
    };
  }
});
export {
  _sfc_main as default
};
