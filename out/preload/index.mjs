import { contextBridge, ipcRenderer } from "electron";
var IpcChannel = /* @__PURE__ */ ((IpcChannel2) => {
  IpcChannel2["PROJECTS_LIST"] = "projects:list";
  IpcChannel2["PROJECTS_ADD"] = "projects:add";
  IpcChannel2["PROJECTS_REMOVE"] = "projects:remove";
  IpcChannel2["PROJECTS_RENAME"] = "projects:rename";
  IpcChannel2["PROJECTS_CONFIG_UPDATE"] = "projects:config:update";
  IpcChannel2["PROJECTS_CONFIG_GET"] = "projects:config:get";
  IpcChannel2["REPO_SCAN"] = "repo:scan";
  IpcChannel2["REPO_SCAN_ALL"] = "repo:scan:all";
  IpcChannel2["JIRA_TICKETS_FETCH"] = "jira:tickets:fetch";
  IpcChannel2["JIRA_BOARD_FETCH"] = "jira:board:fetch";
  IpcChannel2["JIRA_TEST"] = "jira:test";
  IpcChannel2["JIRA_SETTINGS_SET"] = "jira:settings:set";
  IpcChannel2["JIRA_SETTINGS_GET"] = "jira:settings:get";
  IpcChannel2["JIRA_PROJECTS_SET"] = "jira:projects:set";
  IpcChannel2["JIRA_PROJECTS_GET"] = "jira:projects:get";
  IpcChannel2["TASK_IGNORE"] = "task:ignore";
  IpcChannel2["TASK_UNIGNORE"] = "task:unignore";
  IpcChannel2["TASK_TOGGLE"] = "task:toggle";
  IpcChannel2["DANGERZONE_STATE"] = "dangerzone:state";
  IpcChannel2["DRAFT_CREATE"] = "draft:create";
  IpcChannel2["AI_START_MY_DAY"] = "ai:start-my-day";
  IpcChannel2["KEYCHAIN_SET"] = "keychain:set";
  IpcChannel2["KEYCHAIN_GET"] = "keychain:get";
  IpcChannel2["KEYCHAIN_DELETE"] = "keychain:delete";
  IpcChannel2["SCHEDULER_TRIGGER"] = "scheduler:trigger";
  IpcChannel2["DIALOG_OPEN_FOLDER"] = "dialog:open-folder";
  IpcChannel2["NOTES_GET"] = "notes:get";
  IpcChannel2["NOTES_SET"] = "notes:set";
  IpcChannel2["AI_ASK"] = "ai:ask";
  IpcChannel2["DEV_TOOLS_TOGGLE"] = "devtools:toggle";
  IpcChannel2["SPRINT_STATUS_GET"] = "sprint:status:get";
  IpcChannel2["JIRA_SPRINT_ACTIVE"] = "jira:sprint:active";
  IpcChannel2["SHELL_OPEN_EXTERNAL"] = "shell:open-external";
  IpcChannel2["CREDENTIALS_LIST"] = "credentials:list";
  IpcChannel2["CREDENTIALS_UPSERT"] = "credentials:upsert";
  IpcChannel2["CREDENTIALS_DELETE"] = "credentials:delete";
  IpcChannel2["CREDENTIALS_GET_PASSWORD"] = "credentials:get-password";
  IpcChannel2["SYNC_COMPLETED"] = "event:sync:completed";
  IpcChannel2["DANGER_ZONE_TRIGGERED"] = "event:dangerzone:triggered";
  IpcChannel2["STREAM_CHUNK"] = "event:stream:chunk";
  IpcChannel2["STREAM_END"] = "event:stream:end";
  IpcChannel2["STREAM_ERROR"] = "event:stream:error";
  return IpcChannel2;
})(IpcChannel || {});
const qaApi = {
  // Projects
  listProjects: () => ipcRenderer.invoke(IpcChannel.PROJECTS_LIST),
  addProject: (rootPath) => ipcRenderer.invoke(IpcChannel.PROJECTS_ADD, rootPath),
  removeProject: (id) => ipcRenderer.invoke(IpcChannel.PROJECTS_REMOVE, id),
  renameProject: (id, name) => ipcRenderer.invoke(IpcChannel.PROJECTS_RENAME, id, name),
  updateProjectConfig: (projectId, patch) => ipcRenderer.invoke(IpcChannel.PROJECTS_CONFIG_UPDATE, projectId, patch),
  getProjectConfig: (projectId) => ipcRenderer.invoke(IpcChannel.PROJECTS_CONFIG_GET, projectId),
  // Repo scanning
  scanRepo: (projectId) => ipcRenderer.invoke(IpcChannel.REPO_SCAN, projectId),
  scanAll: () => ipcRenderer.invoke(IpcChannel.REPO_SCAN_ALL),
  // Jira
  fetchTickets: (keys) => ipcRenderer.invoke(IpcChannel.JIRA_TICKETS_FETCH, keys),
  testJiraConnection: (baseUrl, email) => ipcRenderer.invoke(IpcChannel.JIRA_TEST, baseUrl, email),
  setJiraSettings: (settings) => ipcRenderer.invoke(IpcChannel.JIRA_SETTINGS_SET, settings),
  getJiraSettings: () => ipcRenderer.invoke(IpcChannel.JIRA_SETTINGS_GET),
  setJiraProjects: (projects) => ipcRenderer.invoke(IpcChannel.JIRA_PROJECTS_SET, projects),
  getJiraProjects: () => ipcRenderer.invoke(IpcChannel.JIRA_PROJECTS_GET),
  // Tasks
  ignoreTask: (taskId) => ipcRenderer.invoke(IpcChannel.TASK_IGNORE, taskId),
  unignoreTask: (taskId) => ipcRenderer.invoke(IpcChannel.TASK_UNIGNORE, taskId),
  toggleTask: (filePath, lineNumber, checked) => ipcRenderer.invoke(IpcChannel.TASK_TOGGLE, filePath, lineNumber, checked),
  // Danger Zone
  getDangerZoneState: (projectId) => ipcRenderer.invoke(IpcChannel.DANGERZONE_STATE, projectId),
  // Draft
  createDraft: (taskId, projectId) => ipcRenderer.invoke(IpcChannel.DRAFT_CREATE, taskId, projectId),
  // AI
  startMyDay: (context) => ipcRenderer.invoke(IpcChannel.AI_START_MY_DAY, context),
  // Keychain
  setCredential: (key, value) => ipcRenderer.invoke(IpcChannel.KEYCHAIN_SET, key, value),
  getCredential: (key) => ipcRenderer.invoke(IpcChannel.KEYCHAIN_GET, key),
  deleteCredential: (key) => ipcRenderer.invoke(IpcChannel.KEYCHAIN_DELETE, key),
  // Scheduler
  triggerSync: () => ipcRenderer.invoke(IpcChannel.SCHEDULER_TRIGGER),
  // Sprint status (dev progress + epic hierarchy from sprint-status.yaml)
  getSprintStatus: (projectId) => ipcRenderer.invoke(IpcChannel.SPRINT_STATUS_GET, projectId),
  getActiveSprint: (projectId) => ipcRenderer.invoke(IpcChannel.JIRA_SPRINT_ACTIVE, projectId),
  // AI ask (free prompt)
  toggleDevTools: () => ipcRenderer.invoke(IpcChannel.DEV_TOOLS_TOGGLE),
  ask: (prompt, imagePath) => ipcRenderer.invoke(IpcChannel.AI_ASK, prompt, imagePath),
  // Notes (daily freeform notes per date)
  getNote: (date) => ipcRenderer.invoke(IpcChannel.NOTES_GET, date),
  setNote: (date, text) => ipcRenderer.invoke(IpcChannel.NOTES_SET, date, text),
  // Credentials vault
  listCredentials: () => ipcRenderer.invoke(IpcChannel.CREDENTIALS_LIST),
  upsertCredential: (entry, password) => ipcRenderer.invoke(IpcChannel.CREDENTIALS_UPSERT, entry, password),
  deleteCredential2: (id) => ipcRenderer.invoke(IpcChannel.CREDENTIALS_DELETE, id),
  getCredentialPassword: (id) => ipcRenderer.invoke(IpcChannel.CREDENTIALS_GET_PASSWORD, id),
  // Shell
  openExternal: (url) => ipcRenderer.invoke(IpcChannel.SHELL_OPEN_EXTERNAL, url),
  // Dialog
  openFolderDialog: () => ipcRenderer.invoke(IpcChannel.DIALOG_OPEN_FOLDER),
  // Event listeners (Main → Renderer push events)
  onSyncCompleted: (callback) => {
    const handler = (_, summary) => callback(summary);
    ipcRenderer.on(IpcChannel.SYNC_COMPLETED, handler);
    return () => ipcRenderer.removeListener(IpcChannel.SYNC_COMPLETED, handler);
  },
  onDangerZoneTriggered: (callback) => {
    const handler = (_, projectId) => callback(projectId);
    ipcRenderer.on(IpcChannel.DANGER_ZONE_TRIGGERED, handler);
    return () => ipcRenderer.removeListener(IpcChannel.DANGER_ZONE_TRIGGERED, handler);
  },
  onStreamChunk: (callback) => {
    const handler = (_, chunk) => callback(chunk);
    ipcRenderer.on(IpcChannel.STREAM_CHUNK, handler);
    return () => ipcRenderer.removeListener(IpcChannel.STREAM_CHUNK, handler);
  },
  onStreamEnd: (callback) => {
    const handler = () => callback();
    ipcRenderer.on(IpcChannel.STREAM_END, handler);
    return () => ipcRenderer.removeListener(IpcChannel.STREAM_END, handler);
  },
  onStreamError: (callback) => {
    const handler = (_, error) => callback(error);
    ipcRenderer.on(IpcChannel.STREAM_ERROR, handler);
    return () => ipcRenderer.removeListener(IpcChannel.STREAM_ERROR, handler);
  }
};
contextBridge.exposeInMainWorld("qaApi", qaApi);
