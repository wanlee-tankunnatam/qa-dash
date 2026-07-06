import { d as defineComponent, o as onMounted, b as openBlock, c as createElementBlock, e as createBaseVNode, m as withDirectives, p as vModelText, s as createCommentVNode, t as toDisplayString, F as Fragment, j as renderList, q as withKeys, n as normalizeClass, r as ref, x as computed, I as nextTick } from "./index-DKW7vBme.js";
const _hoisted_1 = { class: "flex flex-col h-full bg-slate-50" };
const _hoisted_2 = { class: "px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between" };
const _hoisted_3 = { class: "flex-1 overflow-auto p-6" };
const _hoisted_4 = {
  key: 0,
  class: "mb-4"
};
const _hoisted_5 = {
  key: 1,
  class: "flex flex-col items-center justify-center mt-20 gap-2 text-center"
};
const _hoisted_6 = {
  key: 2,
  class: "text-center mt-16 text-sm text-slate-400"
};
const _hoisted_7 = {
  key: 3,
  class: "grid grid-cols-2 gap-3"
};
const _hoisted_8 = { class: "flex items-start justify-between gap-2" };
const _hoisted_9 = { class: "flex items-center gap-2.5 min-w-0" };
const _hoisted_10 = { class: "w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 text-xs font-bold" };
const _hoisted_11 = { class: "min-w-0" };
const _hoisted_12 = { class: "text-sm font-semibold text-slate-700 truncate" };
const _hoisted_13 = ["onClick"];
const _hoisted_14 = { class: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" };
const _hoisted_15 = ["onClick"];
const _hoisted_16 = ["onClick"];
const _hoisted_17 = ["onClick"];
const _hoisted_18 = { class: "flex flex-col gap-1 border-t border-slate-50 pt-2" };
const _hoisted_19 = {
  key: 0,
  class: "grid items-center gap-x-1",
  style: { "grid-template-columns": "2.5rem auto 1fr" }
};
const _hoisted_20 = ["onClick"];
const _hoisted_21 = {
  key: 0,
  class: "text-[10px]"
};
const _hoisted_22 = {
  key: 1,
  class: "w-3 h-3",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_23 = { class: "text-xs text-slate-600 font-mono truncate" };
const _hoisted_24 = {
  class: "grid items-center gap-x-1",
  style: { "grid-template-columns": "2.5rem auto 1fr" }
};
const _hoisted_25 = ["onClick"];
const _hoisted_26 = {
  key: 0,
  class: "text-[10px]"
};
const _hoisted_27 = {
  key: 1,
  class: "w-3 h-3",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_28 = { class: "text-xs text-slate-600 font-mono truncate" };
const _hoisted_29 = {
  class: "grid items-center gap-x-1",
  style: { "grid-template-columns": "2.5rem auto 1fr" }
};
const _hoisted_30 = ["onClick"];
const _hoisted_31 = {
  key: 0,
  class: "text-[10px]"
};
const _hoisted_32 = {
  key: 1,
  class: "w-3 h-3",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_33 = {
  key: 1,
  class: "w-5 h-5"
};
const _hoisted_34 = {
  key: 2,
  class: "text-xs text-slate-300 font-mono tracking-widest"
};
const _hoisted_35 = {
  key: 3,
  class: "text-xs text-slate-200"
};
const _hoisted_36 = {
  key: 1,
  class: "grid items-center gap-x-1",
  style: { "grid-template-columns": "2.5rem auto 1fr" }
};
const _hoisted_37 = ["onClick"];
const _hoisted_38 = {
  key: 0,
  class: "text-[10px]"
};
const _hoisted_39 = {
  key: 1,
  class: "w-3 h-3",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_40 = {
  key: 2,
  class: "grid items-center gap-x-1",
  style: { "grid-template-columns": "2.5rem auto 1fr" }
};
const _hoisted_41 = ["onClick"];
const _hoisted_42 = {
  key: 0,
  class: "text-[10px]"
};
const _hoisted_43 = {
  key: 1,
  class: "w-3 h-3",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_44 = { class: "text-xs text-slate-600 font-mono truncate" };
const _hoisted_45 = {
  key: 3,
  class: "grid items-center gap-x-1",
  style: { "grid-template-columns": "2.5rem auto 1fr" }
};
const _hoisted_46 = ["onClick"];
const _hoisted_47 = {
  key: 0,
  class: "text-[10px]"
};
const _hoisted_48 = {
  key: 1,
  class: "w-3 h-3",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_49 = {
  key: 0,
  class: "border-t border-slate-200 bg-white px-5 py-3 flex-shrink-0"
};
const _hoisted_50 = { class: "border border-slate-200 rounded-lg overflow-hidden" };
const _hoisted_51 = { class: "flex items-center border-b border-slate-200" };
const _hoisted_52 = { class: "flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 flex-1" };
const _hoisted_53 = { class: "flex items-center gap-1.5 px-3 py-2 flex-1" };
const _hoisted_54 = { class: "flex items-center border-b border-slate-200" };
const _hoisted_55 = { class: "flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 flex-1" };
const _hoisted_56 = { class: "flex items-center gap-1.5 px-3 py-2 flex-1" };
const _hoisted_57 = { class: "flex items-center border-b border-slate-200" };
const _hoisted_58 = { class: "flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 flex-1" };
const _hoisted_59 = ["placeholder"];
const _hoisted_60 = { class: "flex items-center gap-1.5 px-3 py-2 flex-1" };
const _hoisted_61 = ["placeholder"];
const _hoisted_62 = { class: "flex items-center" };
const _hoisted_63 = { class: "flex items-center gap-1.5 px-3 py-2 border-r border-slate-200 flex-1" };
const _hoisted_64 = { class: "flex items-center gap-1.5 px-3 py-2 flex-1" };
const _hoisted_65 = ["placeholder"];
const _hoisted_66 = { class: "flex gap-2 mt-2" };
const _hoisted_67 = ["disabled"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CredentialsPage",
  setup(__props) {
    const credList = ref([]);
    const form = ref(null);
    const query = ref("");
    const copied = ref({});
    const copiedAll = ref(null);
    async function copyText(id, field, text) {
      await navigator.clipboard.writeText(text ?? "");
      copied.value = { ...copied.value, [id]: field };
      setTimeout(() => {
        const r = { ...copied.value };
        delete r[id];
        copied.value = r;
      }, 1500);
    }
    async function copyPass(c) {
      const pass = await window.qaApi.getCredentialPassword(c.id);
      if (!pass) return;
      await copyText(c.id, "pass", pass);
    }
    async function copyToken(c) {
      const token = await window.qaApi.getCredentialToken(c.id);
      if (!token) return;
      await copyText(c.id, "token", token);
    }
    async function copyAll(c) {
      const lines = [];
      lines.push(`service: ${c.service}`);
      if (c.url) lines.push(`url: ${c.url}`);
      if (c.email) lines.push(`email: ${c.email}`);
      lines.push(`user: ${c.username}`);
      if (c.hasPassword) {
        const pw = await window.qaApi.getCredentialPassword(c.id);
        if (pw) lines.push(`pass: ${pw}`);
      }
      if (c.hasToken) {
        const tk = await window.qaApi.getCredentialToken(c.id);
        if (tk) lines.push(`token: ${tk}`);
      }
      if (c.clientId) lines.push(`id: ${c.clientId}`);
      if (c.hasSecret) {
        const sc = await window.qaApi.getCredentialSecret(c.id);
        if (sc) lines.push(`secret: ${sc}`);
      }
      await navigator.clipboard.writeText(lines.join("\n"));
      copiedAll.value = c.id;
      setTimeout(() => {
        copiedAll.value = null;
      }, 2e3);
    }
    async function copySecret(c) {
      const secret = await window.qaApi.getCredentialSecret(c.id);
      if (!secret) return;
      await copyText(c.id, "secret", secret);
    }
    const serviceInput = ref(null);
    const urlInput = ref(null);
    const usernameInput = ref(null);
    const emailInput = ref(null);
    const passwordInput = ref(null);
    const tokenInput = ref(null);
    const clientIdInput = ref(null);
    const secretInput = ref(null);
    const filtered = computed(() => {
      const list = [...credList.value].reverse();
      if (!query.value.trim()) return list;
      const q = query.value.toLowerCase();
      return list.filter(
        (c) => c.service.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)
      );
    });
    async function load() {
      credList.value = await window.qaApi.listCredentials();
    }
    function focusNext(field) {
      nextTick(() => {
        if (field === "url") urlInput.value?.focus();
        else if (field === "username") usernameInput.value?.focus();
        else if (field === "email") emailInput.value?.focus();
        else if (field === "password") passwordInput.value?.focus();
        else if (field === "token") tokenInput.value?.focus();
        else if (field === "clientId") clientIdInput.value?.focus();
        else secretInput.value?.focus();
      });
    }
    async function openForm(existing) {
      if (existing) {
        form.value = { ...existing, password: "", token: "", secret: "", isNew: false };
      } else {
        form.value = { id: crypto.randomUUID(), service: "", username: "", password: "", token: "", secret: "", isNew: true };
      }
      await nextTick();
      serviceInput.value?.focus();
    }
    async function save() {
      if (!form.value) return;
      const { password, token, secret, isNew: _, ...entry } = form.value;
      entry.hasPassword = form.value.isNew ? !!password : entry.hasPassword || !!password;
      entry.hasToken = form.value.isNew ? !!token : entry.hasToken || !!token;
      entry.hasSecret = form.value.isNew ? !!secret : entry.hasSecret || !!secret;
      await window.qaApi.upsertCredential(entry, password, token, secret);
      await load();
      form.value = null;
    }
    async function deleteCred(id) {
      await window.qaApi.deleteCredential2(id);
      await load();
    }
    onMounted(load);
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[26] || (_cache[26] = createBaseVNode("div", null, [
            createBaseVNode("h1", { class: "text-base font-semibold text-slate-800" }, "Credentials"),
            createBaseVNode("p", { class: "text-xs text-slate-400 mt-0.5" }, "เก็บ username/password ของ service ต่างๆ ไว้ใน macOS Keychain")
          ], -1)),
          createBaseVNode("button", {
            class: "text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors",
            onClick: _cache[0] || (_cache[0] = ($event) => openForm())
          }, "+ เพิ่ม")
        ]),
        createBaseVNode("div", _hoisted_3, [
          credList.value.length || query.value ? (openBlock(), createElementBlock("div", _hoisted_4, [
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => query.value = $event),
              type: "text",
              placeholder: "ค้นหา service หรือ username…",
              class: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            }, null, 512), [
              [vModelText, query.value]
            ])
          ])) : createCommentVNode("", true),
          !credList.value.length && !form.value ? (openBlock(), createElementBlock("div", _hoisted_5, [..._cache[27] || (_cache[27] = [
            createBaseVNode("svg", {
              class: "w-10 h-10 text-slate-200",
              viewBox: "0 0 24 24",
              fill: "currentColor"
            }, [
              createBaseVNode("path", {
                "fill-rule": "evenodd",
                d: "M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z",
                "clip-rule": "evenodd"
              })
            ], -1),
            createBaseVNode("p", { class: "text-sm font-medium text-slate-500" }, "ยังไม่มี credential", -1),
            createBaseVNode("p", { class: "text-xs text-slate-400" }, "กด + เพิ่ม เพื่อเพิ่ม service แรก", -1)
          ])])) : query.value && !filtered.value.length ? (openBlock(), createElementBlock("div", _hoisted_6, ' ไม่พบ "' + toDisplayString(query.value) + '" ', 1)) : createCommentVNode("", true),
          filtered.value.length ? (openBlock(), createElementBlock("div", _hoisted_7, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(filtered.value, (c) => {
              return openBlock(), createElementBlock("div", {
                key: c.id,
                class: "bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 group hover:shadow-sm transition-shadow"
              }, [
                createBaseVNode("div", _hoisted_8, [
                  createBaseVNode("div", _hoisted_9, [
                    createBaseVNode("div", _hoisted_10, toDisplayString(c.service.slice(0, 2).toUpperCase()), 1),
                    createBaseVNode("div", _hoisted_11, [
                      createBaseVNode("p", _hoisted_12, toDisplayString(c.service), 1),
                      c.url ? (openBlock(), createElementBlock("a", {
                        key: 0,
                        class: "text-xs text-indigo-400 hover:text-indigo-600 hover:underline truncate cursor-pointer block",
                        onClick: ($event) => _ctx.window.qaApi.openExternal(c.url)
                      }, toDisplayString(c.url), 9, _hoisted_13)) : createCommentVNode("", true)
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_14, [
                    createBaseVNode("button", {
                      class: "text-xs text-slate-400 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 transition-colors",
                      onClick: ($event) => openForm(c)
                    }, "แก้ไข", 8, _hoisted_15),
                    createBaseVNode("button", {
                      class: normalizeClass(["text-xs px-2 py-1 rounded transition-colors", copiedAll.value === c.id ? "text-emerald-500 bg-emerald-50" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"]),
                      onClick: ($event) => copyAll(c)
                    }, toDisplayString(copiedAll.value === c.id ? "✓ copied" : "copy all"), 11, _hoisted_16),
                    createBaseVNode("button", {
                      class: "text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors",
                      onClick: ($event) => deleteCred(c.id)
                    }, "ลบ", 8, _hoisted_17)
                  ])
                ]),
                createBaseVNode("div", _hoisted_18, [
                  c.email ? (openBlock(), createElementBlock("div", _hoisted_19, [
                    _cache[29] || (_cache[29] = createBaseVNode("span", { class: "text-xs text-slate-400" }, "email:", -1)),
                    createBaseVNode("button", {
                      class: normalizeClass(["w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors", copied.value[c.id] === "email" ? "text-emerald-500" : "text-slate-300 hover:text-slate-500"]),
                      onClick: ($event) => copyText(c.id, "email", c.email)
                    }, [
                      copied.value[c.id] === "email" ? (openBlock(), createElementBlock("span", _hoisted_21, "✓")) : (openBlock(), createElementBlock("svg", _hoisted_22, [..._cache[28] || (_cache[28] = [
                        createBaseVNode("path", { d: "M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" }, null, -1),
                        createBaseVNode("path", { d: "M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z" }, null, -1)
                      ])]))
                    ], 10, _hoisted_20),
                    createBaseVNode("span", _hoisted_23, toDisplayString(c.email), 1)
                  ])) : createCommentVNode("", true),
                  createBaseVNode("div", _hoisted_24, [
                    _cache[31] || (_cache[31] = createBaseVNode("span", { class: "text-xs text-slate-400" }, "user:", -1)),
                    createBaseVNode("button", {
                      class: normalizeClass(["w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors", copied.value[c.id] === "user" ? "text-emerald-500" : "text-slate-300 hover:text-slate-500"]),
                      onClick: ($event) => copyText(c.id, "user", c.username)
                    }, [
                      copied.value[c.id] === "user" ? (openBlock(), createElementBlock("span", _hoisted_26, "✓")) : (openBlock(), createElementBlock("svg", _hoisted_27, [..._cache[30] || (_cache[30] = [
                        createBaseVNode("path", { d: "M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" }, null, -1),
                        createBaseVNode("path", { d: "M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z" }, null, -1)
                      ])]))
                    ], 10, _hoisted_25),
                    createBaseVNode("span", _hoisted_28, toDisplayString(c.username), 1)
                  ]),
                  createBaseVNode("div", _hoisted_29, [
                    _cache[33] || (_cache[33] = createBaseVNode("span", { class: "text-xs text-slate-400" }, "pass:", -1)),
                    c.hasPassword ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      class: normalizeClass(["w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors", copied.value[c.id] === "pass" ? "text-emerald-500" : "text-slate-300 hover:text-slate-500"]),
                      onClick: ($event) => copyPass(c)
                    }, [
                      copied.value[c.id] === "pass" ? (openBlock(), createElementBlock("span", _hoisted_31, "✓")) : (openBlock(), createElementBlock("svg", _hoisted_32, [..._cache[32] || (_cache[32] = [
                        createBaseVNode("path", { d: "M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" }, null, -1),
                        createBaseVNode("path", { d: "M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z" }, null, -1)
                      ])]))
                    ], 10, _hoisted_30)) : (openBlock(), createElementBlock("div", _hoisted_33)),
                    c.hasPassword ? (openBlock(), createElementBlock("span", _hoisted_34, "••••••")) : (openBlock(), createElementBlock("span", _hoisted_35, "—"))
                  ]),
                  c.hasToken ? (openBlock(), createElementBlock("div", _hoisted_36, [
                    _cache[35] || (_cache[35] = createBaseVNode("span", { class: "text-xs text-slate-400" }, "token:", -1)),
                    createBaseVNode("button", {
                      class: normalizeClass(["w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors", copied.value[c.id] === "token" ? "text-emerald-500" : "text-slate-300 hover:text-slate-500"]),
                      onClick: ($event) => copyToken(c)
                    }, [
                      copied.value[c.id] === "token" ? (openBlock(), createElementBlock("span", _hoisted_38, "✓")) : (openBlock(), createElementBlock("svg", _hoisted_39, [..._cache[34] || (_cache[34] = [
                        createBaseVNode("path", { d: "M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" }, null, -1),
                        createBaseVNode("path", { d: "M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z" }, null, -1)
                      ])]))
                    ], 10, _hoisted_37),
                    _cache[36] || (_cache[36] = createBaseVNode("span", { class: "text-xs text-slate-300 font-mono tracking-widest" }, "••••••", -1))
                  ])) : createCommentVNode("", true),
                  c.clientId ? (openBlock(), createElementBlock("div", _hoisted_40, [
                    _cache[38] || (_cache[38] = createBaseVNode("span", { class: "text-xs text-slate-400" }, "id:", -1)),
                    createBaseVNode("button", {
                      class: normalizeClass(["w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors", copied.value[c.id] === "clientId" ? "text-emerald-500" : "text-slate-300 hover:text-slate-500"]),
                      onClick: ($event) => copyText(c.id, "clientId", c.clientId)
                    }, [
                      copied.value[c.id] === "clientId" ? (openBlock(), createElementBlock("span", _hoisted_42, "✓")) : (openBlock(), createElementBlock("svg", _hoisted_43, [..._cache[37] || (_cache[37] = [
                        createBaseVNode("path", { d: "M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" }, null, -1),
                        createBaseVNode("path", { d: "M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z" }, null, -1)
                      ])]))
                    ], 10, _hoisted_41),
                    createBaseVNode("span", _hoisted_44, toDisplayString(c.clientId), 1)
                  ])) : createCommentVNode("", true),
                  c.hasSecret ? (openBlock(), createElementBlock("div", _hoisted_45, [
                    _cache[40] || (_cache[40] = createBaseVNode("span", { class: "text-xs text-slate-400" }, "secret:", -1)),
                    createBaseVNode("button", {
                      class: normalizeClass(["w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors", copied.value[c.id] === "secret" ? "text-emerald-500" : "text-slate-300 hover:text-slate-500"]),
                      onClick: ($event) => copySecret(c)
                    }, [
                      copied.value[c.id] === "secret" ? (openBlock(), createElementBlock("span", _hoisted_47, "✓")) : (openBlock(), createElementBlock("svg", _hoisted_48, [..._cache[39] || (_cache[39] = [
                        createBaseVNode("path", { d: "M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" }, null, -1),
                        createBaseVNode("path", { d: "M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1H2V6h1V5H2Z" }, null, -1)
                      ])]))
                    ], 10, _hoisted_46),
                    _cache[41] || (_cache[41] = createBaseVNode("span", { class: "text-xs text-slate-300 font-mono tracking-widest" }, "••••••", -1))
                  ])) : createCommentVNode("", true)
                ])
              ]);
            }), 128))
          ])) : createCommentVNode("", true)
        ]),
        form.value ? (openBlock(), createElementBlock("div", _hoisted_49, [
          createBaseVNode("div", _hoisted_50, [
            createBaseVNode("div", _hoisted_51, [
              createBaseVNode("div", _hoisted_52, [
                _cache[42] || (_cache[42] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono flex-shrink-0" }, "service:", -1)),
                withDirectives(createBaseVNode("input", {
                  ref_key: "serviceInput",
                  ref: serviceInput,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.value.service = $event),
                  type: "text",
                  placeholder: "GitLab…",
                  class: "flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300",
                  onKeydown: [
                    _cache[3] || (_cache[3] = withKeys(($event) => focusNext("url"), ["enter"])),
                    _cache[4] || (_cache[4] = withKeys(($event) => form.value = null, ["esc"]))
                  ]
                }, null, 544), [
                  [vModelText, form.value.service]
                ])
              ]),
              createBaseVNode("div", _hoisted_53, [
                _cache[43] || (_cache[43] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono flex-shrink-0" }, "url:", -1)),
                withDirectives(createBaseVNode("input", {
                  ref_key: "urlInput",
                  ref: urlInput,
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.value.url = $event),
                  type: "text",
                  placeholder: "https://…",
                  class: "flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300",
                  onKeydown: [
                    _cache[6] || (_cache[6] = withKeys(($event) => focusNext("username"), ["enter"])),
                    _cache[7] || (_cache[7] = withKeys(($event) => form.value = null, ["esc"]))
                  ]
                }, null, 544), [
                  [vModelText, form.value.url]
                ])
              ])
            ]),
            createBaseVNode("div", _hoisted_54, [
              createBaseVNode("div", _hoisted_55, [
                _cache[44] || (_cache[44] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono flex-shrink-0" }, "user:", -1)),
                withDirectives(createBaseVNode("input", {
                  ref_key: "usernameInput",
                  ref: usernameInput,
                  "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.value.username = $event),
                  type: "text",
                  placeholder: "username",
                  class: "flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300",
                  onKeydown: [
                    _cache[9] || (_cache[9] = withKeys(($event) => focusNext("email"), ["enter"])),
                    _cache[10] || (_cache[10] = withKeys(($event) => form.value = null, ["esc"]))
                  ]
                }, null, 544), [
                  [vModelText, form.value.username]
                ])
              ]),
              createBaseVNode("div", _hoisted_56, [
                _cache[45] || (_cache[45] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono flex-shrink-0" }, "email:", -1)),
                withDirectives(createBaseVNode("input", {
                  ref_key: "emailInput",
                  ref: emailInput,
                  "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.value.email = $event),
                  type: "email",
                  placeholder: "you@example.com",
                  class: "flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300",
                  onKeydown: [
                    _cache[12] || (_cache[12] = withKeys(($event) => focusNext("password"), ["enter"])),
                    _cache[13] || (_cache[13] = withKeys(($event) => form.value = null, ["esc"]))
                  ]
                }, null, 544), [
                  [vModelText, form.value.email]
                ])
              ])
            ]),
            createBaseVNode("div", _hoisted_57, [
              createBaseVNode("div", _hoisted_58, [
                _cache[46] || (_cache[46] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono flex-shrink-0" }, "pass:", -1)),
                withDirectives(createBaseVNode("input", {
                  ref_key: "passwordInput",
                  ref: passwordInput,
                  "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.value.password = $event),
                  type: "password",
                  placeholder: form.value.isNew ? "••••••••" : "เว้นว่างถ้าไม่เปลี่ยน",
                  class: "flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300",
                  onKeydown: [
                    _cache[15] || (_cache[15] = withKeys(($event) => focusNext("token"), ["enter"])),
                    _cache[16] || (_cache[16] = withKeys(($event) => form.value = null, ["esc"]))
                  ]
                }, null, 40, _hoisted_59), [
                  [vModelText, form.value.password]
                ])
              ]),
              createBaseVNode("div", _hoisted_60, [
                _cache[47] || (_cache[47] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono flex-shrink-0" }, "token:", -1)),
                withDirectives(createBaseVNode("input", {
                  ref_key: "tokenInput",
                  ref: tokenInput,
                  "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => form.value.token = $event),
                  type: "password",
                  placeholder: form.value.isNew ? "API token…" : "เว้นว่างถ้าไม่เปลี่ยน",
                  class: "flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300",
                  onKeydown: [
                    _cache[18] || (_cache[18] = withKeys(($event) => focusNext("clientId"), ["enter"])),
                    _cache[19] || (_cache[19] = withKeys(($event) => form.value = null, ["esc"]))
                  ]
                }, null, 40, _hoisted_61), [
                  [vModelText, form.value.token]
                ])
              ])
            ]),
            createBaseVNode("div", _hoisted_62, [
              createBaseVNode("div", _hoisted_63, [
                _cache[48] || (_cache[48] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono flex-shrink-0" }, "id:", -1)),
                withDirectives(createBaseVNode("input", {
                  ref_key: "clientIdInput",
                  ref: clientIdInput,
                  "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => form.value.clientId = $event),
                  type: "text",
                  placeholder: "client_id…",
                  class: "flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300",
                  onKeydown: [
                    _cache[21] || (_cache[21] = withKeys(($event) => focusNext("secret"), ["enter"])),
                    _cache[22] || (_cache[22] = withKeys(($event) => form.value = null, ["esc"]))
                  ]
                }, null, 544), [
                  [vModelText, form.value.clientId]
                ])
              ]),
              createBaseVNode("div", _hoisted_64, [
                _cache[49] || (_cache[49] = createBaseVNode("span", { class: "text-xs text-slate-400 font-mono flex-shrink-0" }, "secret:", -1)),
                withDirectives(createBaseVNode("input", {
                  ref_key: "secretInput",
                  ref: secretInput,
                  "onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => form.value.secret = $event),
                  type: "password",
                  placeholder: form.value.isNew ? "client_secret…" : "เว้นว่างถ้าไม่เปลี่ยน",
                  class: "flex-1 text-xs text-slate-700 bg-transparent focus:outline-none placeholder-slate-300",
                  onKeydown: [
                    withKeys(save, ["enter"]),
                    _cache[24] || (_cache[24] = withKeys(($event) => form.value = null, ["esc"]))
                  ]
                }, null, 40, _hoisted_65), [
                  [vModelText, form.value.secret]
                ])
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_66, [
            createBaseVNode("button", {
              class: normalizeClass(["text-xs font-medium px-3 py-1.5 rounded-lg transition-all", form.value.service && form.value.username ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-300 cursor-not-allowed"]),
              disabled: !form.value.service || !form.value.username,
              onClick: save
            }, "บันทึก", 10, _hoisted_67),
            createBaseVNode("button", {
              class: "text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50",
              onClick: _cache[25] || (_cache[25] = ($event) => form.value = null)
            }, "ยกเลิก")
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
export {
  _sfc_main as default
};
