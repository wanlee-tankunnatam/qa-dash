import { d as defineComponent, b as openBlock, c as createElementBlock, n as normalizeClass, x as computed } from "./index-DKW7vBme.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LoadingSpinner",
  props: {
    size: { default: "md" }
  },
  setup(__props) {
    const props = __props;
    const sizeClass = computed(() => {
      const map = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-10 w-10"
      };
      return map[props.size];
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["animate-spin rounded-full border-2 border-gray-300 border-t-blue-600", sizeClass.value]),
        role: "status",
        "aria-label": "Loading"
      }, null, 2);
    };
  }
});
export {
  _sfc_main as _
};
