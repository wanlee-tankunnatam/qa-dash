import { z as defineStore, u as useProjectsStore, d as defineComponent, b as openBlock, c as createElementBlock, e as createBaseVNode, f as createTextVNode, t as toDisplayString, j as createCommentVNode, s as computed, a as useTasksStore, A as useJiraStore, q as ref, w as watch, o as onMounted, h as createVNode, y as unref, n as normalizeClass, g as createBlock, B as createStaticVNode, i as withCtx, F as Fragment, r as renderList, k as withDirectives, l as vModelText, x as resolveComponent, p as withModifiers } from "./index-Ruh7bkA3.js";
import { _ as _sfc_main$3 } from "./LoadingSpinner.vue_vue_type_script_setup_true_lang-BcEQEbaR.js";
import { _ as _sfc_main$2 } from "./ErrorMessage.vue_vue_type_script_setup_true_lang-B9MosXKw.js";
const useDangerZoneStore = defineStore("dangerZone", {
  state: () => ({
    states: {}
  }),
  getters: {
    isActive: (state) => (projectId) => state.states[projectId]?.isActive ?? false,
    activeProjects() {
      const projectsStore = useProjectsStore();
      return projectsStore.projects.filter((p) => this.isActive(p.id));
    }
  },
  actions: {
    updateFromScan(projectId, state) {
      this.states[projectId] = state;
    }
  }
});
const _hoisted_1$1 = {
  key: 0,
  class: "flex items-center gap-3 px-6 py-2.5 bg-red-950 border-b border-red-900"
};
const _hoisted_2$1 = { class: "text-xs font-medium text-red-300" };
const _hoisted_3$1 = { class: "font-semibold text-red-200" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "DangerZoneBanner",
  props: {
    projects: {}
  },
  setup(__props) {
    const props = __props;
    const projectNames = computed(() => props.projects.map((p) => p.name).join(", "));
    return (_ctx, _cache) => {
      return __props.projects.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
        _cache[2] || (_cache[2] = createBaseVNode("span", { class: "h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" }, null, -1)),
        createBaseVNode("p", _hoisted_2$1, [
          _cache[0] || (_cache[0] = createTextVNode(" Danger Zone · ", -1)),
          createBaseVNode("span", _hoisted_3$1, toDisplayString(projectNames.value), 1),
          _cache[1] || (_cache[1] = createBaseVNode("span", { class: "text-red-400" }, " — untracked tasks for 3+ consecutive days", -1))
        ])
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1 = { class: "flex flex-col h-full bg-slate-50" };
const _hoisted_2 = { class: "flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100" };
const _hoisted_3 = { class: "text-xs text-slate-400 mt-0.5" };
const _hoisted_4 = ["disabled"];
const _hoisted_5 = {
  key: 2,
  class: "flex flex-col items-center justify-center mt-20 gap-4"
};
const _hoisted_6 = { class: "flex items-end gap-0 px-6 bg-white border-b border-slate-100 overflow-x-auto" };
const _hoisted_7 = ["onClick"];
const _hoisted_8 = {
  key: 0,
  class: "w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
};
const _hoisted_9 = {
  key: 0,
  class: "flex items-center gap-0 px-4 pt-2 bg-white border-b border-slate-100"
};
const _hoisted_10 = ["onClick"];
const _hoisted_11 = { class: "flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-100 flex-wrap" };
const _hoisted_12 = { class: "relative flex-1 min-w-40 max-w-72" };
const _hoisted_13 = { class: "flex items-center gap-1 border-r border-slate-200 pr-2" };
const _hoisted_14 = { class: "flex items-center gap-1 flex-wrap" };
const _hoisted_15 = ["onClick"];
const _hoisted_16 = { class: "flex-1 overflow-auto" };
const _hoisted_17 = {
  key: 0,
  class: "flex items-center justify-center mt-16"
};
const _hoisted_18 = {
  key: 1,
  class: "flex flex-col items-center justify-center mt-16 gap-2"
};
const _hoisted_19 = {
  key: 2,
  class: "flex flex-col items-center justify-center mt-16 gap-2"
};
const _hoisted_20 = {
  key: 3,
  class: "p-4 space-y-6"
};
const _hoisted_21 = { class: "flex items-center gap-2 mb-2" };
const _hoisted_22 = { class: "text-sm" };
const _hoisted_23 = { class: "text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5" };
const _hoisted_24 = { class: "w-full text-xs" };
const _hoisted_25 = { class: "py-2 px-3 w-16 whitespace-nowrap" };
const _hoisted_26 = { class: "text-slate-400 font-mono" };
const _hoisted_27 = { class: "py-2 px-3" };
const _hoisted_28 = { class: "text-slate-700" };
const _hoisted_29 = { class: "py-2 px-3 w-14 text-center" };
const _hoisted_30 = {
  key: 0,
  class: "text-purple-600 font-bold text-sm"
};
const _hoisted_31 = {
  key: 1,
  class: "text-slate-200"
};
const _hoisted_32 = { class: "py-2 px-3 w-20 text-center" };
const _hoisted_33 = {
  key: 0,
  class: "text-purple-600 font-bold text-sm"
};
const _hoisted_34 = {
  key: 1,
  class: "text-slate-200"
};
const _hoisted_35 = { class: "py-2 px-3 w-12 text-center" };
const _hoisted_36 = {
  key: 0,
  class: "text-purple-600 font-bold text-sm"
};
const _hoisted_37 = {
  key: 1,
  class: "text-slate-200"
};
const _hoisted_38 = { class: "py-2 px-3 w-14 text-center" };
const _hoisted_39 = {
  key: 0,
  class: "text-teal-600 font-bold text-sm"
};
const _hoisted_40 = {
  key: 1,
  class: "text-slate-200"
};
const _hoisted_41 = { class: "py-2 px-3 w-14 text-center" };
const _hoisted_42 = {
  key: 0,
  class: "text-indigo-600 font-bold text-sm"
};
const _hoisted_43 = {
  key: 1,
  class: "text-slate-200"
};
const _hoisted_44 = { class: "py-2 px-3 w-24 text-right" };
const _hoisted_45 = {
  key: 0,
  class: "text-slate-500 font-mono"
};
const _hoisted_46 = {
  key: 1,
  class: "text-slate-200"
};
const _hoisted_47 = { class: "py-2 px-3 w-32 text-right" };
const _hoisted_48 = { class: "flex flex-col items-end gap-0.5" };
const _hoisted_49 = {
  key: 0,
  class: "text-slate-500 font-mono text-[10px]",
  title: "Jira"
};
const _hoisted_50 = {
  key: 1,
  class: "text-indigo-400 font-mono text-[10px]",
  title: "Git"
};
const _hoisted_51 = {
  key: 2,
  class: "text-slate-200"
};
const _hoisted_52 = { key: 4 };
const _hoisted_53 = { class: "w-full text-sm" };
const _hoisted_54 = ["onClick"];
const _hoisted_55 = {
  colspan: "6",
  class: "px-5 py-2"
};
const _hoisted_56 = { class: "flex items-start gap-2" };
const _hoisted_57 = { class: "text-xs font-semibold uppercase tracking-wide text-indigo-400 bg-indigo-100 px-1.5 py-0.5 rounded flex-shrink-0" };
const _hoisted_58 = { class: "flex flex-col gap-1 min-w-0 flex-1" };
const _hoisted_59 = { class: "flex items-center gap-2 flex-wrap" };
const _hoisted_60 = { class: "text-xs font-bold text-indigo-700 leading-tight" };
const _hoisted_61 = { class: "flex flex-wrap gap-1" };
const _hoisted_62 = { class: "text-indigo-300 font-mono" };
const _hoisted_63 = { class: "ml-auto text-xs text-indigo-400 flex-shrink-0 mt-0.5" };
const _hoisted_64 = ["onClick"];
const _hoisted_65 = {
  colspan: "6",
  class: "px-6 py-1.5 pl-10"
};
const _hoisted_66 = { class: "flex items-center gap-2" };
const _hoisted_67 = {
  key: 1,
  class: "w-2.5 h-2.5 flex-shrink-0"
};
const _hoisted_68 = { class: "text-xs font-medium text-slate-600" };
const _hoisted_69 = {
  key: 3,
  class: "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-purple-200"
};
const _hoisted_70 = {
  key: 4,
  class: "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold bg-teal-50 text-teal-700 ring-1 ring-teal-200"
};
const _hoisted_71 = { class: "ml-auto text-xs text-slate-400" };
const _hoisted_73 = { class: "px-6 py-2.5 pl-14 w-[400px] max-w-[400px]" };
const _hoisted_74 = { class: "flex items-center gap-2 min-w-0" };
const _hoisted_75 = ["onClick"];
const _hoisted_76 = {
  key: 0,
  class: "w-3.5 h-3.5 text-emerald-500",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_77 = {
  key: 1,
  class: "w-3.5 h-3.5 text-slate-300 hover:text-slate-400",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_78 = {
  key: 0,
  class: "px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-xs font-mono font-semibold flex-shrink-0"
};
const _hoisted_79 = { class: "flex flex-col min-w-0" };
const _hoisted_80 = { class: "text-[10px] text-slate-300 font-mono truncate" };
const _hoisted_81 = {
  key: 1,
  class: "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold bg-indigo-600 text-white flex-shrink-0"
};
const _hoisted_82 = {
  key: 2,
  class: "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold bg-rose-500 text-white flex-shrink-0"
};
const _hoisted_83 = { class: "px-4 py-2.5 text-center" };
const _hoisted_84 = {
  key: 1,
  class: "text-xs text-slate-300"
};
const _hoisted_85 = { class: "px-4 py-2.5" };
const _hoisted_86 = {
  key: 0,
  class: "text-xs text-slate-500 whitespace-nowrap"
};
const _hoisted_87 = {
  key: 1,
  class: "text-xs text-slate-300"
};
const _hoisted_88 = { class: "px-4 py-2.5" };
const _hoisted_89 = {
  key: 0,
  class: "text-xs text-slate-500 font-mono whitespace-nowrap"
};
const _hoisted_90 = {
  key: 1,
  class: "text-xs text-slate-300"
};
const _hoisted_91 = { class: "px-4 py-2.5 text-center" };
const _hoisted_92 = { class: "px-4 py-2.5 text-center" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DashboardPage",
  props: {
    initialView: { default: "qa" }
  },
  setup(__props) {
    const props = __props;
    const projectsStore = useProjectsStore();
    const tasksStore = useTasksStore();
    const jiraStore = useJiraStore();
    const dangerZoneStore = useDangerZoneStore();
    const isSyncing = ref(false);
    const activeProjectId = ref("");
    const activeUntracked = computed(() => tasksStore.getUntracked(activeProjectId.value));
    const activeLinked = computed(() => tasksStore.getLinked(activeProjectId.value));
    function extractRole(text) {
      if (/\(QA\)/i.test(text)) return "QA";
      if (/\(DEV\)/i.test(text)) return "DEV";
      return null;
    }
    const QA_CATEGORIES = [
      {
        id: "test-plan",
        label: "Test Plan",
        badge: "bg-purple-50 text-purple-700 ring-purple-200",
        patterns: /test\s*plan|test\s*strategy|test\s*suite|test\s*case|แผนทดสอบ|acceptance\s*criteria/i
      },
      {
        id: "integration-test",
        label: "Integration",
        badge: "bg-cyan-50 text-cyan-700 ring-cyan-200",
        patterns: /integration\s*test|integ(r|ress)ation|api\s*test|contract\s*test/i
      },
      {
        id: "e2e",
        label: "E2E",
        badge: "bg-teal-50 text-teal-700 ring-teal-200",
        patterns: /\be2e\b|playwright|cypress|end.to.end|e2e\s*spec/i
      },
      {
        id: "script",
        label: "Script",
        badge: "bg-yellow-50 text-yellow-700 ring-yellow-200",
        patterns: /\bscript\b|automation|automate|automated\s*test/i
      },
      {
        id: "manual",
        label: "Manual",
        badge: "bg-orange-50 text-orange-700 ring-orange-200",
        patterns: /manual\s*test|manual\s*qa|แมนนัว|ทดสอบมือ|manual\s*check|manual\s*verify/i
      }
    ];
    const devStatusMap = ref({});
    const gitDateMap = ref({});
    const epicHierarchy = ref([]);
    const tcCoverage = ref({});
    const DEV_STATUS_BADGE = {
      done: { label: "Done", cls: "bg-slate-100 text-slate-600 ring-slate-300" },
      "in-progress": { label: "In Progress", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
      review: { label: "In Review", cls: "bg-violet-50 text-violet-700 ring-violet-200" },
      "ready-for-dev": { label: "Ready", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
      backlog: { label: "Backlog", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
      descoped: { label: "Descoped", cls: "bg-gray-100 text-gray-400 ring-gray-200" },
      optional: { label: "Optional", cls: "bg-gray-100 text-gray-400 ring-gray-200" }
    };
    const JIRA_STATUS_BADGE = {
      TODO: { label: "Todo", cls: "bg-slate-100 text-slate-600 ring-slate-200" },
      IN_PROGRESS: { label: "In Progress", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
      IN_REVIEW: { label: "In Review", cls: "bg-violet-50 text-violet-700 ring-violet-200" },
      DONE: { label: "Done", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
      BLOCKED: { label: "Blocked", cls: "bg-red-50 text-red-700 ring-red-200" },
      FAILED: { label: "Failed", cls: "bg-rose-50 text-rose-700 ring-rose-200" }
    };
    function qaWorkBadge(task) {
      if (task.isChecked) return { label: "Done", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
      return { label: "Pending", cls: "bg-slate-100 text-slate-500 ring-slate-200" };
    }
    function jiraStatusBadge(task) {
      const jiraTicket = task.jiraTicket;
      if (task.isLinked && jiraTicket?.status) {
        return JIRA_STATUS_BADGE[jiraTicket.status] ?? { label: jiraTicket.status, cls: "bg-slate-100 text-slate-600 ring-slate-200" };
      }
      if (task.isLinked) return { label: "Linked", cls: "bg-indigo-50 text-indigo-600 ring-indigo-200" };
      return { label: "ยังไม่สร้าง", cls: "bg-amber-50 text-amber-700 ring-amber-200" };
    }
    function classifyTask(text) {
      for (const cat of QA_CATEGORIES) {
        if (cat.patterns.test(text)) return cat.id;
      }
      return null;
    }
    const collapsedCategories = ref(/* @__PURE__ */ new Set());
    const searchQuery = ref("");
    const activeCategories = ref(/* @__PURE__ */ new Set());
    const activeRole = ref(null);
    const VIEW_TABS = [
      { id: "qa", label: "QA View" },
      { id: "weekly", label: "Weekly" },
      { id: "today", label: "Today" }
    ];
    const viewTab = ref(props.initialView);
    const DEV_DONE_STATUSES = /* @__PURE__ */ new Set(["done", "in-review"]);
    const qaGroups = computed(() => {
      if (!epicHierarchy.value.length) return [];
      const groups = [
        { id: "needs-tc", label: "ต้องเขียน TC", color: "text-red-600", dot: "🔴", stories: [] },
        { id: "needs-e2e", label: "ต้องเขียน E2E", color: "text-amber-600", dot: "🟡", stories: [] },
        { id: "ready", label: "พร้อมทดสอบ", color: "text-emerald-600", dot: "🟢", stories: [] },
        { id: "waiting", label: "รอ Dev", color: "text-slate-400", dot: "⚪", stories: [] }
      ];
      for (const epic of epicHierarchy.value) {
        for (const story of epic.stories) {
          const cov = tcCoverage.value[story.slug];
          const isDone = DEV_DONE_STATUSES.has(story.status);
          const dueDate = story.jiraKeys.map((k) => jiraStore.getTicket(k)?.dueDate).find((d) => !!d);
          const updatedDate = story.jiraKeys.map((k) => jiraStore.getTicket(k)?.updatedDate).find((d) => !!d);
          const gitDate = story.jiraKeys.map((k) => gitDateMap.value[k]).find((d) => !!d);
          const row = {
            epicNum: epic.number,
            epicLabel: `Epic ${epic.number}`,
            storyLabel: story.label,
            hasAPI: cov?.hasAPI ?? false,
            hasIntegration: cov?.hasIntegration ?? false,
            hasUI: cov?.hasUI ?? false,
            hasE2E: cov?.hasE2E ?? false,
            hasScript: cov?.hasScript ?? false,
            dueDate,
            updatedDate,
            gitDate
          };
          const tab = viewTab.value;
          if (tab === "today" && dueDate !== todayStr) continue;
          if (tab === "yesterday" && dueDate !== yesterdayStr) continue;
          if (tab === "weekly" && (!dueDate || dueDate < todayStr || dueDate > weekEndStr)) continue;
          const hasAnyTC = (cov?.hasAPI || cov?.hasIntegration || cov?.hasUI) ?? false;
          if (!isDone) groups[3].stories.push(row);
          else if (!hasAnyTC) groups[0].stories.push(row);
          else if (!cov?.hasE2E) groups[1].stories.push(row);
          else groups[2].stories.push(row);
        }
      }
      return groups.filter((g) => g.stories.length > 0);
    });
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const yesterdayStr = (() => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })();
    const weekEndStr = (() => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + 6);
      return d.toISOString().slice(0, 10);
    })();
    function toggleCollapse(id) {
      const s = new Set(collapsedCategories.value);
      s.has(id) ? s.delete(id) : s.add(id);
      collapsedCategories.value = s;
    }
    function toggleCategory(id) {
      const s = new Set(activeCategories.value);
      s.has(id) ? s.delete(id) : s.add(id);
      activeCategories.value = s;
    }
    function toggleRole(role) {
      activeRole.value = activeRole.value === role ? null : role;
    }
    function stripMd(text) {
      let s = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/~~(.+?)~~/g, "$1").replace(/^\s*#+\s*/, "").trim();
      s = s.replace(/\s*\(AC[\d,\s:]+\)\s*$/i, "").trim();
      const dashIdx = s.indexOf(" — ");
      if (dashIdx > 15) s = s.slice(0, dashIdx);
      const parenIdx = s.search(/\s\(/);
      if (parenIdx > 20) s = s.slice(0, parenIdx);
      return s;
    }
    function fileLabel(fileRelativePath) {
      const name = fileRelativePath.split("/").pop()?.replace(/\.md$/i, "") ?? fileRelativePath;
      return name.replace(/^\d+[-_.]\d*[-_.]?/, "").replace(/[-_]/g, " ").trim() || name;
    }
    function epicBadgeLabel(epicText) {
      const m = epicText.match(/\bepic\s+(\d+)\b/i);
      return m ? `Epic ${m[1]}` : epicText.slice(0, 12);
    }
    function epicDevSlug(epicText) {
      const m = epicText.match(/\bepic\s+(\d+)\b/i);
      return m ? `epic-${m[1]}` : null;
    }
    const activeProject = computed(
      () => projectsStore.projects.find((p) => p.id === activeProjectId.value)
    );
    const groupedTasks = computed(() => {
      const allTasks = [
        ...activeUntracked.value.map((t) => ({ ...t, isLinked: false })),
        ...activeLinked.value.map((t) => ({ ...t, isLinked: true }))
      ];
      const q = searchQuery.value.toLowerCase().trim();
      const cats = activeCategories.value;
      const role = activeRole.value;
      const tab = viewTab.value;
      const currentSprint = activeProject.value?.config.currentSprint;
      const weekLater = /* @__PURE__ */ new Date();
      weekLater.setDate(weekLater.getDate() + 7);
      const weekLaterStr = weekLater.toISOString().slice(0, 10);
      const filtered = [];
      for (const t of allTasks) {
        if (q && !t.rawText.toLowerCase().includes(q)) continue;
        if (cats.size > 0) {
          const cat = classifyTask(t.rawText);
          if (!cat || !cats.has(cat)) continue;
        }
        if (role && extractRole(t.rawText) !== role) continue;
        if (tab === "yesterday") {
          if (t.dueDate !== yesterdayStr) continue;
        } else if (tab === "today") {
          const due = t.dueDate;
          const isOverdue = due && due < todayStr && !t.isChecked;
          const isDueToday = due === todayStr;
          if (!isDueToday && !isOverdue) continue;
        } else if (tab === "weekly") {
          const due = t.dueDate;
          const inSprint = currentSprint ? t.sprint === currentSprint : true;
          const dueThisWeek = due && due >= todayStr && due <= weekLaterStr;
          if (!dueThisWeek && !inSprint) continue;
        }
        filtered.push(t);
      }
      if (tab === "weekly") {
        const sprintMap = /* @__PURE__ */ new Map();
        for (const t of filtered) {
          const sprintKey = t.sprint ?? "(ไม่มี Sprint)";
          const section = t.section ?? t.epic ?? fileLabel(t.fileRelativePath);
          if (!sprintMap.has(sprintKey)) sprintMap.set(sprintKey, /* @__PURE__ */ new Map());
          const secMap = sprintMap.get(sprintKey);
          if (!secMap.has(section)) secMap.set(section, []);
          secMap.get(section).push(t);
        }
        return [...sprintMap.entries()].map(([epic, secMap]) => ({
          epic,
          sections: [...secMap.entries()].map(([section, tasks]) => ({ section, tasks })),
          total: [...secMap.values()].reduce((s, arr) => s + arr.length, 0)
        }));
      }
      if (epicHierarchy.value.length > 0) {
        const fileStoryMap = /* @__PURE__ */ new Map();
        const jiraTaskMap = /* @__PURE__ */ new Map();
        const fileEpicTasks = /* @__PURE__ */ new Map();
        for (const t of filtered) {
          const fileM = t.fileRelativePath.match(/\/(\d+)-(\d+)-[^/]+\.md$/);
          if (fileM) {
            const storyNum = `${fileM[1]}.${fileM[2]}`;
            if (!fileStoryMap.has(storyNum)) fileStoryMap.set(storyNum, []);
            fileStoryMap.get(storyNum).push(t);
          } else {
            const sectionM = (t.section ?? "").match(/Story\s+(\d+)\.(\d+)/i);
            if (sectionM) {
              const storyNum = `${sectionM[1]}.${sectionM[2]}`;
              if (!fileStoryMap.has(storyNum)) fileStoryMap.set(storyNum, []);
              fileStoryMap.get(storyNum).push(t);
              continue;
            }
            const jiraKey = t.jiraKey;
            if (jiraKey) {
              if (!jiraTaskMap.has(jiraKey)) jiraTaskMap.set(jiraKey, []);
              jiraTaskMap.get(jiraKey).push(t);
            }
            const em = t.fileRelativePath.match(/\/epic-(\d+)\//i);
            if (em) {
              const epicNum = parseInt(em[1]);
              if (!fileEpicTasks.has(epicNum)) fileEpicTasks.set(epicNum, []);
              fileEpicTasks.get(epicNum).push(t);
            }
          }
        }
        return epicHierarchy.value.map((epic) => {
          const sections = epic.stories.map((story) => {
            const numM = story.slug.match(/^(\d+)-(\d+)/);
            const storyNum = numM ? `${numM[1]}.${numM[2]}` : null;
            const tasks = [];
            if (storyNum) tasks.push(...fileStoryMap.get(storyNum) ?? []);
            for (const jk of story.jiraKeys) {
              tasks.push(...jiraTaskMap.get(jk) ?? []);
            }
            const cov = tcCoverage.value[story.slug];
            return {
              section: story.label,
              storyStatus: story.status,
              storySlug: story.slug,
              hasTC: cov?.hasTC,
              hasE2E: cov?.hasE2E,
              tasks
            };
          });
          const misc = fileEpicTasks.get(epic.number) ?? [];
          if (misc.length > 0) {
            sections.push({ section: "(misc)", tasks: misc });
          }
          return {
            epic: `Epic ${epic.number}`,
            epicStatus: epic.status,
            sections,
            total: sections.reduce((s, sec) => s + sec.tasks.length, 0)
          };
        });
      }
      const epicMap = /* @__PURE__ */ new Map();
      for (const t of filtered) {
        const epic = t.epic ?? fileLabel(t.fileRelativePath);
        const section = t.section ?? "—";
        if (!epicMap.has(epic)) epicMap.set(epic, /* @__PURE__ */ new Map());
        const secMap = epicMap.get(epic);
        if (!secMap.has(section)) secMap.set(section, []);
        secMap.get(section).push(t);
      }
      return [...epicMap.entries()].map(([epic, secMap]) => ({
        epic,
        sections: [...secMap.entries()].map(([section, tasks]) => ({ section, tasks })),
        total: [...secMap.values()].reduce((s, arr) => s + arr.length, 0)
      }));
    });
    const subtitle = computed(() => {
      const n = projectsStore.projects.length;
      if (n === 0) return "No projects";
      const total = projectsStore.projects.reduce((s, p) => s + tasksStore.untrackedCount(p.id), 0);
      return `${n} project${n > 1 ? "s" : ""} · ${total} untracked`;
    });
    async function loadSprintStatus(projectId) {
      const result = await window.qaApi.getSprintStatus(projectId);
      devStatusMap.value = result.devStatusMap;
      epicHierarchy.value = result.epicHierarchy;
      tcCoverage.value = result.tcCoverage ?? {};
      gitDateMap.value = result.gitDateMap ?? {};
      const allKeys = result.epicHierarchy.flatMap((e) => e.stories.flatMap((s) => s.jiraKeys));
      if (allKeys.length > 0) {
        jiraStore.fetchTickets(allKeys, projectId).catch(() => {
        });
      }
    }
    async function loadProjects() {
      await projectsStore.fetchProjects();
      if (!activeProjectId.value && projectsStore.projects.length > 0) {
        activeProjectId.value = projectsStore.projects[0].id;
      }
      for (const project of projectsStore.projects) {
        tasksStore.scanProject(project.id);
      }
      if (activeProjectId.value) {
        await loadSprintStatus(activeProjectId.value);
      }
    }
    async function triggerSync() {
      isSyncing.value = true;
      try {
        await window.qaApi.triggerSync();
        await loadProjects();
      } finally {
        isSyncing.value = false;
      }
    }
    watch(
      () => projectsStore.projects,
      (projects) => {
        if (!activeProjectId.value && projects.length > 0) {
          activeProjectId.value = projects[0].id;
        }
      }
    );
    watch(activeProjectId, async (id) => {
      if (!id) return;
      await loadSprintStatus(id);
    });
    onMounted(() => {
      loadProjects();
    });
    return (_ctx, _cache) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_sfc_main$1, {
          projects: unref(dangerZoneStore).activeProjects
        }, null, 8, ["projects"]),
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", null, [
            _cache[6] || (_cache[6] = createBaseVNode("h1", { class: "text-base font-semibold text-slate-800" }, "Dashboard", -1)),
            createBaseVNode("p", _hoisted_3, toDisplayString(subtitle.value), 1)
          ]),
          createBaseVNode("button", {
            class: normalizeClass([
              "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all",
              isSyncing.value ? "border-indigo-200 bg-indigo-50 text-indigo-500 cursor-not-allowed" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
            ]),
            disabled: isSyncing.value,
            onClick: triggerSync
          }, [
            (openBlock(), createElementBlock("svg", {
              class: normalizeClass(["w-3.5 h-3.5", isSyncing.value ? "animate-spin" : ""]),
              viewBox: "0 0 16 16",
              fill: "currentColor"
            }, [..._cache[7] || (_cache[7] = [
              createBaseVNode("path", { d: "M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1Z" }, null, -1),
              createBaseVNode("path", { d: "M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466Z" }, null, -1)
            ])], 2)),
            createTextVNode(" " + toDisplayString(isSyncing.value ? "Syncing…" : "Sync Now"), 1)
          ], 10, _hoisted_4)
        ]),
        unref(projectsStore).loading ? (openBlock(), createBlock(_sfc_main$3, {
          key: 0,
          size: "lg",
          class: "mx-auto mt-16"
        })) : unref(projectsStore).error ? (openBlock(), createBlock(_sfc_main$2, {
          key: 1,
          message: unref(projectsStore).error,
          retryable: true,
          onRetry: loadProjects
        }, null, 8, ["message"])) : unref(projectsStore).projects.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_5, [
          _cache[9] || (_cache[9] = createStaticVNode('<div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center"><svg class="w-7 h-7 text-slate-300" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3Zm0 10h8v8H3v-8Zm10-10h8v8h-8V3Zm0 10h8v8h-8v-8Z"></path></svg></div><div class="text-center"><p class="text-sm font-medium text-slate-700">No projects yet</p><p class="text-xs text-slate-400 mt-1">Go to Settings and add your first project</p></div>', 2)),
          createVNode(_component_RouterLink, {
            to: "/settings",
            class: "text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
          }, {
            default: withCtx(() => [..._cache[8] || (_cache[8] = [
              createTextVNode(" Open Settings → ", -1)
            ])]),
            _: 1
          })
        ])) : (openBlock(), createElementBlock(Fragment, { key: 3 }, [
          createBaseVNode("div", _hoisted_6, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(projectsStore).projects, (project) => {
              return openBlock(), createElementBlock("button", {
                key: project.id,
                class: normalizeClass([
                  "relative flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex-shrink-0",
                  activeProjectId.value === project.id ? "text-indigo-600 border-indigo-500" : "text-slate-500 border-transparent hover:text-slate-700"
                ]),
                onClick: ($event) => activeProjectId.value = project.id
              }, [
                unref(dangerZoneStore).isActive(project.id) ? (openBlock(), createElementBlock("span", _hoisted_8)) : createCommentVNode("", true),
                createTextVNode(" " + toDisplayString(project.name) + " ", 1),
                project.config.currentSprint ? (openBlock(), createElementBlock("span", {
                  key: 1,
                  class: normalizeClass([
                    "px-1.5 py-0.5 rounded text-xs font-mono",
                    activeProjectId.value === project.id ? "bg-indigo-50 text-indigo-500" : "bg-slate-50 text-slate-400"
                  ])
                }, toDisplayString(project.config.currentSprint), 3)) : createCommentVNode("", true),
                unref(tasksStore).untrackedCount(project.id) > 0 ? (openBlock(), createElementBlock("span", {
                  key: 2,
                  class: normalizeClass([
                    "px-1.5 py-0.5 rounded-full text-xs font-semibold",
                    activeProjectId.value === project.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
                  ])
                }, toDisplayString(unref(tasksStore).untrackedCount(project.id)), 3)) : createCommentVNode("", true)
              ], 10, _hoisted_7);
            }), 128))
          ]),
          !props.initialView || props.initialView === "qa" ? (openBlock(), createElementBlock("div", _hoisted_9, [
            (openBlock(), createElementBlock(Fragment, null, renderList(VIEW_TABS, (tab) => {
              return createBaseVNode("button", {
                key: tab.id,
                class: normalizeClass(["px-4 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap", viewTab.value === tab.id ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"]),
                onClick: ($event) => viewTab.value = tab.id
              }, toDisplayString(tab.label), 11, _hoisted_10);
            }), 64))
          ])) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_11, [
            createBaseVNode("div", _hoisted_12, [
              _cache[11] || (_cache[11] = createBaseVNode("svg", {
                class: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none",
                viewBox: "0 0 16 16",
                fill: "currentColor"
              }, [
                createBaseVNode("path", { d: "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.868-3.833ZM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z" })
              ], -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchQuery.value = $event),
                type: "text",
                placeholder: "ค้นหา task...",
                class: "w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              }, null, 512), [
                [vModelText, searchQuery.value]
              ]),
              searchQuery.value ? (openBlock(), createElementBlock("button", {
                key: 0,
                class: "absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600",
                onClick: _cache[1] || (_cache[1] = ($event) => searchQuery.value = "")
              }, [..._cache[10] || (_cache[10] = [
                createBaseVNode("svg", {
                  class: "w-3 h-3",
                  viewBox: "0 0 12 12",
                  fill: "currentColor"
                }, [
                  createBaseVNode("path", { d: "M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06Z" })
                ], -1)
              ])])) : createCommentVNode("", true)
            ]),
            createBaseVNode("div", _hoisted_13, [
              createBaseVNode("button", {
                class: normalizeClass(["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 transition-all cursor-pointer", activeRole.value === "QA" ? "bg-indigo-600 text-white ring-indigo-600" : "bg-indigo-50 text-indigo-700 ring-indigo-200 opacity-60 hover:opacity-100"]),
                onClick: _cache[2] || (_cache[2] = ($event) => toggleRole("QA"))
              }, "QA", 2),
              createBaseVNode("button", {
                class: normalizeClass(["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 transition-all cursor-pointer", activeRole.value === "DEV" ? "bg-rose-600 text-white ring-rose-600" : "bg-rose-50 text-rose-700 ring-rose-200 opacity-60 hover:opacity-100"]),
                onClick: _cache[3] || (_cache[3] = ($event) => toggleRole("DEV"))
              }, "DEV", 2)
            ]),
            createBaseVNode("div", _hoisted_14, [
              (openBlock(), createElementBlock(Fragment, null, renderList(QA_CATEGORIES, (cat) => {
                return createBaseVNode("button", {
                  key: cat.id,
                  class: normalizeClass(["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 transition-opacity cursor-pointer", [cat.badge, activeCategories.value.size > 0 && !activeCategories.value.has(cat.id) ? "opacity-30" : ""]]),
                  onClick: ($event) => toggleCategory(cat.id)
                }, toDisplayString(cat.label), 11, _hoisted_15);
              }), 64)),
              activeCategories.value.size > 0 || activeRole.value || searchQuery.value ? (openBlock(), createElementBlock("button", {
                key: 0,
                class: "text-xs text-slate-400 hover:text-slate-600 px-1",
                onClick: _cache[4] || (_cache[4] = ($event) => {
                  activeCategories.value = /* @__PURE__ */ new Set();
                  activeRole.value = null;
                  searchQuery.value = "";
                })
              }, "Clear")) : createCommentVNode("", true)
            ])
          ]),
          createBaseVNode("div", _hoisted_16, [
            unref(tasksStore).scanning[activeProjectId.value] ? (openBlock(), createElementBlock("div", _hoisted_17, [
              createVNode(_sfc_main$3, { size: "md" })
            ])) : activeUntracked.value.length === 0 && activeLinked.value.length === 0 && !epicHierarchy.value.length ? (openBlock(), createElementBlock("div", _hoisted_18, [..._cache[12] || (_cache[12] = [
              createBaseVNode("svg", {
                class: "w-10 h-10 text-emerald-300",
                viewBox: "0 0 24 24",
                fill: "currentColor"
              }, [
                createBaseVNode("path", {
                  "fill-rule": "evenodd",
                  d: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",
                  "clip-rule": "evenodd"
                })
              ], -1),
              createBaseVNode("p", { class: "text-sm font-medium text-slate-600" }, "All tracked", -1),
              createBaseVNode("p", { class: "text-xs text-slate-400" }, "No untracked tasks in this project", -1)
            ])])) : groupedTasks.value.length === 0 && !epicHierarchy.value.length ? (openBlock(), createElementBlock("div", _hoisted_19, [
              _cache[13] || (_cache[13] = createBaseVNode("svg", {
                class: "w-8 h-8 text-slate-300",
                viewBox: "0 0 24 24",
                fill: "currentColor"
              }, [
                createBaseVNode("path", { d: "M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" })
              ], -1)),
              _cache[14] || (_cache[14] = createBaseVNode("p", { class: "text-sm font-medium text-slate-500" }, "ไม่พบ task ที่ตรงกับ filter", -1)),
              createBaseVNode("button", {
                class: "text-xs text-indigo-500 hover:text-indigo-700",
                onClick: _cache[5] || (_cache[5] = ($event) => {
                  activeCategories.value = /* @__PURE__ */ new Set();
                  activeRole.value = null;
                  searchQuery.value = "";
                })
              }, "ล้าง filter")
            ])) : epicHierarchy.value.length ? (openBlock(), createElementBlock("div", _hoisted_20, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(qaGroups.value, (group) => {
                return openBlock(), createElementBlock("div", {
                  key: group.id
                }, [
                  createBaseVNode("div", _hoisted_21, [
                    createBaseVNode("span", _hoisted_22, toDisplayString(group.dot), 1),
                    createBaseVNode("span", {
                      class: normalizeClass(["text-sm font-semibold", group.color])
                    }, toDisplayString(group.label), 3),
                    createBaseVNode("span", _hoisted_23, toDisplayString(group.stories.length), 1)
                  ]),
                  createBaseVNode("table", _hoisted_24, [
                    _cache[15] || (_cache[15] = createBaseVNode("thead", null, [
                      createBaseVNode("tr", { class: "border-b border-slate-100 text-left text-[10px] text-slate-400 uppercase tracking-wide" }, [
                        createBaseVNode("th", { class: "px-3 pb-1.5 w-16" }, "Epic"),
                        createBaseVNode("th", { class: "px-3 pb-1.5" }, "Story"),
                        createBaseVNode("th", { class: "px-3 pb-1.5 w-14 text-center" }, "API"),
                        createBaseVNode("th", { class: "px-3 pb-1.5 w-20 text-center" }, "Integration"),
                        createBaseVNode("th", { class: "px-3 pb-1.5 w-12 text-center" }, "UI"),
                        createBaseVNode("th", { class: "px-3 pb-1.5 w-14 text-center" }, "E2E"),
                        createBaseVNode("th", { class: "px-3 pb-1.5 w-14 text-center" }, "Script"),
                        createBaseVNode("th", { class: "px-3 pb-1.5 w-24 text-right" }, "Due Date"),
                        createBaseVNode("th", { class: "px-3 pb-1.5 w-24 text-right" }, "Updated")
                      ])
                    ], -1)),
                    createBaseVNode("tbody", null, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(group.stories, (row) => {
                        return openBlock(), createElementBlock("tr", {
                          key: row.epicLabel + row.storyLabel,
                          class: "border-b border-slate-50 hover:bg-slate-50"
                        }, [
                          createBaseVNode("td", _hoisted_25, [
                            createBaseVNode("span", _hoisted_26, toDisplayString(row.epicLabel), 1)
                          ]),
                          createBaseVNode("td", _hoisted_27, [
                            createBaseVNode("span", _hoisted_28, toDisplayString(row.storyLabel), 1)
                          ]),
                          createBaseVNode("td", _hoisted_29, [
                            row.hasAPI ? (openBlock(), createElementBlock("span", _hoisted_30, "✓")) : (openBlock(), createElementBlock("span", _hoisted_31, "—"))
                          ]),
                          createBaseVNode("td", _hoisted_32, [
                            row.hasIntegration ? (openBlock(), createElementBlock("span", _hoisted_33, "✓")) : (openBlock(), createElementBlock("span", _hoisted_34, "—"))
                          ]),
                          createBaseVNode("td", _hoisted_35, [
                            row.hasUI ? (openBlock(), createElementBlock("span", _hoisted_36, "✓")) : (openBlock(), createElementBlock("span", _hoisted_37, "—"))
                          ]),
                          createBaseVNode("td", _hoisted_38, [
                            row.hasE2E ? (openBlock(), createElementBlock("span", _hoisted_39, "✓")) : (openBlock(), createElementBlock("span", _hoisted_40, "—"))
                          ]),
                          createBaseVNode("td", _hoisted_41, [
                            row.hasScript ? (openBlock(), createElementBlock("span", _hoisted_42, "✓")) : (openBlock(), createElementBlock("span", _hoisted_43, "—"))
                          ]),
                          createBaseVNode("td", _hoisted_44, [
                            row.dueDate ? (openBlock(), createElementBlock("span", _hoisted_45, toDisplayString(row.dueDate), 1)) : (openBlock(), createElementBlock("span", _hoisted_46, "—"))
                          ]),
                          createBaseVNode("td", _hoisted_47, [
                            createBaseVNode("div", _hoisted_48, [
                              row.updatedDate ? (openBlock(), createElementBlock("span", _hoisted_49, "J " + toDisplayString(row.updatedDate), 1)) : createCommentVNode("", true),
                              row.gitDate ? (openBlock(), createElementBlock("span", _hoisted_50, "G " + toDisplayString(row.gitDate), 1)) : createCommentVNode("", true),
                              !row.updatedDate && !row.gitDate ? (openBlock(), createElementBlock("span", _hoisted_51, "—")) : createCommentVNode("", true)
                            ])
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ]);
              }), 128))
            ])) : (openBlock(), createElementBlock("div", _hoisted_52, [
              createBaseVNode("table", _hoisted_53, [
                _cache[21] || (_cache[21] = createBaseVNode("thead", null, [
                  createBaseVNode("tr", { class: "border-b border-slate-100 bg-white sticky top-0 z-10" }, [
                    createBaseVNode("th", { class: "text-left px-6 py-2.5 text-xs font-semibold text-slate-500 w-[400px] max-w-[400px]" }, "Task"),
                    createBaseVNode("th", { class: "text-center px-4 py-2.5 text-xs font-semibold text-slate-500 w-24" }, "Type"),
                    createBaseVNode("th", { class: "text-left px-4 py-2.5 text-xs font-semibold text-slate-500 w-28" }, "Sprint"),
                    createBaseVNode("th", { class: "text-left px-4 py-2.5 text-xs font-semibold text-slate-500 w-28" }, "Due Date"),
                    createBaseVNode("th", { class: "text-center px-4 py-2.5 text-xs font-semibold text-slate-500 w-24" }, "QA"),
                    createBaseVNode("th", { class: "text-center px-4 py-2.5 text-xs font-semibold text-slate-500 w-28" }, "Jira")
                  ])
                ], -1)),
                createBaseVNode("tbody", null, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(groupedTasks.value, (epicGroup, epicIndex) => {
                    return openBlock(), createElementBlock(Fragment, {
                      key: epicGroup.epic
                    }, [
                      createBaseVNode("tr", {
                        class: "bg-indigo-50 border-y border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors select-none",
                        onClick: ($event) => toggleCollapse("epic:" + epicGroup.epic)
                      }, [
                        createBaseVNode("td", _hoisted_55, [
                          createBaseVNode("div", _hoisted_56, [
                            (openBlock(), createElementBlock("svg", {
                              class: normalizeClass(["w-3 h-3 text-indigo-400 flex-shrink-0 transition-transform mt-0.5", collapsedCategories.value.has("epic:" + epicGroup.epic) ? "-rotate-90" : ""]),
                              viewBox: "0 0 12 12",
                              fill: "currentColor"
                            }, [..._cache[16] || (_cache[16] = [
                              createBaseVNode("path", { d: "M6 8.5 1.5 4h9L6 8.5Z" }, null, -1)
                            ])], 2)),
                            createBaseVNode("span", _hoisted_57, toDisplayString(viewTab.value === "weekly" ? epicGroup.epic : epicBadgeLabel(epicGroup.epic)), 1),
                            createBaseVNode("div", _hoisted_58, [
                              createBaseVNode("div", _hoisted_59, [
                                createBaseVNode("span", _hoisted_60, toDisplayString(epicGroup.epic), 1),
                                epicGroup.epicStatus || epicDevSlug(epicGroup.epic) && devStatusMap.value[epicDevSlug(epicGroup.epic)] ? (openBlock(), createElementBlock("span", {
                                  key: 0,
                                  class: normalizeClass(["inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1", (DEV_STATUS_BADGE[epicGroup.epicStatus ?? devStatusMap.value[epicDevSlug(epicGroup.epic)]] ?? { cls: "bg-slate-100 text-slate-400 ring-slate-200" }).cls])
                                }, toDisplayString((DEV_STATUS_BADGE[epicGroup.epicStatus ?? devStatusMap.value[epicDevSlug(epicGroup.epic)]] ?? { label: epicGroup.epicStatus ?? devStatusMap.value[epicDevSlug(epicGroup.epic)] }).label), 3)) : createCommentVNode("", true)
                              ]),
                              createBaseVNode("div", _hoisted_61, [
                                (openBlock(true), createElementBlock(Fragment, null, renderList(epicGroup.sections, (sec) => {
                                  return openBlock(), createElementBlock("span", {
                                    key: sec.section,
                                    class: "inline-flex items-center gap-1 text-xs text-indigo-500 bg-white border border-indigo-100 rounded px-1.5 py-0.5 leading-none"
                                  }, [
                                    createTextVNode(toDisplayString(sec.section === "—" ? "(ไม่มีหมวด)" : sec.section) + " ", 1),
                                    createBaseVNode("span", _hoisted_62, toDisplayString(sec.tasks.length), 1)
                                  ]);
                                }), 128))
                              ])
                            ]),
                            createBaseVNode("span", _hoisted_63, toDisplayString(epicGroup.total) + " items", 1)
                          ])
                        ])
                      ], 8, _hoisted_54),
                      !collapsedCategories.value.has("epic:" + epicGroup.epic) ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(epicGroup.sections, (secGroup) => {
                        return openBlock(), createElementBlock(Fragment, {
                          key: epicGroup.epic + ":" + secGroup.section
                        }, [
                          createBaseVNode("tr", {
                            class: normalizeClass(["bg-slate-50 border-y border-slate-100 transition-colors select-none", secGroup.tasks.length > 0 ? "cursor-pointer hover:bg-slate-100" : ""]),
                            onClick: ($event) => secGroup.tasks.length > 0 && toggleCollapse(epicGroup.epic + ":" + secGroup.section)
                          }, [
                            createBaseVNode("td", _hoisted_65, [
                              createBaseVNode("div", _hoisted_66, [
                                secGroup.tasks.length > 0 ? (openBlock(), createElementBlock("svg", {
                                  key: 0,
                                  class: normalizeClass(["w-2.5 h-2.5 text-slate-400 flex-shrink-0 transition-transform", collapsedCategories.value.has(epicGroup.epic + ":" + secGroup.section) ? "-rotate-90" : ""]),
                                  viewBox: "0 0 12 12",
                                  fill: "currentColor"
                                }, [..._cache[17] || (_cache[17] = [
                                  createBaseVNode("path", { d: "M6 8.5 1.5 4h9L6 8.5Z" }, null, -1)
                                ])], 2)) : (openBlock(), createElementBlock("span", _hoisted_67)),
                                createBaseVNode("span", _hoisted_68, toDisplayString(secGroup.section), 1),
                                secGroup.storyStatus && DEV_STATUS_BADGE[secGroup.storyStatus] ? (openBlock(), createElementBlock("span", {
                                  key: 2,
                                  class: normalizeClass(["inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1", DEV_STATUS_BADGE[secGroup.storyStatus].cls])
                                }, " Dev " + toDisplayString(DEV_STATUS_BADGE[secGroup.storyStatus].label), 3)) : createCommentVNode("", true),
                                secGroup.hasTC ? (openBlock(), createElementBlock("span", _hoisted_69, "TC")) : createCommentVNode("", true),
                                secGroup.hasE2E ? (openBlock(), createElementBlock("span", _hoisted_70, "E2E")) : createCommentVNode("", true),
                                createBaseVNode("span", _hoisted_71, toDisplayString(secGroup.tasks.length), 1)
                              ])
                            ])
                          ], 10, _hoisted_64),
                          secGroup.tasks.length > 0 && !collapsedCategories.value.has(epicGroup.epic + ":" + secGroup.section) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                            createCommentVNode("", true),
                            (openBlock(true), createElementBlock(Fragment, null, renderList(secGroup.tasks, (task) => {
                              return openBlock(), createElementBlock("tr", {
                                key: task.id,
                                class: normalizeClass(["bg-white hover:bg-slate-50 transition-colors border-b border-slate-50", task.isIgnoredToday ? "opacity-40" : ""])
                              }, [
                                createBaseVNode("td", _hoisted_73, [
                                  createBaseVNode("div", _hoisted_74, [
                                    createBaseVNode("button", {
                                      class: "flex-shrink-0 hover:scale-110 transition-transform",
                                      onClick: withModifiers(($event) => unref(tasksStore).toggleTask(task.id, activeProjectId.value, !task.isChecked), ["stop"])
                                    }, [
                                      task.isChecked ? (openBlock(), createElementBlock("svg", _hoisted_76, [..._cache[19] || (_cache[19] = [
                                        createBaseVNode("path", { d: "M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0Z" }, null, -1),
                                        createBaseVNode("path", {
                                          "fill-rule": "evenodd",
                                          d: "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Z",
                                          "clip-rule": "evenodd"
                                        }, null, -1)
                                      ])])) : (openBlock(), createElementBlock("svg", _hoisted_77, [..._cache[20] || (_cache[20] = [
                                        createBaseVNode("path", {
                                          "fill-rule": "evenodd",
                                          d: "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Z",
                                          "clip-rule": "evenodd"
                                        }, null, -1)
                                      ])]))
                                    ], 8, _hoisted_75),
                                    task.isLinked ? (openBlock(), createElementBlock("span", _hoisted_78, toDisplayString(task.jiraKey), 1)) : createCommentVNode("", true),
                                    createBaseVNode("div", _hoisted_79, [
                                      createBaseVNode("span", {
                                        class: normalizeClass(["line-clamp-2 text-xs leading-relaxed", task.isChecked ? "line-through text-slate-400" : "text-slate-700"])
                                      }, toDisplayString(stripMd(task.rawText)), 3),
                                      createBaseVNode("span", _hoisted_80, toDisplayString(task.fileRelativePath) + ":" + toDisplayString(task.lineNumber), 1)
                                    ]),
                                    extractRole(task.rawText) === "QA" ? (openBlock(), createElementBlock("span", _hoisted_81, "QA")) : extractRole(task.rawText) === "DEV" ? (openBlock(), createElementBlock("span", _hoisted_82, "DEV")) : createCommentVNode("", true)
                                  ])
                                ]),
                                createBaseVNode("td", _hoisted_83, [
                                  classifyTask(task.rawText) ? (openBlock(), createElementBlock("span", {
                                    key: 0,
                                    class: normalizeClass([
                                      "inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1",
                                      QA_CATEGORIES.find((c) => c.id === classifyTask(task.rawText))?.badge ?? ""
                                    ])
                                  }, toDisplayString(QA_CATEGORIES.find((c) => c.id === classifyTask(task.rawText))?.label), 3)) : (openBlock(), createElementBlock("span", _hoisted_84, "—"))
                                ]),
                                createBaseVNode("td", _hoisted_85, [
                                  task.sprint ? (openBlock(), createElementBlock("span", _hoisted_86, toDisplayString(task.sprint), 1)) : (openBlock(), createElementBlock("span", _hoisted_87, "—"))
                                ]),
                                createBaseVNode("td", _hoisted_88, [
                                  task.dueDate ? (openBlock(), createElementBlock("span", _hoisted_89, toDisplayString(task.dueDate), 1)) : (openBlock(), createElementBlock("span", _hoisted_90, "—"))
                                ]),
                                createBaseVNode("td", _hoisted_91, [
                                  createBaseVNode("span", {
                                    class: normalizeClass(["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1", qaWorkBadge(task).cls])
                                  }, toDisplayString(qaWorkBadge(task).label), 3)
                                ]),
                                createBaseVNode("td", _hoisted_92, [
                                  createBaseVNode("span", {
                                    class: normalizeClass(["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1", jiraStatusBadge(task).cls])
                                  }, toDisplayString(jiraStatusBadge(task).label), 3)
                                ])
                              ], 2);
                            }), 128))
                          ], 64)) : createCommentVNode("", true)
                        ], 64);
                      }), 128)) : createCommentVNode("", true)
                    ], 64);
                  }), 128))
                ])
              ])
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
