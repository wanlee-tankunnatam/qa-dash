import { d as defineComponent, b as openBlock, c as createElementBlock, e as createBaseVNode, F as Fragment, j as renderList, t as toDisplayString, o as onMounted, z as unref, g as createBlock, h as createVNode, s as createCommentVNode, G as useRouter, r as ref } from "./index-DKW7vBme.js";
import { u as useDraftStore } from "./draft-B0amErFC.js";
import { _ as _sfc_main$3 } from "./LoadingSpinner.vue_vue_type_script_setup_true_lang-DLc3VGCp.js";
import { _ as _sfc_main$2 } from "./ErrorMessage.vue_vue_type_script_setup_true_lang-BncxwQo5.js";
const _hoisted_1$1 = { class: "space-y-4" };
const _hoisted_2$1 = ["value"];
const _hoisted_3$1 = ["value"];
const _hoisted_4$1 = ["value"];
const _hoisted_5 = { class: "flex flex-wrap gap-2" };
const _hoisted_6 = { class: "pt-2" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "DraftForm",
  props: {
    draft: {}
  },
  emits: ["update", "copy"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", null, [
          _cache[4] || (_cache[4] = createBaseVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Summary", -1)),
          createBaseVNode("input", {
            value: __props.draft.summary,
            type: "text",
            class: "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
            onInput: _cache[0] || (_cache[0] = ($event) => emit("update", "summary", $event.target.value))
          }, null, 40, _hoisted_2$1)
        ]),
        createBaseVNode("div", null, [
          _cache[5] || (_cache[5] = createBaseVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Description", -1)),
          createBaseVNode("textarea", {
            value: __props.draft.description,
            rows: "6",
            class: "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y",
            onInput: _cache[1] || (_cache[1] = ($event) => emit("update", "description", $event.target.value))
          }, null, 40, _hoisted_3$1)
        ]),
        createBaseVNode("div", null, [
          _cache[7] || (_cache[7] = createBaseVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Priority", -1)),
          createBaseVNode("select", {
            value: __props.draft.suggestedPriority,
            class: "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
            onChange: _cache[2] || (_cache[2] = ($event) => emit("update", "suggestedPriority", $event.target.value))
          }, [..._cache[6] || (_cache[6] = [
            createBaseVNode("option", null, "Blocker", -1),
            createBaseVNode("option", null, "Critical", -1),
            createBaseVNode("option", null, "Major", -1),
            createBaseVNode("option", null, "Minor", -1),
            createBaseVNode("option", null, "Trivial", -1)
          ])], 40, _hoisted_4$1)
        ]),
        createBaseVNode("div", null, [
          _cache[8] || (_cache[8] = createBaseVNode("label", { class: "block text-sm font-medium text-gray-700 mb-1" }, "Labels", -1)),
          createBaseVNode("div", _hoisted_5, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.draft.suggestedLabels, (label) => {
              return openBlock(), createElementBlock("span", {
                key: label,
                class: "inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs text-blue-700"
              }, toDisplayString(label), 1);
            }), 128))
          ])
        ]),
        createBaseVNode("div", _hoisted_6, [
          createBaseVNode("button", {
            class: "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors",
            onClick: _cache[3] || (_cache[3] = ($event) => emit("copy"))
          }, " Copy to Clipboard (Jira-compatible JSON) ")
        ])
      ]);
    };
  }
});
const _hoisted_1 = { class: "flex flex-col h-full overflow-auto p-6" };
const _hoisted_2 = { class: "flex items-center gap-4 mb-6" };
const _hoisted_3 = {
  key: 2,
  class: "max-w-2xl"
};
const _hoisted_4 = {
  key: 0,
  class: "mt-3 text-sm text-green-600"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DraftReviewPage",
  setup(__props) {
    const router = useRouter();
    const draftStore = useDraftStore();
    const copied = ref(false);
    function handleUpdate(field, value) {
      draftStore.updateField(field, value);
    }
    async function handleCopy() {
      if (!draftStore.current) return;
      const payload = {
        summary: draftStore.current.summary,
        description: draftStore.current.description,
        priority: { name: draftStore.current.suggestedPriority },
        labels: draftStore.current.suggestedLabels
      };
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      copied.value = true;
      setTimeout(() => copied.value = false, 2e3);
    }
    onMounted(() => {
      if (!draftStore.current && !draftStore.loading) {
        router.replace("/");
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("button", {
            class: "text-sm text-gray-500 hover:text-gray-700",
            onClick: _cache[0] || (_cache[0] = ($event) => unref(router).back())
          }, " ← Back "),
          _cache[1] || (_cache[1] = createBaseVNode("h1", { class: "text-xl font-bold text-gray-800" }, "Draft Review", -1))
        ]),
        unref(draftStore).loading ? (openBlock(), createBlock(_sfc_main$3, {
          key: 0,
          size: "lg",
          class: "mx-auto mt-12"
        })) : unref(draftStore).error ? (openBlock(), createBlock(_sfc_main$2, {
          key: 1,
          message: unref(draftStore).error
        }, null, 8, ["message"])) : unref(draftStore).current ? (openBlock(), createElementBlock("div", _hoisted_3, [
          createVNode(_sfc_main$1, {
            draft: unref(draftStore).current,
            onUpdate: handleUpdate,
            onCopy: handleCopy
          }, null, 8, ["draft"]),
          copied.value ? (openBlock(), createElementBlock("p", _hoisted_4, "Copied to clipboard!")) : createCommentVNode("", true)
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
export {
  _sfc_main as default
};
