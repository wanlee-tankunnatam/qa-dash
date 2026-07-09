import { d as defineComponent, u as useProjectsStore, B as useJiraStore, w as watch, o as onMounted, b as openBlock, c as createElementBlock, e as createBaseVNode, t as toDisplayString, s as createCommentVNode, F as Fragment, j as renderList, z as unref, g as createBlock, C as createStaticVNode, r as ref, x as computed, n as normalizeClass, f as createTextVNode, h as createVNode, J as h } from "./index-Bq_91m8v.js";
import { _ as _sfc_main$1 } from "./LoadingSpinner.vue_vue_type_script_setup_true_lang-BGG7VSfd.js";
const _hoisted_1 = { class: "flex flex-col h-full bg-slate-50" };
const _hoisted_2 = { class: "flex flex-col gap-0 bg-white border-b border-slate-100" };
const _hoisted_3 = { class: "flex items-center justify-between px-6 pt-4 pb-2" };
const _hoisted_4 = { class: "flex items-center gap-3" };
const _hoisted_5 = {
  key: 0,
  class: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
};
const _hoisted_6 = { class: "flex items-center gap-0 px-4 overflow-x-auto" };
const _hoisted_7 = ["onClick"];
const _hoisted_8 = {
  key: 1,
  class: "flex flex-col items-center justify-center mt-20 gap-3 text-center"
};
const _hoisted_9 = {
  key: 2,
  class: "flex-1 overflow-auto p-5 space-y-4"
};
const _hoisted_10 = { class: "flex items-center gap-2 flex-wrap" };
const _hoisted_11 = ["onClick"];
const _hoisted_12 = { class: "text-xs font-semibold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded" };
const _hoisted_13 = { class: "text-sm font-semibold text-slate-700 flex-1 truncate" };
const _hoisted_14 = { class: "text-xs text-slate-400" };
const _hoisted_15 = {
  key: 0,
  class: "w-full text-xs"
};
const _hoisted_16 = { class: "px-4 py-2.5" };
const _hoisted_17 = { class: "flex items-center gap-2" };
const _hoisted_18 = { class: "text-slate-700 font-medium" };
const _hoisted_19 = ["onClick"];
const _hoisted_20 = { class: "px-3 py-2.5 text-center" };
const _hoisted_21 = { class: "px-3 py-2.5 text-center" };
const _hoisted_22 = { class: "px-3 py-2.5 text-center" };
const _hoisted_23 = { class: "px-3 py-2.5 text-center" };
const _hoisted_24 = { class: "px-3 py-2.5 text-center" };
const _hoisted_25 = { class: "px-3 py-2.5 text-center" };
const _hoisted_26 = { class: "px-3 py-2.5 text-right font-mono text-slate-400" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SprintPage",
  setup(__props) {
    const projectsStore = useProjectsStore();
    const jiraStore = useJiraStore();
    const loading = ref(false);
    const activeProjectId = ref("");
    const activeSprint = ref(null);
    const epicHierarchy = ref([]);
    const tcCoverage = ref({});
    const gitDateMap = ref({});
    const collapsed = ref(/* @__PURE__ */ new Set());
    const jiraSite = ref("");
    function buildJiraBase(site) {
      if (!site) return "";
      return site.startsWith("http") ? site.replace(/\/$/, "") : `https://${site}.atlassian.net`;
    }
    function openJira(key) {
      if (!jiraSite.value || !key) return;
      const base = buildJiraBase(jiraSite.value);
      if (!base) return;
      window.qaApi.openExternal(`${base}/browse/${key}`);
    }
    const DEV_STATUS = {
      done: { label: "Done", cls: "bg-slate-100 text-slate-600 ring-slate-300" },
      "in-progress": { label: "In Prog", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
      review: { label: "Review", cls: "bg-violet-50 text-violet-700 ring-violet-200" },
      "ready-for-dev": { label: "Ready", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
      backlog: { label: "Backlog", cls: "bg-slate-50 text-slate-400 ring-slate-200" },
      descoped: { label: "Descoped", cls: "bg-gray-100 text-gray-400 ring-gray-200" },
      optional: { label: "Optional", cls: "bg-gray-100 text-gray-400 ring-gray-200" }
    };
    function statusBadge(status) {
      return DEV_STATUS[status] ?? { label: status, cls: "bg-slate-100 text-slate-500 ring-slate-200" };
    }
    function coverage(slug) {
      return tcCoverage.value[slug];
    }
    function latestDate(jiraKeys) {
      return jiraKeys.map((k) => gitDateMap.value[k]).filter(Boolean).sort().pop();
    }
    function epicLabel(epic) {
      const story = epic.stories[0];
      if (!story) return `Epic ${epic.number}`;
      const m = story.slug.match(/^(\d+)-([^-]+)-(.+)/);
      return m ? m[3].replace(/-/g, " ") : `Epic ${epic.number}`;
    }
    function toggleEpic(slug) {
      const s = new Set(collapsed.value);
      s.has(slug) ? s.delete(slug) : s.add(slug);
      collapsed.value = s;
    }
    const summaryChips = computed(() => {
      const stories = epicHierarchy.value.flatMap((e) => e.stories);
      const done = stories.filter((s) => s.status === "done").length;
      const inProgress = stories.filter((s) => s.status === "in-progress" || s.status === "review").length;
      const waiting = stories.filter((s) => !["done", "in-progress", "review", "descoped"].includes(s.status)).length;
      return [
        { label: "Done", count: done, dot: "bg-emerald-400", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
        { label: "In Progress", count: inProgress, dot: "bg-blue-400", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
        { label: "Waiting", count: waiting, dot: "bg-slate-300", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
        { label: "Total", count: stories.length, dot: "bg-indigo-400", cls: "bg-indigo-50 text-indigo-700 ring-indigo-200" }
      ];
    });
    const CheckMark = (props) => {
      if (props.has) {
        const color = props.color === "teal" ? "text-teal-500" : props.color === "indigo" ? "text-indigo-500" : "text-purple-500";
        return h("span", { class: `${color} font-bold text-sm` }, "✓");
      }
      return h("span", { class: "text-slate-200" }, "—");
    };
    async function loadSprint(projectId) {
      if (!projectId) return;
      loading.value = true;
      activeSprint.value = null;
      try {
        const [result, sprint] = await Promise.all([
          window.qaApi.getSprintStatus(projectId),
          window.qaApi.getActiveSprint(projectId)
        ]);
        epicHierarchy.value = result.epicHierarchy;
        tcCoverage.value = result.tcCoverage ?? {};
        gitDateMap.value = result.gitDateMap ?? {};
        activeSprint.value = sprint;
        const allKeys = result.epicHierarchy.flatMap((e) => e.stories.flatMap((s) => s.jiraKeys));
        if (allKeys.length > 0) {
          jiraStore.fetchTickets(allKeys).catch(() => {
          });
        }
      } finally {
        loading.value = false;
      }
    }
    watch(activeProjectId, loadSprint);
    onMounted(async () => {
      const settings = await window.qaApi.getJiraSettings();
      if (settings?.site) jiraSite.value = settings.site;
      if (projectsStore.projects.length === 0) {
        await projectsStore.fetchProjects();
      }
      if (projectsStore.projects.length > 0) {
        activeProjectId.value = projectsStore.projects[0].id;
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("div", _hoisted_4, [
              _cache[0] || (_cache[0] = createBaseVNode("h1", { class: "text-base font-semibold text-slate-800" }, "Sprint", -1)),
              activeSprint.value ? (openBlock(), createElementBlock("span", _hoisted_5, toDisplayString(activeSprint.value.name), 1)) : createCommentVNode("", true)
            ]),
            _cache[1] || (_cache[1] = createBaseVNode("p", { class: "text-xs text-slate-400" }, "QA coverage per epic / story", -1))
          ]),
          createBaseVNode("div", _hoisted_6, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(projectsStore).projects, (p) => {
              return openBlock(), createElementBlock("button", {
                key: p.id,
                class: normalizeClass(["px-4 py-1.5 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap", activeProjectId.value === p.id ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"]),
                onClick: ($event) => activeProjectId.value = p.id
              }, toDisplayString(p.name), 11, _hoisted_7);
            }), 128))
          ])
        ]),
        loading.value ? (openBlock(), createBlock(_sfc_main$1, {
          key: 0,
          size: "lg",
          class: "mx-auto mt-16"
        })) : !epicHierarchy.value.length ? (openBlock(), createElementBlock("div", _hoisted_8, [..._cache[2] || (_cache[2] = [
          createStaticVNode('<svg class="w-10 h-10 text-slate-200" viewBox="0 0 24 24" fill="currentColor"><path d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9H3.75v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"></path></svg><p class="text-sm font-medium text-slate-500">ไม่พบ sprint-status.yaml</p><p class="text-xs text-slate-400 max-w-xs">วาง <span class="font-mono">sprint-status.yaml</span> ไว้ที่ root ของ project เพื่อแสดง epic/story breakdown</p>', 3)
        ])])) : (openBlock(), createElementBlock("div", _hoisted_9, [
          createBaseVNode("div", _hoisted_10, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(summaryChips.value, (chip) => {
              return openBlock(), createElementBlock("span", {
                key: chip.label,
                class: normalizeClass(["inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1", chip.cls])
              }, [
                createBaseVNode("span", {
                  class: normalizeClass(["w-1.5 h-1.5 rounded-full", chip.dot])
                }, null, 2),
                createTextVNode(" " + toDisplayString(chip.label) + ": " + toDisplayString(chip.count), 1)
              ], 2);
            }), 128))
          ]),
          (openBlock(true), createElementBlock(Fragment, null, renderList(epicHierarchy.value, (epic) => {
            return openBlock(), createElementBlock("div", {
              key: epic.slug,
              class: "bg-white rounded-xl border border-slate-200 overflow-hidden"
            }, [
              createBaseVNode("div", {
                class: "flex items-center gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer select-none hover:bg-slate-50",
                onClick: ($event) => toggleEpic(epic.slug)
              }, [
                (openBlock(), createElementBlock("svg", {
                  class: normalizeClass(["w-3 h-3 text-slate-400 flex-shrink-0 transition-transform", collapsed.value.has(epic.slug) ? "-rotate-90" : ""]),
                  viewBox: "0 0 12 12",
                  fill: "currentColor"
                }, [..._cache[3] || (_cache[3] = [
                  createBaseVNode("path", { d: "M6 8.5 1.5 4h9L6 8.5Z" }, null, -1)
                ])], 2)),
                createBaseVNode("span", _hoisted_12, "Epic " + toDisplayString(epic.number), 1),
                createBaseVNode("span", _hoisted_13, toDisplayString(epicLabel(epic)), 1),
                createBaseVNode("span", {
                  class: normalizeClass(["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1", statusBadge(epic.status).cls])
                }, toDisplayString(statusBadge(epic.status).label), 3),
                createBaseVNode("span", _hoisted_14, toDisplayString(epic.stories.length) + " stories", 1)
              ], 8, _hoisted_11),
              !collapsed.value.has(epic.slug) ? (openBlock(), createElementBlock("table", _hoisted_15, [
                _cache[4] || (_cache[4] = createBaseVNode("thead", null, [
                  createBaseVNode("tr", { class: "border-b border-slate-50 text-[10px] text-slate-400 uppercase tracking-wider text-left" }, [
                    createBaseVNode("th", { class: "px-4 py-2" }, "Story"),
                    createBaseVNode("th", { class: "px-3 py-2 text-center w-16" }, "Dev"),
                    createBaseVNode("th", { class: "px-3 py-2 text-center w-14" }, "API"),
                    createBaseVNode("th", { class: "px-3 py-2 text-center w-20" }, "Integ."),
                    createBaseVNode("th", { class: "px-3 py-2 text-center w-10" }, "UI"),
                    createBaseVNode("th", { class: "px-3 py-2 text-center w-10" }, "E2E"),
                    createBaseVNode("th", { class: "px-3 py-2 text-center w-14" }, "Script"),
                    createBaseVNode("th", { class: "px-3 py-2 text-right w-24" }, "Updated")
                  ])
                ], -1)),
                createBaseVNode("tbody", null, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(epic.stories, (story) => {
                    return openBlock(), createElementBlock("tr", {
                      key: story.slug,
                      class: "border-b border-slate-50 hover:bg-slate-50"
                    }, [
                      createBaseVNode("td", _hoisted_16, [
                        createBaseVNode("div", _hoisted_17, [
                          createBaseVNode("span", _hoisted_18, toDisplayString(story.label), 1),
                          (openBlock(true), createElementBlock(Fragment, null, renderList([...new Set(story.jiraKeys)].filter((k) => unref(jiraStore).getTicket(k)).slice(0, 2), (k) => {
                            return openBlock(), createElementBlock("button", {
                              key: k,
                              class: "text-indigo-500 font-mono bg-indigo-50 hover:bg-indigo-100 hover:underline px-1 py-0.5 rounded text-[10px]",
                              onClick: ($event) => openJira(k)
                            }, toDisplayString(k), 9, _hoisted_19);
                          }), 128))
                        ])
                      ]),
                      createBaseVNode("td", _hoisted_20, [
                        createBaseVNode("span", {
                          class: normalizeClass(["inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1", statusBadge(story.status).cls])
                        }, toDisplayString(statusBadge(story.status).label), 3)
                      ]),
                      createBaseVNode("td", _hoisted_21, [
                        createVNode(CheckMark, {
                          has: coverage(story.slug)?.hasAPI
                        }, null, 8, ["has"])
                      ]),
                      createBaseVNode("td", _hoisted_22, [
                        createVNode(CheckMark, {
                          has: coverage(story.slug)?.hasIntegration
                        }, null, 8, ["has"])
                      ]),
                      createBaseVNode("td", _hoisted_23, [
                        createVNode(CheckMark, {
                          has: coverage(story.slug)?.hasUI
                        }, null, 8, ["has"])
                      ]),
                      createBaseVNode("td", _hoisted_24, [
                        createVNode(CheckMark, {
                          has: coverage(story.slug)?.hasE2E,
                          color: "teal"
                        }, null, 8, ["has"])
                      ]),
                      createBaseVNode("td", _hoisted_25, [
                        createVNode(CheckMark, {
                          has: coverage(story.slug)?.hasScript,
                          color: "indigo"
                        }, null, 8, ["has"])
                      ]),
                      createBaseVNode("td", _hoisted_26, toDisplayString(latestDate(story.jiraKeys) ?? "—"), 1)
                    ]);
                  }), 128))
                ])
              ])) : createCommentVNode("", true)
            ]);
          }), 128))
        ]))
      ]);
    };
  }
});
export {
  _sfc_main as default
};
