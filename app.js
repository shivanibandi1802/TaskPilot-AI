/**
 * TaskPilot AI — Main Application Orchestrator
 * Controls user interface interactions, drag-and-drop kanban, modal workflows, and animations.
 */

class TaskPilotApp {
  constructor() {
    this.currentView = 'kanban';
    this.currentFilter = 'all';
    this.currentProjectFilter = 'all';
    this.searchQuery = '';
    this.draggedTaskId = null;
    this.editingTaskId = null;
    this.currentWorkflowResult = null;
    this.addedWorkflowTaskIds = new Set();

    // AI Workflow Generator State
    this.currentWorkflowTab = 'studio';
    this.activeWorkflowDraft = null;
    this.selectedWorkflowTaskIds = new Set();
    this.collapsedPhaseNames = new Set();
    this.expandedTaskDetailIds = new Set();
    this.historyFilter = 'all';
    this.historySearchQuery = '';
    this.editingWorkflowTaskId = null;
    this.editingWorkflowMilestoneId = null;
    this.matrixFilter = 'all';

    this.init();
  }

  init() {
    this.hydrateActiveWorkflowDraft();
    this.bindEvents();
    this.loadTheme();
    this.render();
    this.updateSupabaseStatusUI();
  }

  bindEvents() {
    // Navigation items
    document.querySelectorAll('[data-view-target]').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetView = item.getAttribute('data-view-target');
        this.switchView(targetView);
      });
    });

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Search input
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCurrentView();
      });
    }

    // Filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentFilter = pill.getAttribute('data-filter') || 'all';
        this.renderCurrentView();
      });
    });

    // Project filter buttons in sidebar
    document.querySelectorAll('[data-project-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-project-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentProjectFilter = btn.getAttribute('data-project-filter');
        this.renderCurrentView();
      });
    });

    // New Task Modal Trigger
    const newTaskBtn = document.getElementById('new-task-btn');
    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => this.openTaskModal());
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Task Form Submit
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => this.handleTaskFormSubmit(e));
    }

    // Natural Language Quick Add bar
    const nlInput = document.getElementById('quick-add-input');
    const nlBtn = document.getElementById('quick-add-btn');
    if (nlInput && nlBtn) {
      const handleQuickAdd = () => {
        const val = nlInput.value.trim();
        if (!val) return;
        const parsed = window.aiCopilot.parseNaturalLanguage(val);
        window.storageManager.addTask({
          title: parsed.title,
          priority: parsed.priority,
          quadrant: parsed.quadrant,
          dueDate: parsed.dueDate,
          estimatedMins: parsed.estimatedMins,
        });
        nlInput.value = '';
        this.showToast(`✨ Smart parsed & added: "${parsed.title}" (${parsed.priority.toUpperCase()})`);
        this.render();
      };

      nlBtn.addEventListener('click', handleQuickAdd);
      nlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleQuickAdd();
      });
    }

    // AI Copilot Launcher Button & Modal
    const aiCopilotBtn = document.getElementById('open-ai-copilot-btn');
    if (aiCopilotBtn) {
      aiCopilotBtn.addEventListener('click', () => this.openAICopilotModal());
    }

    const aiBreakdownBtn = document.getElementById('ai-breakdown-submit');
    if (aiBreakdownBtn) {
      aiBreakdownBtn.addEventListener('click', () => this.handleAIGoalDeconstruction());
    }

    // Prompt Chips in AI window
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const promptInput = document.getElementById('ai-goal-input');
        if (promptInput) {
          promptInput.value = chip.textContent.trim();
          this.handleAIGoalDeconstruction();
        }
      });
    });

    // Focus Timer Controls
    const timerStartBtn = document.getElementById('timer-start-btn');
    const timerResetBtn = document.getElementById('timer-reset-btn');
    if (timerStartBtn) {
      timerStartBtn.addEventListener('click', () => {
        if (window.focusTimer.isRunning) {
          window.focusTimer.pause();
          timerStartBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Resume Focus
          `;
        } else {
          window.focusTimer.start();
          timerStartBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            Pause Focus
          `;
        }
      });
    }

    if (timerResetBtn) {
      timerResetBtn.addEventListener('click', () => {
        window.focusTimer.reset();
        if (timerStartBtn) {
          timerStartBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Start Focus
          `;
        }
      });
    }

    document.querySelectorAll('[data-timer-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-timer-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-timer-mode');
        window.focusTimer.setMode(mode);
        if (timerStartBtn) {
          timerStartBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Start Session
          `;
        }
      });
    });

    // Ambient sound buttons
    const btnRain = document.getElementById('ambient-rain-btn');
    const btnBinaural = document.getElementById('ambient-binaural-btn');
    if (btnRain) {
      btnRain.addEventListener('click', () => {
        const isPlaying = window.focusTimer.toggleAmbient('rain');
        btnRain.classList.toggle('playing', isPlaying);
        if (btnBinaural) btnBinaural.classList.remove('playing');
        this.showToast(isPlaying ? '🌧️ Ambient Soft Rain playing' : 'Ambient audio stopped');
      });
    }

    if (btnBinaural) {
      btnBinaural.addEventListener('click', () => {
        const isPlaying = window.focusTimer.toggleAmbient('binaural');
        btnBinaural.classList.toggle('playing', isPlaying);
        if (btnRain) btnRain.classList.remove('playing');
        this.showToast(isPlaying ? '🧠 Binaural Theta Drone playing (6Hz focus)' : 'Ambient audio stopped');
      });
    }

    // Export & Import buttons
    const exportJsonBtn = document.getElementById('export-json-btn');
    const exportMdBtn = document.getElementById('export-md-btn');
    const resetDataBtn = document.getElementById('reset-data-btn');

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportJSON());
    }
    if (exportMdBtn) {
      exportMdBtn.addEventListener('click', () => this.exportMarkdown());
    }
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Reset all tasks to sample initial state?')) {
          window.storageManager.resetDefaults();
          this.render();
          this.showToast('Reset to default sample tasks');
        }
      });
    }

    // AI Workflow Generator Events
    document.querySelectorAll('[data-workflow-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-workflow-tab');
        this.switchWorkflowTab(targetTab);
      });
    });

    const wfInput = document.getElementById('workflow-instructions-input');
    const wfCharCounter = document.getElementById('workflow-char-counter') || document.getElementById('wf-char-counter');
    if (wfInput && wfCharCounter) {
      const updateCharCount = () => {
        const len = wfInput.value.length;
        if (len === 0) {
          wfCharCounter.textContent = '0 characters (min. 10)';
          wfCharCounter.className = 'workflow-char-counter';
        } else if (len < 10) {
          wfCharCounter.textContent = `${len} / 10 characters (needs ${10 - len} more)`;
          wfCharCounter.className = 'workflow-char-counter error';
        } else {
          wfCharCounter.textContent = `${len} characters (ready to generate)`;
          wfCharCounter.className = 'workflow-char-counter valid';
        }
      };
      wfInput.addEventListener('input', updateCharCount);
      updateCharCount();
    }

    const toggleWfSettingsBtn = document.getElementById('toggle-optional-settings-btn') || document.getElementById('toggle-wf-settings-btn');
    const wfSettingsBody = document.getElementById('optional-settings-body') || document.getElementById('wf-advanced-settings-body');
    const wfChevron = document.getElementById('optional-settings-arrow') || document.getElementById('wf-settings-chevron');
    if (toggleWfSettingsBtn && wfSettingsBody) {
      toggleWfSettingsBtn.addEventListener('click', () => {
        const isHidden = wfSettingsBody.style.display === 'none';
        wfSettingsBody.style.display = isHidden ? 'grid' : 'none';
        if (wfChevron) {
          wfChevron.textContent = isHidden ? '▲ Collapse Settings' : '▼ Expand Settings';
        }
      });
    }

    const hackathonBtn = document.getElementById('load-hackathon-demo-btn') || document.getElementById('load-hackathon-preset-btn');
    if (hackathonBtn) {
      hackathonBtn.addEventListener('click', () => {
        if (wfInput) {
          wfInput.value = "Organize a college hackathon for 100 participants in 10 days. Handle venue booking, registrations, sponsorships, marketing, mentors, equipment, event-day operations, and post-event feedback. We have four organizers and a limited budget.";
          wfInput.dispatchEvent(new Event('input', { bubbles: true }));
          if (wfCharCounter) {
            wfCharCounter.textContent = `${wfInput.value.length} characters (ready to generate)`;
            wfCharCounter.className = 'workflow-char-counter valid';
          }
        }
        const optName = document.getElementById('wf-setting-name') || document.getElementById('wf-opt-name');
        if (optName) optName.value = 'Campus Hackathon 2026';
        const optDeadline = document.getElementById('wf-setting-deadline') || document.getElementById('wf-opt-deadline');
        if (optDeadline) {
          const d = new Date();
          d.setDate(d.getDate() + 10);
          optDeadline.value = d.toISOString().split('T')[0];
        }
        const optPriority = document.getElementById('wf-setting-priority') || document.getElementById('wf-opt-priority');
        if (optPriority) optPriority.value = 'high';
        const optTeam = document.getElementById('wf-setting-team') || document.getElementById('wf-opt-team');
        if (optTeam) optTeam.value = '4 Organizers';
        const optBudget = document.getElementById('wf-setting-budget') || document.getElementById('wf-opt-budget');
        if (optBudget) optBudget.value = '$1,500 (Limited Sponsor Grant)';
        const optDetail = document.getElementById('wf-setting-detail') || document.getElementById('wf-opt-detail');
        if (optDetail) optDetail.value = 'detailed';

        if (wfSettingsBody) wfSettingsBody.style.display = 'grid';
        if (wfChevron) wfChevron.textContent = '▲ Collapse Settings';

        document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        const chip = document.querySelector('.preset-chip[data-preset="hackathon"]') || document.querySelector('.preset-chip[data-preset="college-event"]');
        if (chip) chip.classList.add('active');

        this.showToast('🎯 Loaded complete College Hackathon scenario & operational parameters');
      });
    }

    const genWorkflowBtn = document.getElementById('generate-workflow-btn');
    if (genWorkflowBtn) {
      genWorkflowBtn.addEventListener('click', () => this.handleGenerateWorkflow());
    }

    const clearWorkflowBtn = document.getElementById('clear-workflow-btn');
    if (clearWorkflowBtn) {
      clearWorkflowBtn.addEventListener('click', () => {
        if (wfInput) { wfInput.value = ''; wfInput.dispatchEvent(new Event('input', { bubbles: true })); }
        if (wfCharCounter) {
          wfCharCounter.textContent = '0 characters (min. 10)';
          wfCharCounter.className = 'workflow-char-counter';
        }
        const results = document.getElementById('workflow-results-container');
        if (results) results.innerHTML = '';
        const banner = document.getElementById('workflow-status-banner');
        if (banner) {
          banner.innerHTML = '';
          banner.style.display = 'none';
        }
        this.activeWorkflowDraft = null;
        this.selectedWorkflowTaskIds.clear();
        this.collapsedPhaseNames.clear();
        this.expandedTaskDetailIds.clear();
        window.storageManager.clearActiveWorkflowDraft();
        this.showToast('Workflow instructions cleared');
      });
    }

    const presetScenarios = {
      'hackathon': 'Organize a college hackathon for 100 participants in 10 days. Handle venue booking, registrations, sponsorships, marketing, mentors, equipment, event-day operations, and post-event feedback. We have four organizers and a limited budget.',
      'college-event': 'Organize a campus technical symposium. Secure seminar halls, confirm keynote researchers, coordinate student paper submissions, print symposium proceedings, and host hands-on coding workshops.',
      'product-launch': 'Coordinate v2.0 product release. Prepare release notes, deploy staging build, conduct QA test run, execute production canary cutover, and broadcast customer newsletter.',
      'incident-response': 'Triage critical service outage. Isolate vulnerable server nodes, inspect crash logs, apply emergency hotfix, verify service uptime, and publish post-mortem report.',
      'onboarding': 'Onboard senior software engineer. Provision hardware workstation, create email and repository accounts, schedule team meet-and-greets, assign senior mentor, and complete compliance review.'
    };

    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const key = chip.getAttribute('data-preset');
        const prompt = presetScenarios[key];
        if (wfInput && prompt) {
          wfInput.value = prompt;
          wfInput.dispatchEvent(new Event('input', { bubbles: true }));
          if (wfCharCounter) {
            wfCharCounter.textContent = `${wfInput.value.length} characters (ready to generate)`;
            wfCharCounter.className = 'workflow-char-counter valid';
          }
        }
      });
    });

    const activeEngineBadge = document.getElementById('active-engine-badge') || document.getElementById('wf-engine-status-pill');
    if (activeEngineBadge) {
      activeEngineBadge.addEventListener('click', () => {
        this.switchView('workflow');
        this.switchWorkflowTab('settings');
      });
    }

    if (wfInput) {
      wfInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.handleGenerateWorkflow();
        }
      });
    }

    // Saved Workflows History Filter Pills
    document.querySelectorAll('[data-wf-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-wf-filter]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.historyFilter = pill.getAttribute('data-wf-filter') || 'all';
        this.renderSavedWorkflows();
      });
    });

    // Dedicated Matrix View filter pills & buttons
    document.querySelectorAll('[data-matrix-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-matrix-filter]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.matrixFilter = pill.getAttribute('data-matrix-filter') || 'all';
        this.renderMatrix();
      });
    });

    const matrixAddBtn = document.getElementById('matrix-add-task-btn');
    if (matrixAddBtn) {
      matrixAddBtn.addEventListener('click', () => this.openTaskModal(null, 'q1'));
    }

    document.querySelectorAll('.quadrant-quick-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.quadrant || 'q1';
        this.openTaskModal(null, q);
      });
    });

    // Rename workflow modal form
    const renameWfForm = document.getElementById('wf-rename-form');
    if (renameWfForm) {
      renameWfForm.addEventListener('submit', (e) => this.handleWorkflowRenameSubmit(e));
    }

    // AI Configuration Controls in Panel 3
    const providerSelect = document.getElementById('setting-ai-provider');
    const keyConfigGroup = document.getElementById('api-key-config-group');
    const customEndpointGroup = document.getElementById('custom-endpoint-group');
    if (providerSelect && keyConfigGroup) {
      providerSelect.addEventListener('change', () => {
        const val = providerSelect.value;
        keyConfigGroup.style.display = val === 'demo' ? 'none' : 'block';
        if (customEndpointGroup) {
          customEndpointGroup.style.display = val === 'custom' ? 'block' : 'none';
        }
      });
    }

    const toggleKeyBtn = document.getElementById('toggle-key-visibility-btn');
    const keyInput = document.getElementById('setting-api-key');
    if (toggleKeyBtn && keyInput) {
      toggleKeyBtn.addEventListener('click', () => {
        const isPass = keyInput.type === 'password';
        keyInput.type = isPass ? 'text' : 'password';
        toggleKeyBtn.textContent = isPass ? 'Hide' : 'Show';
      });
    }

    // Supabase controls
    const testSupaBtn = document.getElementById('test-supabase-connection-btn');
    if (testSupaBtn) {
      testSupaBtn.addEventListener('click', () => this.testSupabaseConnectionUI());
    }

    const saveSupaBtn = document.getElementById('save-supabase-config-btn');
    if (saveSupaBtn) {
      saveSupaBtn.addEventListener('click', () => this.saveSupabaseConfigUI());
    }

    const syncSupaBtn = document.getElementById('sync-supabase-now-btn');
    if (syncSupaBtn) {
      syncSupaBtn.addEventListener('click', () => this.syncSupabaseNowUI());
    }

    const clearSupaBtn = document.getElementById('clear-supabase-config-btn');
    if (clearSupaBtn) {
      clearSupaBtn.addEventListener('click', () => this.clearSupabaseConfigUI());
    }

    const toggleSupaKeyBtn = document.getElementById('toggle-supabase-key-btn');
    const supaKeyInput = document.getElementById('setting-supabase-anon-key');
    if (toggleSupaKeyBtn && supaKeyInput) {
      toggleSupaKeyBtn.addEventListener('click', () => {
        const isPass = supaKeyInput.type === 'password';
        supaKeyInput.type = isPass ? 'text' : 'password';
        toggleSupaKeyBtn.textContent = isPass ? 'Hide' : 'Show';
      });
    }

    const testConnBtn = document.getElementById('test-ai-connection-btn');
    if (testConnBtn) {
      testConnBtn.addEventListener('click', () => this.testAIConnectionUI());
    }

    const saveAIConfigBtn = document.getElementById('save-ai-config-btn');
    if (saveAIConfigBtn) {
      saveAIConfigBtn.addEventListener('click', () => this.saveAIConfigFromUI());
    }

    const resetAIConfigBtn = document.getElementById('reset-ai-config-btn');
    if (resetAIConfigBtn) {
      resetAIConfigBtn.addEventListener('click', () => this.resetAIConfigToDemoUI());
    }

    // Modal Form Listeners
    const wfTaskForm = document.getElementById('wf-task-edit-form');
    if (wfTaskForm) {
      wfTaskForm.addEventListener('submit', (e) => this.handleWorkflowTaskFormSubmit(e));
    }

    const wfMilestoneForm = document.getElementById('wf-milestone-form');
    if (wfMilestoneForm) {
      wfMilestoneForm.addEventListener('submit', (e) => this.handleWorkflowMilestoneSubmit(e));
    }

    const toggleMatrixBtn = document.getElementById('toggle-matrix-triage-btn');
    const matrixBody = document.getElementById('matrix-accordion-body');
    const matrixArrow = document.getElementById('matrix-accordion-arrow');
    if (toggleMatrixBtn && matrixBody) {
      toggleMatrixBtn.addEventListener('click', () => {
        const isHidden = matrixBody.style.display === 'none';
        matrixBody.style.display = isHidden ? 'block' : 'none';
        if (matrixArrow) {
          matrixArrow.textContent = isHidden ? '▲ Hide Matrix' : '▼ Show Matrix';
        }
        if (isHidden) {
          this.renderMatrix();
        }
      });
    }

    // Drag and Drop delegation on Kanban Columns
    this.setupKanbanDragAndDrop();

    // Mobile sidebar hamburger
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update active nav link
    document.querySelectorAll('[data-view-target]').forEach(item => {
      const target = item.getAttribute('data-view-target');
      item.classList.toggle('active', target === viewName);
    });

    // Update visible view section
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active-view');
    });

    const activeViewEl = document.getElementById(`view-${viewName}`);
    if (activeViewEl) {
      activeViewEl.classList.add('active-view');
    }

    // Trigger specific view renders
    if (viewName === 'analytics') {
      window.analyticsManager.renderDashboard();
    } else if (viewName === 'focus') {
      window.focusTimer.updateDisplay();
    } else if (viewName === 'workflow') {
      this.initWorkflowView();
    } else if (viewName === 'matrix') {
      this.renderMatrix();
    } else {
      this.renderCurrentView();
    }
  }

  render() {
    this.updateCounts();
    this.renderCurrentView();
    if (this.currentView === 'analytics') {
      window.analyticsManager.renderDashboard();
    }
  }

  renderCurrentView() {
    if (this.currentView === 'kanban') {
      this.renderKanban();
    } else if (this.currentView === 'workflow') {
      this.initWorkflowView();
      this.renderMatrix();
    } else if (this.currentView === 'matrix') {
      this.renderMatrix();
    } else if (this.currentView === 'tasks-list') {
      this.renderListView();
    }
  }

  getFilteredTasks() {
    let tasks = window.storageManager.getTasks();

    // Search query filter
    if (this.searchQuery) {
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(this.searchQuery) ||
        (t.description && t.description.toLowerCase().includes(this.searchQuery))
      );
    }

    // Priority filter pill
    if (this.currentFilter && this.currentFilter !== 'all') {
      tasks = tasks.filter(t => t.priority === this.currentFilter);
    }

    // Project filter
    if (this.currentProjectFilter && this.currentProjectFilter !== 'all') {
      tasks = tasks.filter(t => t.projectId === this.currentProjectFilter);
    }

    return tasks;
  }

  updateCounts() {
    const tasks = window.storageManager.getTasks();
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
    const reviewCount = tasks.filter(t => t.status === 'review').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;

    // Sidebar total badge
    const sidebarBadge = document.getElementById('sidebar-total-badge');
    if (sidebarBadge) sidebarBadge.textContent = tasks.length;

    // Sidebar matrix badge (active unfinished tasks)
    const sidebarMatrixBadge = document.getElementById('sidebar-matrix-badge');
    if (sidebarMatrixBadge) sidebarMatrixBadge.textContent = tasks.filter(t => t.status !== 'done').length;

    // Column badges
    const bTodo = document.getElementById('badge-col-todo');
    const bProg = document.getElementById('badge-col-in-progress');
    const bRev = document.getElementById('badge-col-review');
    const bDone = document.getElementById('badge-col-done');

    if (bTodo) bTodo.textContent = todoCount;
    if (bProg) bProg.textContent = inProgressCount;
    if (bRev) bRev.textContent = reviewCount;
    if (bDone) bDone.textContent = doneCount;

    // Workflow history count badge
    this.updateHistoryCount();
  }

  /* ==========================================================================
     Kanban Rendering & Drag-and-Drop
     ========================================================================== */
  renderKanban() {
    const tasks = this.getFilteredTasks();
    const columns = {
      todo: document.getElementById('cards-col-todo'),
      'in-progress': document.getElementById('cards-col-in-progress'),
      review: document.getElementById('cards-col-review'),
      done: document.getElementById('cards-col-done'),
    };

    // Clear columns
    Object.values(columns).forEach(col => {
      if (col) col.innerHTML = '';
    });

    tasks.forEach(task => {
      const targetCol = columns[task.status] || columns.todo;
      if (targetCol) {
        targetCol.appendChild(this.createTaskCard(task));
      }
    });

    this.updateCounts();
  }

  createTaskCard(task) {
    const projects = window.storageManager.getProjects();
    const project = projects.find(p => p.id === task.projectId) || { name: 'General', color: '#6366f1' };

    const card = document.createElement('div');
    card.className = `task-card ${task.status === 'done' ? 'completed' : ''}`;
    card.draggable = true;
    card.dataset.id = task.id;

    // Subtask count & progress
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(s => s.completed).length;
    const progressPct = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

    // Due date display
    const isOverdue = task.status !== 'done' && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));

    card.innerHTML = `
      <div class="card-top">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="task-checkbox-btn ${task.status === 'done' ? 'checked' : ''}" data-task-id="${task.id}" title="${task.status === 'done' ? 'Mark incomplete' : 'Mark completed'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <span class="card-project">
            <span class="project-dot" style="background: ${project.color}"></span>
            ${project.name}
          </span>
        </div>
        <span class="priority-tag priority-${task.priority}">${task.priority}</span>
      </div>
      ${task.workflowTitle ? `
        <div class="card-wf-badge" style="font-size: 0.68rem; color: var(--accent-cyan); font-weight: 600; margin: 3px 0 1px 0; display: flex; align-items: center; gap: 4px;" title="Imported from workflow: ${this.escapeHTML(task.workflowTitle)}">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHTML(task.workflowTitle)}${task.workflowPhase ? ` • ${this.escapeHTML(task.workflowPhase)}` : ''}</span>
        </div>
      ` : ''}
      <div class="card-title ${task.status === 'done' ? 'completed-text' : ''}">${this.escapeHTML(task.title)}</div>
      ${task.description ? `<div class="card-desc">${this.escapeHTML(task.description)}</div>` : ''}

      ${subtasks.length > 0 ? `
        <div class="card-checklist-bar">
          <div class="checklist-labels">
            <span>Checklist</span>
            <span>${completedSubtasks}/${subtasks.length} (${progressPct}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${progressPct}%"></div>
          </div>
        </div>
      ` : ''}

      <div class="card-footer">
        <span class="card-due-date ${isOverdue ? 'overdue' : ''}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${task.dueDate || 'No due date'}
        </span>
        <div class="card-actions-quick">
          <button class="card-icon-btn focus-timer-btn" title="Focus on this task in Pomodoro">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 10"></polyline></svg>
          </button>
          <button class="card-icon-btn edit-btn" title="Edit task">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="card-icon-btn delete-btn" title="Delete task">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;

    // Bind card actions
    const checkBtn = card.querySelector('.task-checkbox-btn');
    if (checkBtn) {
      checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTaskCompletion(task.id);
      });
    }
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.openTaskModal(task.id);
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Delete task "${task.title}"?`)) {
        window.storageManager.deleteTask(task.id);
        this.render();
        this.showToast('Task removed');
      }
    });

    card.querySelector('.focus-timer-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      window.focusTimer.setActiveTask(task.id);
      this.switchView('focus');
      this.showToast(`Active focus set to: "${task.title}"`);
    });

    // Drag listeners
    card.addEventListener('dragstart', (e) => {
      this.draggedTaskId = task.id;
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', task.id);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      this.draggedTaskId = null;
    });

    return card;
  }

  setupKanbanDragAndDrop() {
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain') || this.draggedTaskId;
        const newStatus = col.dataset.status;

        if (taskId && newStatus) {
          const task = window.storageManager.getTaskById(taskId);
          if (task && task.status !== newStatus) {
            window.storageManager.updateTask(taskId, { status: newStatus });
            if (newStatus === 'done') {
              this.triggerConfetti();
              this.showToast(`🎉 Great job! Completed: "${task.title}"`);
            } else {
              this.showToast(`Moved to ${newStatus.toUpperCase()}`);
            }
            this.render();
          }
        }
      });
    });
  }

  /* ==========================================================================
     Eisenhower Matrix View
     ========================================================================== */
  renderMatrix() {
    const allTasks = window.storageManager.getTasks();
    let tasks = this.getFilteredTasks();

    // Check filter on dedicated view
    if (this.matrixFilter && this.matrixFilter !== 'all') {
      tasks = tasks.filter(t => (t.quadrant || 'q2') === this.matrixFilter);
    }

    // Quadrant count badges in full view
    ['q1', 'q2', 'q3', 'q4'].forEach(q => {
      const b = document.getElementById(`badge-matrix-${q}`);
      if (b) b.textContent = allTasks.filter(t => (t.quadrant || 'q2') === q).length;
    });

    // 1. Dedicated Full-Page Matrix View
    const fullQuadrants = {
      q1: document.getElementById('full-matrix-q1-list'),
      q2: document.getElementById('full-matrix-q2-list'),
      q3: document.getElementById('full-matrix-q3-list'),
      q4: document.getElementById('full-matrix-q4-list'),
    };

    Object.values(fullQuadrants).forEach(q => {
      if (q) q.innerHTML = '';
    });

    // 2. Accordion in Workflow View
    const accordionQuadrants = {
      q1: document.getElementById('matrix-q1-list'),
      q2: document.getElementById('matrix-q2-list'),
      q3: document.getElementById('matrix-q3-list'),
      q4: document.getElementById('matrix-q4-list'),
    };

    Object.values(accordionQuadrants).forEach(q => {
      if (q) q.innerHTML = '';
    });

    // Populate full matrix
    tasks.forEach(task => {
      const quad = task.quadrant || 'q2';
      const targetFull = fullQuadrants[quad] || fullQuadrants.q2;

      if (targetFull) {
        const item = document.createElement('div');
        item.className = `matrix-task-card ${task.status === 'done' ? 'completed' : ''}`;
        item.dataset.id = task.id;

        item.innerHTML = `
          <div class="matrix-task-top">
            <button class="task-checkbox-btn ${task.status === 'done' ? 'checked' : ''}" title="${task.status === 'done' ? 'Mark incomplete' : 'Mark completed'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <span class="matrix-task-title ${task.status === 'done' ? 'completed-text' : ''}">${this.escapeHTML(task.title)}</span>
            <span class="priority-tag priority-${task.priority}" style="font-size:0.65rem; padding:1px 6px;">${task.priority}</span>
          </div>
          ${task.description ? `<div class="matrix-task-desc">${this.escapeHTML(task.description)}</div>` : ''}
          <div class="matrix-task-bottom">
            <div class="matrix-task-meta">
              <span>📅 ${task.dueDate || 'No date'}</span>
              <span>•</span>
              <span style="text-transform:uppercase; font-size:0.7rem; font-weight:600;">${task.status}</span>
            </div>
            <div class="matrix-task-actions">
              <select class="matrix-move-select" title="Move to different quadrant">
                <option value="q1" ${quad === 'q1' ? 'selected' : ''}>Q1: Do</option>
                <option value="q2" ${quad === 'q2' ? 'selected' : ''}>Q2: Schedule</option>
                <option value="q3" ${quad === 'q3' ? 'selected' : ''}>Q3: Delegate</option>
                <option value="q4" ${quad === 'q4' ? 'selected' : ''}>Q4: Eliminate</option>
              </select>
              <button class="btn-icon-xs matrix-edit-btn" title="Edit task">✏️</button>
              <button class="btn-icon-xs matrix-del-btn" title="Delete task">🗑️</button>
            </div>
          </div>
        `;

        item.querySelector('.task-checkbox-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleTaskCompletion(task.id);
        });

        item.querySelector('.matrix-move-select').addEventListener('change', (e) => {
          const newQuad = e.target.value;
          window.storageManager.updateTask(task.id, { quadrant: newQuad });
          this.showToast(`Relocated to ${newQuad.toUpperCase()}`);
          this.render();
        });

        item.querySelector('.matrix-edit-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          this.openTaskModal(task.id);
        });

        item.querySelector('.matrix-del-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Delete task "${task.title}"?`)) {
            window.storageManager.deleteTask(task.id);
            this.render();
            this.showToast('Task removed');
          }
        });

        targetFull.appendChild(item);
      }
    });

    // Populate accordion in studio
    tasks.forEach(task => {
      const quad = task.quadrant || 'q2';
      const targetAccordion = accordionQuadrants[quad] || accordionQuadrants.q2;
      if (targetAccordion) {
        const item = document.createElement('div');
        item.className = 'generated-task-item';
        item.style.cursor = 'pointer';
        item.innerHTML = `
          <div>
            <div style="font-weight:600; font-size:0.88rem; color:var(--text-main); ${task.status === 'done' ? 'text-decoration:line-through; opacity:0.7;' : ''}">${this.escapeHTML(task.title)}</div>
            <div style="font-size:0.74rem; color:var(--text-muted); margin-top:2px">Status: ${task.status.toUpperCase()} | Due: ${task.dueDate || 'None'}</div>
          </div>
          <span class="priority-tag priority-${task.priority}">${task.priority}</span>
        `;
        item.addEventListener('click', () => this.openTaskModal(task.id));
        targetAccordion.appendChild(item);
      }
    });

    // Show empty states if quadrant has no tasks
    ['q1', 'q2', 'q3', 'q4'].forEach(q => {
      const container = fullQuadrants[q];
      if (container && container.children.length === 0) {
        container.innerHTML = `<div class="matrix-empty-msg">No tasks in this quadrant</div>`;
      }
    });
  }

  /* ==========================================================================
     Table / List View
     ========================================================================== */
  renderListView() {
    const listContainer = document.getElementById('tasks-table-body');
    if (!listContainer) return;
    const tasks = this.getFilteredTasks();
    const projects = window.storageManager.getProjects();
    const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

    listContainer.innerHTML = '';
    if (tasks.length === 0) {
      listContainer.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted)">No matching tasks found.</td></tr>`;
      return;
    }

    tasks.forEach(task => {
      const proj = projectMap[task.projectId] || { name: 'General', color: '#6366f1' };
      const isDone = task.status === 'done';
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-subtle)';
      if (isDone) tr.style.opacity = '0.75';

      tr.innerHTML = `
        <td style="padding:14px 16px; font-weight:600;">
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="task-checkbox-btn ${isDone ? 'checked' : ''}" data-task-id="${task.id}" title="${isDone ? 'Mark incomplete' : 'Mark completed'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <span style="${isDone ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${this.escapeHTML(task.title)}</span>
          </div>
        </td>
        <td style="padding:14px 16px;">
          <span style="display:inline-flex; align-items:center; gap:6px; font-size:0.85rem">
            <span style="width:8px; height:8px; border-radius:50%; background:${proj.color}"></span>
            ${proj.name}
          </span>
        </td>
        <td style="padding:14px 16px;"><span class="priority-tag priority-${task.priority}">${task.priority}</span></td>
        <td style="padding:14px 16px; text-transform:uppercase; font-size:0.78rem; font-weight:600">${task.status}</td>
        <td style="padding:14px 16px; font-size:0.85rem; color:var(--text-muted)">${task.dueDate || '—'}</td>
        <td style="padding:14px 16px; white-space:nowrap;">
          <button class="card-icon-btn edit-list-btn" title="Edit" style="margin-right:8px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="card-icon-btn del-list-btn" title="Delete" style="color:var(--accent-danger);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;

      tr.querySelector('.task-checkbox-btn').addEventListener('click', () => {
        this.toggleTaskCompletion(task.id);
      });

      tr.querySelector('.edit-list-btn').addEventListener('click', () => this.openTaskModal(task.id));

      tr.querySelector('.del-list-btn').addEventListener('click', () => {
        if (confirm(`Delete task "${task.title}"?`)) {
          window.storageManager.deleteTask(task.id);
          this.render();
          this.showToast('Task removed');
        }
      });

      listContainer.appendChild(tr);
    });
  }

  toggleTaskCompletion(taskId) {
    const updated = window.storageManager.toggleTaskCompletion(taskId);
    if (updated) {
      if (updated.status === 'done') {
        this.triggerConfetti();
        this.showToast(`🎉 Completed: "${updated.title}"`);
      } else {
        this.showToast(`Task reopened: "${updated.title}"`);
      }
      this.render();
    }
  }

  /* ==========================================================================
     Modal Handling (Create / Edit Task)
     ========================================================================== */
  openTaskModal(taskId = null, defaultQuadrant = null) {
    this.editingTaskId = taskId;
    const modal = document.getElementById('task-modal');
    const titleEl = document.getElementById('modal-task-title');
    const projectSelect = document.getElementById('task-project-select');

    // Populate project options
    const projects = window.storageManager.getProjects();
    projectSelect.innerHTML = projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    if (taskId) {
      const task = window.storageManager.getTaskById(taskId);
      if (task) {
        titleEl.textContent = 'Edit Task';
        document.getElementById('task-title-input').value = task.title;
        document.getElementById('task-desc-input').value = task.description || '';
        projectSelect.value = task.projectId;
        document.getElementById('task-priority-select').value = task.priority;
        document.getElementById('task-status-select').value = task.status;
        document.getElementById('task-quadrant-select').value = task.quadrant || 'q2';
        document.getElementById('task-due-input').value = task.dueDate || '';
        document.getElementById('task-mins-input').value = task.estimatedMins || 30;
      }
    } else {
      titleEl.textContent = 'Create New Task';
      document.getElementById('task-form').reset();
      document.getElementById('task-due-input').value = new Date().toISOString().split('T')[0];
      if (defaultQuadrant) {
        document.getElementById('task-quadrant-select').value = defaultQuadrant;
        if (defaultQuadrant === 'q1') {
          document.getElementById('task-priority-select').value = 'urgent';
        }
      }
    }

    modal.classList.add('open');
  }

  handleTaskFormSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('task-title-input').value.trim();
    if (!title) return;

    const taskData = {
      title,
      description: document.getElementById('task-desc-input').value.trim(),
      projectId: document.getElementById('task-project-select').value,
      priority: document.getElementById('task-priority-select').value,
      status: document.getElementById('task-status-select').value,
      quadrant: document.getElementById('task-quadrant-select').value,
      dueDate: document.getElementById('task-due-input').value,
      estimatedMins: parseInt(document.getElementById('task-mins-input').value, 10) || 30,
    };

    if (this.editingTaskId) {
      window.storageManager.updateTask(this.editingTaskId, taskData);
      this.showToast('Task updated successfully');
    } else {
      window.storageManager.addTask(taskData);
      this.showToast('New task added to board');
    }

    this.closeAllModals();
    this.render();
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay, .ai-modal-overlay').forEach(m => m.classList.remove('open', 'active'));
    this.editingTaskId = null;
    this.editingWorkflowTaskId = null;
    this.editingWorkflowMilestoneId = null;
  }

  /* ==========================================================================
     AI Copilot Goal Deconstruction Modal
     ========================================================================== */
  openAICopilotModal() {
    const modal = document.getElementById('ai-copilot-modal');
    modal.classList.add('open');

    // Populate Daily Standup briefing header
    const briefing = window.aiCopilot.generateDailyBriefing(window.storageManager.getTasks());
    const briefingEl = document.getElementById('ai-briefing-banner');
    if (briefingEl) {
      briefingEl.innerHTML = `
        <div style="background:var(--accent-gradient-subtle); border:1px solid var(--border-highlight); border-radius:var(--radius-md); padding:14px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="color:var(--text-main); font-size:0.88rem">⚡ AI Daily Velocity Briefing (${briefing.timestamp})</strong>
            <span style="font-size:0.75rem; color:var(--accent-cyan); font-weight:700">${briefing.completionRate}% Done</span>
          </div>
          <div style="font-size:0.82rem; color:var(--text-secondary); line-height:1.4">${briefing.priorityRecommendation}</div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px">💡 ${briefing.coachingTip}</div>
        </div>
      `;
    }
  }

  async handleAIGoalDeconstruction() {
    const inputEl = document.getElementById('ai-goal-input');
    const resultsContainer = document.getElementById('ai-results-container');
    const submitBtn = document.getElementById('ai-breakdown-submit');

    const goal = inputEl.value.trim();
    if (!goal) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
      Deconstructing with AI...
    `;

    try {
      const generatedTasks = await window.aiCopilot.breakdownGoal(goal);
      resultsContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; margin-bottom:8px">
          <span style="font-size:0.85rem; font-weight:600; color:var(--text-main)">Generated Roadmap (${generatedTasks.length} Milestones)</span>
          <button id="add-all-ai-btn" class="btn btn-primary" style="padding:6px 14px; font-size:0.8rem">
            + Add All to Board
          </button>
        </div>
        <div class="ai-generated-subtasks-list">
          ${generatedTasks.map(t => `
            <div class="generated-task-item">
              <div>
                <div style="font-weight:600; font-size:0.88rem; color:var(--text-main)">${this.escapeHTML(t.title)}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px">${this.escapeHTML(t.description)} (${t.estimatedMins} mins)</div>
              </div>
              <span class="priority-tag priority-${t.priority}">${t.priority}</span>
            </div>
          `).join('')}
        </div>
      `;

      document.getElementById('add-all-ai-btn').addEventListener('click', () => {
        generatedTasks.forEach(task => {
          window.storageManager.addTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            quadrant: task.quadrant,
            estimatedMins: task.estimatedMins,
            subtasks: task.subtasks || [],
          });
        });
        this.closeAllModals();
        this.render();
        this.triggerConfetti();
        this.showToast(`🚀 Successfully scheduled ${generatedTasks.length} milestones!`);
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
        Deconstruct Goal
      `;
    }
  }

  /* ==========================================================================
     Theme & Confetti & Utilities
     ========================================================================== */
  toggleTheme() {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const nextTheme = isLight ? 'dark' : 'light';
    document.body.setAttribute('data-theme', nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
    this.showToast(`Switched to ${nextTheme} theme`);
  }

  loadTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    document.body.setAttribute('data-theme', saved);
  }

  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

    for (let i = 0; i < 75; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        alpha: 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rot += p.rotSpeed;
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animate();
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${this.escapeHTML(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  exportJSON() {
    const jsonStr = window.storageManager.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskpilot_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Exported JSON backup file');
  }

  exportMarkdown() {
    const mdStr = window.storageManager.exportMarkdownReport();
    const blob = new Blob([mdStr], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaskPilot_Report_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Exported Markdown Productivity Report');
  }

  /* ==========================================================================
     AI Workflow Generator Orchestration (Complete Intelligent Suite)
     ========================================================================== */
  initWorkflowView() {
    this.populateWorkflowProjects();
    this.updateEngineBadge();
    this.updateHistoryCount();

    const input = document.getElementById('workflow-instructions-input');
    if (input && !input.value.trim()) {
      input.value = "Organize a college hackathon for 100 participants in 10 days. Handle venue booking, registrations, sponsorships, marketing, mentors, equipment, event-day operations, and post-event feedback. We have four organizers and a limited budget.";
      const charCounter = document.getElementById('wf-char-counter');
      if (charCounter) charCounter.textContent = `${input.value.length} characters`;
    }

    if (this.currentWorkflowTab === 'history') {
      this.renderSavedWorkflows();
    } else if (this.currentWorkflowTab === 'settings') {
      this.populateAIConfigForm();
    } else {
      if (this.activeWorkflowDraft) {
        this.renderWorkflowResults(this.activeWorkflowDraft);
      }
    }
  }

  switchWorkflowTab(tabName) {
    this.currentWorkflowTab = tabName || 'studio';

    document.querySelectorAll('.wf-nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-workflow-tab') === this.currentWorkflowTab);
    });

    const studioPanel = document.getElementById('panel-wf-studio');
    const historyPanel = document.getElementById('panel-wf-history');
    const settingsPanel = document.getElementById('panel-wf-settings');

    if (studioPanel) studioPanel.style.display = this.currentWorkflowTab === 'studio' ? 'block' : 'none';
    if (historyPanel) historyPanel.style.display = this.currentWorkflowTab === 'history' ? 'block' : 'none';
    if (settingsPanel) settingsPanel.style.display = this.currentWorkflowTab === 'settings' ? 'block' : 'none';

    if (this.currentWorkflowTab === 'history') {
      this.renderSavedWorkflows();
    } else if (this.currentWorkflowTab === 'settings') {
      this.populateAIConfigForm();
    } else if (this.currentWorkflowTab === 'studio' && this.activeWorkflowDraft) {
      this.renderWorkflowResults(this.activeWorkflowDraft);
    }
  }

  updateEngineBadge() {
    const config = window.storageManager.getAIConfig();
    const pill = document.getElementById('wf-engine-status-pill');
    if (pill) {
      if (config.provider === 'demo' || !config.apiKey) {
        pill.innerHTML = `
          <span class="engine-dot demo"></span>
          <span>⚡ Demo Mode (Offline Deterministic Engine)</span>
        `;
        pill.className = 'engine-mode-pill demo';
        pill.title = 'Running locally without external API dependencies. 100% offline & reproducible.';
      } else {
        const providerName = config.provider === 'gemini' ? 'Google Gemini' : config.provider === 'openai' ? 'OpenAI GPT' : 'Custom LLM';
        pill.innerHTML = `
          <span class="engine-dot active"></span>
          <span>✨ ${providerName} (${this.escapeHTML(config.model || 'Active')})</span>
        `;
        pill.className = 'engine-mode-pill active';
        pill.title = `Connected to live ${providerName} API endpoint.`;
      }
    }
  }

  updateHistoryCount() {
    const count = window.storageManager.getWorkflows().length;
    const badge1 = document.getElementById('wf-history-count-badge');
    if (badge1) {
      badge1.textContent = count;
    }
    const badge2 = document.getElementById('saved-workflows-badge');
    if (badge2) {
      badge2.textContent = count;
    }
  }

  populateWorkflowProjects() {
    const projects = window.storageManager.getProjects();
    const select = document.getElementById('workflow-project-select');
    if (select) {
      const currentVal = select.value;
      select.innerHTML = projects.map(p => 
        `<option value="${p.id}" ${p.id === 'proj-academic' ? 'selected' : ''}>${this.escapeHTML(p.name)}</option>`
      ).join('');
      if (currentVal && projects.some(p => p.id === currentVal)) {
        select.value = currentVal;
      }
    }

    const editSelect = document.getElementById('wf-edit-task-project');
    if (editSelect) {
      editSelect.innerHTML = projects.map(p => 
        `<option value="${p.id}">${this.escapeHTML(p.name)}</option>`
      ).join('');
    }
  }

  async handleGenerateWorkflow() {
    const inputEl = document.getElementById('workflow-instructions-input');
    const submitBtn = document.getElementById('generate-workflow-btn');
    const loader = document.getElementById('workflow-progress-loader');
    const banner = document.getElementById('workflow-status-banner');

    if (!inputEl) return;
    const rawInput = inputEl.value.trim();

    // Input validation
    if (!rawInput || rawInput.length < 10) {
      this.showToast('⚠️ Please provide detailed instructions (at least 10 characters)');
      inputEl.focus();
      inputEl.classList.add('input-error');
      setTimeout(() => inputEl.classList.remove('input-error'), 1200);
      return;
    }

    // Collect optional settings
    const optName = document.getElementById('wf-opt-name')?.value.trim();
    const optDeadline = document.getElementById('wf-opt-deadline')?.value;
    const optPriority = document.getElementById('wf-opt-priority')?.value || 'medium';
    const optTeam = document.getElementById('wf-opt-team')?.value.trim();
    const optBudget = document.getElementById('wf-opt-budget')?.value.trim();
    const optDetail = document.getElementById('wf-opt-detail')?.value || 'standard';
    const projSelect = document.getElementById('workflow-project-select');
    const projectId = projSelect ? projSelect.value : 'proj-academic';

    // Show Progress Loader
    if (loader) {
      loader.style.display = 'flex';
      this.animateLoaderStages();
    }
    if (banner) {
      banner.innerHTML = '';
      banner.style.display = 'none';
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        </svg>
        <span>Synthesizing Operations Plan...</span>
      `;
    }

    try {
      const result = await window.aiCopilot.generateOperationsWorkflow(rawInput, {
        name: optName,
        deadline: optDeadline,
        priority: optPriority,
        teamSize: optTeam,
        budget: optBudget,
        detailLevel: optDetail,
        projectId
      });

      this.activeWorkflowDraft = result;
      // By default select all tasks for importing
      this.selectedWorkflowTaskIds = new Set(result.tasks.map(t => t.id));
      window.storageManager.saveActiveWorkflowDraft(result);

      this.renderWorkflowResults(result);
      this.showToast(`✨ Generated complete workflow: "${result.title}" with ${result.tasks.length} actionable tasks!`);
    } catch (err) {
      console.error('Workflow synthesis failed', err);
      this.showToast(`❌ Generation error: ${err.message}`);
    } finally {
      if (loader) loader.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Generate Workflow</span>
        `;
      }
    }
  }

  animateLoaderStages() {
    const stages = ['stg-1', 'stg-2', 'stg-3', 'stg-4', 'stg-5'];
    stages.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active', 'done');
    });

    let current = 0;
    const interval = setInterval(() => {
      if (current > 0 && current - 1 < stages.length) {
        const prevEl = document.getElementById(stages[current - 1]);
        if (prevEl) {
          prevEl.classList.remove('active');
          prevEl.classList.add('done');
        }
      }
      if (current < stages.length) {
        const currEl = document.getElementById(stages[current]);
        if (currEl) currEl.classList.add('active');
        current++;
      } else {
        clearInterval(interval);
      }
    }, 280);
  }

  renderWorkflowResults(workflow) {
    const container = document.getElementById('workflow-results-container');
    if (!container || !workflow) return;

    // Check how many tasks are already in the storage manager
    const existingTasks = window.storageManager.getTasks();
    const importedTaskMap = new Map();
    existingTasks.forEach(t => {
      if (t.workflowId === workflow.id || (workflow.title && t.workflowTitle === workflow.title)) {
        importedTaskMap.set(t.title.toLowerCase().trim(), t);
      }
    });

    const totalTasks = workflow.tasks ? workflow.tasks.length : 0;
    const completedTasksCount = workflow.tasks ? workflow.tasks.filter(t => {
      const matched = importedTaskMap.get(t.title.toLowerCase().trim());
      return (matched && matched.status === 'done') || t.status === 'done' || t.completed === true;
    }).length : 0;

    const progressPct = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
    const selectedCount = this.selectedWorkflowTaskIds.size;
    const allSelected = totalTasks > 0 && selectedCount === totalTasks;

    // Group tasks into phases
    const phaseGroups = {};
    (workflow.tasks || []).forEach(task => {
      const ph = task.workflowPhase || task.phase || 'General Execution';
      if (!phaseGroups[ph]) phaseGroups[ph] = [];
      phaseGroups[ph].push(task);
    });

    const phaseCount = Object.keys(phaseGroups).length;
    const milestoneCount = (workflow.milestones || []).length;
    const allPhasesCollapsed = phaseCount > 0 && Object.keys(phaseGroups).every(ph => this.collapsedPhaseNames.has(ph));

    container.innerHTML = `
      <!-- 1. Executive Operations Header & Plan Summary -->
      <div class="workflow-summary-card">
        <div class="workflow-summary-top">
          <div style="flex: 1; min-width: 280px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
              <span class="workflow-status-badge status-${(workflow.status || 'draft').toLowerCase()}">
                ● ${(workflow.status || 'Draft').toUpperCase()}
              </span>
              <span class="engine-badge-tag ${workflow.engine === 'real-ai' ? 'engine-ai' : 'engine-demo'}">
                ${workflow.engine === 'real-ai' ? '✨ LLM Model Generated' : '⚡ Demo Mode (Deterministic Engine)'}
              </span>
              ${workflow.priority ? `<span class="priority-tag priority-${workflow.priority.toLowerCase()}">${workflow.priority} Priority</span>` : ''}
            </div>
            <h2 class="workflow-summary-title" id="wf-header-title">
              ${this.escapeHTML(workflow.title || 'Untitled Workflow')}
            </h2>
          </div>

          <div class="workflow-summary-actions">
            <button class="btn btn-secondary btn-sm" id="wf-save-draft-btn" title="Save this workflow to Saved Workflows">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>Save Workflow</span>
            </button>
            <button class="btn btn-secondary btn-sm" id="wf-edit-workflow-btn" title="Edit title, deadline and scope">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Edit Details</span>
            </button>
            <button class="btn btn-secondary btn-sm" id="wf-export-json-btn" title="Download complete workflow JSON">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Export JSON</span>
            </button>
            <button class="btn btn-secondary btn-sm" id="wf-copy-md-btn" title="Copy markdown runbook to clipboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy Runbook (.md)</span>
            </button>
            <button class="btn btn-primary btn-sm" id="wf-import-selected-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Add Selected (${selectedCount}) to My Tasks</span>
            </button>
            <button class="btn btn-ghost btn-sm" id="wf-discard-draft-btn" title="Discard unsaved draft">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>Discard</span>
            </button>
          </div>
        </div>

        <p class="workflow-summary-desc">${this.escapeHTML(workflow.summary || workflow.objective || 'Complete operational workflow.')}</p>

        <!-- Metric Chips Grid -->
        <div class="workflow-metric-chips">
          <div class="workflow-metric-chip" title="Total Tasks & Completed Status">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"></rect><rect x="14" y="3" width="7" height="11" rx="1"></rect></svg>
            <span>Tasks: <strong>${totalTasks} Total</strong> (${completedTasksCount} Done)</span>
          </div>
          <div class="workflow-metric-chip" title="Live Overall Completion">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 10"></polyline></svg>
            <span>Progress: <strong>${progressPct}% Completed</strong></span>
          </div>
          <div class="workflow-metric-chip" title="Execution Deadline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Deadline: <strong>${workflow.deadline || 'Sequenced Timeline'}</strong></span>
          </div>
          <div class="workflow-metric-chip" title="Execution Phases">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            <span>Phases: <strong>${phaseCount} Phases</strong></span>
          </div>
          <div class="workflow-metric-chip" title="Critical Milestones Checkpoints">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>Milestones: <strong>${milestoneCount} Milestones</strong></span>
          </div>
          <div class="workflow-metric-chip" title="Team allocation and budget constraints">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Team &amp; Budget: <strong>${this.escapeHTML(workflow.teamSize || '4 Organizers')} • ${this.escapeHTML(workflow.budget || 'Limited')}</strong></span>
          </div>
        </div>

        <!-- Workflow Execution Progress Bar -->
        <div class="workflow-progress-bar-wrap">
          <div class="workflow-progress-label">
            <span>Live Completion Rate: ${completedTasksCount} of ${totalTasks} tasks completed</span>
            <span><strong>${progressPct}%</strong></span>
          </div>
          <div class="progress-track" style="height: 8px;">
            <div class="progress-fill" style="width: ${progressPct}%; background: linear-gradient(90deg, #6366f1, #06b6d4); transition: width 0.3s ease;"></div>
          </div>
        </div>
      </div>

      <!-- 2. Assumptions & Risks Section -->
      <div class="workflow-section-wrap">
        <div class="workflow-two-col-grid">
          <!-- Assumptions -->
          <div class="workflow-meta-card">
            <h4 class="workflow-meta-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Key Operational Assumptions</span>
            </h4>
            <div class="workflow-assumptions-list">
              ${(workflow.assumptions || [
                'Venue infrastructure supports AV & power demands',
                'Core organizers collaborate across dedicated tracks',
                'Timeline assumes strict daily progress checkpoints'
              ]).map(asmp => `
                <div class="workflow-assumption-tag">
                  <span class="assumption-bullet">✓</span>
                  <span>${this.escapeHTML(asmp)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Risks & Mitigations -->
          <div class="workflow-meta-card">
            <h4 class="workflow-meta-card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span>Identified Risks &amp; Mitigations</span>
            </h4>
            <div class="workflow-risks-list">
              ${(workflow.risks || [
                { title: 'Wi-Fi / Power Overload', mitigation: 'Provision dedicated hotspot backups and surge strips' },
                { title: 'Sponsor Delay', mitigation: 'Request electronic fund transfer and pre-order essentials' },
                { title: 'Volunteer Drop-out', mitigation: 'Cross-train core team and maintain contingency floats' }
              ]).map(risk => `
                <div class="workflow-risk-item">
                  <div class="risk-title">⚠️ ${this.escapeHTML(risk.title)}</div>
                  <div class="risk-mitigation"><strong>Mitigation:</strong> ${this.escapeHTML(risk.mitigation)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Milestones Timeline Section -->
      <div class="workflow-section-wrap">
        <div class="workflow-section-header">
          <div>
            <h3 class="workflow-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Critical Workflow Milestones</span>
            </h3>
            <p class="workflow-section-subtitle">Key checkpoint dates and expected outcomes to keep operations on schedule</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="wf-add-milestone-btn">
            + Add Milestone
          </button>
        </div>

        <div class="workflow-milestones-grid">
          ${(workflow.milestones || []).map((ms, msIdx) => `
            <div class="workflow-milestone-card" data-ms-id="${ms.id}">
              <div class="milestone-card-header">
                <span class="milestone-num">M${msIdx + 1}</span>
                <span class="milestone-due">📅 ${ms.dueDate || 'TBD'}</span>
              </div>
              <div class="milestone-card-title">${this.escapeHTML(ms.title)}</div>
              <div class="milestone-card-desc">${this.escapeHTML(ms.description || ms.expectedOutcome || '')}</div>
              <div class="milestone-card-actions">
                <button class="btn-icon-xs edit-ms-btn" data-ms-id="${ms.id}" title="Edit milestone">✏️</button>
                <button class="btn-icon-xs delete-ms-btn" data-ms-id="${ms.id}" title="Delete milestone">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 4. Phased Task Pipeline & Interactive Editor -->
      <div class="workflow-section-wrap">
        <div class="workflow-section-header">
          <div>
            <h3 class="workflow-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
              <span>Actionable Task Execution Pipeline</span>
            </h3>
            <p class="workflow-section-subtitle">Review, edit, reorder, toggle completion status, and organize tasks across structured phases</p>
          </div>
          <div class="workflow-pipeline-actions">
            <button class="btn btn-ghost btn-sm" id="wf-toggle-all-phases-btn" type="button" title="Expand or collapse all phases">
              ${allPhasesCollapsed ? '▼ Expand All Phases' : '▲ Collapse All Phases'}
            </button>
            <button class="btn btn-secondary btn-sm" id="wf-select-all-btn" type="button">
              ${allSelected ? 'Deselect All' : 'Select All'}
            </button>
            <button class="btn btn-primary btn-sm" id="wf-add-manual-task-btn" type="button">
              + Add Task Manually
            </button>
          </div>
        </div>

        <!-- Phased Task Groups -->
        <div class="workflow-phases-container">
          ${Object.entries(phaseGroups).map(([phaseName, phaseTasks], phaseIdx) => {
            const isCollapsed = this.collapsedPhaseNames.has(phaseName);
            const phaseMeta = (workflow.workflowPhases || []).find(p => p.name === phaseName || p.phaseId === phaseName) || {};
            const phaseDesc = phaseMeta.description || '';
            const phaseTotal = phaseTasks.length;
            const phaseDone = phaseTasks.filter(t => {
              const matched = importedTaskMap.get(t.title.toLowerCase().trim());
              return (matched && matched.status === 'done') || t.status === 'done' || t.completed === true;
            }).length;

            return `
              <div class="workflow-phase-group ${isCollapsed ? 'is-collapsed' : ''}" data-phase-name="${this.escapeHTML(phaseName)}">
                <div class="workflow-phase-header" data-phase-name="${this.escapeHTML(phaseName)}">
                  <div class="workflow-phase-header-left">
                    <button class="phase-chevron-btn" type="button" aria-label="Toggle Phase Collapse" data-phase-name="${this.escapeHTML(phaseName)}">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <span class="workflow-phase-pill">Phase ${phaseIdx + 1}</span>
                    <div class="workflow-phase-info">
                      <h4 class="workflow-phase-name">${this.escapeHTML(phaseName)}</h4>
                      ${phaseDesc ? `<p class="workflow-phase-desc">${this.escapeHTML(phaseDesc)}</p>` : ''}
                    </div>
                  </div>

                  <div class="workflow-phase-header-right">
                    <span class="workflow-phase-stats-pill">
                      <span class="phase-stats-indicator ${phaseDone === phaseTotal && phaseTotal > 0 ? 'all-done' : ''}"></span>
                      <span>${phaseDone}/${phaseTotal} Completed</span>
                    </span>
                    <button class="wf-add-phase-task-btn" data-phase-name="${this.escapeHTML(phaseName)}" type="button" title="Add a new task directly to this phase">
                      + Add Task
                    </button>
                  </div>
                </div>

                <div class="workflow-phase-body">
                  <div class="workflow-phase-tasks-list">
                    ${phaseTasks.map(task => {
                      const isSelected = this.selectedWorkflowTaskIds.has(task.id);
                      const matchedImported = importedTaskMap.get(task.title.toLowerCase().trim());
                      const isAlreadyImported = Boolean(matchedImported);
                      const isDone = (matchedImported && matchedImported.status === 'done') || task.status === 'done' || task.completed === true;
                      const isDetailsExpanded = this.expandedTaskDetailIds.has(task.id);
                      const depTaskTitles = (task.dependencies || []).map(depId => {
                        const depT = (workflow.tasks || []).find(t => t.id === depId);
                        return depT ? depT.title : depId;
                      });
                      const hasLongDesc = task.description && task.description.length > 75;
                      const hasExtraDetails = Boolean(task.completionCriteria || (task.subtasks && task.subtasks.length > 0) || hasLongDesc);

                      return `
                        <div class="workflow-task-item-card ${isDone ? 'is-completed' : ''} ${isSelected ? 'selected' : ''}" data-task-id="${task.id}">
                          <div class="wf-task-header-row">
                            <div class="wf-task-header-left">
                              <label class="wf-task-select-label" title="Select task for dashboard import">
                                <input type="checkbox" class="wf-task-checkbox" data-task-id="${task.id}" ${isSelected ? 'checked' : ''}>
                              </label>

                              <!-- Complete / Reopen Action Button -->
                              <button class="wf-task-status-toggle-btn ${isDone ? 'is-done' : ''}" data-task-id="${task.id}" type="button" title="${isDone ? 'Mark as To Do (Reopen)' : 'Mark as Completed'}">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                  ${isDone ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="9"></circle>'}
                                </svg>
                                <span>${isDone ? 'Completed' : 'To Do'}</span>
                              </button>

                              <span class="priority-tag priority-${(task.priority || 'medium').toLowerCase()}">${task.priority || 'Medium'}</span>
                              ${task.suggestedRole ? `<span class="wf-role-badge">👤 ${this.escapeHTML(task.suggestedRole)}</span>` : ''}
                            </div>

                            <div class="wf-task-header-right">
                              ${isAlreadyImported ? `<span class="status-badge-added">✓ In Task Manager</span>` : ''}
                              <button class="btn-icon-xs wf-move-up-btn" data-task-id="${task.id}" title="Move task up in order" type="button">↑</button>
                              <button class="btn-icon-xs wf-move-down-btn" data-task-id="${task.id}" title="Move task down in order" type="button">↓</button>
                            </div>
                          </div>

                          <div class="wf-task-title ${isDone ? 'title-done' : ''}">${this.escapeHTML(task.title)}</div>

                          <!-- Compact Description with Expandable Details -->
                          <div class="wf-task-desc-wrap">
                            <p class="wf-task-desc ${!isDetailsExpanded && hasLongDesc ? 'is-clamped' : ''}">
                              ${this.escapeHTML(task.description || '')}
                            </p>
                            ${hasExtraDetails ? `
                              <button class="wf-task-expand-btn" data-task-id="${task.id}" type="button">
                                <span>${isDetailsExpanded ? '▲ Hide Details' : '▼ Details & Criteria'}</span>
                              </button>
                            ` : ''}
                          </div>

                          <!-- Expandable Details: Outcome verification & subtasks -->
                          <div class="wf-task-expanded-body" id="details-${task.id}" style="${isDetailsExpanded ? 'display: flex;' : 'display: none;'}">
                            ${task.completionCriteria ? `
                              <div class="wf-completion-criteria">
                                <span class="criteria-label">🎯 Verification Criteria:</span>
                                <span>${this.escapeHTML(task.completionCriteria)}</span>
                              </div>
                            ` : ''}

                            ${task.subtasks && task.subtasks.length > 0 ? `
                              <div class="workflow-task-subtasks">
                                <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:2px;">
                                  Checklist (${task.subtasks.length} items)
                                </div>
                                ${task.subtasks.map(st => `
                                  <div class="workflow-subtask-row">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>
                                    <span>${this.escapeHTML(st.title)}</span>
                                  </div>
                                `).join('')}
                              </div>
                            ` : ''}
                          </div>

                          ${depTaskTitles.length > 0 ? `
                            <div class="wf-dependencies-row">
                              <span class="dep-label">🔗 Prerequisites:</span>
                              ${depTaskTitles.map(dt => `<span class="dep-chip" title="Prerequisite task">${this.escapeHTML(dt)}</span>`).join('')}
                            </div>
                          ` : ''}

                          <div class="wf-task-footer-row">
                            <div class="wf-task-footer-meta">
                              <span class="wf-task-due">📅 ${task.displayDueDate || task.dueDate || 'Suggested sequencing'}</span>
                              <span class="wf-task-duration">⏱️ ${task.estimatedDuration || `${task.estimatedMins || 60}m`}</span>
                            </div>

                            <div class="wf-task-controls">
                              <button class="btn btn-ghost btn-xs wf-edit-task-btn" data-task-id="${task.id}" type="button" title="Edit task details">✏️ Edit</button>
                              <button class="btn btn-ghost btn-xs wf-dup-task-btn" data-task-id="${task.id}" type="button" title="Duplicate task">📋 Copy</button>
                              <button class="btn btn-ghost btn-xs wf-del-task-btn" data-task-id="${task.id}" type="button" title="Delete task" style="color:var(--priority-urgent);">🗑️ Delete</button>
                              <button class="btn btn-secondary btn-xs wf-quick-add-btn ${isAlreadyImported ? 'added' : ''}" data-task-id="${task.id}" ${isAlreadyImported ? 'disabled' : ''} type="button">
                                ${isAlreadyImported ? '✓ In Board' : '+ Add to Board'}
                              </button>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 5. Workflow Refinement Panel (Conversational Operations Tuning) -->
      <div class="workflow-section-wrap">
        <div class="workflow-refinement-card">
          <div class="refinement-header">
            <div class="workflow-icon-badge" style="background: linear-gradient(135deg, #a855f7, #6366f1); width: 34px; height: 34px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <div>
              <h4 style="font-weight: 700; color: var(--text-main); font-size: 0.95rem; margin-bottom: 2px;">
                Intelligent Workflow Refinement
              </h4>
              <p style="font-size: 0.78rem; color: var(--text-secondary);">
                Tune timeline, rebalance team assignments, introduce dedicated risk phases, or split tasks without starting from scratch.
              </p>
            </div>
          </div>

          <div class="refinement-chips-row">
            <span class="refine-chip" data-refine="Reduce the plan to fit 5 days">⚡ Compress to 5 days</span>
            <span class="refine-chip" data-refine="Add a risk-management phase">🛡️ Add risk management phase</span>
            <span class="refine-chip" data-refine="Give the marketing tasks higher priority">📈 Prioritize marketing</span>
            <span class="refine-chip" data-refine="Split the venue preparation into smaller tasks">🏢 Deconstruct venue tasks</span>
            <span class="refine-chip" data-refine="Reassign these tasks across four organizers">👥 Distribute across 4 organizers</span>
          </div>

          <form id="wf-refinement-form" class="refinement-input-wrap">
            <input type="text" id="wf-refinement-input" class="form-control" placeholder="Tell the generator what to tweak (e.g. 'Shorten timeline to 5 days and give marketing higher priority')...">
            <button type="submit" class="btn btn-primary" id="wf-refine-submit-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Apply Refinement</span>
            </button>
          </form>
        </div>
      </div>
    `;

    // Bind Result Events
    this.bindWorkflowResultEvents(container, workflow);
  }

  bindWorkflowResultEvents(container, workflow) {
    // 1. Save Workflow
    const saveDraftBtn = container.querySelector('#wf-save-draft-btn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => this.saveWorkflowDraft());
    }

    // 2. Edit Workflow Details
    const editWfBtn = container.querySelector('#wf-edit-workflow-btn');
    if (editWfBtn) {
      editWfBtn.addEventListener('click', () => this.openEditWorkflowModal());
    }

    // 3. Export JSON
    const exportJsonBtn = container.querySelector('#wf-export-json-btn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportWorkflowJSON(workflow));
    }

    // 4. Copy Markdown Runbook
    const copyMdBtn = container.querySelector('#wf-copy-md-btn');
    if (copyMdBtn) {
      copyMdBtn.addEventListener('click', () => this.exportWorkflowMarkdown(workflow));
    }

    // 5. Import Selected Tasks to Task Manager
    const importSelectedBtn = container.querySelector('#wf-import-selected-btn');
    if (importSelectedBtn) {
      importSelectedBtn.addEventListener('click', () => this.addSelectedWorkflowTasks());
    }

    // 6. Discard Draft
    const discardBtn = container.querySelector('#wf-discard-draft-btn');
    if (discardBtn) {
      discardBtn.addEventListener('click', () => this.discardWorkflowDraft());
    }

    // 7. Toggle All Phases (Expand / Collapse All)
    const toggleAllPhasesBtn = container.querySelector('#wf-toggle-all-phases-btn');
    if (toggleAllPhasesBtn) {
      toggleAllPhasesBtn.addEventListener('click', () => {
        const phaseGroups = {};
        (workflow.tasks || []).forEach(task => {
          const ph = task.workflowPhase || task.phase || 'General Execution';
          phaseGroups[ph] = true;
        });
        const allPhaseNames = Object.keys(phaseGroups);
        const shouldCollapse = this.collapsedPhaseNames.size === 0;

        if (shouldCollapse) {
          allPhaseNames.forEach(p => this.collapsedPhaseNames.add(p));
        } else {
          this.collapsedPhaseNames.clear();
        }

        container.querySelectorAll('.workflow-phase-group').forEach(group => {
          const name = group.getAttribute('data-phase-name');
          const isCol = this.collapsedPhaseNames.has(name);
          group.classList.toggle('is-collapsed', isCol);
        });

        toggleAllPhasesBtn.textContent = shouldCollapse ? '▼ Expand All Phases' : '▲ Collapse All Phases';
      });
    }

    // 8. Collapsible Phase Headers
    container.querySelectorAll('.workflow-phase-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.wf-add-phase-task-btn')) return;

        const phaseName = header.getAttribute('data-phase-name');
        if (!phaseName) return;

        const group = header.closest('.workflow-phase-group');
        const isCollapsed = this.collapsedPhaseNames.has(phaseName);

        if (isCollapsed) {
          this.collapsedPhaseNames.delete(phaseName);
          if (group) group.classList.remove('is-collapsed');
        } else {
          this.collapsedPhaseNames.add(phaseName);
          if (group) group.classList.add('is-collapsed');
        }

        if (toggleAllPhasesBtn) {
          toggleAllPhasesBtn.textContent = this.collapsedPhaseNames.size > 0 ? '▼ Expand All Phases' : '▲ Collapse All Phases';
        }
      });
    });

    // 9. Add Task to Specific Phase
    container.querySelectorAll('.wf-add-phase-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const phaseName = btn.getAttribute('data-phase-name');
        this.openWorkflowTaskEditModal(null, phaseName);
      });
    });

    // 10. Task Status Toggle (Complete / Reopen)
    container.querySelectorAll('.wf-task-status-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.getAttribute('data-task-id');
        this.toggleWorkflowTaskStatus(taskId);
      });
    });

    // 11. Task Details / Checklist Expansion Toggle
    container.querySelectorAll('.wf-task-expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.getAttribute('data-task-id');
        const card = btn.closest('.workflow-task-item-card');
        const detailsEl = card ? card.querySelector('.wf-task-expanded-body') : null;
        const descEl = card ? card.querySelector('.wf-task-desc') : null;
        const btnSpan = btn.querySelector('span');

        if (this.expandedTaskDetailIds.has(taskId)) {
          this.expandedTaskDetailIds.delete(taskId);
          if (detailsEl) detailsEl.style.display = 'none';
          if (descEl) descEl.classList.add('is-clamped');
          if (btnSpan) btnSpan.textContent = '▼ Details & Criteria';
        } else {
          this.expandedTaskDetailIds.add(taskId);
          if (detailsEl) detailsEl.style.display = 'flex';
          if (descEl) descEl.classList.remove('is-clamped');
          if (btnSpan) btnSpan.textContent = '▲ Hide Details';
        }
      });
    });

    // 12. Select All / Deselect All
    const selectAllBtn = container.querySelector('#wf-select-all-btn');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        const total = workflow.tasks ? workflow.tasks.length : 0;
        if (this.selectedWorkflowTaskIds.size === total) {
          this.selectedWorkflowTaskIds.clear();
        } else {
          this.selectedWorkflowTaskIds = new Set((workflow.tasks || []).map(t => t.id));
        }
        this.renderWorkflowResults(workflow);
      });
    }

    // 13. Checkbox toggles
    container.querySelectorAll('.wf-task-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const taskId = cb.getAttribute('data-task-id');
        if (cb.checked) {
          this.selectedWorkflowTaskIds.add(taskId);
        } else {
          this.selectedWorkflowTaskIds.delete(taskId);
        }
        const card = cb.closest('.workflow-task-item-card');
        if (card) card.classList.toggle('selected', cb.checked);
        const importBtn = container.querySelector('#wf-import-selected-btn span');
        if (importBtn) {
          importBtn.textContent = `Add Selected (${this.selectedWorkflowTaskIds.size}) to My Tasks`;
        }
      });
    });

    // 14. Add Manual Task Button
    const addManualTaskBtn = container.querySelector('#wf-add-manual-task-btn');
    if (addManualTaskBtn) {
      addManualTaskBtn.addEventListener('click', () => this.openWorkflowTaskEditModal(null));
    }

    // 15. Add Milestone Button
    const addMsBtn = container.querySelector('#wf-add-milestone-btn');
    if (addMsBtn) {
      addMsBtn.addEventListener('click', () => this.openWorkflowMilestoneModal(null));
    }

    // 16. Task Controls: Move Up, Move Down, Edit, Duplicate, Delete, Quick Add
    container.querySelectorAll('.wf-move-up-btn').forEach(btn => {
      btn.addEventListener('click', () => this.reorderWorkflowTask(btn.dataset.taskId, -1));
    });

    container.querySelectorAll('.wf-move-down-btn').forEach(btn => {
      btn.addEventListener('click', () => this.reorderWorkflowTask(btn.dataset.taskId, 1));
    });

    container.querySelectorAll('.wf-edit-task-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openWorkflowTaskEditModal(btn.dataset.taskId));
    });

    container.querySelectorAll('.wf-dup-task-btn').forEach(btn => {
      btn.addEventListener('click', () => this.duplicateWorkflowTask(btn.dataset.taskId));
    });

    container.querySelectorAll('.wf-del-task-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteWorkflowTask(btn.dataset.taskId));
    });

    container.querySelectorAll('.wf-quick-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const task = (workflow.tasks || []).find(t => t.id === btn.dataset.taskId);
        const card = btn.closest('.workflow-task-item-card');
        if (task && card) {
          this.addSingleWorkflowTask(task, card, btn);
        }
      });
    });

    // 17. Milestone Controls: Edit, Delete
    container.querySelectorAll('.edit-ms-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openWorkflowMilestoneModal(btn.dataset.msId));
    });

    container.querySelectorAll('.delete-ms-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteWorkflowMilestone(btn.dataset.msId));
    });

    // 18. Refinement Form & Chips
    const refineForm = container.querySelector('#wf-refinement-form');
    const refineInput = container.querySelector('#wf-refinement-input');
    if (refineForm && refineInput) {
      refineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = refineInput.value.trim();
        if (val) this.handleRefinementSubmit(val);
      });
    }

    container.querySelectorAll('.refine-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.refine;
        if (text) this.handleRefinementSubmit(text);
      });
    });
  }

  /* ==========================================================================
     Interactive Task Editor (Modals, Duplication, Reordering, Deletion)
     ========================================================================== */
  openWorkflowTaskEditModal(taskId = null, defaultPhase = null) {
    if (!this.activeWorkflowDraft) return;
    this.editingWorkflowTaskId = taskId;

    const modal = document.getElementById('wf-task-edit-modal');
    const titleEl = document.getElementById('wf-task-modal-title');
    const titleInput = document.getElementById('wf-edit-task-title');
    const descInput = document.getElementById('wf-edit-task-desc');
    const phaseInput = document.getElementById('wf-edit-task-phase');
    const prioInput = document.getElementById('wf-edit-task-priority');
    const dueInput = document.getElementById('wf-edit-task-due');
    const durInput = document.getElementById('wf-edit-task-duration');
    const roleInput = document.getElementById('wf-edit-task-role');
    const criteriaInput = document.getElementById('wf-edit-task-criteria');
    const depList = document.getElementById('wf-edit-dependencies-list');
    const datalist = document.getElementById('wf-phases-datalist');

    const isEdit = Boolean(taskId);
    if (titleEl) titleEl.textContent = isEdit ? 'Edit Workflow Task' : 'Add Task to Workflow';

    let task = null;
    if (isEdit) {
      task = (this.activeWorkflowDraft.tasks || []).find(t => t.id === taskId);
    }

    // Populate phase datalist
    if (datalist && this.activeWorkflowDraft.tasks) {
      const uniquePhases = new Set();
      this.activeWorkflowDraft.tasks.forEach(t => {
        const ph = t.workflowPhase || t.phase;
        if (ph) uniquePhases.add(ph);
      });
      datalist.innerHTML = Array.from(uniquePhases).map(ph => `<option value="${this.escapeHTML(ph)}"></option>`).join('');
    }

    if (titleInput) titleInput.value = task ? task.title : '';
    if (descInput) descInput.value = task ? task.description : '';
    if (phaseInput) {
      phaseInput.value = task ? (task.workflowPhase || task.phase || 'Planning') : (defaultPhase || 'Phase 1: Planning');
    }
    if (prioInput) prioInput.value = task ? task.priority : 'medium';
    if (dueInput) dueInput.value = task ? (task.dueDate || '') : '';
    if (durInput) durInput.value = task ? (task.estimatedDuration || `${task.estimatedMins || 60}m`) : '2 hours';
    if (roleInput) roleInput.value = task ? (task.suggestedRole || '') : '';
    if (criteriaInput) criteriaInput.value = task ? (task.completionCriteria || '') : '';

    // Render Prerequisite Dependencies list
    if (depList) {
      const otherTasks = (this.activeWorkflowDraft.tasks || []).filter(t => t.id !== taskId);
      if (otherTasks.length === 0) {
        depList.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted);">No other tasks available for dependencies.</span>`;
      } else {
        const currentDeps = new Set(task ? (task.dependencies || []) : []);
        depList.innerHTML = otherTasks.map(ot => `
          <label class="dep-checkbox-item">
            <input type="checkbox" name="wf-dep" value="${ot.id}" ${currentDeps.has(ot.id) ? 'checked' : ''}>
            <span>${this.escapeHTML(ot.title)} <small style="color:var(--text-muted);">(${ot.workflowPhase || ot.phase || 'Phase'})</small></span>
          </label>
        `).join('');
      }
    }

    if (modal) modal.classList.add('open', 'active');
  }

  handleWorkflowTaskFormSubmit(e) {
    e.preventDefault();
    if (!this.activeWorkflowDraft) return;

    const title = document.getElementById('wf-edit-task-title')?.value.trim();
    const desc = document.getElementById('wf-edit-task-desc')?.value.trim();
    const phase = document.getElementById('wf-edit-task-phase')?.value.trim() || 'Phase 1: Planning';
    const priority = document.getElementById('wf-edit-task-priority')?.value || 'medium';
    const dueDate = document.getElementById('wf-edit-task-due')?.value || null;
    const duration = document.getElementById('wf-edit-task-duration')?.value.trim() || '2 hours';
    const role = document.getElementById('wf-edit-task-role')?.value.trim() || null;
    const criteria = document.getElementById('wf-edit-task-criteria')?.value.trim() || null;

    // Collect selected dependencies
    const selectedDeps = [];
    document.querySelectorAll('#wf-edit-dependencies-list input[name="wf-dep"]:checked').forEach(cb => {
      selectedDeps.push(cb.value);
    });

    if (!title) return;

    if (this.editingWorkflowTaskId) {
      // Update existing task
      const task = (this.activeWorkflowDraft.tasks || []).find(t => t.id === this.editingWorkflowTaskId);
      if (task) {
        task.title = title;
        task.description = desc;
        task.workflowPhase = phase;
        task.phase = phase;
        task.priority = priority;
        task.dueDate = dueDate;
        task.displayDueDate = dueDate || 'Scheduled';
        task.estimatedDuration = duration;
        task.suggestedRole = role;
        task.completionCriteria = criteria;
        task.dependencies = selectedDeps;
      }
      this.showToast(`Updated task: "${title}"`);
    } else {
      // Create new manual task
      const newId = `task-man-${Date.now()}`;
      const newTask = {
        id: newId,
        title,
        description: desc,
        workflowPhase: phase,
        phase,
        priority,
        status: 'todo',
        quadrant: priority === 'high' ? 'q1' : 'q2',
        dueDate,
        displayDueDate: dueDate || 'Scheduled',
        estimatedDuration: duration,
        estimatedMins: parseInt(duration, 10) || 90,
        dependencies: selectedDeps,
        suggestedRole: role,
        completionCriteria: criteria,
        subtasks: []
      };
      this.activeWorkflowDraft.tasks.push(newTask);
      this.selectedWorkflowTaskIds.add(newId);
      this.showToast(`Added new task: "${title}"`);
    }

    // Guarantee acyclic dependency graph
    this.activeWorkflowDraft.tasks = window.aiCopilot.resolveAndCleanDependencies(this.activeWorkflowDraft.tasks);
    window.storageManager.saveActiveWorkflowDraft(this.activeWorkflowDraft);

    this.closeAllModals();
    this.renderWorkflowResults(this.activeWorkflowDraft);
  }

  duplicateWorkflowTask(taskId) {
    if (!this.activeWorkflowDraft || !this.activeWorkflowDraft.tasks) return;
    const idx = this.activeWorkflowDraft.tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;

    const source = this.activeWorkflowDraft.tasks[idx];
    const newId = `task-dup-${Date.now()}`;
    const clone = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      title: `${source.title} (Copy)`,
      dependencies: [...(source.dependencies || [])]
    };

    this.activeWorkflowDraft.tasks.splice(idx + 1, 0, clone);
    this.selectedWorkflowTaskIds.add(newId);
    window.storageManager.saveActiveWorkflowDraft(this.activeWorkflowDraft);
    this.renderWorkflowResults(this.activeWorkflowDraft);
    this.showToast(`Duplicated task: "${clone.title}"`);
  }

  reorderWorkflowTask(taskId, delta) {
    if (!this.activeWorkflowDraft || !this.activeWorkflowDraft.tasks) return;
    const tasks = this.activeWorkflowDraft.tasks;
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;

    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= tasks.length) return;

    const [moved] = tasks.splice(idx, 1);
    tasks.splice(targetIdx, 0, moved);

    window.storageManager.saveActiveWorkflowDraft(this.activeWorkflowDraft);
    this.renderWorkflowResults(this.activeWorkflowDraft);
  }

  deleteWorkflowTask(taskId) {
    if (!this.activeWorkflowDraft || !this.activeWorkflowDraft.tasks) return;
    const task = this.activeWorkflowDraft.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.openConfirmModal({
      title: 'Delete Workflow Task',
      message: `Are you sure you want to remove "${this.escapeHTML(task.title)}" from this workflow draft? Any prerequisite dependencies pointing to this task will be safely cleaned up.`,
      confirmText: 'Delete Task',
      onConfirm: () => {
        this.activeWorkflowDraft.tasks = this.activeWorkflowDraft.tasks.filter(t => t.id !== taskId);
        this.selectedWorkflowTaskIds.delete(taskId);

        this.activeWorkflowDraft.tasks.forEach(t => {
          if (t.dependencies) {
            t.dependencies = t.dependencies.filter(d => d !== taskId);
          }
        });

        window.storageManager.saveActiveWorkflowDraft(this.activeWorkflowDraft);
        this.renderWorkflowResults(this.activeWorkflowDraft);
        this.showToast(`Deleted task "${task.title}"`);
      }
    });
  }

  /* ==========================================================================
     Milestones Management
     ========================================================================== */
  openWorkflowMilestoneModal(msId = null) {
    if (!this.activeWorkflowDraft) return;
    this.editingWorkflowMilestoneId = msId;

    const modal = document.getElementById('wf-milestone-modal');
    const titleEl = document.getElementById('wf-milestone-modal-title');
    const titleInput = document.getElementById('wf-milestone-title');
    const descInput = document.getElementById('wf-milestone-desc');
    const dueInput = document.getElementById('wf-milestone-due');

    const ms = msId ? (this.activeWorkflowDraft.milestones || []).find(m => m.id === msId) : null;
    if (titleEl) titleEl.textContent = ms ? 'Edit Milestone' : 'Add Milestone';
    if (titleInput) titleInput.value = ms ? ms.title : '';
    if (descInput) descInput.value = ms ? (ms.description || ms.expectedOutcome || '') : '';
    if (dueInput) dueInput.value = ms ? (ms.dueDate || '') : '';

    if (modal) modal.classList.add('open', 'active');
  }

  handleWorkflowMilestoneSubmit(e) {
    e.preventDefault();
    if (!this.activeWorkflowDraft) return;

    const title = document.getElementById('wf-milestone-title')?.value.trim();
    const desc = document.getElementById('wf-milestone-desc')?.value.trim();
    const due = document.getElementById('wf-milestone-due')?.value || null;

    if (!title) return;
    if (!this.activeWorkflowDraft.milestones) this.activeWorkflowDraft.milestones = [];

    if (this.editingWorkflowMilestoneId) {
      const ms = this.activeWorkflowDraft.milestones.find(m => m.id === this.editingWorkflowMilestoneId);
      if (ms) {
        ms.title = title;
        ms.description = desc;
        ms.expectedOutcome = desc;
        ms.dueDate = due;
      }
      this.showToast(`Updated milestone: "${title}"`);
    } else {
      const newMs = {
        id: `ms-${Date.now()}`,
        title,
        description: desc,
        expectedOutcome: desc,
        dueDate: due
      };
      this.activeWorkflowDraft.milestones.push(newMs);
      this.showToast(`Added milestone: "${title}"`);
    }

    window.storageManager.saveActiveWorkflowDraft(this.activeWorkflowDraft);
    this.closeAllModals();
    this.renderWorkflowResults(this.activeWorkflowDraft);
  }

  deleteWorkflowMilestone(msId) {
    if (!this.activeWorkflowDraft || !this.activeWorkflowDraft.milestones) return;
    this.activeWorkflowDraft.milestones = this.activeWorkflowDraft.milestones.filter(m => m.id !== msId);
    window.storageManager.saveActiveWorkflowDraft(this.activeWorkflowDraft);
    this.renderWorkflowResults(this.activeWorkflowDraft);
    this.showToast('Milestone removed');
  }

  /* ==========================================================================
     Workflow Refinement Execution
     ========================================================================== */
  async handleRefinementSubmit(promptText) {
    if (!this.activeWorkflowDraft) return;
    const btn = document.getElementById('wf-refine-submit-btn');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spin">⏳</span> Refining...`;
    }

    try {
      const refined = await window.aiCopilot.refineWorkflow(this.activeWorkflowDraft, promptText);
      this.activeWorkflowDraft = refined;
      this.selectedWorkflowTaskIds = new Set(refined.tasks.map(t => t.id));
      window.storageManager.saveActiveWorkflowDraft(refined);
      this.renderWorkflowResults(refined);
      this.showToast(`✨ Refinement Applied: "${promptText}"`);
    } catch (err) {
      console.error('Refinement failed', err);
      this.showToast(`Refinement error: ${err.message}`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Apply Refinement</span>
        `;
      }
    }
  }

  /* ==========================================================================
     Workflow Status Toggling, Editing, and Export Actions
     ========================================================================== */
  toggleWorkflowTaskStatus(taskId) {
    if (!this.activeWorkflowDraft || !this.activeWorkflowDraft.tasks) return;
    const task = this.activeWorkflowDraft.tasks.find(t => t.id === taskId);
    if (!task) return;

    const willBeDone = (task.status !== 'done' && !task.completed);
    task.status = willBeDone ? 'done' : 'todo';
    task.completed = willBeDone;

    // Sync with storage if imported to task manager
    const existingTasks = window.storageManager.getTasks();
    const matched = existingTasks.find(t =>
      (t.workflowId === this.activeWorkflowDraft.id || (this.activeWorkflowDraft.title && t.workflowTitle === this.activeWorkflowDraft.title)) &&
      t.title.toLowerCase().trim() === task.title.toLowerCase().trim()
    );
    if (matched) {
      window.storageManager.updateTask(matched.id, { status: task.status });
    }

    // Persist active draft
    window.storageManager.saveActiveWorkflowDraft(this.activeWorkflowDraft);

    // Sync with saved workflows if present
    const savedList = window.storageManager.getRawWorkflows();
    const savedIdx = savedList.findIndex(w => w.id === this.activeWorkflowDraft.id);
    if (savedIdx >= 0) {
      savedList[savedIdx] = {
        ...savedList[savedIdx],
        tasks: this.activeWorkflowDraft.tasks,
        updatedAt: new Date().toISOString()
      };
      window.storageManager.saveWorkflows(savedList);
    }

    // Immediately re-render to update progress counters, progress bar & task card
    this.renderWorkflowResults(this.activeWorkflowDraft);
    this.showToast(willBeDone ? `✓ Marked "${task.title}" as completed!` : `🔄 Reopened "${task.title}"`);
  }

  openEditWorkflowModal() {
    if (!this.activeWorkflowDraft) return;
    const modal = document.getElementById('wf-rename-modal');
    const titleInput = document.getElementById('wf-rename-title-input');
    const summaryInput = document.getElementById('wf-edit-workflow-summary');
    const deadlineInput = document.getElementById('wf-edit-workflow-deadline');
    const prioritySelect = document.getElementById('wf-edit-workflow-priority');
    const teamInput = document.getElementById('wf-edit-workflow-team');
    const budgetInput = document.getElementById('wf-edit-workflow-budget');
    const idInput = document.getElementById('wf-rename-id');

    if (idInput) idInput.value = this.activeWorkflowDraft.id || '';
    if (titleInput) titleInput.value = this.activeWorkflowDraft.title || '';
    if (summaryInput) summaryInput.value = this.activeWorkflowDraft.summary || this.activeWorkflowDraft.objective || '';
    if (deadlineInput) deadlineInput.value = this.activeWorkflowDraft.deadline || '';
    if (prioritySelect) prioritySelect.value = (this.activeWorkflowDraft.priority || 'high').toLowerCase();
    if (teamInput) teamInput.value = this.activeWorkflowDraft.teamSize || '';
    if (budgetInput) budgetInput.value = this.activeWorkflowDraft.budget || '';

    if (modal) modal.classList.add('open', 'active');
  }

  handleWorkflowEditSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!this.activeWorkflowDraft) return;

    const titleInput = document.getElementById('wf-rename-title-input');
    const summaryInput = document.getElementById('wf-edit-workflow-summary');
    const deadlineInput = document.getElementById('wf-edit-workflow-deadline');
    const prioritySelect = document.getElementById('wf-edit-workflow-priority');
    const teamInput = document.getElementById('wf-edit-workflow-team');
    const budgetInput = document.getElementById('wf-edit-workflow-budget');

    const newTitle = titleInput ? titleInput.value.trim() : '';
    if (!newTitle) return;

    this.activeWorkflowDraft.title = newTitle;
    if (summaryInput) {
      this.activeWorkflowDraft.summary = summaryInput.value.trim();
      this.activeWorkflowDraft.objective = summaryInput.value.trim();
    }
    if (deadlineInput && deadlineInput.value) {
      this.activeWorkflowDraft.deadline = deadlineInput.value;
    }
    if (prioritySelect) {
      this.activeWorkflowDraft.priority = prioritySelect.value;
    }
    if (teamInput) {
      this.activeWorkflowDraft.teamSize = teamInput.value.trim() || this.activeWorkflowDraft.teamSize;
    }
    if (budgetInput) {
      this.activeWorkflowDraft.budget = budgetInput.value.trim() || this.activeWorkflowDraft.budget;
    }

    // Persist active draft
    window.storageManager.saveActiveWorkflowDraft(this.activeWorkflowDraft);

    // If this workflow is already saved, update it in storage as well
    const savedList = window.storageManager.getRawWorkflows();
    const savedIdx = savedList.findIndex(w => w.id === this.activeWorkflowDraft.id);
    if (savedIdx >= 0) {
      savedList[savedIdx] = {
        ...savedList[savedIdx],
        title: this.activeWorkflowDraft.title,
        summary: this.activeWorkflowDraft.summary,
        objective: this.activeWorkflowDraft.objective,
        deadline: this.activeWorkflowDraft.deadline,
        priority: this.activeWorkflowDraft.priority,
        teamSize: this.activeWorkflowDraft.teamSize,
        budget: this.activeWorkflowDraft.budget,
        updatedAt: new Date().toISOString()
      };
      window.storageManager.saveWorkflows(savedList);
    }

    this.closeAllModals();
    this.renderWorkflowResults(this.activeWorkflowDraft);
    this.showToast(`Updated workflow: "${newTitle}"`);
  }

  handleWorkflowRenameSubmit(e) {
    this.handleWorkflowEditSubmit(e);
  }

  exportWorkflowJSON(workflow) {
    if (!workflow) return;
    try {
      const dataStr = JSON.stringify(workflow, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = (workflow.title || 'workflow').toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `TaskPilot_${safeTitle}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('📥 Exported workflow JSON backup file');
    } catch (err) {
      console.error('Failed to export workflow JSON', err);
      this.showToast('Failed to export JSON');
    }
  }

  hydrateActiveWorkflowDraft() {
    if (!this.activeWorkflowDraft) {
      const cached = window.storageManager.getActiveWorkflowDraft();
      if (cached && cached.tasks) {
        this.activeWorkflowDraft = cached;
        if (!this.selectedWorkflowTaskIds || this.selectedWorkflowTaskIds.size === 0) {
          this.selectedWorkflowTaskIds = new Set(cached.tasks.map(t => t.id));
        }
      }
    }
  }

  /* ==========================================================================
     Import to Task Manager & Workflow Persistence
     ========================================================================== */
  saveWorkflowDraft() {
    if (!this.activeWorkflowDraft) return;
    const wf = {
      ...this.activeWorkflowDraft,
      status: this.activeWorkflowDraft.status || 'Draft',
      updatedAt: new Date().toISOString()
    };

    window.storageManager.addWorkflow(wf);
    window.storageManager.saveActiveWorkflowDraft(wf);
    this.updateHistoryCount();
    this.showToast(`💾 Saved workflow "${wf.title}" to Saved Workflows`);
  }

  addSelectedWorkflowTasks() {
    if (!this.activeWorkflowDraft || !this.activeWorkflowDraft.tasks) return;
    const projSelect = document.getElementById('workflow-project-select');
    const selectedProjectId = projSelect ? projSelect.value : 'proj-academic';

    const tasksToImport = this.activeWorkflowDraft.tasks.filter(t => this.selectedWorkflowTaskIds.has(t.id));
    if (tasksToImport.length === 0) {
      this.showToast('⚠️ Please select at least one task to import');
      return;
    }

    // Save/update parent workflow first
    this.activeWorkflowDraft.status = 'Active';
    const existingWfs = window.storageManager.getWorkflows();
    const wfIdx = existingWfs.findIndex(w => w.id === this.activeWorkflowDraft.id);
    if (wfIdx >= 0) {
      existingWfs[wfIdx] = this.activeWorkflowDraft;
    } else {
      existingWfs.push(this.activeWorkflowDraft);
    }
    window.storageManager.saveWorkflows(existingWfs);

    // Import tasks avoiding duplicate additions
    const existingTasks = window.storageManager.getTasks();
    let newlyAddedCount = 0;

    tasksToImport.forEach(task => {
      const alreadyExists = existingTasks.some(et => 
        (et.workflowId === this.activeWorkflowDraft.id && et.title.toLowerCase().trim() === task.title.toLowerCase().trim())
      );

      if (!alreadyExists) {
        window.storageManager.addTask({
          title: task.title,
          description: task.description,
          priority: task.priority || 'medium',
          quadrant: task.quadrant || (task.priority === 'high' ? 'q1' : 'q2'),
          dueDate: task.dueDate || null,
          estimatedMins: task.estimatedMins || 60,
          subtasks: task.subtasks || [],
          projectId: selectedProjectId,
          status: 'todo',
          workflowId: this.activeWorkflowDraft.id,
          workflowTitle: this.activeWorkflowDraft.title,
          workflowPhase: task.workflowPhase || task.phase || 'Planning',
          dependencies: task.dependencies || [],
          suggestedRole: task.suggestedRole || null,
          completionCriteria: task.completionCriteria || null
        });
        newlyAddedCount++;
      }
    });

    this.render();
    this.triggerConfetti();

    // Render Confirmation Banner
    const banner = document.getElementById('workflow-status-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.innerHTML = `
        <div class="workflow-confirmation-banner">
          <div class="workflow-confirmation-left">
            <div class="confirmation-badge-icon">✓</div>
            <div>
              <h4 style="font-weight: 700; color: var(--text-main); font-size: 1rem; margin-bottom: 2px;">
                Confirmation: ${newlyAddedCount} Tasks Successfully Added to AI Task Dashboard!
              </h4>
              <p style="font-size: 0.82rem; color: var(--text-secondary);">
                All tasks are now active in the "To Do" stage with linked dependencies, assigned priorities, and target outcomes.
              </p>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" id="banner-view-dashboard-btn" type="button">
            View on AI Task Dashboard →
          </button>
        </div>
      `;

      const viewBtn = document.getElementById('banner-view-dashboard-btn');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => this.switchView('kanban'));
      }
    }

    this.renderWorkflowResults(this.activeWorkflowDraft);
    this.showToast(`🚀 Successfully imported ${newlyAddedCount} tasks into Kanban!`);
  }

  addSingleWorkflowTask(task, cardEl, btnEl) {
    if (!this.activeWorkflowDraft) return;
    const projSelect = document.getElementById('workflow-project-select');
    const selectedProjectId = projSelect ? projSelect.value : 'proj-academic';

    window.storageManager.addTask({
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      quadrant: task.quadrant || (task.priority === 'high' ? 'q1' : 'q2'),
      dueDate: task.dueDate || null,
      estimatedMins: task.estimatedMins || 60,
      subtasks: task.subtasks || [],
      projectId: selectedProjectId,
      status: 'todo',
      workflowId: this.activeWorkflowDraft.id,
      workflowTitle: this.activeWorkflowDraft.title,
      workflowPhase: task.workflowPhase || task.phase || 'Planning',
      dependencies: task.dependencies || [],
      suggestedRole: task.suggestedRole || null,
      completionCriteria: task.completionCriteria || null
    });

    // Update UI elements
    btnEl.textContent = '✓ Added';
    btnEl.classList.add('added');
    btnEl.disabled = true;

    const metaRight = cardEl.querySelector('.wf-task-meta-right');
    if (metaRight && !metaRight.querySelector('.status-badge-added')) {
      const badge = document.createElement('span');
      badge.className = 'status-badge-added';
      badge.textContent = '✓ In Task Manager';
      metaRight.appendChild(badge);
    }

    this.render();
    this.showToast(`Added "${task.title}" to AI Task Dashboard!`);
  }

  discardWorkflowDraft() {
    this.openConfirmModal({
      title: 'Discard Unsaved Workflow Draft',
      message: 'Are you sure you want to discard this generated workflow? Any unsaved edits will be removed.',
      confirmText: 'Discard Draft',
      onConfirm: () => {
        this.activeWorkflowDraft = null;
        this.selectedWorkflowTaskIds.clear();
        this.collapsedPhaseNames.clear();
        this.expandedTaskDetailIds.clear();
        window.storageManager.clearActiveWorkflowDraft();
        const container = document.getElementById('workflow-results-container');
        if (container) container.innerHTML = '';
        const banner = document.getElementById('workflow-status-banner');
        if (banner) {
          banner.innerHTML = '';
          banner.style.display = 'none';
        }
        this.showToast('Workflow draft discarded');
      }
    });
  }

  /* ==========================================================================
     Saved Workflows History Section
     ========================================================================== */
  renderSavedWorkflows() {
    const listContainer = document.getElementById('saved-workflows-list');
    if (!listContainer) return;

    let workflows = window.storageManager.getWorkflows();
    this.updateHistoryCount();

    // Enrich with dynamic task statistics
    workflows = workflows.map(wf => window.storageManager.enrichWorkflowWithTaskStats(wf));

    // Apply Filter Pill
    if (this.historyFilter && this.historyFilter !== 'all') {
      workflows = workflows.filter(w => (w.status || 'draft').toLowerCase() === this.historyFilter.toLowerCase());
    }

    if (workflows.length === 0) {
      listContainer.innerHTML = `
        <div class="wf-empty-history-card">
          <div class="empty-icon-circle">📋</div>
          <h4 style="font-size:1.05rem; font-weight:700; color:var(--text-main); margin-bottom:4px;">
            No ${this.historyFilter !== 'all' ? this.historyFilter : ''} workflows found
          </h4>
          <p style="font-size:0.84rem; color:var(--text-secondary); max-width:440px; margin-bottom:16px;">
            Generate an operational plan in the Studio tab or save your current draft to track long-term execution progress here.
          </p>
          <button class="btn btn-primary btn-sm" id="empty-goto-studio-btn">
            Create Workflow in Studio →
          </button>
        </div>
      `;
      const btn = listContainer.querySelector('#empty-goto-studio-btn');
      if (btn) {
        btn.addEventListener('click', () => this.switchWorkflowTab('studio'));
      }
      return;
    }

    listContainer.innerHTML = workflows.map(wf => {
      const total = wf.totalTasks || 0;
      const completed = wf.completedTasks || 0;
      const pct = wf.completionPercentage || 0;
      const statusLower = (wf.status || 'draft').toLowerCase();

      return `
        <div class="saved-wf-card" data-wf-id="${wf.id}">
          <div class="saved-wf-top">
            <span class="workflow-status-badge status-${statusLower}">
              ● ${(wf.status || 'Draft').toUpperCase()}
            </span>
            <span style="font-size:0.75rem; color:var(--text-muted);">
              Created ${new Date(wf.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <h4 class="saved-wf-title">${this.escapeHTML(wf.title)}</h4>
          <p class="saved-wf-desc">${this.escapeHTML(wf.objective || wf.summary || 'Operational plan')}</p>

          <!-- Execution Progress -->
          <div class="saved-wf-progress-wrap">
            <div class="saved-wf-progress-label">
              <span>Progress: ${completed} of ${total} tasks completed</span>
              <span><strong>${pct}%</strong></span>
            </div>
            <div class="progress-track" style="height: 6px;">
              <div class="progress-fill" style="width: ${pct}%; background: linear-gradient(90deg, #6366f1, #06b6d4);"></div>
            </div>
          </div>

          <div class="saved-wf-meta-tags">
            <span class="saved-wf-tag">📋 ${total} Tasks</span>
            <span class="saved-wf-tag">🚩 ${(wf.milestones || []).length} Milestones</span>
            ${wf.deadline ? `<span class="saved-wf-tag">📅 Due ${wf.deadline}</span>` : ''}
          </div>

          <div class="saved-wf-actions">
            <button class="btn btn-secondary btn-xs open-studio-wf-btn" data-wf-id="${wf.id}">
              Open in Studio
            </button>
            <button class="btn btn-ghost btn-xs view-kanban-wf-btn" data-wf-id="${wf.id}">
              View Kanban Tasks
            </button>
            <select class="form-control status-select-wf-btn" data-wf-id="${wf.id}" style="width:auto; padding:3px 8px; font-size:0.75rem;">
              <option value="Draft" ${statusLower === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="Active" ${statusLower === 'active' ? 'selected' : ''}>Active</option>
              <option value="Completed" ${statusLower === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="Archived" ${statusLower === 'archived' ? 'selected' : ''}>Archived</option>
            </select>
            <button class="btn-icon-xs delete-wf-btn" data-wf-id="${wf.id}" title="Delete this workflow" style="color:var(--accent-danger);">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind saved workflow actions
    listContainer.querySelectorAll('.open-studio-wf-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openSavedWorkflowInStudio(btn.dataset.wfId));
    });

    listContainer.querySelectorAll('.view-kanban-wf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView('kanban');
      });
    });

    listContainer.querySelectorAll('.status-select-wf-btn').forEach(sel => {
      sel.addEventListener('change', (e) => {
        this.updateSavedWorkflowStatus(sel.dataset.wfId, e.target.value);
      });
    });

    listContainer.querySelectorAll('.delete-wf-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteSavedWorkflow(btn.dataset.wfId));
    });
  }

  openSavedWorkflowInStudio(workflowId) {
    const wf = window.storageManager.getWorkflowById(workflowId);
    if (!wf) return;

    this.activeWorkflowDraft = JSON.parse(JSON.stringify(wf));
    this.selectedWorkflowTaskIds = new Set((this.activeWorkflowDraft.tasks || []).map(t => t.id));
    window.storageManager.saveActiveWorkflowDraft(this.activeWorkflowDraft);
    this.switchWorkflowTab('studio');
    this.renderWorkflowResults(this.activeWorkflowDraft);
    this.showToast(`Loaded "${wf.title}" into Studio`);
  }

  updateSavedWorkflowStatus(workflowId, newStatus) {
    const wfs = window.storageManager.getWorkflows();
    const target = wfs.find(w => w.id === workflowId);
    if (target) {
      target.status = newStatus;
      target.updatedAt = new Date().toISOString();
      window.storageManager.saveWorkflows(wfs);
      this.renderSavedWorkflows();
      this.showToast(`Updated workflow status to "${newStatus}"`);
    }
  }

  deleteSavedWorkflow(workflowId) {
    const wf = window.storageManager.getWorkflowById(workflowId);
    if (!wf) return;

    this.openConfirmModal({
      title: 'Delete Saved Workflow',
      message: `Are you sure you want to delete workflow "${this.escapeHTML(wf.title)}"?`,
      extraHtml: `
        <label style="display:flex; align-items:center; gap:8px; font-size:0.85rem; color:var(--text-secondary); cursor:pointer;">
          <input type="checkbox" id="wf-del-cascade-tasks" checked>
          <span>Also remove imported tasks from Kanban dashboard</span>
        </label>
      `,
      confirmText: 'Delete Workflow',
      onConfirm: () => {
        const removeTasks = Boolean(document.getElementById('wf-del-cascade-tasks')?.checked);
        window.storageManager.deleteWorkflow(workflowId, removeTasks);
        if (this.activeWorkflowDraft && this.activeWorkflowDraft.id === workflowId) {
          this.activeWorkflowDraft = null;
          this.selectedWorkflowTaskIds.clear();
          this.collapsedPhaseNames.clear();
          this.expandedTaskDetailIds.clear();
          window.storageManager.clearActiveWorkflowDraft();
          const container = document.getElementById('workflow-results-container');
          if (container) container.innerHTML = '';
        }
        this.renderSavedWorkflows();
        this.render();
        this.showToast(`Deleted workflow "${wf.title}"`);
      }
    });
  }

  /* ==========================================================================
     Confirmation Modal Dialog Helper
     ========================================================================== */
  openConfirmModal({ title, message, extraHtml, confirmText = 'Confirm', onConfirm }) {
    const modal = document.getElementById('wf-confirm-modal');
    const titleEl = document.getElementById('wf-confirm-title');
    const msgEl = document.getElementById('wf-confirm-message');
    const extraEl = document.getElementById('wf-confirm-extra-options');
    const actionBtn = document.getElementById('wf-confirm-action-btn');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.innerHTML = message;
    if (extraEl) {
      if (extraHtml) {
        extraEl.style.display = 'block';
        extraEl.innerHTML = extraHtml;
      } else {
        extraEl.style.display = 'none';
        extraEl.innerHTML = '';
      }
    }

    if (actionBtn) {
      actionBtn.textContent = confirmText;
      // Replace button clone to clean old event listeners
      const newBtn = actionBtn.cloneNode(true);
      actionBtn.parentNode.replaceChild(newBtn, actionBtn);
      newBtn.addEventListener('click', () => {
        this.closeAllModals();
        if (typeof onConfirm === 'function') onConfirm();
      });
    }

    if (modal) modal.classList.add('active');
  }

  /* ==========================================================================
     AI Configuration & Provider Settings (Panel 3)
     ========================================================================== */
  populateAIConfigForm() {
    const config = window.storageManager.getAIConfig();
    const providerSelect = document.getElementById('setting-ai-provider');
    const keyInput = document.getElementById('setting-api-key');
    const modelInput = document.getElementById('setting-ai-model');
    const endpointInput = document.getElementById('setting-custom-endpoint');
    const keyGroup = document.getElementById('api-key-config-group');
    const customEndpointGroup = document.getElementById('custom-endpoint-group');
    const bannerTitle = document.getElementById('mode-banner-title');

    if (providerSelect) providerSelect.value = config.provider || 'demo';
    if (keyInput) keyInput.value = config.apiKey || '';
    if (modelInput) modelInput.value = config.model || (config.provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash');
    if (endpointInput) endpointInput.value = config.customEndpoint || '';

    const isDemo = (config.provider || 'demo') === 'demo';
    if (keyGroup) keyGroup.style.display = isDemo ? 'none' : 'block';
    if (customEndpointGroup) customEndpointGroup.style.display = config.provider === 'custom' ? 'block' : 'none';

    if (bannerTitle) {
      bannerTitle.textContent = isDemo
        ? 'Demo Mode Active (Offline Heuristic Operations Engine)'
        : `Connected to Live AI Provider: ${(config.provider || '').toUpperCase()}`;
    }
  }

  saveAIConfigFromUI() {
    const provider = document.getElementById('setting-ai-provider')?.value || 'demo';
    const apiKey = document.getElementById('setting-api-key')?.value.trim() || '';
    const model = document.getElementById('setting-ai-model')?.value.trim() || 'gemini-1.5-flash';
    const customEndpoint = document.getElementById('setting-custom-endpoint')?.value.trim() || '';

    window.storageManager.saveAIConfig({
      provider,
      apiKey,
      model,
      customEndpoint
    });

    this.updateEngineBadge();
    this.populateAIConfigForm();
    this.showToast('✅ Saved AI Provider configuration');
  }

  resetAIConfigToDemoUI() {
    window.storageManager.saveAIConfig({
      provider: 'demo',
      apiKey: '',
      model: 'deterministic-heuristic-v1',
      customEndpoint: ''
    });

    this.updateEngineBadge();
    this.populateAIConfigForm();
    this.showToast('Reset to Demo Mode (100% Offline)');
  }

  async testAIConnectionUI() {
    const provider = document.getElementById('setting-ai-provider')?.value || 'demo';
    const apiKey = document.getElementById('setting-api-key')?.value.trim() || '';
    const model = document.getElementById('setting-ai-model')?.value.trim() || 'gemini-1.5-flash';
    const resultSpan = document.getElementById('test-connection-result');
    const btn = document.getElementById('test-ai-connection-btn');

    if (resultSpan) {
      resultSpan.textContent = 'Testing connection...';
      resultSpan.style.color = 'var(--text-secondary)';
    }
    if (btn) btn.disabled = true;

    try {
      const res = await window.aiCopilot.testAIConnection(apiKey, provider, model);
      if (resultSpan) {
        if (res.success) {
          resultSpan.textContent = `✓ ${res.message}`;
          resultSpan.style.color = 'var(--accent-success)';
        } else {
          resultSpan.textContent = `❌ ${res.message}`;
          resultSpan.style.color = 'var(--accent-danger)';
        }
      }
    } catch (err) {
      if (resultSpan) {
        resultSpan.textContent = `❌ ${err.message}`;
        resultSpan.style.color = 'var(--accent-danger)';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  /* ==========================================================================
     Markdown Export of Complete Workflow
     ========================================================================== */
  exportWorkflowMarkdown(workflow) {
    if (!workflow) return;
    let md = `# ⚡ ${workflow.title || 'Operational Workflow'}\n`;
    md += `*Generated by TaskPilot AI Workflow Generator (${workflow.engine === 'real-ai' ? 'Live LLM Integration' : 'Deterministic Operations Engine'})*\n\n`;
    md += `> **Objective**: ${workflow.objective || workflow.summary || 'Operations Execution'}\n`;
    md += `> **Deadline**: ${workflow.deadline || 'Sequenced'} | **Duration**: ${workflow.estimatedDuration || 'Calculated'}\n\n`;

    if (workflow.assumptions && workflow.assumptions.length > 0) {
      md += `## 📋 Key Assumptions\n`;
      workflow.assumptions.forEach(a => md += `- ${a}\n`);
      md += `\n`;
    }

    if (workflow.risks && workflow.risks.length > 0) {
      md += `## 🛡️ Identified Risks & Mitigations\n`;
      workflow.risks.forEach(r => md += `- **Risk**: ${r.title} | **Mitigation**: ${r.mitigation}\n`);
      md += `\n`;
    }

    if (workflow.milestones && workflow.milestones.length > 0) {
      md += `## 🚩 Critical Milestones\n`;
      workflow.milestones.forEach(m => md += `- **${m.title}** (${m.dueDate || 'TBD'}): ${m.description || m.expectedOutcome || ''}\n`);
      md += `\n`;
    }

    md += `## 🚀 Phased Task Execution Pipeline\n`;
    (workflow.tasks || []).forEach(t => {
      md += `### [ ] ${t.title} [${(t.priority || 'MEDIUM').toUpperCase()}]\n`;
      md += `- **Phase**: ${t.workflowPhase || t.phase || 'Execution'}\n`;
      md += `- **Due Date**: ${t.displayDueDate || t.dueDate || 'Suggested'}\n`;
      md += `- **Duration**: ${t.estimatedDuration || `${t.estimatedMins || 60}m`}\n`;
      if (t.suggestedRole) md += `- **Suggested Role**: ${t.suggestedRole}\n`;
      if (t.completionCriteria) md += `- **Completion Verification**: ${t.completionCriteria}\n`;
      if (t.dependencies && t.dependencies.length > 0) md += `- **Prerequisites**: ${t.dependencies.join(', ')}\n`;
      md += `- **Description**: ${t.description}\n`;
      if (t.subtasks && t.subtasks.length > 0) {
        md += `- **Checklist**:\n`;
        t.subtasks.forEach(st => md += `  - [ ] ${st.title}\n`);
      }
      md += `\n`;
    });

    const copyText = (text) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise((resolve, reject) => {
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    };

    copyText(md).then(() => {
      this.showToast('📋 Copied complete workflow runbook markdown to clipboard!');
    }).catch(() => {
      this.showToast('⚠️ Unable to copy markdown to clipboard automatically');
    });
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Bootstrap once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new TaskPilotApp();
});
