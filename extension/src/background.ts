/// <reference types="chrome" />

// Chrome Extension Service Worker (background.ts)

// 1. Initialize Context Menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-link-task',
    title: 'Save current page as task',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'save-reading-list',
    title: 'Save page for later (Reading List)',
    contexts: ['page']
  });
});

// Helper to broadcast state to all open FocusFlow tabs
const broadcastStateToWebTabs = async (state: any) => {
  const tabs = await chrome.tabs.query({});
  const targetUrls = ['http://localhost/', 'http://127.0.0.1/'];
  
  tabs.forEach((tab: any) => {
    if (tab.id && tab.url && targetUrls.some(url => tab.url?.startsWith(url))) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'STATE_UPDATE_FROM_EXTENSION',
        state
      }).catch(() => {
        // Tab might not have content scripts loaded yet, ignore
      });
    }
  });
};

// 2. Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info: any, tab: any) => {
  if (!tab || !tab.url) return;
  
  const title = tab.title || 'Saved Page';
  const url = tab.url;

  // Retrieve state from storage
  const result: any = await chrome.storage.local.get('focusflow_state');
  const state = result.focusflow_state || { goals: [], projects: [], tasks: [], sessions: [], dailyReviews: [], weeklyReviews: [], settings: {} };

  // Generate a task
  const taskId = crypto.randomUUID();
  
  // Find first active project to map it to, or create a mock project called 'Inbox'
  let targetProjectId = state.projects[0]?.id;
  if (!targetProjectId) {
    // If no projects exist, seed a mock Goal & Project
    const goalId = crypto.randomUUID();
    targetProjectId = crypto.randomUUID();
    
    state.goals.push({
      id: goalId,
      name: 'General / Inbox',
      description: 'Incoming items saved from the browser companion.',
      progress: 0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      color: '#6366F1',
      icon: '📥',
      createdAt: new Date().toISOString()
    });

    state.projects.push({
      id: targetProjectId,
      goalId,
      name: 'Reading Inbox',
      description: 'Items captured from the web.',
      progress: 0,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'Important',
      status: 'In Progress',
      createdAt: new Date().toISOString()
    });
  }

  const tag = info.menuItemId === 'save-reading-list' ? 'reading' : 'extension';

  const newTask = {
    id: taskId,
    projectId: targetProjectId,
    name: info.menuItemId === 'save-reading-list' ? `Read: ${title}` : `Process: ${title}`,
    description: `Captured link: ${url}`,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
    estimatedTime: 15,
    actualTime: 0,
    impact: 'Low',
    priority: 'Low Priority',
    status: 'Todo',
    weight: 5,
    tags: [tag],
    notes: `Page title: ${title}\nURL: ${url}`,
    isRecurring: false,
    createdAt: new Date().toISOString(),
    isBigThree: false,
    isSavedLink: true,
    linkUrl: url
  };

  state.tasks.push(newTask);

  // Recalculate progress for the project (optional but good for sync consistency)
  const projTasks = state.tasks.filter((t: any) => t.projectId === targetProjectId && t.status !== 'Archived');
  const completedTasks = projTasks.filter((t: any) => t.status === 'Completed');
  const projectIndex = state.projects.findIndex((p: any) => p.id === targetProjectId);
  if (projectIndex !== -1 && projTasks.length > 0) {
    state.projects[projectIndex].progress = Math.round((completedTasks.length / projTasks.length) * 100);
  }

  // Save back to storage
  await chrome.storage.local.set({ focusflow_state: state });
  
  // Broadcast update to web app tabs so it updates instantly
  await broadcastStateToWebTabs(state);
});

// 3. Coordinate State Sync messages
chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
  if (message.action === 'STATE_CHANGED' && message.state) {
    // Received state from content script (web app page)
    chrome.storage.local.set({ focusflow_state: message.state });
    
    // Broadcast state to all other tabs
    chrome.tabs.query({}).then((tabs: any) => {
      tabs.forEach((t: any) => {
        if (t.id && sender.tab && t.id !== sender.tab.id) {
          chrome.tabs.sendMessage(t.id, {
            action: 'STATE_UPDATE_FROM_EXTENSION',
            state: message.state
          }).catch(() => {});
        }
      });
    });
  }
  
  if (message.action === 'GET_STATE') {
    chrome.storage.local.get('focusflow_state').then((result: any) => {
      sendResponse({ state: result.focusflow_state });
    });
    return true; // Keep message channel open for async response
  }

  if (message.action === 'UPDATE_STATE' && message.state) {
    // Received updated state from extension popup
    chrome.storage.local.set({ focusflow_state: message.state });
    
    // Broadcast updated state to all web app tabs
    broadcastStateToWebTabs(message.state);
  }
});
export {};
