import { BrowserWindow, ipcMain, shell, dialog, app } from "electron";
import { join, resolve, relative } from "path";
import keytar from "keytar";
import Store from "electron-store";
import { randomUUID, createHash } from "crypto";
import { execSync, spawn, exec } from "child_process";
import { readFile, readdir, writeFile } from "fs/promises";
import { glob } from "glob";
import schedule from "node-schedule";
import { promisify } from "util";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const isDev = process.env["NODE_ENV"] === "development";
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  if (isDev) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
  return win;
}
class KeychainService {
  SERVICE = "QADash";
  async setCredential(key, value) {
    try {
      await keytar.setPassword(this.SERVICE, key, value);
    } catch (err) {
      throw new Error("KEYCHAIN_ERROR: " + err.message);
    }
  }
  async getCredential(key) {
    try {
      return await keytar.getPassword(this.SERVICE, key);
    } catch (err) {
      throw new Error("KEYCHAIN_ERROR: " + err.message);
    }
  }
  async deleteCredential(key) {
    try {
      await keytar.deletePassword(this.SERVICE, key);
    } catch (err) {
      throw new Error("KEYCHAIN_ERROR: " + err.message);
    }
  }
}
const DEFAULT_PROJECT_CONFIG = {
  ticketRegex: "[A-Z]+-\\d+",
  excludePatterns: ["node_modules/**", ".git/**", "dist/**", "build/**"],
  includePaths: [],
  warningThresholdDays: 3,
  warningThresholdCount: 5
};
const DANGER_ZONE_SNAPSHOT_WINDOW = 7;
const JIRA_RETRY_DELAY_MS = 1e3;
class ConfigStore {
  store;
  constructor() {
    this.store = new Store({
      name: "config",
      defaults: { projects: [] }
    });
  }
  getProjects() {
    return this.store.get("projects") ?? [];
  }
  deriveProjectName(rootPath) {
    try {
      const gitRoot = execSync("git rev-parse --show-toplevel", { cwd: rootPath, encoding: "utf-8" }).trim();
      return gitRoot.split("/").pop() ?? rootPath.split("/").pop() ?? rootPath;
    } catch {
      return rootPath.split("/").pop() ?? rootPath;
    }
  }
  addProject(rootPath) {
    const project = {
      id: randomUUID(),
      name: this.deriveProjectName(rootPath),
      rootPath,
      jiraBoardId: "",
      jiraBaseUrl: "",
      addedAt: (/* @__PURE__ */ new Date()).toISOString(),
      config: { ...DEFAULT_PROJECT_CONFIG }
    };
    const projects = this.getProjects();
    projects.push(project);
    this.store.set("projects", projects);
    return project;
  }
  renameProject(id, name) {
    const projects = this.getProjects();
    const p = projects.find((x) => x.id === id);
    if (p) {
      p.name = name.trim() || p.name;
      this.store.set("projects", projects);
    }
  }
  removeProject(id) {
    const projects = this.getProjects().filter((p) => p.id !== id);
    this.store.set("projects", projects);
  }
  getConfig(projectId) {
    return this.store.get(`config.${projectId}`) ?? { ...DEFAULT_PROJECT_CONFIG };
  }
  updateConfig(projectId, patch) {
    const current = this.getConfig(projectId);
    const updated = { ...current, ...patch };
    this.store.set(`config.${projectId}`, updated);
    return updated;
  }
  setJiraSettings(projectId, settings) {
    this.store.set(`jira.${projectId}`, settings);
  }
  getJiraSettings(projectId) {
    return this.store.get(`jira.${projectId}`) ?? null;
  }
  getNote(date) {
    return this.store.get(`notes.${date}`) ?? "";
  }
  setNote(date, text) {
    if (text) this.store.set(`notes.${date}`, text);
    else this.store.delete(`notes.${date}`);
  }
  setGlobalJira(settings) {
    this.store.set("jira.global", settings);
  }
  getGlobalJira() {
    return this.store.get("jira.global") ?? null;
  }
  getJiraProjects() {
    return this.store.get("jira.projects") ?? [];
  }
  setJiraProjects(projects) {
    this.store.set("jira.projects", projects);
  }
}
class IgnoreStore {
  store;
  constructor() {
    this.store = new Store({
      name: "ignores",
      defaults: { ignores: {} }
    });
    this.clearStale();
  }
  today() {
    return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  }
  ignore(taskId) {
    try {
      const date = this.today();
      const ignores = this.store.get("ignores") ?? {};
      const list = ignores[date] ?? [];
      if (!list.includes(taskId)) {
        list.push(taskId);
      }
      ignores[date] = list;
      this.store.set("ignores", ignores);
    } catch {
    }
  }
  unignore(taskId) {
    try {
      const date = this.today();
      const ignores = this.store.get("ignores") ?? {};
      const list = ignores[date] ?? [];
      ignores[date] = list.filter((id) => id !== taskId);
      this.store.set("ignores", ignores);
    } catch {
    }
  }
  isIgnored(taskId) {
    try {
      const date = this.today();
      const ignores = this.store.get("ignores") ?? {};
      return (ignores[date] ?? []).includes(taskId);
    } catch {
      return false;
    }
  }
  getIgnoredToday() {
    try {
      const date = this.today();
      const ignores = this.store.get("ignores") ?? {};
      return ignores[date] ?? [];
    } catch {
      return [];
    }
  }
  clearStale() {
    try {
      const date = this.today();
      const ignores = this.store.get("ignores") ?? {};
      const filtered = {};
      if (ignores[date]) {
        filtered[date] = ignores[date];
      }
      this.store.set("ignores", filtered);
    } catch {
    }
  }
}
const CHECKLIST_REGEX = /^(\s*)-\s\[([ xX])\]\s+(.+)$/;
const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;
function extractHeading(line) {
  const match = HEADING_REGEX.exec(line);
  if (!match) return null;
  return { level: match[1].length, text: match[2].trim() };
}
function extractDueDate(text) {
  const m = /(?:due[:\s]+|by\s+)(\d{4}-\d{2}-\d{2})/i.exec(text) ?? /\((\d{4}-\d{2}-\d{2})\)/.exec(text) ?? /\b(\d{4}-\d{2}-\d{2})\b/.exec(text);
  return m ? m[1] : null;
}
function extractSprint(text, filePath) {
  const inText = /sprint[\s-](\w+)/i.exec(text);
  if (inText) return `Sprint ${inText[1]}`;
  if (filePath) {
    const inFile = /sprint[-_](\w+)/i.exec(filePath);
    if (inFile) return `Sprint ${inFile[1]}`;
  }
  return null;
}
function parseChecklist(line) {
  const match = CHECKLIST_REGEX.exec(line);
  if (!match) return null;
  return {
    isChecked: match[2] !== " ",
    text: match[3].trim()
  };
}
function extractTicketKey(text, regex) {
  try {
    const match = new RegExp(regex).exec(text);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}
function getSurroundingLines(lines, lineIndex, count) {
  const start = Math.max(0, lineIndex - count);
  const end = Math.min(lines.length - 1, lineIndex + count);
  return lines.slice(start, end + 1);
}
class RepoScanner {
  constructor(ignoreStore) {
    this.ignoreStore = ignoreStore;
  }
  async scan(project) {
    const scannedAt = (/* @__PURE__ */ new Date()).toISOString();
    const errors = [];
    const untracked = [];
    const linked = [];
    let files;
    try {
      const patterns = project.config.includePaths?.length ? project.config.includePaths.map((p) => p.endsWith(".md") ? p : `${p.replace(/\/$/, "")}/**/*.md`) : ["_bmad-output/test-artifacts/epic-*/*.md"];
      files = (await Promise.all(
        patterns.map(
          (pattern) => glob(pattern, {
            cwd: project.rootPath,
            ignore: project.config.excludePatterns,
            absolute: false
          })
        )
      )).flat();
      files = [...new Set(files)];
    } catch (err) {
      return {
        projectId: project.id,
        scannedAt,
        untracked: [],
        linked: [],
        filesScanned: 0,
        errors: [`glob error: ${err.message}`]
      };
    }
    for (const relPath of files) {
      const absPath = resolve(project.rootPath, relPath);
      let content;
      try {
        content = await readFile(absPath, "utf-8");
      } catch (err) {
        errors.push(`${relPath}: ${err.message}`);
        continue;
      }
      const lines = content.split("\n");
      let currentEpic;
      let currentSection;
      for (let i = 0; i < lines.length; i++) {
        const heading = extractHeading(lines[i]);
        if (heading) {
          if (heading.level === 1) {
            currentEpic = heading.text;
            currentSection = void 0;
          } else if (heading.level === 2) {
            currentSection = heading.text;
          } else if (heading.level === 3) {
            if (/Story\s+\d+\.\d+/i.test(heading.text)) {
              currentSection = heading.text;
            }
          }
          continue;
        }
        const parsed = parseChecklist(lines[i]);
        if (!parsed) continue;
        const lineNumber = i + 1;
        const id = createHash("sha1").update(absPath + ":" + lineNumber).digest("hex");
        const ticketKey = extractTicketKey(parsed.text, project.config.ticketRegex);
        const dueDate = extractDueDate(parsed.text) ?? void 0;
        const sprint = extractSprint(parsed.text, relPath) ?? void 0;
        if (ticketKey) {
          const task = {
            id,
            projectId: project.id,
            filePath: absPath,
            fileRelativePath: relative(project.rootPath, absPath),
            lineNumber,
            rawText: parsed.text,
            isChecked: parsed.isChecked,
            scannedAt,
            type: "linked",
            jiraKey: ticketKey,
            epic: currentEpic,
            section: currentSection,
            dueDate,
            sprint
          };
          linked.push(task);
        } else {
          const isIgnoredToday = this.ignoreStore.isIgnored(id);
          const task = {
            id,
            projectId: project.id,
            filePath: absPath,
            fileRelativePath: relative(project.rootPath, absPath),
            lineNumber,
            rawText: parsed.text,
            isChecked: parsed.isChecked,
            scannedAt,
            type: "untracked",
            isIgnoredToday,
            epic: currentEpic,
            section: currentSection,
            dueDate,
            sprint
          };
          if (isIgnoredToday) {
            task.ignoredAt = (/* @__PURE__ */ new Date()).toISOString();
          }
          untracked.push(task);
        }
      }
    }
    return {
      projectId: project.id,
      scannedAt,
      untracked,
      linked,
      filesScanned: files.length,
      errors
    };
  }
}
const STATUS_MAP = {
  "To Do": "TODO",
  "In Progress": "IN_PROGRESS",
  "In Review": "IN_REVIEW",
  "Done": "DONE",
  "Blocked": "BLOCKED",
  "Failed": "FAILED"
};
function sleep(ms) {
  return new Promise((resolve2) => setTimeout(resolve2, ms));
}
class JiraClient {
  constructor(keychainService) {
    this.keychainService = keychainService;
  }
  async getTickets(keys, baseUrl, email) {
    const token = await this.keychainService.getCredential("jira-token");
    if (!token) throw new Error("JIRA_AUTH_FAILED");
    if (!email) throw new Error("JIRA_AUTH_FAILED");
    const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
    const unique = [...new Set(keys)];
    const results = await Promise.all(
      unique.map((key) => this.fetchIssue(key, baseUrl, authHeader))
    );
    return results.filter((t) => t !== null);
  }
  async fetchIssue(key, baseUrl, authHeader, isRetry = false) {
    const url = `${baseUrl}/rest/api/3/issue/${key}?fields=summary,status,priority,duedate,updated,assignee,labels`;
    let response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: { Authorization: authHeader, Accept: "application/json" }
      });
    } catch {
      return null;
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("JIRA_AUTH_FAILED");
    }
    if (response.status === 429) {
      if (!isRetry) {
        await sleep(JIRA_RETRY_DELAY_MS);
        return this.fetchIssue(key, baseUrl, authHeader, true);
      }
      return null;
    }
    if (!response.ok) return null;
    const issue = await response.json();
    const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
    return {
      key,
      summary: issue.fields.summary,
      status: STATUS_MAP[issue.fields.status.name] ?? "TODO",
      priority: issue.fields.priority?.name ?? "Minor",
      dueDate: issue.fields.duedate ?? void 0,
      updatedDate: issue.fields.updated ? issue.fields.updated.slice(0, 10) : void 0,
      assignee: issue.fields.assignee?.displayName,
      labels: issue.fields.labels ?? [],
      url: `${baseUrl}/browse/${key}`,
      fetchedAt
    };
  }
  async getActiveSprint(boardId, baseUrl, email) {
    const token = await this.keychainService.getCredential("jira-token");
    if (!token || !email) return null;
    const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
    try {
      const res = await fetch(`${baseUrl}/rest/agile/1.0/board/${boardId}/sprint?state=active`, {
        headers: { Authorization: authHeader, Accept: "application/json" }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.values?.[0] ?? null;
    } catch {
      return null;
    }
  }
  async testConnection(baseUrl, email) {
    try {
      const token = await this.keychainService.getCredential("jira-token");
      if (!token) return false;
      const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
      const response = await fetch(`${baseUrl}/rest/api/3/myself`, {
        headers: { Authorization: authHeader }
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
class DangerZoneTracker {
  constructor(store) {
    this.store = store;
  }
  recordAndEvaluate(scanResult, config) {
    try {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const storeKey = `dangerzone.snapshots.${scanResult.projectId}`;
      const snapshots = this.store["store"].get(storeKey) ?? [];
      const todayIdx = snapshots.findIndex((s) => s.date === today);
      const todaySnapshot = {
        projectId: scanResult.projectId,
        date: today,
        untrackedCount: scanResult.untracked.filter((t) => !t.isIgnoredToday).length,
        linkedCount: scanResult.linked.length
      };
      if (todayIdx >= 0) {
        snapshots[todayIdx] = todaySnapshot;
      } else {
        snapshots.push(todaySnapshot);
      }
      const cutoff = /* @__PURE__ */ new Date();
      cutoff.setDate(cutoff.getDate() - DANGER_ZONE_SNAPSHOT_WINDOW);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      const pruned = snapshots.filter((s) => s.date >= cutoffStr);
      this.store["store"].set(storeKey, pruned);
      const sorted = [...pruned].sort((a, b) => b.date.localeCompare(a.date));
      let streak = 0;
      let streakStartDate;
      let currentDate = /* @__PURE__ */ new Date();
      for (const snapshot of sorted) {
        const expectedDate = currentDate.toISOString().split("T")[0];
        if (snapshot.date !== expectedDate) break;
        if (snapshot.untrackedCount >= config.warningThresholdCount) {
          streak++;
          streakStartDate = snapshot.date;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      const isActive = streak >= config.warningThresholdDays;
      return {
        projectId: scanResult.projectId,
        isActive,
        consecutiveDays: streak,
        streakStartDate,
        lastCheckedDate: today,
        snapshots: pruned
      };
    } catch {
      return {
        projectId: scanResult.projectId,
        isActive: false,
        consecutiveDays: 0,
        lastCheckedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        snapshots: []
      };
    }
  }
  getState(projectId) {
    try {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const storeKey = `dangerzone.snapshots.${projectId}`;
      const snapshots = this.store["store"].get(storeKey) ?? [];
      return {
        projectId,
        isActive: false,
        consecutiveDays: 0,
        lastCheckedDate: today,
        snapshots
      };
    } catch {
      return {
        projectId,
        isActive: false,
        consecutiveDays: 0,
        lastCheckedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        snapshots: []
      };
    }
  }
}
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
  IpcChannel2["SYNC_COMPLETED"] = "event:sync:completed";
  IpcChannel2["DANGER_ZONE_TRIGGERED"] = "event:dangerzone:triggered";
  IpcChannel2["STREAM_CHUNK"] = "event:stream:chunk";
  IpcChannel2["STREAM_END"] = "event:stream:end";
  IpcChannel2["STREAM_ERROR"] = "event:stream:error";
  return IpcChannel2;
})(IpcChannel || {});
const CLAUDE_BIN = process.env.CLAUDE_BIN ?? "/Users/ice/.local/bin/claude";
function runClaude(prompt) {
  return new Promise((resolve2, reject) => {
    let out = "";
    let err = "";
    const child = spawn(CLAUDE_BIN, ["-p", prompt, "--output-format", "text"], {
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "" }
    });
    child.stdout.on("data", (d) => {
      out += d.toString();
    });
    child.stderr.on("data", (d) => {
      err += d.toString();
    });
    child.on("close", (code) => {
      if (code === 0) resolve2(out.trim());
      else reject(new Error(err.trim() || `claude exited with code ${code}`));
    });
    child.on("error", reject);
  });
}
function streamClaude(prompt, onChunk, imagePath) {
  return new Promise((resolve2, reject) => {
    const args = ["-p", prompt, "--output-format", "text"];
    if (imagePath) {
      const { dirname } = require2("path");
      args.push("--add-dir", dirname(imagePath));
    }
    const child = spawn(CLAUDE_BIN, args, {
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    child.stdout.on("data", (d) => {
      onChunk(d.toString());
    });
    child.on("close", (code) => {
      if (code === 0) resolve2();
      else reject(new Error(`claude exited with code ${code}`));
    });
    child.on("error", reject);
  });
}
class DraftService {
  constructor() {
  }
  async ask(prompt, window, imagePath) {
    const fullPrompt = imagePath ? `${prompt}

(Please read and analyze the image at: ${imagePath})` : prompt;
    await streamClaude(fullPrompt, (chunk) => {
      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_CHUNK, chunk);
      }
    }, imagePath);
  }
  async draftTicket(task, project, surroundingLines) {
    const warnings = [];
    const systemPrompt = "คุณเป็น QA engineer ที่ช่วยร่าง Jira ticket จากงานที่ยังไม่ได้ track ใน Jira ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่น";
    const userPrompt = `Task: ${task.rawText}
File: ${task.fileRelativePath}
Project Jira Board: ${project.jiraBoardId}
Context lines:
${surroundingLines.join("\n")}

Please provide a JSON object with these fields: { "summary": string, "description": string, "priority": "Blocker"|"Critical"|"Major"|"Minor"|"Trivial", "labels": string[] }`;
    const rawPrompt = `${systemPrompt}

${userPrompt}`;
    let rawResponse;
    let parsed;
    try {
      rawResponse = await runClaude(rawPrompt);
      parsed = this.parseJson(rawResponse);
    } catch {
      try {
        rawResponse = await runClaude(rawPrompt + "\n\nตอบ JSON เท่านั้น ไม่มีข้อความอื่น");
        parsed = this.parseJson(rawResponse);
      } catch (err) {
        throw new Error("DRAFT_FAILED: " + err.message);
      }
    }
    const draft = {
      id: randomUUID(),
      sourceTaskId: task.id,
      projectId: project.id,
      summary: parsed.summary,
      description: parsed.description,
      suggestedPriority: parsed.priority,
      suggestedLabels: parsed.labels,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      rawPrompt,
      rawResponse
    };
    return { draft, warnings };
  }
  parseJson(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no JSON block found in response");
    return JSON.parse(match[0]);
  }
  async startMyDay(context, window) {
    const blockedTickets = context.jiraTickets.filter(
      (t) => t.status === "BLOCKED" || t.status === "FAILED"
    );
    const today = context.date;
    const overdueTickets = context.jiraTickets.filter(
      (t) => t.dueDate && t.dueDate < today
    );
    const dueTodayTickets = context.jiraTickets.filter((t) => t.dueDate === today);
    const untrackedByProject = context.projects.map((p) => {
      const result = context.allScanResults.find((r) => r.projectId === p.id);
      if (!result) return "";
      const tasks = result.untracked.filter((t) => !t.isIgnoredToday);
      if (tasks.length === 0) return "";
      return `### ${p.name}
${tasks.map((t) => `- ${t.rawText}`).join("\n")}`;
    }).filter(Boolean).join("\n\n");
    const prompt = `คุณเป็น QA engineer's daily briefing assistant ที่เข้าถึงสถานะงาน QA ปัจจุบันได้ ตอบสั้นกระชับ เป็น bullet points ไม่มีข้อความที่ไม่จำเป็น

วันนี้คือ ${today} นี่คือสถานะงาน QA ของฉัน:

## Blocker / Failed Tickets
${blockedTickets.map((t) => `- [${t.key}] ${t.summary} (${t.status})`).join("\n") || "ไม่มี"}

## Overdue Tickets
${overdueTickets.map((t) => `- [${t.key}] ${t.summary} (due: ${t.dueDate})`).join("\n") || "ไม่มี"}

## Due Today
${dueTodayTickets.map((t) => `- [${t.key}] ${t.summary}`).join("\n") || "ไม่มี"}

## Untracked Tasks (ยังไม่มีใน Jira)
${untrackedByProject || "ไม่มี"}

กรุณาสรุป:
1. CRITICAL ก่อนเที่ยง: งานอะไรที่ต้องจัดการใน 4 ชั่วโมงข้างหน้า?
2. STANDUP: 3-5 bullet points สำหรับรายงาน Standup
3. CLEAR UNTRACKED: แผนขั้นตอนการเปลี่ยน 3 Untracked Tasks แรกเป็น Jira ticket`;
    try {
      await streamClaude(prompt, (chunk) => {
        if (!window.isDestroyed()) {
          window.webContents.send(IpcChannel.STREAM_CHUNK, chunk);
        }
      });
      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_END);
      }
    } catch (err) {
      if (!window.isDestroyed()) {
        window.webContents.send(IpcChannel.STREAM_ERROR, err.message);
      }
    }
  }
}
class Scheduler {
  constructor(configStore, repoScanner, jiraClient, dangerZoneTracker, getWindow) {
    this.configStore = configStore;
    this.repoScanner = repoScanner;
    this.jiraClient = jiraClient;
    this.dangerZoneTracker = dangerZoneTracker;
    this.getWindow = getWindow;
  }
  syncJob = null;
  focusJob = null;
  // previousDangerZoneStates ใช้ track การเปลี่ยนจาก false → true
  previousDangerZoneStates = /* @__PURE__ */ new Map();
  start() {
    this.syncJob = schedule.scheduleJob("0 9 * * 1-5", () => {
      this.triggerSync().catch((err) => {
        console.error("[Scheduler] triggerSync error:", err);
      });
    });
    this.focusJob = schedule.scheduleJob("10 9 * * 1-5", () => {
      this.focusWindow();
    });
  }
  stop() {
    if (this.syncJob) {
      this.syncJob.cancel();
      this.syncJob = null;
    }
    if (this.focusJob) {
      this.focusJob.cancel();
      this.focusJob = null;
    }
  }
  async triggerSync() {
    const syncedAt = (/* @__PURE__ */ new Date()).toISOString();
    const errors = [];
    const dangerZoneProjects = [];
    let totalUntracked = 0;
    let totalLinked = 0;
    const projects = this.configStore.getProjects();
    const scanResults = [];
    for (const project of projects) {
      try {
        const result = await this.repoScanner.scan(project);
        scanResults.push(result);
        totalUntracked += result.untracked.length;
        totalLinked += result.linked.length;
        if (result.errors.length > 0) {
          errors.push(...result.errors.map((e) => `[${project.id}] ${e}`));
        }
      } catch (err) {
        errors.push(`[${project.id}] scan failed: ${err.message}`);
      }
    }
    const keysByProject = /* @__PURE__ */ new Map();
    for (const project of projects) {
      const result = scanResults.find((r) => r.projectId === project.id);
      if (!result) continue;
      const keys = result.linked.map((t) => t.jiraKey);
      if (keys.length === 0) continue;
      const settings = this.configStore.getJiraSettings(project.id);
      if (!settings) continue;
      const existing = keysByProject.get(settings.baseUrl);
      if (existing) {
        existing.keys.push(...keys);
      } else {
        keysByProject.set(settings.baseUrl, { keys, baseUrl: settings.baseUrl, email: settings.email });
      }
    }
    for (const { keys, baseUrl, email } of keysByProject.values()) {
      try {
        await this.jiraClient.getTickets(keys, baseUrl, email);
      } catch (err) {
        errors.push(`[jira:${baseUrl}] fetch failed: ${err.message}`);
      }
    }
    for (const project of projects) {
      const result = scanResults.find((r) => r.projectId === project.id);
      if (!result) continue;
      try {
        const state = this.dangerZoneTracker.recordAndEvaluate(
          result,
          project.config
        );
        const wasActive = this.previousDangerZoneStates.get(project.id) ?? false;
        if (!wasActive && state.isActive) {
          this.sendToWindow(IpcChannel.DANGER_ZONE_TRIGGERED, project.id);
        }
        this.previousDangerZoneStates.set(project.id, state.isActive);
        if (state.isActive) {
          dangerZoneProjects.push(project.id);
        }
      } catch (err) {
        errors.push(
          `[dangerzone:${project.id}] evaluate failed: ${err.message}`
        );
      }
    }
    const summary = {
      syncedAt,
      projectsScanned: projects.length,
      totalUntracked,
      totalLinked,
      dangerZoneProjects,
      errors
    };
    this.sendToWindow(IpcChannel.SYNC_COMPLETED, summary);
    return summary;
  }
  // AC-011-01 ถึง AC-011-07: Window focus handler สำหรับ US-017
  focusWindow() {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length === 0) return;
    const win = windows[0];
    if (win.isDestroyed()) return;
    if (win.isMinimized()) {
      win.restore();
      win.show();
      win.focus();
      return;
    }
    if (!win.isVisible()) {
      win.show();
      win.focus();
      return;
    }
    win.show();
    win.focus();
  }
  // Helper: ส่ง event ไป renderer ถ้า window ยังไม่ถูก destroy
  sendToWindow(channel, ...args) {
    const win = this.getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  }
}
const execAsync = promisify(exec);
const SPRINT_STATUS_PATH = "_bmad-output/implementation-artifacts/sprint-status.yaml";
const ACRONYMS = /* @__PURE__ */ new Set([
  "sso",
  "jwt",
  "pdpa",
  "ml",
  "rls",
  "api",
  "tos",
  "cs",
  "hud",
  "ux",
  "ci",
  "ui",
  "oidc",
  "worm",
  "rbac",
  "s3",
  "kpi",
  "kpis"
]);
const SMALL_WORDS = /* @__PURE__ */ new Set(["via", "at", "of", "the", "in", "on", "for", "and", "or", "to", "a"]);
function titleCase(words) {
  return words.map((w, i) => {
    const lower = w.toLowerCase();
    if (ACRONYMS.has(lower)) return lower.toUpperCase();
    if (i > 0 && SMALL_WORDS.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(" ");
}
function slugToLabel(slug) {
  const m = slug.match(/^(\d+)-(\d+)-(.+)$/);
  if (m) {
    const words = m[3].split("-");
    return `${m[1]}.${m[2]} ${titleCase(words)}`;
  }
  return titleCase(slug.split("-"));
}
class SprintStatusReader {
  async getStatus(rootPath) {
    const filePath = join(rootPath, SPRINT_STATUS_PATH);
    let content;
    try {
      content = await readFile(filePath, "utf-8");
    } catch {
      const tcCoverage2 = await this.scanTCCoverage(rootPath, []);
      const epicHierarchy2 = await this.buildFallbackHierarchy(rootPath, tcCoverage2);
      const gitDateMap2 = await this.scanGitDates(rootPath, epicHierarchy2);
      return { devStatusMap: {}, epicHierarchy: epicHierarchy2, tcCoverage: tcCoverage2, gitDateMap: gitDateMap2 };
    }
    const slugStatus = {};
    const jiraToSlug = {};
    const epicHierarchy = [];
    const epicByNum = {};
    let section = "none";
    let inAssignments = false;
    for (const rawLine of content.split("\n")) {
      const commentIdx = rawLine.indexOf("#");
      const commentPart = commentIdx >= 0 ? rawLine.slice(commentIdx + 1) : "";
      const line = (commentIdx >= 0 ? rawLine.slice(0, commentIdx) : rawLine).trimEnd();
      if (!line.trim()) continue;
      if (/^\S/.test(line)) {
        inAssignments = false;
        section = "none";
        if (line.startsWith("development_status:")) section = "devStatus";
        else if (line.startsWith("assignments:")) inAssignments = true;
        continue;
      }
      if (inAssignments && /^  \S/.test(line)) {
        const trimmed = line.trimStart();
        section = "none";
        if (trimmed.startsWith("stories:")) section = "stories";
        else if (trimmed.startsWith("epics:")) section = "epics";
        continue;
      }
      if (section === "devStatus") {
        const m = line.match(/^  ([\w-]+):\s*([\w-]+)/);
        if (!m) continue;
        const slug = m[1];
        const status = m[2];
        slugStatus[slug] = status;
        const jiraKeys = [...commentPart.matchAll(/\b([A-Z]+-\d+)\b/g)].map((k) => k[1]);
        const epicMatch = slug.match(/^epic-(\d+)$/);
        if (epicMatch) {
          const num = parseInt(epicMatch[1]);
          const epic = { slug, number: num, status, stories: [] };
          epicHierarchy.push(epic);
          epicByNum[num] = epic;
        } else if (!/^epic-\d+-/.test(slug)) {
          const storyNumMatch = slug.match(/^(\d+)-\d+/);
          if (storyNumMatch) {
            const epicNum = parseInt(storyNumMatch[1]);
            const epic = epicByNum[epicNum];
            if (epic) {
              const story = {
                slug,
                label: slugToLabel(slug),
                status,
                jiraKeys,
                epicSlug: `epic-${epicNum}`
              };
              epic.stories.push(story);
              for (const jk of jiraKeys) {
                jiraToSlug[jk] = slug;
              }
            }
          }
        }
      }
      if (section === "stories") {
        const slugMatch = line.match(/^    ([\w-]+):/);
        if (slugMatch) {
          const slug = slugMatch[1];
          for (const km of line.matchAll(/\bjira(?:_\w+)?:\s*([A-Z]+-\d+)/g)) {
            jiraToSlug[km[1]] = slug;
            for (const epic of epicHierarchy) {
              for (const story of epic.stories) {
                if (story.slug === slug && !story.jiraKeys.includes(km[1])) {
                  story.jiraKeys.push(km[1]);
                }
              }
            }
          }
        }
      }
      if (section === "epics") {
        const m = line.match(/^    ([\w-]+):\s*([A-Z]+-\d+)/);
        if (m) jiraToSlug[m[2]] = m[1];
      }
    }
    const devStatusMap = {};
    for (const [jiraKey, slug] of Object.entries(jiraToSlug)) {
      const status = slugStatus[slug];
      if (status) devStatusMap[jiraKey] = status;
    }
    for (const [slug, status] of Object.entries(slugStatus)) {
      if (/^epic-\d+$/.test(slug)) devStatusMap[slug] = status;
    }
    const tcCoverage = await this.scanTCCoverage(rootPath, epicHierarchy);
    const gitDateMap = await this.scanGitDates(rootPath, epicHierarchy);
    return { devStatusMap, epicHierarchy, tcCoverage, gitDateMap };
  }
  async scanGitDates(rootPath, epicHierarchy) {
    const result = {};
    try {
      const { stdout } = await execAsync(
        'git log --format="%cs %s" --no-merges -500',
        { cwd: rootPath }
      );
      const lines = stdout.split("\n").filter(Boolean);
      for (const epic of epicHierarchy) {
        for (const story of epic.stories) {
          for (const key of story.jiraKeys) {
            if (result[key]) continue;
            const line = lines.find((l) => l.includes(key));
            if (line) result[key] = line.slice(0, 10);
          }
        }
      }
    } catch {
    }
    return result;
  }
  async buildFallbackHierarchy(rootPath, tcCoverage) {
    const casePath = join(rootPath, "_bmad-output/test-artifacts/case");
    let dirs;
    try {
      dirs = await readdir(casePath, { withFileTypes: true });
    } catch {
      return [];
    }
    const stories = dirs.filter((d) => d.isDirectory()).map((d) => ({
      slug: d.name,
      label: titleCase(d.name.split("-")),
      status: "done",
      jiraKeys: [],
      epicSlug: "epic-0"
    }));
    if (!stories.length) return [];
    return [{ slug: "epic-0", number: 0, status: "done", stories }];
  }
  async scanTCCoverage(rootPath, epicHierarchy) {
    const testArtifactsPath = join(rootPath, "_bmad-output/test-artifacts");
    const coverage = {};
    const specSlugs = /* @__PURE__ */ new Set();
    try {
      const specFiles = await readdir(join(rootPath, "web", "e2e"));
      for (const f of specFiles) {
        const m = f.match(/^(.+)\.spec\.[tj]s$/);
        if (m) specSlugs.add(m[1]);
      }
    } catch {
    }
    const caseFeatures = /* @__PURE__ */ new Map();
    try {
      const dirs = await readdir(join(testArtifactsPath, "case"), { withFileTypes: true });
      for (const entry of dirs) {
        if (!entry.isDirectory()) continue;
        const files = await readdir(join(testArtifactsPath, "case", entry.name));
        const hasAPI = files.includes("api.md");
        const hasIntegration = files.includes("integration.md");
        const hasUI = files.includes("ui.md");
        const hasE2E = files.includes("fullloop-e2e.md");
        const hasTC = hasAPI || hasIntegration || hasUI || hasE2E;
        caseFeatures.set(entry.name, { hasAPI, hasIntegration, hasUI, hasE2E, hasTC });
      }
    } catch {
      return coverage;
    }
    const storyNumToFeature = /* @__PURE__ */ new Map();
    for (const epic of epicHierarchy) {
      try {
        const testPlan = await readFile(
          join(testArtifactsPath, `epic-${epic.number}`, "test-plan.md"),
          "utf-8"
        );
        for (const line of testPlan.split("\n")) {
          for (const m of line.matchAll(/([\w-]+)\s+\(Story\s+(\d+)\.(\d+)/g)) {
            const key = `${m[2]}.${m[3]}`;
            if (!storyNumToFeature.has(key)) storyNumToFeature.set(key, m[1]);
          }
          const mH = line.match(/^###\s+Story\s+(\d+)\.(\d+)\s+[—–-]+\s+([\w\s-]+?)(?:\s*\(|\s*$)/);
          if (mH) {
            const derived = mH[3].trim().toLowerCase().replace(/\s+/g, "-");
            const key = `${mH[1]}.${mH[2]}`;
            if (!storyNumToFeature.has(key) && caseFeatures.has(derived)) {
              storyNumToFeature.set(key, derived);
            }
          }
        }
      } catch {
      }
    }
    for (const epic of epicHierarchy) {
      for (const story of epic.stories) {
        const numMatch = story.slug.match(/^(\d+)-(\d+)-/);
        let featureSlug;
        if (numMatch) {
          const storyNum = `${numMatch[1]}.${numMatch[2]}`;
          featureSlug = storyNumToFeature.get(storyNum);
          if (!featureSlug) {
            for (const caseDir of caseFeatures.keys()) {
              if (story.slug.includes(caseDir)) {
                featureSlug = caseDir;
                break;
              }
            }
          }
        } else {
          featureSlug = caseFeatures.has(story.slug) ? story.slug : void 0;
        }
        if (featureSlug && caseFeatures.has(featureSlug)) {
          const cf = caseFeatures.get(featureSlug);
          const hasScript = specSlugs.has(featureSlug);
          coverage[story.slug] = { hasAPI: cf.hasAPI, hasIntegration: cf.hasIntegration, hasUI: cf.hasUI, hasE2E: cf.hasE2E, hasTC: cf.hasTC, hasScript, featureSlug };
        }
      }
    }
    return coverage;
  }
  async getDevStatusMap(rootPath) {
    return (await this.getStatus(rootPath)).devStatusMap;
  }
}
function registerHandlers(configStore, repoScanner, jiraClient, dangerZoneTracker, draftService, ignoreStore, keychainService, scheduler, sprintStatusReader, getWindow) {
  ipcMain.handle(IpcChannel.PROJECTS_LIST, async () => {
    return configStore.getProjects();
  });
  ipcMain.handle(IpcChannel.PROJECTS_ADD, async (_, rootPath) => {
    return configStore.addProject(rootPath);
  });
  ipcMain.handle(IpcChannel.PROJECTS_REMOVE, async (_, id) => {
    configStore.removeProject(id);
  });
  ipcMain.handle(IpcChannel.PROJECTS_RENAME, async (_, id, name) => {
    configStore.renameProject(id, name);
  });
  ipcMain.handle(
    IpcChannel.PROJECTS_CONFIG_UPDATE,
    async (_, projectId, patch) => {
      return configStore.updateConfig(projectId, patch);
    }
  );
  ipcMain.handle(IpcChannel.PROJECTS_CONFIG_GET, async (_, projectId) => {
    return configStore.getConfig(projectId);
  });
  ipcMain.handle(IpcChannel.REPO_SCAN, async (_, projectId) => {
    const project = configStore.getProjects().find((p) => p.id === projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);
    return repoScanner.scan(project);
  });
  ipcMain.handle(IpcChannel.REPO_SCAN_ALL, async () => {
    const projects = configStore.getProjects();
    const results = await Promise.allSettled(projects.map((p) => repoScanner.scan(p)));
    return results.map((r, i) => {
      if (r.status === "fulfilled") return r.value;
      return { projectId: projects[i].id, error: r.reason?.message };
    });
  });
  ipcMain.handle(
    IpcChannel.JIRA_TICKETS_FETCH,
    async (_, keys) => {
      const jira = configStore.getGlobalJira();
      if (!jira?.site || !jira?.email) throw new Error("JIRA_NOT_CONFIGURED");
      const baseUrl = jira.site.startsWith("http") ? jira.site.replace(/\/$/, "") : `https://${jira.site}.atlassian.net`;
      return jiraClient.getTickets(keys, baseUrl, jira.email);
    }
  );
  ipcMain.handle(IpcChannel.JIRA_TEST, async (_, baseUrl, email) => {
    return jiraClient.testConnection(baseUrl, email);
  });
  ipcMain.handle(
    IpcChannel.JIRA_SETTINGS_SET,
    async (_, settings) => {
      configStore.setGlobalJira(settings);
    }
  );
  ipcMain.handle(IpcChannel.JIRA_SETTINGS_GET, async () => {
    return configStore.getGlobalJira();
  });
  ipcMain.handle(IpcChannel.JIRA_PROJECTS_SET, async (_, projects) => {
    configStore.setJiraProjects(projects);
  });
  ipcMain.handle(IpcChannel.JIRA_PROJECTS_GET, async () => {
    return configStore.getJiraProjects();
  });
  ipcMain.handle(IpcChannel.TASK_IGNORE, async (_, taskId) => {
    ignoreStore.ignore(taskId);
  });
  ipcMain.handle(IpcChannel.TASK_UNIGNORE, async (_, taskId) => {
    ignoreStore.unignore(taskId);
  });
  ipcMain.handle(
    IpcChannel.TASK_TOGGLE,
    async (_, filePath, lineNumber, checked) => {
      const content = await readFile(filePath, "utf-8");
      const lines = content.split("\n");
      const idx = lineNumber - 1;
      if (idx < 0 || idx >= lines.length) throw new Error("Line out of range");
      lines[idx] = lines[idx].replace(
        checked ? /^(\s*-\s\[)\s(\])/ : /^(\s*-\s\[)[xX](\])/,
        `$1${checked ? "x" : " "}$2`
      );
      await writeFile(filePath, lines.join("\n"), "utf-8");
    }
  );
  ipcMain.handle(IpcChannel.DANGERZONE_STATE, async (_, projectId) => {
    return dangerZoneTracker.getState(projectId);
  });
  ipcMain.handle(
    IpcChannel.DRAFT_CREATE,
    async (_, taskId, projectId) => {
      const project = configStore.getProjects().find((p) => p.id === projectId);
      if (!project) throw new Error(`Project not found: ${projectId}`);
      const result = await repoScanner.scan(project);
      const task = result.untracked.find((t) => t.id === taskId);
      if (!task) throw new Error(`Task not found: ${taskId}`);
      let surroundingLines = [];
      try {
        const content = await readFile(task.filePath, "utf-8");
        const lines = content.split("\n");
        surroundingLines = getSurroundingLines(lines, task.lineNumber - 1, 5);
      } catch {
      }
      return draftService.draftTicket(task, project, surroundingLines);
    }
  );
  ipcMain.handle(IpcChannel.AI_START_MY_DAY, async (_, context) => {
    const win = getWindow();
    await draftService.startMyDay(context, win);
  });
  ipcMain.handle(IpcChannel.KEYCHAIN_SET, async (_, key, value) => {
    await keychainService.setCredential(
      key,
      value
    );
  });
  ipcMain.handle(IpcChannel.KEYCHAIN_GET, async (_, key) => {
    return keychainService.getCredential(
      key
    );
  });
  ipcMain.handle(IpcChannel.KEYCHAIN_DELETE, async (_, key) => {
    await keychainService.deleteCredential(
      key
    );
  });
  ipcMain.handle(IpcChannel.SCHEDULER_TRIGGER, async () => {
    return scheduler.triggerSync();
  });
  ipcMain.handle(IpcChannel.JIRA_SPRINT_ACTIVE, async (_, projectId) => {
    const project = configStore.getProjects().find((p) => p.id === projectId);
    if (!project?.jiraBoardId || !project?.jiraBaseUrl) return null;
    const jiraSettings = configStore.getGlobalJira();
    if (!jiraSettings?.email) return null;
    return jiraClient.getActiveSprint(project.jiraBoardId, project.jiraBaseUrl, jiraSettings.email);
  });
  ipcMain.handle(IpcChannel.SPRINT_STATUS_GET, async (_, projectId) => {
    const project = configStore.getProjects().find((p) => p.id === projectId);
    if (!project) return { devStatusMap: {}, epicHierarchy: [] };
    return sprintStatusReader.getStatus(project.rootPath);
  });
  ipcMain.handle(IpcChannel.DEV_TOOLS_TOGGLE, () => {
    const win = getWindow();
    if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools();
    else win.webContents.openDevTools();
  });
  ipcMain.handle(IpcChannel.AI_ASK, async (_, prompt, imagePath) => {
    const win = getWindow();
    try {
      await draftService.ask(prompt, win, imagePath);
      if (!win.isDestroyed()) win.webContents.send(IpcChannel.STREAM_END);
    } catch (err) {
      if (!win.isDestroyed()) win.webContents.send(IpcChannel.STREAM_ERROR, err.message);
    }
  });
  ipcMain.handle(IpcChannel.NOTES_GET, (_event, date) => {
    return configStore.getNote(date);
  });
  ipcMain.handle(IpcChannel.NOTES_SET, (_event, date, text) => {
    configStore.setNote(date, text);
  });
  ipcMain.handle(IpcChannel.SHELL_OPEN_EXTERNAL, async (_, url) => {
    await shell.openExternal(url);
  });
  ipcMain.handle(IpcChannel.DIALOG_OPEN_FOLDER, async () => {
    const win = getWindow();
    if (!win.isDestroyed()) win.focus();
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Select Project Folder"
    });
    return result.canceled ? null : result.filePaths[0];
  });
}
let mainWindow = null;
app.whenReady().then(async () => {
  const keychainService = new KeychainService();
  const configStore = new ConfigStore();
  const ignoreStore = new IgnoreStore();
  const repoScanner = new RepoScanner(ignoreStore);
  const jiraClient = new JiraClient(keychainService);
  const dangerZoneTracker = new DangerZoneTracker(configStore);
  const draftService = new DraftService();
  const sprintStatusReader = new SprintStatusReader();
  mainWindow = createWindow();
  const scheduler = new Scheduler(
    configStore,
    repoScanner,
    jiraClient,
    dangerZoneTracker,
    () => mainWindow
  );
  registerHandlers(
    configStore,
    repoScanner,
    jiraClient,
    dangerZoneTracker,
    draftService,
    ignoreStore,
    keychainService,
    scheduler,
    sprintStatusReader,
    () => mainWindow
  );
  scheduler.start();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  mainWindow = null;
});
