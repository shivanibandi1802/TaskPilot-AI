/**
 * TaskPilot AI — Storage & State Management Module
 * Handles local storage persistence, state hydration, and data export/import.
 */

const STORAGE_KEYS = {
  TASKS: 'taskpilot_tasks_v1',
  PROJECTS: 'taskpilot_projects_v1',
  THEME: 'taskpilot_theme_v1',
  POMODORO_STATS: 'taskpilot_pomodoro_v1',
  WORKFLOWS: 'taskpilot_workflows_v1',
  ACTIVE_DRAFT: 'taskpilot_active_draft_v1',
  AI_CONFIG: 'taskpilot_ai_config_v1',
};

const DEFAULT_PROJECTS = [
  { id: 'proj-ai', name: 'AI Engineering', color: '#6366f1' },
  { id: 'proj-launch', name: 'Product Launch', color: '#ec4899' },
  { id: 'proj-academic', name: 'Academic Research', color: '#06b6d4' },
  { id: 'proj-personal', name: 'Personal Growth', color: '#10b981' },
];

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Design neural network architecture for TaskPilot model',
    description: 'Implement transformer encoder blocks and attention heads for natural language task parsing.',
    projectId: 'proj-ai',
    priority: 'urgent',
    status: 'in-progress',
    quadrant: 'q1', // Urgent & Important
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    estimatedMins: 90,
    timeSpentMins: 45,
    subtasks: [
      { id: 'st-1-1', title: 'Define attention layer matrix', completed: true },
      { id: 'st-1-2', title: 'Benchmark tokenizer throughput', completed: true },
      { id: 'st-1-3', title: 'Implement positional embeddings', completed: false },
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Deploy WebSocket server for real-time collaboration',
    description: 'Setup low-latency sync mechanism with automated reconnection and state conflict resolution.',
    projectId: 'proj-launch',
    priority: 'high',
    status: 'todo',
    quadrant: 'q2', // Important, Not Urgent
    dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], // In 3 days
    estimatedMins: 120,
    timeSpentMins: 0,
    subtasks: [
      { id: 'st-2-1', title: 'Audit connection handshake latency', completed: false },
      { id: 'st-2-2', title: 'Configure heartbeat ping/pong interval', completed: false },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Audit system performance & bundle size',
    description: 'Analyze tree-shaking, memory leaks in canvas rendering, and lazy load routes.',
    projectId: 'proj-launch',
    priority: 'medium',
    status: 'review',
    quadrant: 'q2',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    estimatedMins: 60,
    timeSpentMins: 55,
    subtasks: [
      { id: 'st-3-1', title: 'Run lighthouse performance audit', completed: true },
      { id: 'st-3-2', title: 'Minify SVG vectors', completed: true },
    ],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Complete Literature Review on Autonomous Agents',
    description: 'Summarize 5 key academic papers on hierarchical reasoning and agent tool selection.',
    projectId: 'proj-academic',
    priority: 'urgent',
    status: 'done',
    quadrant: 'q1',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    estimatedMins: 180,
    timeSpentMins: 180,
    subtasks: [
      { id: 'st-4-1', title: 'Read ReAct agent paper', completed: true },
      { id: 'st-4-2', title: 'Synthesize benchmark results', completed: true },
    ],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 'task-5',
    title: 'Daily Mindfulness & 30-min Deep Work Routine',
    description: 'Maintain high focus baseline without cognitive fatigue.',
    projectId: 'proj-personal',
    priority: 'low',
    status: 'done',
    quadrant: 'q2',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedMins: 30,
    timeSpentMins: 30,
    subtasks: [
      { id: 'st-5-1', title: 'Morning meditation session', completed: true },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'Renew API Gateway SSL certificates',
    description: 'Check automated certificate renewal bot before expiry warning.',
    projectId: 'proj-launch',
    priority: 'urgent',
    status: 'todo',
    quadrant: 'q3', // Urgent, Not Important
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    estimatedMins: 20,
    timeSpentMins: 0,
    subtasks: [],
    createdAt: new Date().toISOString(),
  }
];

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WORKFLOWS)) {
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify([]));
    }
  }

  getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse tasks from localStorage', e);
      return [];
    }
  }

  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  addTask(task) {
    const tasks = this.getTasks();
    const newTask = {
      id: task.id || ('task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
      title: task.title ? task.title.trim() : 'Untitled Task',
      description: task.description || '',
      projectId: task.projectId || 'proj-ai',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      quadrant: task.quadrant || this.calculateQuadrant(task.priority),
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      estimatedMins: parseInt(task.estimatedMins, 10) || 30,
      timeSpentMins: task.timeSpentMins || 0,
      subtasks: task.subtasks || [],
      workflowId: task.workflowId || null,
      workflowTitle: task.workflowTitle || null,
      workflowPhase: task.workflowPhase || null,
      dependencies: task.dependencies || [],
      suggestedRole: task.suggestedRole || null,
      completionCriteria: task.completionCriteria || null,
      createdAt: task.createdAt || new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);

    if (newTask.workflowId) {
      this.syncWorkflowProgress(newTask.workflowId);
    }

    if (window.supabaseManager && window.supabaseManager.isOnline) {
      window.supabaseManager.syncTasksToCloud(this.getTasks());
    }

    return newTask;
  }

  updateTask(id, updates) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const prev = tasks[idx];
      tasks[idx] = { ...prev, ...updates };
      this.saveTasks(tasks);

      const wfId = tasks[idx].workflowId || prev.workflowId;
      if (wfId) {
        this.syncWorkflowProgress(wfId);
      }

      if (window.supabaseManager && window.supabaseManager.isOnline) {
        window.supabaseManager.syncTasksToCloud(this.getTasks());
      }

      return tasks[idx];
    }
    return null;
  }

  toggleTaskCompletion(id) {
    const task = this.getTaskById(id);
    if (!task) return null;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    return this.updateTask(id, { status: newStatus });
  }

  deleteTask(id) {
    const tasks = this.getTasks();
    const target = tasks.find(t => t.id === id);
    const updated = tasks.filter(t => t.id !== id);
    this.saveTasks(updated);

    if (target && target.workflowId) {
      this.syncWorkflowProgress(target.workflowId);
    }

    if (window.supabaseManager && window.supabaseManager.isOnline) {
      window.supabaseManager.syncTasksToCloud(this.getTasks());
    }
  }

  getTaskById(id) {
    return this.getTasks().find(t => t.id === id) || null;
  }

  /* ==========================================================================
     Workflows Persistence & Progress Synchronization
     ========================================================================== */
  getWorkflows() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      const list = data ? JSON.parse(data) : [];
      // Re-hydrate dynamically calculated progress from actual tasks
      const allTasks = this.getTasks();
      return list.map(wf => this.enrichWorkflowWithTaskStats(wf, allTasks));
    } catch (e) {
      console.error('Failed to parse workflows from localStorage', e);
      return [];
    }
  }

  saveWorkflows(workflows) {
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
  }

  getWorkflowById(id) {
    const workflows = this.getWorkflows();
    return workflows.find(w => w.id === id) || null;
  }

  addWorkflow(workflow) {
    const rawList = this.getRawWorkflows();
    const existingIdx = rawList.findIndex(w => w.id === workflow.id);
    const now = new Date().toISOString();

    const wfData = {
      id: workflow.id || ('wf-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)),
      title: (workflow.title || 'Untitled Workflow').trim(),
      objective: workflow.objective || workflow.title || '',
      summary: workflow.summary || '',
      assumptions: Array.isArray(workflow.assumptions) ? workflow.assumptions : [],
      milestones: Array.isArray(workflow.milestones) ? workflow.milestones : [],
      tasks: Array.isArray(workflow.tasks) ? workflow.tasks : [],
      risks: Array.isArray(workflow.risks) ? workflow.risks : [],
      status: workflow.status || 'draft', // draft, active, completed, archived
      createdAt: workflow.createdAt || now,
      updatedAt: now,
      deadline: workflow.deadline || null,
      detailLevel: workflow.detailLevel || 'standard',
      teamSize: workflow.teamSize || null,
      budget: workflow.budget || null,
      projectId: workflow.projectId || 'proj-academic',
      isDemoMode: workflow.isDemoMode !== undefined ? workflow.isDemoMode : true,
      refinementHistory: workflow.refinementHistory || [],
    };

    if (existingIdx !== -1) {
      rawList[existingIdx] = { ...rawList[existingIdx], ...wfData, updatedAt: now };
    } else {
      rawList.unshift(wfData);
    }

    this.saveWorkflows(rawList);

    if (window.supabaseManager && window.supabaseManager.isOnline) {
      window.supabaseManager.syncWorkflowsToCloud(this.getRawWorkflows());
    }

    return this.enrichWorkflowWithTaskStats(wfData, this.getTasks());
  }

  updateWorkflow(id, updates) {
    const rawList = this.getRawWorkflows();
    const idx = rawList.findIndex(w => w.id === id);
    if (idx !== -1) {
      rawList[idx] = { ...rawList[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveWorkflows(rawList);

      if (window.supabaseManager && window.supabaseManager.isOnline) {
        window.supabaseManager.syncWorkflowsToCloud(this.getRawWorkflows());
      }

      return this.enrichWorkflowWithTaskStats(rawList[idx], this.getTasks());
    }
    return null;
  }

  renameWorkflow(id, newTitle) {
    if (!id || !newTitle || !newTitle.trim()) return null;
    const cleanTitle = newTitle.trim();
    const updatedWf = this.updateWorkflow(id, { title: cleanTitle });

    // Also update workflowTitle on all tasks that belong to this workflow
    const tasks = this.getTasks();
    let tasksChanged = false;
    tasks.forEach(t => {
      if (t.workflowId === id) {
        t.workflowTitle = cleanTitle;
        tasksChanged = true;
      }
    });

    if (tasksChanged) {
      this.saveTasks(tasks);
      if (window.supabaseManager && window.supabaseManager.isOnline) {
        window.supabaseManager.syncTasksToCloud(this.getTasks());
      }
    }

    return updatedWf;
  }

  deleteWorkflow(id, removeImportedTasks = false) {
    const rawList = this.getRawWorkflows().filter(w => w.id !== id);
    this.saveWorkflows(rawList);

    if (removeImportedTasks) {
      const tasks = this.getTasks().filter(t => t.workflowId !== id);
      this.saveTasks(tasks);
    }

    if (window.supabaseManager && window.supabaseManager.isOnline) {
      window.supabaseManager.syncWorkflowsToCloud(this.getRawWorkflows());
      if (removeImportedTasks) {
        window.supabaseManager.syncTasksToCloud(this.getTasks());
      }
    }
  }

  getRawWorkflows() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getActiveWorkflowDraft() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to parse active workflow draft from localStorage', e);
      return null;
    }
  }

  saveActiveWorkflowDraft(draft) {
    try {
      if (!draft) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_DRAFT);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(draft));
      }
    } catch (e) {
      console.error('Failed to save active workflow draft', e);
    }
  }

  clearActiveWorkflowDraft() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_DRAFT);
    } catch (e) {
      console.error('Failed to clear active workflow draft', e);
    }
  }

  enrichWorkflowWithTaskStats(workflow, allTasks = null) {
    if (!workflow) return null;
    const tasks = allTasks || this.getTasks();
    const importedTasks = tasks.filter(t => t.workflowId === workflow.id);

    // Map completion across tasks defined inside workflow vs tasks imported
    const totalInternalTasks = (workflow.tasks && workflow.tasks.length) || 0;
    const importedCount = importedTasks.length;
    const completedImported = importedTasks.filter(t => t.status === 'done').length;

    // Internal task statuses check
    const completedInternal = (workflow.tasks || []).filter(t => t.status === 'done').length;
    const effectiveTotal = Math.max(totalInternalTasks, importedCount);
    const effectiveCompleted = Math.max(completedImported, completedInternal);

    const completionRate = effectiveTotal > 0 
      ? Math.round((effectiveCompleted / effectiveTotal) * 100) 
      : 0;

    let computedStatus = workflow.status || 'draft';
    if (computedStatus !== 'archived') {
      if (effectiveTotal > 0 && effectiveCompleted === effectiveTotal) {
        computedStatus = 'completed';
      } else if (importedCount > 0 || completedInternal > 0) {
        computedStatus = 'active';
      }
    }

    return {
      ...workflow,
      status: computedStatus,
      importedTasksCount: importedCount,
      completedTasksCount: effectiveCompleted,
      totalTasksCount: effectiveTotal,
      completionRate,
      // Field aliases for compatibility
      totalTasks: effectiveTotal,
      completedTasks: effectiveCompleted,
      completionPercentage: completionRate,
    };
  }

  syncWorkflowProgress(workflowId) {
    if (!workflowId) return;
    const rawList = this.getRawWorkflows();
    const idx = rawList.findIndex(w => w.id === workflowId);
    if (idx === -1) return;

    const allTasks = this.getTasks();
    const importedTasks = allTasks.filter(t => t.workflowId === workflowId);
    const importedMap = new Map(importedTasks.map(t => [t.title.toLowerCase().trim(), t]));

    // Sync task statuses back into workflow definition if matched
    if (Array.isArray(rawList[idx].tasks)) {
      rawList[idx].tasks = rawList[idx].tasks.map(wt => {
        const matchingImport = wt.importedTaskId 
          ? allTasks.find(t => t.id === wt.importedTaskId)
          : importedMap.get(wt.title.toLowerCase().trim());

        if (matchingImport) {
          return {
            ...wt,
            status: matchingImport.status,
            imported: true,
            importedTaskId: matchingImport.id,
          };
        }
        return wt;
      });
    }

    const total = rawList[idx].tasks ? rawList[idx].tasks.length : 0;
    const completed = rawList[idx].tasks ? rawList[idx].tasks.filter(t => t.status === 'done').length : 0;
    
    if (rawList[idx].status !== 'archived') {
      if (total > 0 && completed === total) {
        rawList[idx].status = 'completed';
      } else if (importedTasks.length > 0 || completed > 0) {
        rawList[idx].status = 'active';
      }
    }

    rawList[idx].updatedAt = new Date().toISOString();
    this.saveWorkflows(rawList);
  }

  /* ==========================================================================
     AI Engine Configuration
     ========================================================================== */
  getAIConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
      return data ? JSON.parse(data) : {
        provider: 'demo', // 'demo', 'gemini', 'openai', 'custom'
        apiKey: '',
        model: 'gemini-1.5-flash',
        customEndpoint: '',
      };
    } catch (e) {
      return { provider: 'demo', apiKey: '', model: 'gemini-1.5-flash', customEndpoint: '' };
    }
  }

  saveAIConfig(config) {
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(config));
  }

  getProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : DEFAULT_PROJECTS;
    } catch (e) {
      return DEFAULT_PROJECTS;
    }
  }

  addProject(name, color = '#6366f1') {
    const projects = this.getProjects();
    const newProj = {
      id: 'proj-' + Date.now(),
      name: name.trim(),
      color,
    };
    projects.push(newProj);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return newProj;
  }

  calculateQuadrant(priority) {
    switch (priority) {
      case 'urgent': return 'q1';
      case 'high': return 'q2';
      case 'medium': return 'q3';
      case 'low': return 'q4';
      default: return 'q2';
    }
  }

  exportDataJSON() {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      projects: this.getProjects(),
      tasks: this.getTasks(),
      workflows: this.getWorkflows(),
      aiConfig: {
        provider: this.getAIConfig().provider,
        model: this.getAIConfig().model,
      }
    };
    return JSON.stringify(data, null, 2);
  }

  importDataJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.tasks)) {
        this.saveTasks(parsed.tasks);
      }
      if (Array.isArray(parsed.projects)) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(parsed.projects));
      }
      if (Array.isArray(parsed.workflows)) {
        this.saveWorkflows(parsed.workflows);
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  resetDefaults() {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify([]));
  }

  exportMarkdownReport() {
    const tasks = this.getTasks();
    const projects = this.getProjects();
    const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]));
    
    let md = `# 🚀 TaskPilot AI — Productivity Report\n`;
    md += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
    
    const completed = tasks.filter(t => t.status === 'done');
    const inProgress = tasks.filter(t => t.status === 'in-progress');
    const todo = tasks.filter(t => t.status === 'todo');

    md += `## 📊 Executive Summary\n`;
    md += `- Total Tasks: ${tasks.length}\n`;
    md += `- Completed: ${completed.length} (${Math.round((completed.length / (tasks.length || 1)) * 100)}%)\n`;
    md += `- Active / In Progress: ${inProgress.length}\n`;
    md += `- Backlog / To Do: ${todo.length}\n\n`;

    md += `## 📋 Task Breakdown\n\n`;
    tasks.forEach(t => {
      const statusIcon = t.status === 'done' ? '✅' : t.status === 'in-progress' ? '🔄' : '⏳';
      md += `### ${statusIcon} ${t.title}\n`;
      md += `- **Project**: ${projectMap[t.projectId] || 'General'}\n`;
      md += `- **Priority**: ${t.priority.toUpperCase()} | **Due**: ${t.dueDate || 'None'}\n`;
      if (t.description) md += `- **Description**: ${t.description}\n`;
      if (t.subtasks && t.subtasks.length > 0) {
        md += `- **Checklist**:\n`;
        t.subtasks.forEach(st => {
          md += `  - [${st.completed ? 'x' : ' '}] ${st.title}\n`;
        });
      }
      md += `\n`;
    });

    return md;
  }
}

// Global singleton instance
window.storageManager = new StorageManager();
