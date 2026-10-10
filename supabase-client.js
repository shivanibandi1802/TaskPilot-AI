/**
 * TaskPilot AI — Supabase Cloud Persistence Integration
 * Provides secure, persistent multi-device synchronization with graceful offline fallback.
 * Only requires Supabase Project URL and Anon Public Key. Never uses or exposes secrets.
 */

class SupabaseManager {
  constructor() {
    this.client = null;
    this.isOnline = false;
    this.configKey = 'taskpilot_supabase_config_v1';
    this.lastSyncTimestamp = null;
    this.init();
  }

  async init() {
    // 1. Try to load config from server /api/config (environment variables)
    let envConfig = null;
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        envConfig = await res.json();
      }
    } catch (e) {
      // Local file or static server without /api/config - continue
    }

    const localConfig = this.getLocalConfig();
    const url = (envConfig && envConfig.supabaseUrl) || (localConfig && localConfig.url) || null;
    const anonKey = (envConfig && envConfig.supabaseAnonKey) || (localConfig && localConfig.anonKey) || null;

    if (url && anonKey) {
      await this.connect(url, anonKey, false);
    }
  }

  getLocalConfig() {
    try {
      const item = localStorage.getItem(this.configKey);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  saveLocalConfig(url, anonKey) {
    try {
      localStorage.setItem(this.configKey, JSON.stringify({
        url: (url || '').trim(),
        anonKey: (anonKey || '').trim(),
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Could not save Supabase config locally', e);
    }
  }

  clearConfig() {
    try {
      localStorage.removeItem(this.configKey);
      this.client = null;
      this.isOnline = false;
      this.lastSyncTimestamp = null;
    } catch (e) {}
  }

  async connect(url, anonKey, saveLocally = true) {
    if (!url || !anonKey) {
      throw new Error('Supabase URL and Anon Key are required.');
    }

    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      throw new Error('Supabase URL must start with https:// or http://');
    }

    // Check if Supabase JS SDK is loaded
    const supabaseLib = window.supabase;
    if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
      throw new Error('Supabase client library is not loaded. Please verify your internet connection or CDN link.');
    }

    try {
      this.client = supabaseLib.createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false }
      });

      // Test connection with a lightweight probe
      const testResult = await this.testConnection();
      if (!testResult.success) {
        throw new Error(testResult.message);
      }

      this.isOnline = true;
      if (saveLocally) {
        this.saveLocalConfig(cleanUrl, cleanKey);
      }

      return { success: true, message: 'Connected to Supabase successfully!' };
    } catch (err) {
      this.client = null;
      this.isOnline = false;
      throw err;
    }
  }

  async testConnection() {
    if (!this.client) {
      const cfg = this.getLocalConfig();
      if (!cfg || !cfg.url || !cfg.anonKey) {
        return { success: false, message: 'No Supabase credentials configured.' };
      }
      try {
        await this.connect(cfg.url, cfg.anonKey, false);
      } catch (err) {
        return { success: false, message: err.message };
      }
    }

    try {
      // Test querying workflows table (limit 1)
      const { data, error } = await this.client
        .from('workflows')
        .select('id')
        .limit(1);

      if (error) {
        // Check for table existence error
        if (error.code === '42P01' || error.message.includes('relation "public.workflows" does not exist')) {
          return {
            success: false,
            message: 'Connected to Supabase, but "workflows" table was not found. Please run the supabase_schema.sql script in your Supabase SQL editor.'
          };
        }
        return { success: false, message: error.message };
      }

      this.isOnline = true;
      return { success: true, message: 'Supabase database is connected and active!' };
    } catch (err) {
      this.isOnline = false;
      return { success: false, message: `Connection failed: ${err.message}` };
    }
  }

  getStatus() {
    const cfg = this.getLocalConfig();
    return {
      isConfigured: Boolean(cfg && cfg.url && cfg.anonKey),
      isOnline: this.isOnline,
      url: cfg ? cfg.url : null,
      lastSync: this.lastSyncTimestamp
    };
  }

  /* ==========================================================================
     Cloud Synchronization: Workflows & Tasks
     ========================================================================== */
  async syncWorkflowsToCloud(workflows) {
    if (!this.client || !this.isOnline) return false;
    try {
      const formatted = (workflows || []).map(w => ({
        id: w.id,
        title: w.title,
        objective: w.objective || w.title || '',
        summary: w.summary || '',
        assumptions: w.assumptions || [],
        milestones: w.milestones || [],
        tasks: w.tasks || [],
        risks: w.risks || [],
        status: w.status || 'draft',
        deadline: w.deadline || null,
        detail_level: w.detailLevel || 'standard',
        team_size: w.teamSize || null,
        budget: w.budget || null,
        project_id: w.projectId || 'proj-academic',
        is_demo_mode: Boolean(w.isDemoMode),
        updated_at: new Date().toISOString()
      }));

      if (formatted.length > 0) {
        const { error } = await this.client
          .from('workflows')
          .upsert(formatted, { onConflict: 'id' });

        if (error) {
          console.warn('Supabase workflows sync error:', error.message);
          return false;
        }
      }
      this.lastSyncTimestamp = new Date();
      return true;
    } catch (e) {
      console.warn('Failed to sync workflows to Supabase:', e);
      return false;
    }
  }

  async fetchWorkflowsFromCloud() {
    if (!this.client || !this.isOnline) return null;
    try {
      const { data, error } = await this.client
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error || !data) return null;

      return data.map(w => ({
        id: w.id,
        title: w.title,
        objective: w.objective,
        summary: w.summary,
        assumptions: w.assumptions || [],
        milestones: w.milestones || [],
        tasks: w.tasks || [],
        risks: w.risks || [],
        status: w.status || 'draft',
        deadline: w.deadline,
        detailLevel: w.detail_level || 'standard',
        teamSize: w.team_size,
        budget: w.budget,
        projectId: w.project_id || 'proj-academic',
        isDemoMode: w.is_demo_mode !== false,
        createdAt: w.created_at,
        updatedAt: w.updated_at
      }));
    } catch (e) {
      console.warn('Failed to fetch workflows from Supabase:', e);
      return null;
    }
  }

  async syncTasksToCloud(tasks) {
    if (!this.client || !this.isOnline) return false;
    try {
      const formatted = (tasks || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        project_id: t.projectId || 'proj-academic',
        priority: t.priority || 'medium',
        status: t.status || 'todo',
        quadrant: t.quadrant || 'q2',
        due_date: t.dueDate || null,
        estimated_mins: t.estimatedMins || 60,
        time_spent_mins: t.timeSpentMins || 0,
        subtasks: t.subtasks || [],
        workflow_id: t.workflowId || null,
        workflow_title: t.workflowTitle || null,
        workflow_phase: t.workflowPhase || null,
        dependencies: t.dependencies || [],
        suggested_role: t.suggestedRole || null,
        completion_criteria: t.completionCriteria || null,
        updated_at: new Date().toISOString()
      }));

      if (formatted.length > 0) {
        const { error } = await this.client
          .from('tasks')
          .upsert(formatted, { onConflict: 'id' });

        if (error) {
          console.warn('Supabase tasks sync error:', error.message);
          return false;
        }
      }
      this.lastSyncTimestamp = new Date();
      return true;
    } catch (e) {
      console.warn('Failed to sync tasks to Supabase:', e);
      return false;
    }
  }

  async fetchTasksFromCloud() {
    if (!this.client || !this.isOnline) return null;
    try {
      const { data, error } = await this.client
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        projectId: t.project_id || 'proj-academic',
        priority: t.priority || 'medium',
        status: t.status || 'todo',
        quadrant: t.quadrant || 'q2',
        dueDate: t.due_date,
        estimatedMins: t.estimated_mins || 60,
        timeSpentMins: t.time_spent_mins || 0,
        subtasks: t.subtasks || [],
        workflowId: t.workflow_id,
        workflowTitle: t.workflow_title,
        workflowPhase: t.workflow_phase,
        dependencies: t.dependencies || [],
        suggestedRole: t.suggested_role,
        completionCriteria: t.completion_criteria,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }));
    } catch (e) {
      console.warn('Failed to fetch tasks from Supabase:', e);
      return null;
    }
  }

  async syncAll(storageManager) {
    if (!storageManager || !this.isOnline) return { success: false, message: 'Not connected to Supabase.' };
    try {
      const localTasks = storageManager.getTasks();
      const localWorkflows = storageManager.getWorkflows();

      // Upsert local data to cloud
      await this.syncWorkflowsToCloud(localWorkflows);
      await this.syncTasksToCloud(localTasks);

      // Check cloud workflows to merge any newer records
      const cloudWfs = await this.fetchWorkflowsFromCloud();
      if (cloudWfs && cloudWfs.length > 0) {
        const wfMap = new Map();
        localWorkflows.forEach(w => wfMap.set(w.id, w));
        cloudWfs.forEach(w => wfMap.set(w.id, w));
        storageManager.saveWorkflows(Array.from(wfMap.values()));
      }

      const cloudTasks = await this.fetchTasksFromCloud();
      if (cloudTasks && cloudTasks.length > 0) {
        const taskMap = new Map();
        localTasks.forEach(t => taskMap.set(t.id, t));
        cloudTasks.forEach(t => taskMap.set(t.id, t));
        storageManager.saveTasks(Array.from(taskMap.values()));
      }

      this.lastSyncTimestamp = new Date();
      return { success: true, message: `Synced ${localTasks.length} tasks and ${localWorkflows.length} workflows with Supabase!` };
    } catch (err) {
      return { success: false, message: `Sync failed: ${err.message}` };
    }
  }
}

// Global singleton instance
window.supabaseManager = new SupabaseManager();
