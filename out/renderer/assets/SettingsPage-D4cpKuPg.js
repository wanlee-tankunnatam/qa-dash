import { d as defineComponent, u as useProjectsStore, A as useJiraStore, o as onMounted, b as openBlock, c as createElementBlock, e as createBaseVNode, B as createStaticVNode, t as toDisplayString, y as unref, F as Fragment, r as renderList, j as createCommentVNode, n as normalizeClass, k as withDirectives, l as vModelText, m as withKeys, f as createTextVNode, q as ref, s as computed } from "./index-Ruh7bkA3.js";
const _hoisted_1 = { class: "flex flex-col h-full bg-slate-50" };
const _hoisted_2 = { class: "flex-1 overflow-auto p-6 space-y-5" };
const _hoisted_3 = { class: "bg-white rounded-xl border border-slate-200" };
const _hoisted_4 = { class: "px-5 py-4 border-b border-slate-100 flex items-center justify-between" };
const _hoisted_5 = { class: "text-xs text-slate-400" };
const _hoisted_6 = {
  key: 0,
  class: "divide-y divide-slate-50"
};
const _hoisted_7 = { class: "flex items-center gap-3" };
const _hoisted_8 = { class: "flex-1 min-w-0" };
const _hoisted_9 = ["value", "onChange"];
const _hoisted_10 = { class: "text-xs text-slate-400 truncate font-mono" };
const _hoisted_11 = ["onClick"];
const _hoisted_12 = { class: "flex items-center gap-2 pl-10" };
const _hoisted_13 = ["value", "onChange"];
const _hoisted_14 = { class: "pl-10 space-y-1.5" };
const _hoisted_15 = { class: "flex-1 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 truncate" };
const _hoisted_16 = ["onClick"];
const _hoisted_17 = { class: "flex gap-2" };
const _hoisted_18 = ["onUpdate:modelValue", "onKeydown"];
const _hoisted_19 = ["onClick"];
const _hoisted_20 = ["onClick"];
const _hoisted_21 = { class: "flex gap-2" };
const _hoisted_22 = ["disabled"];
const _hoisted_23 = {
  key: 0,
  class: "mt-2 text-xs text-red-600"
};
const _hoisted_24 = {
  key: 1,
  class: "mt-2 text-xs text-slate-400"
};
const _hoisted_25 = { class: "bg-white rounded-xl border border-slate-200" };
const _hoisted_26 = {
  key: 0,
  class: "divide-y divide-slate-50"
};
const _hoisted_27 = { class: "px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-xs font-mono font-semibold" };
const _hoisted_28 = { class: "flex-1 text-sm text-slate-600" };
const _hoisted_29 = ["onClick"];
const _hoisted_30 = { class: "flex gap-2" };
const _hoisted_31 = ["disabled"];
const _hoisted_32 = { class: "bg-white rounded-xl border border-slate-200" };
const _hoisted_33 = { class: "p-5 space-y-3" };
const _hoisted_34 = { class: "block text-xs font-medium text-slate-600 mb-1.5" };
const _hoisted_35 = {
  key: 0,
  class: "ml-1.5 text-emerald-600 font-normal"
};
const _hoisted_36 = { class: "flex items-center gap-1" };
const _hoisted_37 = { class: "flex gap-2 pt-1" };
const _hoisted_38 = ["disabled"];
const _hoisted_39 = ["disabled"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SettingsPage",
  setup(__props) {
    const projectsStore = useProjectsStore();
    const jiraStore = useJiraStore();
    const newProjectPath = ref("");
    const addError = ref("");
    const projectConfigs = ref({});
    const newIncludePath = ref({});
    async function updateSprint(projectId, value) {
      if (!projectConfigs.value[projectId]) projectConfigs.value[projectId] = { sprint: "", includePaths: [] };
      projectConfigs.value[projectId].sprint = value;
      await window.qaApi.updateProjectConfig(projectId, { currentSprint: value || void 0 });
    }
    async function browseIncludePath(projectId, rootPath) {
      const selected = await window.qaApi.openFolderDialog();
      if (!selected) return;
      const rel = selected.startsWith(rootPath) ? selected.slice(rootPath.endsWith("/") ? rootPath.length : rootPath.length + 1) : selected;
      newIncludePath.value[projectId] = rel ? rel + "/" : "";
    }
    async function addIncludePath(projectId) {
      const raw = (newIncludePath.value[projectId] ?? "").trim();
      if (!raw) return;
      if (!projectConfigs.value[projectId]) projectConfigs.value[projectId] = { sprint: "", includePaths: [] };
      const paths = [...projectConfigs.value[projectId].includePaths, raw];
      projectConfigs.value[projectId].includePaths = paths;
      newIncludePath.value[projectId] = "";
      await window.qaApi.updateProjectConfig(projectId, { includePaths: paths });
    }
    async function removeIncludePath(projectId, idx) {
      const paths = projectConfigs.value[projectId].includePaths.filter((_, i) => i !== idx);
      projectConfigs.value[projectId].includePaths = paths;
      await window.qaApi.updateProjectConfig(projectId, { includePaths: paths });
    }
    async function pickFolder() {
      try {
        const path = await window.qaApi.openFolderDialog();
        if (path) newProjectPath.value = path;
      } catch (e) {
        addError.value = "ไม่สามารถเปิด folder picker: " + e.message;
      }
    }
    async function addProject() {
      const path = newProjectPath.value.trim();
      if (!path) return;
      addError.value = "";
      try {
        await projectsStore.addProject(path);
        newProjectPath.value = "";
      } catch (e) {
        addError.value = e.message;
      }
    }
    async function removeProject(id) {
      await projectsStore.removeProject(id);
    }
    async function renameProject(id, name) {
      if (!name.trim()) return;
      await window.qaApi.renameProject(id, name.trim());
      await projectsStore.fetchProjects();
    }
    const jiraProjects = ref([]);
    const newJiraKey = ref("");
    const newJiraName = ref("");
    async function addJiraProject() {
      const key = newJiraKey.value.trim().toUpperCase();
      if (!key || jiraProjects.value.some((p) => p.key === key)) return;
      jiraProjects.value.push({ key, name: newJiraName.value.trim() || key });
      await window.qaApi.setJiraProjects(jiraProjects.value);
      newJiraKey.value = "";
      newJiraName.value = "";
    }
    async function removeJiraProject(key) {
      jiraProjects.value = jiraProjects.value.filter((p) => p.key !== key);
      await window.qaApi.setJiraProjects(jiraProjects.value);
    }
    const jiraEmail = ref("");
    const jiraToken = ref("");
    const jiraSite = ref("");
    const jiraTokenSaved = ref(false);
    const connectionResult = ref(null);
    const canSaveJira = computed(() => !!(jiraEmail.value && jiraSite.value && jiraToken.value));
    function buildBaseUrl(site) {
      if (site.startsWith("http")) return site.replace(/\/$/, "");
      return `https://${site}.atlassian.net`;
    }
    async function saveJiraSettings() {
      if (!canSaveJira.value) return;
      await window.qaApi.setJiraSettings({ email: jiraEmail.value, site: jiraSite.value });
      await window.qaApi.setCredential("jira-token", jiraToken.value);
      jiraToken.value = "";
      jiraTokenSaved.value = true;
    }
    async function testConnection() {
      connectionResult.value = null;
      const baseUrl = buildBaseUrl(jiraSite.value);
      const result = await jiraStore.testConnection(baseUrl, jiraEmail.value);
      connectionResult.value = result;
    }
    onMounted(async () => {
      if (projectsStore.projects.length === 0) {
        await projectsStore.fetchProjects();
      }
      for (const p of projectsStore.projects) {
        const cfg = await window.qaApi.getProjectConfig(p.id);
        projectConfigs.value[p.id] = {
          sprint: cfg.currentSprint ?? "",
          includePaths: cfg.includePaths ?? []
        };
      }
      const saved = await window.qaApi.getJiraSettings();
      if (saved) {
        jiraEmail.value = saved.email;
        jiraSite.value = saved.site;
        jiraTokenSaved.value = true;
      }
      jiraProjects.value = await window.qaApi.getJiraProjects();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[22] || (_cache[22] = createBaseVNode("div", { class: "px-6 py-4 bg-white border-b border-slate-100" }, [
          createBaseVNode("h1", { class: "text-base font-semibold text-slate-800" }, "Settings"),
          createBaseVNode("p", { class: "text-xs text-slate-400 mt-0.5" }, "API keys, projects, and Jira configuration")
        ], -1)),
        createBaseVNode("div", _hoisted_2, [
          _cache[21] || (_cache[21] = createStaticVNode('<section class="bg-white rounded-xl border border-slate-200"><div class="px-5 py-4 border-b border-slate-100"><h2 class="text-sm font-semibold text-slate-700">AI Engine</h2></div><div class="p-5 flex items-start gap-3"><div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0"><svg class="w-4 h-4 text-emerald-500" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm3.25 4.75a.75.75 0 0 0-1.06 0L7 8.94 5.81 7.75a.75.75 0 1 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0 0-1.06Z"></path></svg></div><div><p class="text-sm font-medium text-slate-700">ใช้ Claude Code session ที่ login แล้ว</p><p class="text-xs text-slate-400 mt-0.5">ไม่ต้องใส่ API key — แอปเรียก <span class="font-mono">claude</span> CLI โดยตรง</p></div></div></section>', 1)),
          createBaseVNode("section", _hoisted_3, [
            createBaseVNode("div", _hoisted_4, [
              _cache[6] || (_cache[6] = createBaseVNode("h2", { class: "text-sm font-semibold text-slate-700" }, "Projects", -1)),
              createBaseVNode("span", _hoisted_5, toDisplayString(unref(projectsStore).projects.length) + " project" + toDisplayString(unref(projectsStore).projects.length !== 1 ? "s" : ""), 1)
            ]),
            unref(projectsStore).projects.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_6, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(projectsStore).projects, (p) => {
                return openBlock(), createElementBlock("div", {
                  key: p.id,
                  class: "px-5 py-3 space-y-2"
                }, [
                  createBaseVNode("div", _hoisted_7, [
                    _cache[7] || (_cache[7] = createBaseVNode("div", { class: "w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center flex-shrink-0" }, [
                      createBaseVNode("svg", {
                        class: "w-3.5 h-3.5 text-indigo-400",
                        viewBox: "0 0 12 12",
                        fill: "currentColor"
                      }, [
                        createBaseVNode("path", { d: "M1 2.5A1.5 1.5 0 0 1 2.5 1H5l1 1.5h3.5A1.5 1.5 0 0 1 11 4v5A1.5 1.5 0 0 1 9.5 10.5h-7A1.5 1.5 0 0 1 1 9V2.5Z" })
                      ])
                    ], -1)),
                    createBaseVNode("div", _hoisted_8, [
                      createBaseVNode("input", {
                        value: p.name,
                        type: "text",
                        class: "w-full text-sm font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-0 py-0.5 truncate",
                        onChange: ($event) => renameProject(p.id, $event.target.value)
                      }, null, 40, _hoisted_9),
                      createBaseVNode("p", _hoisted_10, toDisplayString(p.rootPath), 1)
                    ]),
                    createBaseVNode("button", {
                      class: "text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50",
                      onClick: ($event) => removeProject(p.id)
                    }, " Remove ", 8, _hoisted_11)
                  ]),
                  createBaseVNode("div", _hoisted_12, [
                    _cache[8] || (_cache[8] = createBaseVNode("span", { class: "text-xs text-slate-400 w-24 flex-shrink-0" }, "Current Sprint", -1)),
                    createBaseVNode("input", {
                      value: projectConfigs.value[p.id]?.sprint ?? "",
                      type: "text",
                      placeholder: "e.g. Sprint 3",
                      class: "flex-1 max-w-xs rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-400",
                      onChange: ($event) => updateSprint(p.id, $event.target.value)
                    }, null, 40, _hoisted_13)
                  ]),
                  createBaseVNode("div", _hoisted_14, [
                    _cache[10] || (_cache[10] = createBaseVNode("div", { class: "flex items-center justify-between" }, [
                      createBaseVNode("span", { class: "text-xs text-slate-400" }, "QA Scan Paths"),
                      createBaseVNode("span", { class: "text-xs text-slate-300" }, "(ว่าง = scan ทั้ง repo)")
                    ], -1)),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(projectConfigs.value[p.id]?.includePaths ?? [], (path, idx) => {
                      return openBlock(), createElementBlock("div", {
                        key: idx,
                        class: "flex items-center gap-2"
                      }, [
                        createBaseVNode("span", _hoisted_15, toDisplayString(path), 1),
                        createBaseVNode("button", {
                          class: "text-slate-300 hover:text-red-400 transition-colors flex-shrink-0",
                          onClick: ($event) => removeIncludePath(p.id, idx)
                        }, [..._cache[9] || (_cache[9] = [
                          createBaseVNode("svg", {
                            class: "w-3.5 h-3.5",
                            viewBox: "0 0 12 12",
                            fill: "currentColor"
                          }, [
                            createBaseVNode("path", { d: "M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06Z" })
                          ], -1)
                        ])], 8, _hoisted_16)
                      ]);
                    }), 128)),
                    createBaseVNode("div", _hoisted_17, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": ($event) => newIncludePath.value[p.id] = $event,
                        type: "text",
                        placeholder: "qa/ หรือ test-plans/",
                        class: "flex-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-mono text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-400",
                        onKeydown: withKeys(($event) => addIncludePath(p.id), ["enter"])
                      }, null, 40, _hoisted_18), [
                        [vModelText, newIncludePath.value[p.id]]
                      ]),
                      createBaseVNode("button", {
                        class: "px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors whitespace-nowrap",
                        onClick: ($event) => browseIncludePath(p.id, p.rootPath)
                      }, "Browse…", 8, _hoisted_19),
                      createBaseVNode("button", {
                        class: "px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors",
                        onClick: ($event) => addIncludePath(p.id)
                      }, "Add", 8, _hoisted_20)
                    ])
                  ])
                ]);
              }), 128))
            ])) : createCommentVNode("", true),
            createBaseVNode("div", {
              class: normalizeClass(["p-5", unref(projectsStore).projects.length > 0 ? "border-t border-slate-100" : ""])
            }, [
              _cache[11] || (_cache[11] = createBaseVNode("p", { class: "text-xs font-medium text-slate-600 mb-2" }, "Add Project", -1)),
              createBaseVNode("div", _hoisted_21, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => newProjectPath.value = $event),
                  type: "text",
                  placeholder: "/Users/you/projects/my-repo",
                  class: "flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                  onKeydown: withKeys(addProject, ["enter"])
                }, null, 544), [
                  [vModelText, newProjectPath.value]
                ]),
                createBaseVNode("button", {
                  class: "px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors whitespace-nowrap",
                  onClick: pickFolder
                }, " Browse… "),
                createBaseVNode("button", {
                  class: normalizeClass([
                    "px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                    !newProjectPath.value.trim() ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  ]),
                  disabled: !newProjectPath.value.trim() || unref(projectsStore).loading,
                  onClick: addProject
                }, " Add ", 10, _hoisted_22)
              ]),
              addError.value ? (openBlock(), createElementBlock("p", _hoisted_23, toDisplayString(addError.value), 1)) : createCommentVNode("", true),
              unref(projectsStore).loading ? (openBlock(), createElementBlock("p", _hoisted_24, "Adding…")) : createCommentVNode("", true)
            ], 2)
          ]),
          createBaseVNode("section", _hoisted_25, [
            _cache[13] || (_cache[13] = createBaseVNode("div", { class: "px-5 py-4 border-b border-slate-100" }, [
              createBaseVNode("h2", { class: "text-sm font-semibold text-slate-700" }, "Jira Projects"),
              createBaseVNode("p", { class: "text-xs text-slate-400 mt-0.5" }, "Project keys ที่ใช้ดึง tickets — เพิ่มได้เรื่อยๆ")
            ], -1)),
            jiraProjects.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_26, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(jiraProjects.value, (p) => {
                return openBlock(), createElementBlock("div", {
                  key: p.key,
                  class: "flex items-center gap-3 px-5 py-3"
                }, [
                  createBaseVNode("span", _hoisted_27, toDisplayString(p.key), 1),
                  createBaseVNode("span", _hoisted_28, toDisplayString(p.name), 1),
                  createBaseVNode("button", {
                    class: "text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50",
                    onClick: ($event) => removeJiraProject(p.key)
                  }, " Remove ", 8, _hoisted_29)
                ]);
              }), 128))
            ])) : createCommentVNode("", true),
            createBaseVNode("div", {
              class: normalizeClass(["p-5", jiraProjects.value.length > 0 ? "border-t border-slate-100" : ""])
            }, [
              _cache[12] || (_cache[12] = createBaseVNode("p", { class: "text-xs font-medium text-slate-600 mb-2" }, "Add Project", -1)),
              createBaseVNode("div", _hoisted_30, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => newJiraKey.value = $event),
                  type: "text",
                  placeholder: "TAK",
                  class: "w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                  onKeydown: withKeys(addJiraProject, ["enter"])
                }, null, 544), [
                  [vModelText, newJiraKey.value]
                ]),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => newJiraName.value = $event),
                  type: "text",
                  placeholder: "Project name (optional)",
                  class: "flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                  onKeydown: withKeys(addJiraProject, ["enter"])
                }, null, 544), [
                  [vModelText, newJiraName.value]
                ]),
                createBaseVNode("button", {
                  class: normalizeClass(["px-4 py-2 rounded-lg text-xs font-semibold transition-all", newJiraKey.value.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"]),
                  disabled: !newJiraKey.value.trim(),
                  onClick: addJiraProject
                }, " Add ", 10, _hoisted_31)
              ])
            ], 2)
          ]),
          createBaseVNode("section", _hoisted_32, [
            _cache[20] || (_cache[20] = createBaseVNode("div", { class: "px-5 py-4 border-b border-slate-100" }, [
              createBaseVNode("h2", { class: "text-sm font-semibold text-slate-700" }, "Jira"),
              createBaseVNode("p", { class: "text-xs text-slate-400 mt-0.5" }, "ตั้งครั้งเดียว ใช้ได้ทุก project")
            ], -1)),
            createBaseVNode("div", _hoisted_33, [
              createBaseVNode("div", null, [
                _cache[14] || (_cache[14] = createBaseVNode("label", { class: "block text-xs font-medium text-slate-600 mb-1.5" }, "Email", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => jiraEmail.value = $event),
                  type: "email",
                  placeholder: "you@company.com",
                  class: "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                }, null, 512), [
                  [vModelText, jiraEmail.value]
                ])
              ]),
              createBaseVNode("div", null, [
                createBaseVNode("label", _hoisted_34, [
                  _cache[15] || (_cache[15] = createTextVNode(" Token ", -1)),
                  jiraTokenSaved.value ? (openBlock(), createElementBlock("span", _hoisted_35, "✓ saved")) : createCommentVNode("", true)
                ]),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => jiraToken.value = $event),
                  type: "password",
                  placeholder: "ATATT3x...",
                  class: "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                }, null, 512), [
                  [vModelText, jiraToken.value]
                ]),
                _cache[16] || (_cache[16] = createBaseVNode("p", { class: "mt-1 text-xs text-slate-400" }, [
                  createTextVNode(" สร้างที่ "),
                  createBaseVNode("span", { class: "font-mono" }, "id.atlassian.com → Security → API tokens")
                ], -1))
              ]),
              createBaseVNode("div", null, [
                _cache[19] || (_cache[19] = createBaseVNode("label", { class: "block text-xs font-medium text-slate-600 mb-1.5" }, "Site Key", -1)),
                createBaseVNode("div", _hoisted_36, [
                  _cache[17] || (_cache[17] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono" }, "https://", -1)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => jiraSite.value = $event),
                    type: "text",
                    placeholder: "yourorg",
                    class: "flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  }, null, 512), [
                    [vModelText, jiraSite.value]
                  ]),
                  _cache[18] || (_cache[18] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono" }, ".atlassian.net", -1))
                ])
              ]),
              createBaseVNode("div", _hoisted_37, [
                createBaseVNode("button", {
                  class: normalizeClass(["px-4 py-2 rounded-lg text-xs font-semibold transition-all", canSaveJira.value ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"]),
                  disabled: !canSaveJira.value,
                  onClick: saveJiraSettings
                }, " Save ", 10, _hoisted_38),
                createBaseVNode("button", {
                  class: "px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors",
                  disabled: unref(jiraStore).loading || !jiraEmail.value || !jiraSite.value,
                  onClick: testConnection
                }, toDisplayString(unref(jiraStore).loading ? "Testing…" : "Test Connection"), 9, _hoisted_39)
              ]),
              connectionResult.value !== null ? (openBlock(), createElementBlock("div", {
                key: 0,
                class: normalizeClass(["flex items-center gap-1.5 text-xs", connectionResult.value ? "text-emerald-600" : "text-red-600"])
              }, [
                createBaseVNode("span", null, toDisplayString(connectionResult.value ? "✓ Connected" : "✗ Failed — ตรวจสอบ email, token, และ site key"), 1)
              ], 2)) : createCommentVNode("", true)
            ])
          ])
        ])
      ]);
    };
  }
});
export {
  _sfc_main as default
};
