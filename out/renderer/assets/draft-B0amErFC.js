import { A as defineStore } from "./index-DKW7vBme.js";
const useDraftStore = defineStore("draft", {
  state: () => ({
    current: null,
    sourceTask: null,
    loading: false,
    error: null
  }),
  actions: {
    async draftTicket(task, projectId, surroundingLines) {
      this.loading = true;
      this.error = null;
      this.sourceTask = task;
      try {
        const result = await window.qaApi.draftTicket(task, projectId, surroundingLines);
        this.current = result.draft;
      } catch (e) {
        this.error = e.message;
        throw e;
      } finally {
        this.loading = false;
      }
    },
    updateField(field, value) {
      if (this.current) {
        this.current[field] = value;
      }
    },
    clearDraft() {
      this.current = null;
      this.sourceTask = null;
      this.error = null;
    }
  }
});
export {
  useDraftStore as u
};
