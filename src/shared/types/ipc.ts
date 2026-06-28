// IPC Channel definitions — ทุก channel ต้องประกาศที่นี่เท่านั้น
// Push events (main → renderer): prefix event:*
// Request events (renderer → main): รูปแบบ category:action

export const enum IpcChannel {
  // Renderer → Main (invoke/handle)
  PROJECTS_LIST = 'projects:list',
  PROJECTS_ADD = 'projects:add',
  PROJECTS_REMOVE = 'projects:remove',
  PROJECTS_CONFIG_UPDATE = 'projects:config:update',
  PROJECTS_CONFIG_GET = 'projects:config:get',
  REPO_SCAN = 'repo:scan',
  REPO_SCAN_ALL = 'repo:scan:all',
  JIRA_TICKETS_FETCH = 'jira:tickets:fetch',
  JIRA_BOARD_FETCH = 'jira:board:fetch',
  JIRA_TEST = 'jira:test',
  TASK_IGNORE = 'task:ignore',
  TASK_UNIGNORE = 'task:unignore',
  DANGERZONE_STATE = 'dangerzone:state',
  DRAFT_CREATE = 'draft:create',
  AI_START_MY_DAY = 'ai:start-my-day',
  KEYCHAIN_SET = 'keychain:set',
  KEYCHAIN_GET = 'keychain:get',
  KEYCHAIN_DELETE = 'keychain:delete',
  SCHEDULER_TRIGGER = 'scheduler:trigger',

  // Main → Renderer (webContents.send) — push events
  SYNC_COMPLETED = 'event:sync:completed',
  DANGER_ZONE_TRIGGERED = 'event:dangerzone:triggered',
  STREAM_CHUNK = 'event:stream:chunk',
  STREAM_END = 'event:stream:end',
  STREAM_ERROR = 'event:stream:error',
}
