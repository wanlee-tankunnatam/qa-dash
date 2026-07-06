import { d as defineComponent, b as openBlock, c as createElementBlock, e as createBaseVNode, t as toDisplayString, s as createCommentVNode } from "./index-DKW7vBme.js";
const _hoisted_1 = { class: "rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3" };
const _hoisted_2 = { class: "flex-1" };
const _hoisted_3 = { class: "text-sm text-red-700" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ErrorMessage",
  props: {
    message: {},
    retryable: { type: Boolean, default: false }
  },
  emits: ["retry"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[1] || (_cache[1] = createBaseVNode("span", { class: "text-red-500 mt-0.5" }, "!", -1)),
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("p", _hoisted_3, toDisplayString(__props.message), 1),
          __props.retryable ? (openBlock(), createElementBlock("button", {
            key: 0,
            class: "mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline",
            onClick: _cache[0] || (_cache[0] = ($event) => emit("retry"))
          }, " Retry ")) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
export {
  _sfc_main as _
};
