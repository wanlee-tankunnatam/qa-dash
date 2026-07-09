import { d as defineComponent, u as useProjectsStore, a as useTasksStore, B as useJiraStore, o as onMounted, H as onUnmounted, b as openBlock, c as createElementBlock, e as createBaseVNode, n as normalizeClass, f as createTextVNode, t as toDisplayString, s as createCommentVNode, F as Fragment, j as renderList, m as withDirectives, p as vModelText, q as withKeys, l as withModifiers, r as ref, I as nextTick } from "./index-Bq_91m8v.js";
const _hoisted_1 = { class: "flex flex-col h-full bg-white" };
const _hoisted_2 = { class: "flex items-center justify-between px-6 py-4 border-b border-slate-100" };
const _hoisted_3 = ["disabled"];
const _hoisted_4 = {
  key: 0,
  class: "flex items-center justify-center h-full"
};
const _hoisted_5 = {
  key: 0,
  class: "flex items-start gap-2 max-w-[80%]"
};
const _hoisted_6 = { class: "bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3" };
const _hoisted_7 = { class: "text-sm text-slate-700 whitespace-pre-wrap break-words font-sans leading-relaxed" };
const _hoisted_8 = {
  key: 0,
  class: "inline-block w-1.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle"
};
const _hoisted_9 = {
  key: 1,
  class: "max-w-[80%]"
};
const _hoisted_10 = { class: "bg-slate-800 text-white rounded-2xl rounded-tr-sm px-4 py-3" };
const _hoisted_11 = { class: "text-sm whitespace-pre-wrap break-words leading-relaxed" };
const _hoisted_12 = {
  key: 0,
  class: "mx-6 mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
};
const _hoisted_13 = { class: "px-6 pb-5 pt-2 border-t border-slate-100" };
const _hoisted_14 = {
  key: 0,
  class: "mb-2 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
};
const _hoisted_15 = ["src"];
const _hoisted_16 = {
  key: 1,
  class: "w-8 h-8 text-slate-400 flex-shrink-0",
  viewBox: "0 0 16 16",
  fill: "currentColor"
};
const _hoisted_17 = { class: "text-xs text-slate-500 flex-1 truncate" };
const _hoisted_18 = { class: "flex gap-2 items-end" };
const _hoisted_19 = ["onKeydown"];
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AITerminalPage",
  setup(__props) {
    const projectsStore = useProjectsStore();
    const tasksStore = useTasksStore();
    const jiraStore = useJiraStore();
    const messages = ref([]);
    const isStreaming = ref(false);
    const streamError = ref(null);
    const userPrompt = ref("");
    const chatRef = ref(null);
    const inputRef = ref(null);
    const attachedImage = ref("");
    const attachedImageName = ref("");
    const cleanups = [];
    function scrollToBottom() {
      nextTick(() => {
        if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight;
      });
    }
    function autoResize(e) {
      const el = e.target;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
    function pushAssistant() {
      messages.value.push({ role: "assistant", content: "" });
    }
    async function startMyDay() {
      if (isStreaming.value) return;
      streamError.value = null;
      isStreaming.value = true;
      pushAssistant();
      scrollToBottom();
      const context = {
        projects: projectsStore.projects,
        allScanResults: projectsStore.projects.map((p) => ({
          projectId: p.id,
          untracked: tasksStore.getUntracked(p.id),
          linked: tasksStore.getLinked(p.id)
        })),
        jiraTickets: Object.values(jiraStore.tickets),
        date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      };
      try {
        await window.qaApi.startMyDay(JSON.parse(JSON.stringify(context)));
      } catch (e) {
        streamError.value = e.message;
        isStreaming.value = false;
      }
    }
    function isImageFile(name) {
      return /\.(png|jpe?g|gif|webp|svg|bmp|tiff?)$/i.test(name);
    }
    function pickImage() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "*/*";
      input.style.display = "none";
      document.body.appendChild(input);
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          attachedImage.value = file.path;
          attachedImageName.value = file.name;
        }
        document.body.removeChild(input);
      };
      input.oncancel = () => document.body.removeChild(input);
      input.click();
    }
    async function sendPrompt() {
      const prompt = userPrompt.value.trim();
      const image = attachedImage.value;
      if (!prompt && !image) return;
      streamError.value = null;
      const displayContent = prompt + (image ? `
📎 ${attachedImageName.value}` : "");
      messages.value.push({ role: "user", content: displayContent });
      pushAssistant();
      userPrompt.value = "";
      attachedImage.value = "";
      attachedImageName.value = "";
      if (inputRef.value) {
        inputRef.value.style.height = "auto";
      }
      isStreaming.value = true;
      scrollToBottom();
      try {
        await window.qaApi.ask(prompt || `อ่านและอธิบายไฟล์นี้: ${image}`, image || void 0);
      } catch (e) {
        streamError.value = e.message;
        isStreaming.value = false;
      }
    }
    onMounted(() => {
      cleanups.push(window.qaApi.onStreamChunk((chunk) => {
        const last = messages.value[messages.value.length - 1];
        if (last?.role === "assistant") last.content += chunk;
        scrollToBottom();
      }));
      cleanups.push(window.qaApi.onStreamEnd(() => {
        isStreaming.value = false;
      }));
      cleanups.push(window.qaApi.onStreamError((msg) => {
        streamError.value = msg;
        isStreaming.value = false;
      }));
    });
    onUnmounted(() => {
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[3] || (_cache[3] = createBaseVNode("h1", { class: "text-base font-semibold text-slate-800" }, "AI Terminal", -1)),
          createBaseVNode("button", {
            class: normalizeClass(["inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all", isStreaming.value ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"]),
            disabled: isStreaming.value,
            onClick: startMyDay
          }, [
            (openBlock(), createElementBlock("svg", {
              class: normalizeClass(["w-3.5 h-3.5", isStreaming.value ? "animate-spin" : ""]),
              viewBox: "0 0 16 16",
              fill: "currentColor"
            }, [..._cache[2] || (_cache[2] = [
              createBaseVNode("path", { d: "M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1Z" }, null, -1),
              createBaseVNode("path", { d: "M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466Z" }, null, -1)
            ])], 2)),
            createTextVNode(" " + toDisplayString(isStreaming.value ? "กำลังคิด…" : "Start My Day"), 1)
          ], 10, _hoisted_3)
        ]),
        createBaseVNode("div", {
          ref_key: "chatRef",
          ref: chatRef,
          class: "flex-1 overflow-auto px-6 py-4 space-y-4"
        }, [
          messages.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_4, [..._cache[4] || (_cache[4] = [
            createBaseVNode("p", { class: "text-sm text-slate-400 italic" }, 'กด "Start My Day" หรือพิมคำถามด้านล่าง', -1)
          ])])) : createCommentVNode("", true),
          (openBlock(true), createElementBlock(Fragment, null, renderList(messages.value, (msg, i) => {
            return openBlock(), createElementBlock("div", {
              key: i,
              class: normalizeClass(["flex", msg.role === "user" ? "justify-end" : "justify-start"])
            }, [
              msg.role === "assistant" ? (openBlock(), createElementBlock("div", _hoisted_5, [
                _cache[5] || (_cache[5] = createBaseVNode("div", { class: "w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5" }, [
                  createBaseVNode("svg", {
                    class: "w-3.5 h-3.5 text-white",
                    viewBox: "0 0 16 16",
                    fill: "currentColor"
                  }, [
                    createBaseVNode("path", { d: "M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Zm1 0v8h10V3H3Zm1 2h1v1H4V5Zm3 0h5v1H7V5ZM4 8h1v1H4V8Zm3 0h3v1H7V8Z" })
                  ])
                ], -1)),
                createBaseVNode("div", _hoisted_6, [
                  createBaseVNode("pre", _hoisted_7, [
                    createTextVNode(toDisplayString(msg.content), 1),
                    isStreaming.value && i === messages.value.length - 1 ? (openBlock(), createElementBlock("span", _hoisted_8)) : createCommentVNode("", true)
                  ])
                ])
              ])) : (openBlock(), createElementBlock("div", _hoisted_9, [
                createBaseVNode("div", _hoisted_10, [
                  createBaseVNode("p", _hoisted_11, toDisplayString(msg.content), 1)
                ])
              ]))
            ], 2);
          }), 128))
        ], 512),
        streamError.value ? (openBlock(), createElementBlock("div", _hoisted_12, toDisplayString(streamError.value), 1)) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_13, [
          attachedImage.value ? (openBlock(), createElementBlock("div", _hoisted_14, [
            isImageFile(attachedImageName.value) ? (openBlock(), createElementBlock("img", {
              key: 0,
              src: `file://${attachedImage.value}`,
              class: "h-10 w-10 object-cover rounded flex-shrink-0"
            }, null, 8, _hoisted_15)) : (openBlock(), createElementBlock("svg", _hoisted_16, [..._cache[6] || (_cache[6] = [
              createBaseVNode("path", { d: "M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0H4Zm0 1h5v3.5A1.5 1.5 0 0 0 10.5 6H14v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z" }, null, -1)
            ])])),
            createBaseVNode("span", _hoisted_17, toDisplayString(attachedImageName.value), 1),
            createBaseVNode("button", {
              class: "text-slate-300 hover:text-slate-500 text-sm",
              onClick: _cache[0] || (_cache[0] = ($event) => {
                attachedImage.value = "";
                attachedImageName.value = "";
              })
            }, "✕")
          ])) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_18, [
            createBaseVNode("button", {
              class: "p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all flex-shrink-0",
              title: "แนบรูป",
              onClick: pickImage
            }, [..._cache[7] || (_cache[7] = [
              createBaseVNode("svg", {
                class: "w-4 h-4",
                viewBox: "0 0 16 16",
                fill: "currentColor"
              }, [
                createBaseVNode("path", { d: "M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" }),
                createBaseVNode("path", { d: "M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2ZM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1ZM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.25.25 0 0 1 .63-.062l2.66 2.773 1.71-1.71a.25.25 0 0 1 .338-.012l2.964 2.776V5a1 1 0 0 0-1-1h-9Z" })
              ], -1)
            ])]),
            withDirectives(createBaseVNode("textarea", {
              ref_key: "inputRef",
              ref: inputRef,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => userPrompt.value = $event),
              placeholder: "พิมคำถาม…",
              rows: "1",
              class: "flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none leading-relaxed",
              onKeydown: withKeys(withModifiers(sendPrompt, ["exact", "prevent"]), ["enter"]),
              onInput: autoResize
            }, null, 40, _hoisted_19), [
              [vModelText, userPrompt.value]
            ]),
            createBaseVNode("button", {
              class: "px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 bg-slate-800 hover:bg-slate-700 text-white",
              onClick: sendPrompt
            }, "Send")
          ]),
          _cache[8] || (_cache[8] = createBaseVNode("p", { class: "text-[10px] text-slate-300 mt-1.5 pl-1" }, "Enter ส่ง · Shift+Enter ขึ้นบรรทัดใหม่", -1))
        ])
      ]);
    };
  }
});
export {
  _sfc_main as default
};
