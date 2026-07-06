import { d as defineComponent, u as useProjectsStore, a as useTasksStore, r as ref, w as watch, o as onMounted, b as openBlock, c as createElementBlock, e as createBaseVNode, t as toDisplayString, n as normalizeClass, f as createTextVNode, g as createBlock, h as createVNode, i as withCtx, F as Fragment, j as renderList, k as normalizeStyle, l as withModifiers, m as withDirectives, v as vModelSelect, p as vModelText, q as withKeys, s as createCommentVNode, x as computed, y as resolveComponent, z as unref } from "./index-DKW7vBme.js";
import { _ as _sfc_main$1 } from "./LoadingSpinner.vue_vue_type_script_setup_true_lang-DLc3VGCp.js";
const _hoisted_1 = { class: "flex flex-col h-full bg-white" };
const _hoisted_2 = { class: "flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200" };
const _hoisted_3 = { class: "text-xs text-slate-400 mt-0.5" };
const _hoisted_4 = { class: "flex items-center gap-2" };
const _hoisted_5 = { class: "flex items-center rounded-md border border-slate-200 overflow-hidden" };
const _hoisted_6 = ["value", "max"];
const _hoisted_7 = ["disabled"];
const _hoisted_8 = { class: "flex rounded-md border border-slate-200 overflow-hidden text-xs font-medium" };
const _hoisted_9 = ["disabled"];
const _hoisted_10 = {
  key: 1,
  class: "flex flex-col items-center justify-center flex-1 gap-4"
};
const _hoisted_11 = {
  key: 2,
  class: "flex-1 overflow-auto p-5"
};
const _hoisted_12 = { class: "w-full table-fixed text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden" };
const _hoisted_13 = { class: "border-b border-slate-200 sticky top-0 z-10 bg-white" };
const _hoisted_14 = { class: "uppercase tracking-wider" };
const _hoisted_15 = { class: "text-[10px] font-mono font-normal mt-0.5" };
const _hoisted_16 = { class: "px-4 py-3 border-r border-slate-200 align-top" };
const _hoisted_17 = { class: "flex items-center gap-1.5" };
const _hoisted_18 = { class: "font-semibold text-slate-700" };
const _hoisted_19 = {
  key: 0,
  class: "w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"
};
const _hoisted_20 = { class: "space-y-1.5" };
const _hoisted_21 = {
  class: "w-3 h-3 text-slate-300 flex-shrink-0 mt-px",
  viewBox: "0 0 12 12",
  fill: "currentColor"
};
const _hoisted_22 = {
  key: 0,
  d: "M10.28 3.28 4.5 9.06 1.72 6.28a.75.75 0 0 0-1.06 1.06l3.34 3.34a.75.75 0 0 0 1.06 0l6.28-6.34a.75.75 0 0 0-1.06-1.06Z"
};
const _hoisted_23 = {
  key: 1,
  cx: "6",
  cy: "6",
  r: "4.5",
  stroke: "currentColor",
  "stroke-width": "1.5",
  fill: "none"
};
const _hoisted_24 = ["onDragstart", "onDragover", "onDrop"];
const _hoisted_25 = ["onClick"];
const _hoisted_26 = {
  key: 0,
  class: "flex items-center gap-1 flex-shrink-0"
};
const _hoisted_27 = ["onClick"];
const _hoisted_28 = ["onClick"];
const _hoisted_29 = {
  key: 0,
  class: "text-slate-200"
};
const _hoisted_30 = { class: "align-top border-t border-slate-200" };
const _hoisted_31 = { class: "space-y-2" };
const _hoisted_32 = ["onDragstart", "onDragover", "onDrop"];
const _hoisted_33 = ["onClick"];
const _hoisted_34 = {
  key: 0,
  class: "flex items-center gap-1 flex-shrink-0"
};
const _hoisted_35 = ["onClick"];
const _hoisted_36 = ["onClick"];
const _hoisted_37 = {
  key: 0,
  class: "text-slate-200"
};
const _hoisted_38 = ["value"];
const _hoisted_39 = ["onKeydown"];
const _hoisted_40 = ["disabled"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "HomePage",
  setup(__props) {
    const projectsStore = useProjectsStore();
    const tasksStore = useTasksStore();
    const loading = ref(false);
    const isSyncing = ref(false);
    const notes = ref({});
    const offsetDays = ref(0);
    const viewMode = ref("daily");
    const entries = ref({});
    const inputText = ref("");
    const inputProjectId = ref("");
    const inputDate = ref(dateStr(0));
    const inputBarHeight = ref(88);
    function startResize(e) {
      const startY = e.clientY;
      const startH = inputBarHeight.value;
      const onMove = (ev) => {
        inputBarHeight.value = Math.max(64, Math.min(400, startH - (ev.clientY - startY)));
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    }
    const editingRef = ref(null);
    const dragSrc = ref(null);
    const dragOverKey = ref(null);
    const confirmDelete = ref(null);
    function localYMD(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    function dateStr(daysFromToday) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + daysFromToday);
      return localYMD(d);
    }
    const anchorStr = computed(() => dateStr(offsetDays.value));
    const prevStr = computed(() => dateStr(offsetDays.value - 1));
    const DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    function dayLabel(date) {
      return DAY_NAMES[(/* @__PURE__ */ new Date(date + "T00:00:00")).getDay()];
    }
    function rollingWorkdays(anchor, n) {
      const result = [];
      const d = /* @__PURE__ */ new Date(anchor + "T00:00:00");
      while (result.length < n) {
        if (d.getDay() !== 0 && d.getDay() !== 6) result.unshift(localYMD(d));
        d.setDate(d.getDate() - 1);
      }
      return result;
    }
    const visibleDates = computed(() => {
      if (viewMode.value !== "week") return rollingWorkdays(anchorStr.value, 2);
      const anchor = /* @__PURE__ */ new Date(anchorStr.value + "T00:00:00");
      const day = anchor.getDay();
      const monday = new Date(anchor);
      if (day === 0) monday.setDate(anchor.getDate() + 1);
      else if (day === 6) monday.setDate(anchor.getDate() + 2);
      else monday.setDate(anchor.getDate() - (day - 1));
      return Array.from({ length: 5 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return localYMD(d);
      });
    });
    const todayLabel = computed(() => {
      const d = /* @__PURE__ */ new Date(anchorStr.value + "T00:00:00");
      return d.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    });
    async function loadNotes() {
      const [prev, anchor] = [prevStr.value, anchorStr.value];
      const [prevNote, anchorNote] = await Promise.all([
        window.qaApi.getNote(prev),
        window.qaApi.getNote(anchor)
      ]);
      for (const [date, text] of [[prev, prevNote], [anchor, anchorNote]]) {
        if (!text) continue;
        const existingRaw = await window.qaApi.getNote(entriesKey("__note__", date));
        let existing = [];
        try {
          existing = existingRaw ? JSON.parse(existingRaw) : [];
        } catch {
          existing = [];
        }
        if (existing.length === 0) {
          const list = [text];
          entries.value = { ...entries.value, [`__note__:${date}`]: list };
          await window.qaApi.setNote(entriesKey("__note__", date), JSON.stringify(list));
          await window.qaApi.setNote(date, "");
        }
      }
      notes.value = { ...notes.value, [prev]: "", [anchor]: "" };
    }
    function onDateChange(e) {
      const val = e.target.value;
      if (!val) return;
      const today = dateStr(0);
      const diffMs = (/* @__PURE__ */ new Date(val + "T00:00:00")).getTime() - (/* @__PURE__ */ new Date(today + "T00:00:00")).getTime();
      offsetDays.value = Math.min(0, Math.round(diffMs / 864e5));
    }
    function setViewMode(mode) {
      if (mode === "daily") offsetDays.value = 0;
      viewMode.value = mode;
    }
    function navigate(direction) {
      const todayMs = (/* @__PURE__ */ new Date(dateStr(0) + "T00:00:00")).getTime();
      if (viewMode.value === "week") {
        offsetDays.value = Math.min(0, offsetDays.value + direction * 7);
      } else {
        const d = /* @__PURE__ */ new Date(anchorStr.value + "T00:00:00");
        d.setDate(d.getDate() + direction);
        while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + direction);
        const newOffset = Math.round((d.getTime() - todayMs) / 864e5);
        offsetDays.value = Math.min(0, newOffset);
      }
    }
    const projects = computed(() => projectsStore.projects);
    function allTasks(projectId) {
      const result = tasksStore.byProject[projectId];
      if (!result) return [];
      return [...result.untracked, ...result.linked];
    }
    function tasksOnDate(projectId, date) {
      return allTasks(projectId).filter((t) => t.dueDate === date);
    }
    function strip(text) {
      return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s*\(AC[\d,\s:]+\)\s*$/i, "").trim();
    }
    async function load() {
      loading.value = true;
      try {
        await projectsStore.fetchProjects();
        for (const p of projectsStore.projects) {
          tasksStore.scanProject(p.id);
        }
      } finally {
        loading.value = false;
      }
    }
    async function triggerSync() {
      isSyncing.value = true;
      try {
        await window.qaApi.triggerSync();
        await load();
      } finally {
        isSyncing.value = false;
      }
    }
    function entriesKey(projectId, date) {
      return `freeform:${projectId}:${date}`;
    }
    function getEntries(projectId, date) {
      return entries.value[`${projectId}:${date}`] ?? [];
    }
    async function loadEntries() {
      const dates = visibleDates.value;
      const ps = projectsStore.projects;
      const keys = [
        ...ps.flatMap((p) => dates.map((d) => ({ ek: `${p.id}:${d}`, sk: entriesKey(p.id, d) }))),
        ...dates.map((d) => ({ ek: `__note__:${d}`, sk: entriesKey("__note__", d) }))
      ];
      const values = await Promise.all(keys.map((k) => window.qaApi.getNote(k.sk)));
      const patch = {};
      keys.forEach(({ ek }, i) => {
        try {
          patch[ek] = values[i] ? JSON.parse(values[i]) : [];
        } catch {
          patch[ek] = [];
        }
      });
      entries.value = { ...entries.value, ...patch };
    }
    function startEdit(projectId, date, idx, text) {
      inputProjectId.value = projectId;
      inputDate.value = date;
      inputText.value = text;
      editingRef.value = { projectId, date, idx };
    }
    async function addEntry() {
      const text = inputText.value.trim();
      const pid = inputProjectId.value;
      if (!text || !pid) return;
      const date = inputDate.value;
      const key = `${pid}:${date}`;
      if (editingRef.value && editingRef.value.projectId === pid && editingRef.value.date === date) {
        await updateEntry(pid, date, editingRef.value.idx, text);
      } else {
        const list = [...entries.value[key] ?? [], text];
        entries.value = { ...entries.value, [key]: list };
        await window.qaApi.setNote(entriesKey(pid, date), JSON.stringify(list));
      }
      inputText.value = "";
      editingRef.value = null;
    }
    function onDragStart(projectId, date, idx) {
      dragSrc.value = { projectId, date, idx };
    }
    function onDragOver(e, projectId, date, idx) {
      e.preventDefault();
      dragOverKey.value = `${projectId}:${date}:${idx}`;
    }
    async function onDrop(projectId, date, idx) {
      const src = dragSrc.value;
      if (!src || src.projectId !== projectId || src.date !== date || src.idx === idx) {
        dragSrc.value = null;
        dragOverKey.value = null;
        return;
      }
      const key = `${projectId}:${date}`;
      const list = [...entries.value[key] ?? []];
      const [item] = list.splice(src.idx, 1);
      list.splice(idx, 0, item);
      entries.value = { ...entries.value, [key]: list };
      await window.qaApi.setNote(entriesKey(projectId, date), JSON.stringify(list));
      dragSrc.value = null;
      dragOverKey.value = null;
    }
    async function updateEntry(projectId, date, idx, text) {
      const key = `${projectId}:${date}`;
      const list = [...entries.value[key] ?? []];
      list[idx] = text;
      entries.value = { ...entries.value, [key]: list };
      await window.qaApi.setNote(entriesKey(projectId, date), JSON.stringify(list));
    }
    async function removeEntry(projectId, date, idx) {
      const key = `${projectId}:${date}`;
      const list = (entries.value[key] ?? []).filter((_, i) => i !== idx);
      entries.value = { ...entries.value, [key]: list };
      await window.qaApi.setNote(entriesKey(projectId, date), JSON.stringify(list));
    }
    watch([anchorStr, viewMode], () => {
      inputDate.value = anchorStr.value;
      loadNotes();
      loadEntries();
    });
    watch(() => projectsStore.projects, loadEntries);
    onMounted(() => {
      load();
      loadNotes();
      loadEntries();
    });
    return (_ctx, _cache) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", null, [
            _cache[12] || (_cache[12] = createBaseVNode("h1", { class: "text-base font-semibold text-slate-800" }, "Home", -1)),
            createBaseVNode("p", _hoisted_3, toDisplayString(todayLabel.value), 1)
          ]),
          createBaseVNode("div", _hoisted_4, [
            createBaseVNode("div", _hoisted_5, [
              createBaseVNode("button", {
                class: "px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 text-sm leading-none transition-colors",
                onClick: _cache[0] || (_cache[0] = ($event) => navigate(-1))
              }, "‹"),
              createBaseVNode("input", {
                type: "date",
                value: anchorStr.value,
                max: dateStr(0),
                class: "text-xs border-l border-r border-slate-200 px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none",
                onChange: onDateChange
              }, null, 40, _hoisted_6),
              createBaseVNode("button", {
                class: normalizeClass(["px-2.5 py-1.5 text-sm leading-none transition-colors", offsetDays.value >= 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-500 hover:bg-slate-50"]),
                disabled: offsetDays.value >= 0,
                onClick: _cache[1] || (_cache[1] = ($event) => navigate(1))
              }, "›", 10, _hoisted_7)
            ]),
            createBaseVNode("div", _hoisted_8, [
              createBaseVNode("button", {
                class: normalizeClass(["px-3 py-1.5 transition-colors", viewMode.value === "daily" ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50"]),
                onClick: _cache[2] || (_cache[2] = ($event) => setViewMode("daily"))
              }, "Daily", 2),
              createBaseVNode("button", {
                class: normalizeClass(["px-3 py-1.5 border-l border-slate-200 transition-colors", viewMode.value === "week" ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50"]),
                onClick: _cache[3] || (_cache[3] = ($event) => setViewMode("week"))
              }, "Week", 2)
            ]),
            createBaseVNode("button", {
              class: normalizeClass(["inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all", isSyncing.value ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"]),
              disabled: isSyncing.value,
              onClick: triggerSync
            }, [
              (openBlock(), createElementBlock("svg", {
                class: normalizeClass(["w-3.5 h-3.5", isSyncing.value ? "animate-spin" : ""]),
                viewBox: "0 0 16 16",
                fill: "currentColor"
              }, [..._cache[13] || (_cache[13] = [
                createBaseVNode("path", { d: "M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1Z" }, null, -1),
                createBaseVNode("path", { d: "M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466Z" }, null, -1)
              ])], 2)),
              createTextVNode(" " + toDisplayString(isSyncing.value ? "…" : "Sync"), 1)
            ], 10, _hoisted_9)
          ])
        ]),
        loading.value ? (openBlock(), createBlock(_sfc_main$1, {
          key: 0,
          size: "lg",
          class: "mx-auto mt-16"
        })) : projects.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_10, [
          _cache[15] || (_cache[15] = createBaseVNode("p", { class: "text-sm font-medium text-slate-500" }, "ยังไม่มี project", -1)),
          createVNode(_component_RouterLink, {
            to: "/settings",
            class: "text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg transition-colors"
          }, {
            default: withCtx(() => [..._cache[14] || (_cache[14] = [
              createTextVNode(" ไปที่ Settings → ", -1)
            ])]),
            _: 1
          })
        ])) : (openBlock(), createElementBlock("div", _hoisted_11, [
          createBaseVNode("table", _hoisted_12, [
            createBaseVNode("thead", null, [
              createBaseVNode("tr", _hoisted_13, [
                _cache[16] || (_cache[16] = createBaseVNode("th", { class: "text-left px-4 py-3 text-xs font-semibold text-slate-500 w-28 border-r border-slate-200" }, "โปรเจกต์", -1)),
                (openBlock(true), createElementBlock(Fragment, null, renderList(visibleDates.value, (date, idx) => {
                  return openBlock(), createElementBlock("th", {
                    key: date,
                    class: normalizeClass(["text-left px-3 py-3 text-xs font-semibold border-r border-slate-200 last:border-r-0", (viewMode.value === "daily" ? idx === visibleDates.value.length - 1 : date === anchorStr.value) ? "text-indigo-600 bg-indigo-50" : "text-slate-500"])
                  }, [
                    createBaseVNode("span", _hoisted_14, toDisplayString(viewMode.value === "daily" ? idx === visibleDates.value.length - 1 ? "วันนี้" : "เมื่อวาน" : dayLabel(date)), 1),
                    createBaseVNode("p", _hoisted_15, toDisplayString(date), 1)
                  ], 2);
                }), 128))
              ])
            ]),
            createBaseVNode("tbody", null, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(projects.value, (p) => {
                return openBlock(), createElementBlock("tr", {
                  key: p.id,
                  class: "border-b border-slate-200 align-top"
                }, [
                  createBaseVNode("td", _hoisted_16, [
                    createBaseVNode("div", _hoisted_17, [
                      createBaseVNode("span", _hoisted_18, toDisplayString(p.name), 1),
                      unref(tasksStore).scanning[p.id] ? (openBlock(), createElementBlock("span", _hoisted_19)) : createCommentVNode("", true)
                    ])
                  ]),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(visibleDates.value, (date) => {
                    return openBlock(), createElementBlock("td", {
                      key: date,
                      class: normalizeClass(["px-3 py-3 border-r border-slate-200 last:border-r-0 align-top min-h-[6rem]", (viewMode.value === "daily" ? date === visibleDates.value[visibleDates.value.length - 1] : date === anchorStr.value) ? "bg-indigo-50/30" : ""])
                    }, [
                      createBaseVNode("div", _hoisted_20, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(tasksOnDate(p.id, date), (task) => {
                          return openBlock(), createElementBlock("div", {
                            key: task.id,
                            class: "flex items-start gap-1.5"
                          }, [
                            (openBlock(), createElementBlock("svg", _hoisted_21, [
                              task.isChecked ? (openBlock(), createElementBlock("path", _hoisted_22)) : (openBlock(), createElementBlock("circle", _hoisted_23))
                            ])),
                            createBaseVNode("span", {
                              class: normalizeClass(["leading-relaxed", task.isChecked ? "line-through text-slate-300" : "text-slate-600"])
                            }, toDisplayString(strip(task.rawText)), 3)
                          ]);
                        }), 128)),
                        (openBlock(true), createElementBlock(Fragment, null, renderList(getEntries(p.id, date), (e, i) => {
                          return openBlock(), createElementBlock("div", {
                            key: "fe-" + i,
                            class: normalizeClass(["flex items-start gap-1.5 group cursor-grab active:cursor-grabbing select-none rounded transition-colors", dragOverKey.value === `${p.id}:${date}:${i}` ? "bg-slate-100" : ""]),
                            draggable: "true",
                            onDragstart: ($event) => onDragStart(p.id, date, i),
                            onDragover: ($event) => onDragOver($event, p.id, date, i),
                            onDrop: ($event) => onDrop(p.id, date, i),
                            onDragend: _cache[5] || (_cache[5] = ($event) => {
                              dragSrc.value = null;
                              dragOverKey.value = null;
                            })
                          }, [
                            _cache[17] || (_cache[17] = createBaseVNode("span", { class: "text-slate-500 text-base mt-0.5 flex-shrink-0 cursor-grab leading-none" }, "⠿", -1)),
                            createBaseVNode("span", {
                              class: normalizeClass(["leading-relaxed text-slate-600 flex-1 whitespace-pre-wrap", editingRef.value?.projectId === p.id && editingRef.value?.date === date && editingRef.value?.idx === i ? "text-slate-300" : ""])
                            }, toDisplayString(e), 3),
                            createBaseVNode("button", {
                              class: "text-slate-500 hover:text-slate-800 text-[10px] flex-shrink-0 px-1 transition-colors",
                              onClick: withModifiers(($event) => startEdit(p.id, date, i, e), ["stop"])
                            }, "✎", 8, _hoisted_25),
                            confirmDelete.value?.projectId === p.id && confirmDelete.value?.date === date && confirmDelete.value?.idx === i ? (openBlock(), createElementBlock("span", _hoisted_26, [
                              createBaseVNode("button", {
                                class: "text-[10px] text-white bg-red-500 hover:bg-red-600 rounded px-1.5 py-0.5 transition-colors",
                                onClick: withModifiers(($event) => {
                                  removeEntry(p.id, date, i);
                                  confirmDelete.value = null;
                                }, ["stop"])
                              }, "ลบ", 8, _hoisted_27),
                              createBaseVNode("button", {
                                class: "text-[10px] text-slate-500 hover:text-slate-700 transition-colors",
                                onClick: _cache[4] || (_cache[4] = withModifiers(($event) => confirmDelete.value = null, ["stop"]))
                              }, "ยกเลิก")
                            ])) : (openBlock(), createElementBlock("button", {
                              key: 1,
                              class: "text-slate-500 hover:text-red-500 text-[10px] flex-shrink-0 transition-colors",
                              onClick: withModifiers(($event) => confirmDelete.value = { projectId: p.id, date, idx: i }, ["stop"])
                            }, "✕", 8, _hoisted_28))
                          ], 42, _hoisted_24);
                        }), 128)),
                        !tasksOnDate(p.id, date).length && !getEntries(p.id, date).length ? (openBlock(), createElementBlock("span", _hoisted_29, "—")) : createCommentVNode("", true)
                      ])
                    ], 2);
                  }), 128))
                ]);
              }), 128)),
              createBaseVNode("tr", _hoisted_30, [
                _cache[19] || (_cache[19] = createBaseVNode("td", { class: "px-4 py-3 border-r border-slate-200 align-top" }, [
                  createBaseVNode("span", { class: "font-semibold text-slate-500" }, "บันทึก")
                ], -1)),
                (openBlock(true), createElementBlock(Fragment, null, renderList(visibleDates.value, (date) => {
                  return openBlock(), createElementBlock("td", {
                    key: date,
                    class: normalizeClass(["px-3 py-3 border-r border-slate-200 last:border-r-0 align-top", (viewMode.value === "daily" ? date === visibleDates.value[visibleDates.value.length - 1] : date === anchorStr.value) ? "bg-indigo-50/30" : ""])
                  }, [
                    createBaseVNode("div", _hoisted_31, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(getEntries("__note__", date), (e, i) => {
                        return openBlock(), createElementBlock("div", {
                          key: "n-" + i,
                          class: normalizeClass(["flex items-start gap-1.5 group cursor-grab active:cursor-grabbing select-none rounded transition-colors", dragOverKey.value === `__note__:${date}:${i}` ? "bg-slate-100" : ""]),
                          draggable: "true",
                          onDragstart: ($event) => onDragStart("__note__", date, i),
                          onDragover: ($event) => onDragOver($event, "__note__", date, i),
                          onDrop: ($event) => onDrop("__note__", date, i),
                          onDragend: _cache[7] || (_cache[7] = ($event) => {
                            dragSrc.value = null;
                            dragOverKey.value = null;
                          })
                        }, [
                          _cache[18] || (_cache[18] = createBaseVNode("span", { class: "text-slate-500 text-base mt-0.5 flex-shrink-0 cursor-grab leading-none" }, "⠿", -1)),
                          createBaseVNode("span", {
                            class: normalizeClass(["leading-relaxed text-slate-600 flex-1 whitespace-pre-wrap", editingRef.value?.projectId === "__note__" && editingRef.value?.date === date && editingRef.value?.idx === i ? "text-slate-300" : ""])
                          }, toDisplayString(e), 3),
                          createBaseVNode("button", {
                            class: "text-slate-500 hover:text-slate-800 text-[10px] flex-shrink-0 px-1 transition-colors",
                            onClick: withModifiers(($event) => startEdit("__note__", date, i, e), ["stop"])
                          }, "✎", 8, _hoisted_33),
                          confirmDelete.value?.projectId === "__note__" && confirmDelete.value?.date === date && confirmDelete.value?.idx === i ? (openBlock(), createElementBlock("span", _hoisted_34, [
                            createBaseVNode("button", {
                              class: "text-[10px] text-white bg-red-500 hover:bg-red-600 rounded px-1.5 py-0.5 transition-colors",
                              onClick: withModifiers(($event) => {
                                removeEntry("__note__", date, i);
                                confirmDelete.value = null;
                              }, ["stop"])
                            }, "ลบ", 8, _hoisted_35),
                            createBaseVNode("button", {
                              class: "text-[10px] text-slate-500 hover:text-slate-700 transition-colors",
                              onClick: _cache[6] || (_cache[6] = withModifiers(($event) => confirmDelete.value = null, ["stop"]))
                            }, "ยกเลิก")
                          ])) : (openBlock(), createElementBlock("button", {
                            key: 1,
                            class: "text-slate-500 hover:text-red-500 text-[10px] flex-shrink-0 transition-colors",
                            onClick: withModifiers(($event) => confirmDelete.value = { projectId: "__note__", date, idx: i }, ["stop"])
                          }, "✕", 8, _hoisted_36))
                        ], 42, _hoisted_32);
                      }), 128)),
                      !getEntries("__note__", date).length ? (openBlock(), createElementBlock("span", _hoisted_37, "—")) : createCommentVNode("", true)
                    ])
                  ], 2);
                }), 128))
              ])
            ])
          ])
        ])),
        projects.value.length ? (openBlock(), createElementBlock("div", {
          key: 3,
          class: "relative border-t border-slate-200 bg-white px-5 py-3 flex items-start gap-2 flex-shrink-0",
          style: normalizeStyle({ height: inputBarHeight.value + "px" })
        }, [
          createBaseVNode("div", {
            class: "absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-indigo-100 transition-colors",
            onMousedown: withModifiers(startResize, ["prevent"])
          }, null, 32),
          withDirectives(createBaseVNode("select", {
            "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => inputProjectId.value = $event),
            class: "text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-[120px]"
          }, [
            _cache[20] || (_cache[20] = createBaseVNode("option", {
              value: "",
              disabled: ""
            }, "เลือก project", -1)),
            (openBlock(true), createElementBlock(Fragment, null, renderList(projects.value, (p) => {
              return openBlock(), createElementBlock("option", {
                key: p.id,
                value: p.id
              }, toDisplayString(p.name), 9, _hoisted_38);
            }), 128)),
            _cache[21] || (_cache[21] = createBaseVNode("option", { value: "__note__" }, "บันทึก", -1))
          ], 512), [
            [vModelSelect, inputProjectId.value]
          ]),
          withDirectives(createBaseVNode("input", {
            type: "date",
            "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => inputDate.value = $event),
            class: "text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
          }, null, 512), [
            [vModelText, inputDate.value]
          ]),
          withDirectives(createBaseVNode("textarea", {
            "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => inputText.value = $event),
            placeholder: "รายละเอียด…",
            class: "flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none leading-relaxed self-stretch",
            onKeydown: withKeys(withModifiers(addEntry, ["exact", "prevent"]), ["enter"])
          }, null, 40, _hoisted_39), [
            [vModelText, inputText.value]
          ]),
          editingRef.value ? (openBlock(), createElementBlock("button", {
            key: 0,
            class: "text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all",
            onClick: _cache[11] || (_cache[11] = ($event) => {
              inputText.value = "";
              editingRef.value = null;
            })
          }, "ยกเลิก")) : createCommentVNode("", true),
          createBaseVNode("button", {
            class: normalizeClass(["text-xs font-medium px-4 py-2 rounded-lg transition-all", inputText.value.trim() && inputProjectId.value ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-300 cursor-not-allowed"]),
            disabled: !inputText.value.trim() || !inputProjectId.value,
            onClick: addEntry
          }, toDisplayString(editingRef.value ? "บันทึก" : "เพิ่ม"), 11, _hoisted_40)
        ], 4)) : createCommentVNode("", true)
      ]);
    };
  }
});
export {
  _sfc_main as default
};
