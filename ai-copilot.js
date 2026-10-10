/**
 * TaskPilot AI — Intelligent Copilot & Task Decomposition Engine
 * Provides smart goal deconstruction, natural language parsing, and daily briefing insights.
 */

class AICopilotEngine {
  constructor() {
    this.knowledgeBase = {
      // Heuristic knowledge bases for popular domains
      webdev: [
        { title: 'Define RESTful API endpoints & data contracts', mins: 45, prio: 'high', quad: 'q2', desc: 'Design JSON schemas and status codes for backend communication.' },
        { title: 'Implement frontend UI state management & stores', mins: 60, prio: 'high', quad: 'q2', desc: 'Setup reactive store and asynchronous action handlers.' },
        { title: 'Write unit tests for critical business logic', mins: 40, prio: 'medium', quad: 'q2', desc: 'Ensure 80%+ coverage on validation routines.' },
        { title: 'Deploy staging environment with CI/CD pipeline', mins: 50, prio: 'urgent', quad: 'q1', desc: 'Configure automatic build, test, and container push on git commit.' },
      ],
      ai_ml: [
        { title: 'Data preprocessing, cleaning & normalization', mins: 60, prio: 'urgent', quad: 'q1', desc: 'Remove outliers, impute missing values, and scale numeric feature distributions.' },
        { title: 'Perform exploratory data analysis (EDA) & feature correlation', mins: 45, prio: 'high', quad: 'q2', desc: 'Generate pairplots and correlation heatmaps to select prime predictive signals.' },
        { title: 'Train baseline machine learning benchmark model', mins: 90, prio: 'high', quad: 'q2', desc: 'Fit baseline classifier/regressor and compute precision, recall & F1 scores.' },
        { title: 'Hyperparameter tuning & cross-validation runs', mins: 75, prio: 'medium', quad: 'q2', desc: 'Run Bayesian optimization or grid search over learning rates and regularization.' },
        { title: 'Export trained model weights & build inference REST endpoint', mins: 40, prio: 'high', quad: 'q1', desc: 'Serialize model artifacts and test inference latency under simulated load.' },
      ],
      exam_study: [
        { title: 'Create master syllabus checklist & identify high-weightage topics', mins: 30, prio: 'urgent', quad: 'q1', desc: 'Analyze past year question papers and pinpoint recurring questions.' },
        { title: 'Synthesize concise chapter summary cheat-sheets', mins: 60, prio: 'high', quad: 'q2', desc: 'Condense formulas, definitions, and architecture diagrams into 2 pages per unit.' },
        { title: 'Solve 3 previous year question papers under exam timer conditions', mins: 120, prio: 'urgent', quad: 'q1', desc: 'Practice time allocation: 2 mins per short question, 15 mins per essay topic.' },
        { title: 'Active recall & flashcard review for tricky concepts', mins: 45, prio: 'medium', quad: 'q2', desc: 'Test memory retrieval without referring to notes.' },
      ],
      marketing: [
        { title: 'Draft value proposition & core campaign messaging', mins: 40, prio: 'high', quad: 'q2', desc: 'Identify core customer pain points and hook copy.' },
        { title: 'Design high-converting visual assets & social thumbnails', mins: 60, prio: 'medium', quad: 'q2', desc: 'Prepare responsive creative graphics matching brand guidelines.' },
        { title: 'Set up A/B landing page variants & tracking pixels', mins: 50, prio: 'urgent', quad: 'q1', desc: 'Configure conversion event tracking and analytics attribution.' },
        { title: 'Launch teaser announcement to early subscriber list', mins: 30, prio: 'high', quad: 'q1', desc: 'Send personalized broadcast email with early-access invitation link.' },
      ]
    };
  }

  /**
   * Deconstructs any complex goal into an actionable roadmap of bite-sized tasks
   */
  async breakdownGoal(goalInput) {
    // Simulate real AI processing latency for authentic user feel
    await new Promise(resolve => setTimeout(resolve, 600));

    const inputLower = goalInput.toLowerCase();
    let templateList = null;

    if (inputLower.includes('machine learning') || inputLower.includes('ai') || inputLower.includes('model') || inputLower.includes('neural') || inputLower.includes('data')) {
      templateList = this.knowledgeBase.ai_ml;
    } else if (inputLower.includes('exam') || inputLower.includes('study') || inputLower.includes('college') || inputLower.includes('test') || inputLower.includes('research')) {
      templateList = this.knowledgeBase.exam_study;
    } else if (inputLower.includes('market') || inputLower.includes('launch') || inputLower.includes('campaign') || inputLower.includes('sale') || inputLower.includes('social')) {
      templateList = this.knowledgeBase.marketing;
    } else if (inputLower.includes('app') || inputLower.includes('web') || inputLower.includes('code') || inputLower.includes('program') || inputLower.includes('software')) {
      templateList = this.knowledgeBase.webdev;
    }

    if (templateList) {
      return templateList.map((item, idx) => ({
        id: 'ai-gen-' + Date.now() + '-' + idx,
        title: item.title,
        description: item.desc,
        priority: item.prio,
        quadrant: item.quad,
        estimatedMins: item.mins,
        subtasks: [
          { id: 'sub-' + idx + '-1', title: 'Phase 1: Initial setup & requirements verification', completed: false },
          { id: 'sub-' + idx + '-2', title: 'Phase 2: Core execution & validation', completed: false },
        ]
      }));
    }

    // Dynamic intelligent decomposition for general queries
    const words = goalInput.trim().replace(/[^\w\s]/gi, '');
    return [
      {
        id: 'ai-gen-' + Date.now() + '-1',
        title: `Phase 1: Research & Scope Definition for "${words}"`,
        description: `Analyze requirements, feasibility, benchmark solutions, and compile success criteria.`,
        priority: 'urgent',
        quadrant: 'q1',
        estimatedMins: 45,
        subtasks: [
          { id: 'sub-1', title: 'Document key milestones & deadlines', completed: false },
          { id: 'sub-2', title: 'Identify required dependencies and tools', completed: false },
        ]
      },
      {
        id: 'ai-gen-' + Date.now() + '-2',
        title: `Phase 2: Core Architecture & Prototype Development`,
        description: `Build the minimum viable foundation for "${words}" and conduct early verification.`,
        priority: 'high',
        quadrant: 'q2',
        estimatedMins: 90,
        subtasks: [
          { id: 'sub-3', title: 'Draft foundational layout / logic', completed: false },
          { id: 'sub-4', title: 'Test edge cases & error boundaries', completed: false },
        ]
      },
      {
        id: 'ai-gen-' + Date.now() + '-3',
        title: `Phase 3: Refinement, Optimization & Quality Polish`,
        description: `Eliminate friction points, improve performance, and refine final presentation.`,
        priority: 'medium',
        quadrant: 'q2',
        estimatedMins: 60,
        subtasks: [
          { id: 'sub-5', title: 'Conduct peer review / self-audit', completed: false },
          { id: 'sub-6', title: 'Verify responsive feel and accessibility', completed: false },
        ]
      },
      {
        id: 'ai-gen-' + Date.now() + '-4',
        title: `Phase 4: Final Delivery & Retrospective Review`,
        description: `Deliver completed work, document findings, and schedule follow-up actions.`,
        priority: 'high',
        quadrant: 'q1',
        estimatedMins: 30,
        subtasks: [
          { id: 'sub-7', title: 'Package final assets for release', completed: false },
          { id: 'sub-8', title: 'Archive notes & celebrate milestone', completed: false },
        ]
      }
    ];
  }

  /**
   * Operations Workflow Generator Engine
   * Converts ordinary human instructions into complete, structured, actionable workflows.
   * Supports real LLM APIs (Gemini/OpenAI) with high-fidelity Demo Mode fallback.
   */
  async generateOperationsWorkflow(rawInput, options = {}) {
    const text = (rawInput || '').trim();
    if (!text) {
      throw new Error('Please provide operations instructions to generate a workflow.');
    }
    if (text.length < 10) {
      throw new Error('Please provide a more descriptive instruction (minimum 10 characters) to generate an actionable workflow.');
    }

    // Check if real AI API credentials are configured in storage
    const aiConfig = window.storageManager ? window.storageManager.getAIConfig() : null;
    const hasValidKey = aiConfig && aiConfig.apiKey && aiConfig.apiKey.trim().length > 5 && aiConfig.provider !== 'demo';

    let workflow = null;

    if (hasValidKey) {
      try {
        workflow = await this.generateWithRealLLM(text, options, aiConfig);
      } catch (err) {
        console.warn('Real AI API call failed, falling back to Demo Mode with notification:', err);
        // Do not silently pretend API succeeded; if configured key fails, report error clearly or allow fallback
        throw new Error(`AI Provider Error (${aiConfig.provider}): ${err.message}. Please verify your API key in AI Settings or switch to Demo Mode.`);
      }
    } else {
      // Offline Intelligent Heuristic Engine (Demo Mode)
      workflow = await this.generateDeterministicWorkflow(text, options);
    }

    // Validate schema & guarantee acyclic dependencies
    workflow = this.validateWorkflowSchema(workflow);
    workflow.tasks = this.resolveAndCleanDependencies(workflow.tasks);

    return workflow;
  }

  /**
   * High-Fidelity Deterministic Workflow Generator (Demo Mode)
   */
  async generateDeterministicWorkflow(rawInput, options = {}) {
    // Realistic simulation latency for interactive feel
    await new Promise(resolve => setTimeout(resolve, 380));

    const text = rawInput.trim();
    const lower = text.toLowerCase();
    const today = new Date();

    // Target horizon calculation
    let horizonDays = parseInt(options.horizonDays, 10);
    if (options.deadline) {
      const targetDate = new Date(options.deadline);
      const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        horizonDays = diffDays;
      }
    }
    if (!horizonDays || isNaN(horizonDays) || horizonDays < 1) {
      horizonDays = 14;
    }

    const detailLevel = (options.detailLevel || 'standard').toLowerCase(); // quick, standard, detailed
    const workflowTitle = options.workflowName ? options.workflowName.trim() : null;
    const userPriority = options.priority ? options.priority.toLowerCase() : null;
    const teamSize = options.teamSize ? options.teamSize.trim() : null;
    const budget = options.budget ? options.budget.trim() : null;
    const projectId = options.projectId || 'proj-academic';

    const formatDate = (offsetDays) => {
      const target = new Date(today);
      target.setDate(today.getDate() + Math.min(offsetDays, horizonDays));
      return target.toISOString().split('T')[0];
    };

    const formatDisplayDate = (offsetDays) => {
      const target = new Date(today);
      const effectiveOffset = Math.min(offsetDays, horizonDays);
      target.setDate(today.getDate() + effectiveOffset);
      const str = target.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const diff = effectiveOffset === 0 ? 'Today' : effectiveOffset === 1 ? 'Tomorrow' : `In ${effectiveOffset} days`;
      return `${str} (${diff})`;
    };

    // ------------------------------------------------------------------------
    // Domain 1: College Hackathon / Academic Event
    // Matches the core problem prompt:
    // "Organize a college hackathon for 100 participants in 10 days. Handle venue booking, registrations, sponsorships, marketing, mentors, equipment, event-day operations, and post-event feedback. We have four organizers and a limited budget."
    // ------------------------------------------------------------------------
    const isHackathon = lower.includes('hackathon') || 
      (lower.includes('college') && (lower.includes('100') || lower.includes('hack') || lower.includes('participant'))) ||
      (lower.includes('venue') && lower.includes('sponsor') && lower.includes('mentor'));

    if (isHackathon) {
      const wfId = 'wf-hackathon-' + Date.now();
      const t1 = 'task-wf-1-' + Date.now();
      const t2 = 'task-wf-2-' + Date.now();
      const t3 = 'task-wf-3-' + Date.now();
      const t4 = 'task-wf-4-' + Date.now();
      const t5 = 'task-wf-5-' + Date.now();
      const t6 = 'task-wf-6-' + Date.now();
      const t7 = 'task-wf-7-' + Date.now();
      const t8 = 'task-wf-8-' + Date.now();
      const t9 = 'task-wf-9-' + Date.now();
      const t10 = 'task-wf-10-' + Date.now();
      const t11 = 'task-wf-11-' + Date.now();
      const t12 = 'task-wf-12-' + Date.now();
      const t13 = 'task-wf-13-' + Date.now();
      const t14 = 'task-wf-14-' + Date.now();

      const allHackathonTasks = [
        {
          id: t1,
          title: 'Secure auditorium & computer lab reservation with administrative sign-off',
          description: 'Inspect facility capacity for 100 hackers, obtain faculty approval, and verify overnight access permissions.',
          phase: 'Phase 1: Planning, Venue & Budget Foundation',
          priority: userPriority || 'urgent',
          status: 'todo',
          dueDate: formatDate(2),
          displayDueDate: formatDisplayDate(2),
          dueOffset: 2,
          estimatedMins: 90,
          estimatedDuration: '1.5 hours',
          dependencies: [],
          suggestedRole: 'Organizer 1 (Lead Operations)',
          completionCriteria: 'Official campus facility booking receipt & security overnight pass signed.',
          subtasks: [
            { id: 'st-h-1-1', title: 'Submit room booking form to campus administration office', completed: false },
            { id: 'st-h-1-2', title: 'Inspect lab seating, air-conditioning, and 24/7 security access', completed: false }
          ]
        },
        {
          id: t2,
          title: 'Establish line-item budget & emergency contingency reserve',
          description: 'Allocate limited financial resources across food/beverages, merchandise, audiovisual rentals, and cash prizes.',
          phase: 'Phase 1: Planning, Venue & Budget Foundation',
          priority: userPriority || 'high',
          status: 'todo',
          dueDate: formatDate(2),
          displayDueDate: formatDisplayDate(2),
          dueOffset: 2,
          estimatedMins: 60,
          estimatedDuration: '1 hour',
          dependencies: [t1],
          suggestedRole: 'Organizer 1 (Lead Operations)',
          completionCriteria: 'Spreadsheet finalized with all 4 organizers signing off on zero deficit.',
          subtasks: [
            { id: 'st-h-2-1', title: 'Itemize food, prizes, and badge costs against available cash', completed: false },
            { id: 'st-h-2-2', title: 'Ring-fence 15% emergency contingency buffer', completed: false }
          ]
        },
        {
          id: t3,
          title: 'Draft tiered sponsorship prospectus & dispatch outreach emails',
          description: 'Contact 15+ potential tech company sponsors with Gold, Silver, and Bronze sponsorship tiers to secure prize funds.',
          phase: 'Phase 1: Planning, Venue & Budget Foundation',
          priority: userPriority || 'urgent',
          status: 'todo',
          dueDate: formatDate(3),
          displayDueDate: formatDisplayDate(3),
          dueOffset: 3,
          estimatedMins: 120,
          estimatedDuration: '2 hours',
          dependencies: [],
          suggestedRole: 'Organizer 3 (Sponsorships & Mentors)',
          completionCriteria: 'Sponsorship PDF prospectus finalized and sent to 15 corporate partner leads.',
          subtasks: [
            { id: 'st-h-3-1', title: 'Prepare 1-page PDF deck detailing 100-student talent demographics', completed: false },
            { id: 'st-h-3-2', title: 'Send personalized outreach emails with tier packages to tech recruiters', completed: false }
          ]
        },
        {
          id: t4,
          title: 'Build registration portal & launch participant application form',
          description: 'Setup digital RSVP form with team creation, GitHub handles, dietary preferences, and resume upload.',
          phase: 'Phase 2: Outreach, Sponsors & Mentorship',
          priority: userPriority || 'high',
          status: 'todo',
          dueDate: formatDate(4),
          displayDueDate: formatDisplayDate(4),
          dueOffset: 4,
          estimatedMins: 75,
          estimatedDuration: '1.25 hours',
          dependencies: [t1],
          suggestedRole: 'Organizer 4 (Marketing & Registration)',
          completionCriteria: 'RSVP portal published live with automated confirmation autoresponder email.',
          subtasks: [
            { id: 'st-h-4-1', title: 'Configure Google Forms / Typeform with 100-seat cap rules', completed: false },
            { id: 'st-h-4-2', title: 'Test confirmation email delivery with Discord invite link', completed: false }
          ]
        },
        {
          id: t5,
          title: 'Execute campus marketing campaign & distribute promotional posters',
          description: 'Print 30 physical posters, pin across academic halls, and launch WhatsApp/Discord broadcast announcements.',
          phase: 'Phase 2: Outreach, Sponsors & Mentorship',
          priority: userPriority || 'medium',
          status: 'todo',
          dueDate: formatDate(5),
          displayDueDate: formatDisplayDate(5),
          dueOffset: 5,
          estimatedMins: 90,
          estimatedDuration: '1.5 hours',
          dependencies: [t4],
          suggestedRole: 'Organizer 4 (Marketing & Registration)',
          completionCriteria: 'Posters pinned in all 4 engineering buildings; 500+ impressions logged on social channels.',
          subtasks: [
            { id: 'st-h-5-1', title: 'Design high-res posters with QR code pointing to registration form', completed: false },
            { id: 'st-h-5-2', title: 'Distribute color printouts across campus bulletin boards and libraries', completed: false }
          ]
        },
        {
          id: t6,
          title: 'Confirm sponsor commitments & collect brand asset packages',
          description: 'Lock in committed sponsor contributions, invoice sponsor pledges, and obtain high-res logos for banners.',
          phase: 'Phase 2: Outreach, Sponsors & Mentorship',
          priority: userPriority || 'high',
          status: 'todo',
          dueDate: formatDate(6),
          displayDueDate: formatDisplayDate(6),
          dueOffset: 6,
          estimatedMins: 90,
          estimatedDuration: '1.5 hours',
          dependencies: [t3],
          suggestedRole: 'Organizer 3 (Sponsorships & Mentors)',
          completionCriteria: 'At least 2 sponsor agreements signed and vector logos received.',
          subtasks: [
            { id: 'st-h-6-1', title: 'Follow up on pending sponsor proposals via phone / email', completed: false },
            { id: 'st-h-6-2', title: 'Collect sponsor logos and track prize API key provisions', completed: false }
          ]
        },
        {
          id: t7,
          title: 'Recruit and onboard 8 industry mentors & 3 judging panel experts',
          description: 'Confirm developer mentors across AI, Web, and Cloud domains; brief them on hackathon problem statements.',
          phase: 'Phase 2: Outreach, Sponsors & Mentorship',
          priority: userPriority || 'high',
          status: 'todo',
          dueDate: formatDate(7),
          displayDueDate: formatDisplayDate(7),
          dueOffset: 7,
          estimatedMins: 75,
          estimatedDuration: '1.25 hours',
          dependencies: [t1],
          suggestedRole: 'Organizer 3 (Sponsorships & Mentors)',
          completionCriteria: '8 mentors confirmed with signed guidelines and schedule allocations locked.',
          subtasks: [
            { id: 'st-h-7-1', title: 'Issue formal mentor invitations with shift hours and expectations', completed: false },
            { id: 'st-h-7-2', title: 'Send judging rubric and scoring criteria document to confirmed judges', completed: false }
          ]
        },
        {
          id: t8,
          title: 'Cap registrations at 100 participants & dispatch welcome packs',
          description: 'Close general registrations at 100 confirmed student hackers, vet team rosters, and send logistical guides.',
          phase: 'Phase 3: Technical Readiness, Equipment & Logistics',
          priority: userPriority || 'urgent',
          status: 'todo',
          dueDate: formatDate(7),
          displayDueDate: formatDisplayDate(7),
          dueOffset: 7,
          estimatedMins: 60,
          estimatedDuration: '1 hour',
          dependencies: [t4, t5],
          suggestedRole: 'Organizer 4 (Marketing & Registration)',
          completionCriteria: '100 participant slots locked with 0 overflow; welcome logistics packet emailed.',
          subtasks: [
            { id: 'st-h-8-1', title: 'Validate team sizes (3–4 members per team = ~25 teams)', completed: false },
            { id: 'st-h-8-2', title: 'Broadcast event survival guide: what to bring, schedule, and rules', completed: false }
          ]
        },
        {
          id: t9,
          title: 'Procure power strips, extension cords & test high-capacity Wi-Fi',
          description: 'Ensure 35+ heavy-duty surge-protected power strips and test simultaneous bandwidth for 100 laptops.',
          phase: 'Phase 3: Technical Readiness, Equipment & Logistics',
          priority: userPriority || 'urgent',
          status: 'todo',
          dueDate: formatDate(8),
          displayDueDate: formatDisplayDate(8),
          dueOffset: 8,
          estimatedMins: 90,
          estimatedDuration: '1.5 hours',
          dependencies: [t1],
          suggestedRole: 'Organizer 2 (Logistics & AV)',
          completionCriteria: 'Campus IT speed test verified > 150 Mbps; 35 extension strips tagged and ready.',
          subtasks: [
            { id: 'st-h-9-1', title: 'Coordinate with campus IT for dedicated SSID network and static IPs', completed: false },
            { id: 'st-h-9-2', title: 'Inspect 35 extension cords and verify emergency circuit breaker location', completed: false }
          ]
        },
        {
          id: t10,
          title: 'Order event catering, coffee, snacks & water within budget',
          description: 'Book reliable local food vendors for opening dinner, midnight snacks, morning coffee, and final lunch.',
          phase: 'Phase 3: Technical Readiness, Equipment & Logistics',
          priority: userPriority || 'medium',
          status: 'todo',
          dueDate: formatDate(8),
          displayDueDate: formatDisplayDate(8),
          dueOffset: 8,
          estimatedMins: 60,
          estimatedDuration: '1 hour',
          dependencies: [t2, t6],
          suggestedRole: 'Organizer 2 (Logistics & AV)',
          completionCriteria: 'Signed catering order receipt with delivery schedule matching event timetable.',
          subtasks: [
            { id: 'st-h-10-1', title: 'Confirm dietary split: vegetarian, vegan, and regular meal counts', completed: false },
            { id: 'st-h-10-2', title: 'Procure bulk water dispensers, tea, coffee, and energy snacks', completed: false }
          ]
        },
        {
          id: t11,
          title: 'Conduct complete AV sound system, projector & timer staging dry-run',
          description: 'Test main stage auditorium sound, dual wireless microphones, countdown timers, and HDMI/USB-C splitters.',
          phase: 'Phase 3: Technical Readiness, Equipment & Logistics',
          priority: userPriority || 'high',
          status: 'todo',
          dueDate: formatDate(9),
          displayDueDate: formatDisplayDate(9),
          dueOffset: 9,
          estimatedMins: 75,
          estimatedDuration: '1.25 hours',
          dependencies: [t1, t9],
          suggestedRole: 'Organizer 2 (Logistics & AV)',
          completionCriteria: 'Successful sound check completed with zero audio feedback; timer slides working.',
          subtasks: [
            { id: 'st-h-11-1', title: 'Test presentation clickers, podium mics, and live countdown timer', completed: false },
            { id: 'st-h-11-2', title: 'Test display adapters for Mac, Windows, and Linux participant laptops', completed: false }
          ]
        },
        {
          id: t12,
          title: 'Manage event-day check-in, team badge distribution & opening ceremony',
          description: 'Coordinate physical check-in desks, hand out lanyard badges, and host opening ceremony with rules briefing.',
          phase: 'Phase 4: Event-Day Operations & Post-Event Wrap-up',
          priority: userPriority || 'urgent',
          status: 'todo',
          dueDate: formatDate(10),
          displayDueDate: formatDisplayDate(10),
          dueOffset: 10,
          estimatedMins: 90,
          estimatedDuration: '1.5 hours',
          dependencies: [t8, t11],
          suggestedRole: 'Organizer 4 (Marketing & Registration)',
          completionCriteria: '100 participant check-ins logged; all 25 teams verified and hack clock started.',
          subtasks: [
            { id: 'st-h-12-1', title: 'Scan registration QR codes and distribute team lanyard badges', completed: false },
            { id: 'st-h-12-2', title: 'Deliver 20-min opening keynote covering code of conduct & sponsors', completed: false }
          ]
        },
        {
          id: t13,
          title: 'Orchestrate mentor breakout rounds & project demo evaluations',
          description: 'Facilitate 3-minute project pitch presentations to judges, tally evaluation sheets, and compute final scores.',
          phase: 'Phase 4: Event-Day Operations & Post-Event Wrap-up',
          priority: userPriority || 'urgent',
          status: 'todo',
          dueDate: formatDate(10),
          displayDueDate: formatDisplayDate(10),
          dueOffset: 10,
          estimatedMins: 150,
          estimatedDuration: '2.5 hours',
          dependencies: [t7, t12],
          suggestedRole: 'Organizer 1 (Lead Operations)',
          completionCriteria: 'All 25 teams evaluated against rubric; top 3 winners and category prizes decided.',
          subtasks: [
            { id: 'st-h-13-1', title: 'Run mentor check-ins across all 25 team tables during building phase', completed: false },
            { id: 'st-h-13-2', title: 'Collect scorecards from judging panel and announce winners at ceremony', completed: false }
          ]
        },
        {
          id: t14,
          title: 'Send post-event feedback survey, certificates & sponsor report',
          description: 'Circulate participant survey, email PDF certificates of participation, and compile sponsor ROI report.',
          phase: 'Phase 4: Event-Day Operations & Post-Event Wrap-up',
          priority: userPriority || 'low',
          status: 'todo',
          dueDate: formatDate(Math.min(horizonDays + 1, 11)),
          displayDueDate: formatDisplayDate(Math.min(horizonDays + 1, 11)),
          dueOffset: 11,
          estimatedMins: 60,
          estimatedDuration: '1 hour',
          dependencies: [t13],
          suggestedRole: 'Organizer 4 (Marketing & Registration)',
          completionCriteria: 'Survey sent to 100 participants; 1-page thank you summary delivered to sponsors.',
          subtasks: [
            { id: 'st-h-14-1', title: 'Send digital participation certificate emails via automated script', completed: false },
            { id: 'st-h-14-2', title: 'Document organizer retrospective lessons learned for future events', completed: false }
          ]
        }
      ];

      // Filter tasks by detail level
      let selectedTasks = allHackathonTasks;
      if (detailLevel === 'quick') {
        selectedTasks = [
          allHackathonTasks[0], // Venue
          allHackathonTasks[1], // Budget
          allHackathonTasks[2], // Sponsors
          allHackathonTasks[3], // Registration
          allHackathonTasks[6], // Mentors
          allHackathonTasks[8], // Equipment/WiFi
          allHackathonTasks[11], // Check-in & Event
          allHackathonTasks[12]  // Demos & Awards
        ];
      }

      const totalMins = selectedTasks.reduce((acc, t) => acc + (t.estimatedMins || 60), 0);

      return {
        id: wfId,
        title: workflowTitle || 'College Hackathon Operations Plan (100 Participants)',
        objective: 'Organize and execute a 10-day sprint college hackathon for 100 student participants under tight budget constraints with 4 designated organizers.',
        summary: 'Comprehensive end-to-end operational plan covering auditorium facility clearance, sponsorship tiers, marketing outreach, mentor coordination, hardware and Wi-Fi infrastructure, 24-hour run-of-show staging, and post-event retrospective.',
        status: 'draft',
        createdAt: new Date().toISOString(),
        deadline: formatDate(horizonDays),
        detailLevel,
        teamSize: teamSize || '4 Organizers',
        budget: budget || 'Limited / Frugal Budget',
        projectId,
        isDemoMode: true,
        engineNotice: 'Demo Mode (Offline Heuristic Operations Engine)',
        assumptions: [
          'Venue provides stable electrical power distribution and Wi-Fi infrastructure (or organizer-supplied hot-spots).',
          'Budget is limited; prizes and meals rely on partial sponsorship support and in-kind API credits.',
          '4 organizers divide core execution: Lead Operations, Logistics & AV, Sponsorships & Mentors, Marketing & Registration.',
          'Targeting 100 participants forming ~25 teams of 3–4 members.'
        ],
        milestones: [
          {
            id: 'ms-h-1',
            title: 'Venue Secured & Budget Approved',
            description: 'Auditorium facility cleared with institutional admin approval; line-item budget locked.',
            dueDate: formatDate(2)
          },
          {
            id: 'ms-h-2',
            title: 'Sponsorship Pledges & Marketing Launch',
            description: 'Corporate sponsor prospectus dispatched and campus-wide promotion kicked off.',
            dueDate: formatDate(4)
          },
          {
            id: 'ms-h-3',
            title: 'Registration Cap (100) Reached & Mentors Onboarded',
            description: 'Application cap reached; 8 industry mentors confirmed and briefed on problem tracks.',
            dueDate: formatDate(7)
          },
          {
            id: 'ms-h-4',
            title: 'Technical Equipment & AV Staging Dry-Run',
            description: 'Wi-Fi load test verified; audio, projectors, and power strips deployed in venue.',
            dueDate: formatDate(9)
          },
          {
            id: 'ms-h-5',
            title: 'Hackathon Demos & Awards Ceremony Concluded',
            description: '100 hackers submit projects; top 3 winning teams awarded by judging panel.',
            dueDate: formatDate(10)
          }
        ],
        workflowPhases: [
          {
            step: 1,
            phaseId: 'phase-h-1',
            name: 'Phase 1: Planning, Venue & Budget Foundation',
            description: 'Facility inspection, administrative permissions, budget allocation, and corporate outreach.',
            prerequisite: 'None (Immediate Day 1 Start)',
            deadline: formatDisplayDate(3),
            duration: '4.5 hours',
            badge: 'Critical Path'
          },
          {
            step: 2,
            phaseId: 'phase-h-2',
            name: 'Phase 2: Outreach, Sponsors & Mentorship',
            description: 'Participant registration launch, social publicity, sponsor confirmations, and mentor onboarding.',
            prerequisite: 'Phase 1: Venue & Budget Foundation',
            deadline: formatDisplayDate(6),
            duration: '5.5 hours',
            badge: 'High Impact'
          },
          {
            step: 3,
            phaseId: 'phase-h-3',
            name: 'Phase 3: Technical Readiness, Equipment & Logistics',
            description: 'Wi-Fi bandwidth verification, power strip distribution, catering confirmation, and AV rehearsal.',
            prerequisite: 'Phases 1 & 2: Venue and Registrations Locked',
            deadline: formatDisplayDate(9),
            duration: '4.5 hours',
            badge: 'Technical Readiness'
          },
          {
            step: 4,
            phaseId: 'phase-h-4',
            name: 'Phase 4: Event-Day Operations & Post-Event Wrap-up',
            description: 'Check-in desks, live mentor office hours, judging panel scoring, and certificate dispatch.',
            prerequisite: 'All Prior Phases Completed',
            deadline: formatDisplayDate(10),
            duration: '5 hours',
            badge: 'Execution & Wrap-up'
          }
        ],
        tasks: selectedTasks,
        risks: [
          {
            title: 'Wi-Fi congestion or latency drop with 100 simultaneous laptops',
            mitigation: 'Provision dual high-speed 5G hotspot routers as instant fallback and coordinate priority bandwidth with campus IT.'
          },
          {
            title: 'Sponsorship funding delays causing catering cashflow shortfall',
            mitigation: 'Secure vendor credit invoice terms with 30-day payment windows and prioritize low-cost bulk catering.'
          },
          {
            title: 'Industry mentor or judge last-minute dropouts',
            mitigation: 'Recruit 2 standby virtual mentors available on Discord video call for remote code reviews.'
          },
          {
            title: 'Auditorium electrical circuit breaker trips under laptop load',
            mitigation: 'Distribute power distribution across 4 distinct circuit breakers and enforce surge-protected multi-plugs.'
          }
        ],
        reminders: [
          {
            id: 'rem-h-1',
            title: 'Campus Facility Key Access & Security Notice',
            triggerTime: 'T-8 Days (Day 2 Checkpoint)',
            dueDate: formatDate(2),
            channel: 'Campus Facilities Office',
            severity: 'Urgent',
            action: 'Verify auditorium keys access pass, custodian coverage, and power backup certification.'
          },
          {
            id: 'rem-h-2',
            title: 'Sponsor Agreement Sign-off & Prize Allocation',
            triggerTime: 'T-5 Days (Day 5 Checkpoint)',
            dueDate: formatDate(5),
            channel: 'Sponsorship Lead Hotline',
            severity: 'High',
            action: 'Ensure all sponsor banners and merchandise are delivered to the staging room.'
          },
          {
            id: 'rem-h-3',
            title: '100-Seat Registration Cap Lock & Discord Broadcast',
            triggerTime: 'T-3 Days (Day 7 Checkpoint)',
            dueDate: formatDate(7),
            channel: 'Attendee Email & Discord',
            severity: 'Urgent',
            action: 'Send final gate check-in instructions and required software stack checklist to attendees.'
          },
          {
            id: 'rem-h-4',
            title: 'AV Sound Check & Hardware Dry-Run Final Sign-off',
            triggerTime: 'T-24 Hours (Event Eve)',
            dueDate: formatDate(9),
            channel: 'Logistics Operations Lead',
            severity: 'High',
            action: 'Power on all stage microphones, test projector aspect ratio, and verify extension cord positions.'
          },
          {
            id: 'rem-h-5',
            title: 'Event Morning Door Opening & Breakfast Dispatch',
            triggerTime: 'T-1 Hour (Event Day 8:00 AM)',
            dueDate: formatDate(10),
            channel: 'Ground Operations Walkie / WhatsApp',
            severity: 'Urgent',
            action: 'Station volunteers at registration desk and set up coffee / breakfast refreshment station.'
          }
        ],
        summaryMetrics: {
          totalTasks: selectedTasks.length,
          totalEstimatedMinutes: totalMins,
          totalPhases: 4,
          totalMilestones: 5,
          totalRisks: 4
        }
      };
    }

    // ------------------------------------------------------------------------
    // Domain 2: Product Release / Software Deployment Operations
    // ------------------------------------------------------------------------
    const isProductLaunch = lower.includes('release') || lower.includes('deploy') || lower.includes('launch') || lower.includes('staging') || lower.includes('qa') || lower.includes('canary');
    if (isProductLaunch) {
      const wfId = 'wf-release-' + Date.now();
      const t1 = 'task-rel-1-' + Date.now();
      const t2 = 'task-rel-2-' + Date.now();
      const t3 = 'task-rel-3-' + Date.now();
      const t4 = 'task-rel-4-' + Date.now();
      const t5 = 'task-rel-5-' + Date.now();

      const releaseTasks = [
        {
          id: t1,
          title: 'Code freeze declaration & release notes synthesis',
          description: 'Tag release candidate git branch, compile changelog, and review breaking changes.',
          phase: 'Phase 1: Code Freeze & Release Documentation',
          priority: userPriority || 'urgent',
          status: 'todo',
          dueDate: formatDate(2),
          displayDueDate: formatDisplayDate(2),
          dueOffset: 2,
          estimatedMins: 45,
          estimatedDuration: '45 mins',
          dependencies: [],
          suggestedRole: 'Release Engineer',
          completionCriteria: 'Git branch cut and published changelog signed off by lead architect.',
          subtasks: [
            { id: 'st-r-1', title: 'Generate diff log between staging and production branches', completed: false },
            { id: 'st-r-2', title: 'Draft customer-facing release notes with migration guides', completed: false }
          ]
        },
        {
          id: t2,
          title: 'Deploy to staging & execute automated regression test suite',
          description: 'Trigger CI/CD pipeline, run end-to-end Cypress tests, and verify payment webhook flows.',
          phase: 'Phase 2: Staging Deployment & Regression Testing',
          priority: userPriority || 'urgent',
          status: 'todo',
          dueDate: formatDate(4),
          displayDueDate: formatDisplayDate(4),
          dueOffset: 4,
          estimatedMins: 90,
          estimatedDuration: '1.5 hours',
          dependencies: [t1],
          suggestedRole: 'QA Automation Lead',
          completionCriteria: '100% test pass rate with zero Sev-1 or Sev-2 defects on staging.',
          subtasks: [
            { id: 'st-r-3', title: 'Execute full test regression suite across browser matrices', completed: false },
            { id: 'st-r-4', title: 'Verify database schema migration with zero table lock conflicts', completed: false }
          ]
        },
        {
          id: t3,
          title: 'Execute production cutover and canary deployment rollout',
          description: 'Promote container images with blue/green deployment strategy, routing 10% traffic first.',
          phase: 'Phase 3: Production Canary Rollout & Database Migration',
          priority: userPriority || 'urgent',
          status: 'todo',
          dueDate: formatDate(6),
          displayDueDate: formatDisplayDate(6),
          dueOffset: 6,
          estimatedMins: 60,
          estimatedDuration: '1 hour',
          dependencies: [t2],
          suggestedRole: 'DevOps Lead',
          completionCriteria: 'Canary traffic clean for 60 mins; 100% DNS cutover executed smoothly.',
          subtasks: [
            { id: 'st-r-5', title: 'Take transactional database backup snapshot before migration', completed: false },
            { id: 'st-r-6', title: 'Monitor real-time error rates and latency percentiles on Datadog', completed: false }
          ]
        },
        {
          id: t4,
          title: 'Publish customer release announcement & brief support teams',
          description: 'Update public product status, publish blog update, and dispatch email broadcast to active users.',
          phase: 'Phase 4: Customer Communication & Support Enablement',
          priority: userPriority || 'medium',
          status: 'todo',
          dueDate: formatDate(7),
          displayDueDate: formatDisplayDate(7),
          dueOffset: 7,
          estimatedMins: 45,
          estimatedDuration: '45 mins',
          dependencies: [t3],
          suggestedRole: 'Product Marketing Lead',
          completionCriteria: 'Public release post live and CS team provided with FAQ cheat sheet.',
          subtasks: [
            { id: 'st-r-7', title: 'Send product newsletter broadcast to workspace owners', completed: false },
            { id: 'st-r-8', title: 'Host 15-minute briefing with customer support agents', completed: false }
          ]
        },
        {
          id: t5,
          title: 'Monitor 24-hour error telemetry & schedule team retrospective',
          description: 'Audit p99 API response latencies, inspect Sentry error logs, and close sprint milestone.',
          phase: 'Phase 5: Telemetry Monitoring & Operational Sign-off',
          priority: userPriority || 'low',
          status: 'todo',
          dueDate: formatDate(8),
          displayDueDate: formatDisplayDate(8),
          dueOffset: 8,
          estimatedMins: 30,
          estimatedDuration: '30 mins',
          dependencies: [t4],
          suggestedRole: 'Engineering Manager',
          completionCriteria: 'Error budget within threshold and team retrospective documented.',
          subtasks: [
            { id: 'st-r-9', title: 'Audit APM latency graphs and resource utilization', completed: false },
            { id: 'st-r-10', title: 'Archive deployment ticket and document retro improvements', completed: false }
          ]
        }
      ];

      return {
        id: wfId,
        title: workflowTitle || 'Software Release & Deployment Operations Runbook',
        objective: 'Execute high-confidence zero-downtime production deployment with rigorous quality gating and stakeholder coordination.',
        summary: 'Production rollout checklist covering release note synthesis, staging verification, end-to-end QA regression testing, DNS/CDN cutover, and customer announcement dispatch.',
        status: 'draft',
        createdAt: new Date().toISOString(),
        deadline: formatDate(horizonDays),
        detailLevel,
        teamSize: teamSize || 'Cross-Functional Release Team',
        budget: budget || 'Standard Infrastructure Budget',
        projectId,
        isDemoMode: true,
        engineNotice: 'Demo Mode (Offline Heuristic Operations Engine)',
        assumptions: [
          'CI/CD deployment pipeline has automated canary rollback triggers.',
          'Database migrations are backward-compatible with active application replicas.',
          'On-call engineering roster is active during the production cutover window.'
        ],
        milestones: [
          { id: 'ms-r-1', title: 'Release Candidate Tagged & Change Log Built', description: 'Code freeze locked; no further pull requests merged.', dueDate: formatDate(2) },
          { id: 'ms-r-2', title: 'Staging QA & Regression Validation Passed', description: 'Zero blocker bugs found on staging environment.', dueDate: formatDate(4) },
          { id: 'ms-r-3', title: 'Production Cutover & Traffic Canary Complete', description: '100% traffic shifted to new version with healthy status.', dueDate: formatDate(6) }
        ],
        workflowPhases: [
          { step: 1, phaseId: 'p-r-1', name: 'Phase 1: Code Freeze & Release Documentation', description: 'Branch tagging and changelog collation.', prerequisite: 'None', deadline: formatDisplayDate(2), duration: '45 mins', badge: 'Governance' },
          { step: 2, phaseId: 'p-r-2', name: 'Phase 2: Staging Deployment & Regression Testing', description: 'Automated test suites and performance validation.', prerequisite: 'Phase 1 Complete', deadline: formatDisplayDate(4), duration: '90 mins', badge: 'Quality Gate' },
          { step: 3, phaseId: 'p-r-3', name: 'Phase 3: Production Canary Rollout & Database Migration', description: 'Zero-downtime cutover and traffic shifting.', prerequisite: 'Phase 2 QA Pass', deadline: formatDisplayDate(6), duration: '60 mins', badge: 'Critical Path' },
          { step: 4, phaseId: 'p-r-4', name: 'Phase 4: Customer Communication & Support Enablement', description: 'Status updates and customer announcements.', prerequisite: 'Phase 3 Verification', deadline: formatDisplayDate(7), duration: '45 mins', badge: 'Outreach' }
        ],
        tasks: releaseTasks,
        risks: [
          { title: 'Schema lock contention during live database migration', mitigation: 'Run migration via background online schema change tool with rollback scripts.' },
          { title: 'Third-party API webhook latency degradation', mitigation: 'Pre-warm cache instances and configure asynchronous retry queues.' }
        ],
        reminders: [
          { id: 'rem-r-1', title: 'Staging QA Freeze Sign-off Deadline', triggerTime: 'T-2 Days before Cutover', dueDate: formatDate(4), channel: '#engineering-release', severity: 'Urgent', action: 'Ensure all critical bug tickets are closed before production tagging.' },
          { id: 'rem-r-2', title: 'Database Snapshot Verification Check', triggerTime: 'T-2 Hours before Migration', dueDate: formatDate(6), channel: 'DBA On-call Hotline', severity: 'Urgent', action: 'Verify point-in-time recovery backup before triggering migrations.' }
        ],
        summaryMetrics: {
          totalTasks: releaseTasks.length,
          totalEstimatedMinutes: releaseTasks.reduce((acc, t) => acc + t.estimatedMins, 0),
          totalPhases: 4,
          totalMilestones: 3,
          totalRisks: 2
        }
      };
    }

    // ------------------------------------------------------------------------
    // Domain 3: Dynamic Operations Generator for Arbitrary Human Instructions
    // Deconstructs ANY natural language instruction into phased, prioritized, actionable tasks
    // ------------------------------------------------------------------------
    const clauses = text
      .split(/(?:[\.\n;]+|,\s*(?=(?:and\s+)?(?:book|invite|assign|prepare|send|deploy|test|build|create|set\s+up|setup|coordinate|audit|write|review|publish|design|organize|contact|verify|pack|notify|hire|inspect|train|implement|conduct|schedule|clean|order|launch|finalize|evaluate)\b))/i)
      .map(s => s.trim())
      .filter(s => s.length > 3 && !/^(and|then|also|please|so|furthermore)$/i.test(s));

    const effectiveClauses = clauses.length >= 2 
      ? clauses 
      : text.split(/[\.\n,;]+/).map(s => s.trim()).filter(s => s.length > 3);

    // Determine target task count based on detail level
    let targetCount = detailLevel === 'quick' ? 6 : detailLevel === 'detailed' ? 16 : 10;
    targetCount = Math.max(4, Math.min(effectiveClauses.length + 3, targetCount));

    const generatedTasks = [];
    const generatedPhases = [];
    const generatedMilestones = [];
    const generatedRisks = [];
    const generatedReminders = [];

    const phaseNames = [
      'Phase 1: Planning, Scoping & Foundations',
      'Phase 2: Execution, Operations & Delivery',
      'Phase 3: Quality Review, Polish & Validation',
      'Phase 4: Final Handover, Release & Retrospective'
    ];

    const stepInterval = Math.max(1, Math.floor(horizonDays / 4));

    phaseNames.forEach((pName, pIdx) => {
      const pOffset = Math.min((pIdx + 1) * stepInterval, horizonDays);
      generatedPhases.push({
        step: pIdx + 1,
        phaseId: `phase-dyn-${pIdx + 1}`,
        name: pName,
        description: `Execute core work packages for stage ${pIdx + 1} with verifiable milestone acceptance.`,
        prerequisite: pIdx === 0 ? 'None (Day 1 Start)' : `${phaseNames[pIdx - 1]} Completion`,
        deadline: formatDisplayDate(pOffset),
        duration: '2–3 hours',
        badge: pIdx === 1 ? 'Core Execution' : pIdx === 0 ? 'Foundation' : 'Sign-off'
      });

      generatedMilestones.push({
        id: `ms-dyn-${pIdx + 1}`,
        title: `Milestone ${pIdx + 1}: ${pName.split(':')[1].trim()} Sign-off`,
        description: `Deliverables for ${pName} complete and verified against acceptance standards.`,
        dueDate: formatDate(pOffset)
      });
    });

    // Populate tasks
    const tasksPerPhase = Math.ceil(targetCount / 4);
    let taskCounter = 0;

    for (let pIdx = 0; pIdx < 4; pIdx++) {
      const currentPhase = generatedPhases[pIdx];
      const pOffset = Math.min((pIdx + 1) * stepInterval, horizonDays);

      for (let tIdx = 0; tIdx < tasksPerPhase && taskCounter < targetCount; tIdx++) {
        taskCounter++;
        const currentTaskId = `task-dyn-${Date.now()}-${taskCounter}`;
        const sourceClause = effectiveClauses[(taskCounter - 1) % effectiveClauses.length] || `Execute action item ${taskCounter}`;

        // Format clean actionable title
        let cleanTitle = sourceClause.replace(/^(step\s*\d+:?|phase\s*\d+:?|\d+[\.\)]|\-\s*)/i, '').trim();
        cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        if (cleanTitle.length > 75) {
          cleanTitle = cleanTitle.slice(0, 72) + '...';
        }

        // Determine sensible distributed priority
        const isUrgent = /(urgent|critical|asap|venue|security|immediate|book|hotfix|freeze|blocker)/i.test(sourceClause);
        const prio = userPriority || (isUrgent ? 'urgent' : taskCounter <= 2 ? 'high' : taskCounter % 3 === 0 ? 'medium' : 'high');

        // Establish logical dependencies
        const dependencies = [];
        if (generatedTasks.length > 0 && tIdx === 0 && pIdx > 0) {
          // First task of phase depends on prior phase's first task
          dependencies.push(generatedTasks[Math.max(0, (pIdx - 1) * tasksPerPhase)].id);
        } else if (generatedTasks.length > 0 && tIdx > 0) {
          // Subsequent tasks in same phase depend on prior task
          dependencies.push(generatedTasks[generatedTasks.length - 1].id);
        }

        const taskOffset = Math.max(1, Math.min(Math.round((taskCounter / targetCount) * horizonDays), horizonDays));

        generatedTasks.push({
          id: currentTaskId,
          title: cleanTitle,
          description: `Action protocol for "${sourceClause}". Coordinate prerequisites, execute standard procedure, and verify completion criteria.`,
          phase: currentPhase.name,
          priority: prio,
          status: 'todo',
          dueDate: formatDate(taskOffset),
          displayDueDate: formatDisplayDate(taskOffset),
          dueOffset: taskOffset,
          estimatedMins: 45 + (taskCounter % 4) * 15,
          estimatedDuration: `${Math.round((45 + (taskCounter % 4) * 15) / 60 * 10) / 10} hours`,
          dependencies,
          suggestedRole: teamSize ? `Team Member ${(taskCounter % 4) + 1}` : 'Operations Lead',
          completionCriteria: `Verified outcomes for "${cleanTitle}" documented and approved.`,
          subtasks: [
            { id: `st-dyn-${taskCounter}-1`, title: `Scope requirements & assemble materials for: ${cleanTitle}`, completed: false },
            { id: `st-dyn-${taskCounter}-2`, title: `Execute core operational task and conduct quality review`, completed: false },
            { id: `st-dyn-${taskCounter}-3`, title: `Log completion record and notify dependent stakeholders`, completed: false }
          ]
        });
      }
    }

    // Generate balanced risks
    generatedRisks.push({
      title: 'Timeline compression risk due to unforeseen dependency delays',
      mitigation: 'Establish daily 10-minute standup checks and buffer float days between phases.'
    });
    generatedRisks.push({
      title: 'Resource constraints or team workload saturation',
      mitigation: 'Distribute non-critical tasks across team members and defer low-priority backlog items.'
    });

    // Reminders
    generatedReminders.push({
      id: `rem-dyn-1`,
      title: `Phase 1 Kick-off & Alignment Check`,
      triggerTime: `Day 1 Checkpoint`,
      dueDate: formatDate(1),
      channel: 'Team Operations Channel',
      severity: 'Urgent',
      action: 'Confirm all prerequisites and assigned roles are clear before kickoff.'
    });
    generatedReminders.push({
      id: `rem-dyn-2`,
      title: `Mid-Point Milestone Evaluation`,
      triggerTime: `T-${Math.max(1, Math.floor(horizonDays / 2))} Days`,
      dueDate: formatDate(Math.floor(horizonDays / 2)),
      channel: 'Lead Coordinator Digest',
      severity: 'High',
      action: 'Audit completion pace and clear any blocker issues across open tasks.'
    });

    const wfId = 'wf-custom-' + Date.now();
    const cleanWords = text.replace(/^[^\w]+/, '').split(/\s+/).slice(0, 5).join(' ');
    const dynamicTitle = workflowTitle || ((cleanWords.charAt(0).toUpperCase() + cleanWords.slice(1)) + ' Operations Workflow');

    return {
      id: wfId,
      title: dynamicTitle,
      objective: `Execute operational directive: "${text.slice(0, 150)}${text.length > 150 ? '...' : ''}"`,
      summary: `Structured workflow generated from human instruction. Operational directives organized into ${generatedTasks.length} prioritized tasks, ${generatedPhases.length} sequential phases, and calendar milestones across a ${horizonDays}-day horizon.`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      deadline: formatDate(horizonDays),
      detailLevel,
      teamSize: teamSize || 'Standard Team',
      budget: budget || 'As Needed',
      projectId,
      isDemoMode: true,
      engineNotice: 'Demo Mode (Offline Heuristic Operations Engine)',
      assumptions: [
        'Team members have access to necessary tooling and permissions to execute tasks.',
        'Target deadline allows sequential completion without external regulatory delays.',
        'Critical path dependencies must be completed before downstream verification tasks commence.'
      ],
      milestones: generatedMilestones,
      workflowPhases: generatedPhases,
      tasks: generatedTasks,
      risks: generatedRisks,
      reminders: generatedReminders,
      summaryMetrics: {
        totalTasks: generatedTasks.length,
        totalEstimatedMinutes: generatedTasks.reduce((acc, t) => acc + (t.estimatedMins || 60), 0),
        totalPhases: generatedPhases.length,
        totalMilestones: generatedMilestones.length,
        totalRisks: generatedRisks.length
      }
    };
  }

  /**
   * Real LLM Provider Integration (Gemini / OpenAI API)
   */
  async generateWithRealLLM(rawInput, options, config) {
    const horizonDays = parseInt(options.horizonDays, 10) || 14;
    const detailLevel = options.detailLevel || 'standard';
    const targetTaskCount = detailLevel === 'quick' ? '6 to 8' : detailLevel === 'detailed' ? '16 to 22' : '10 to 14';

    const promptText = `
You are an expert Operations Planning Assistant. Convert the following operational instruction into a complete, structured, actionable workflow.

User Instruction: "${rawInput}"
Planning Constraints:
- Timeline Horizon: ${horizonDays} days
- Desired Detail Level: ${detailLevel} (${targetTaskCount} tasks)
- Project / Target Name: ${options.workflowName || 'Auto-generate descriptive title'}
- Team Information: ${options.teamSize || 'Infer logical roles if mentioned'}
- Budget Constraints: ${options.budget || 'Respect any budget limits mentioned'}

Return ONLY a valid JSON object strictly matching this schema with NO markdown code fences or conversational text:
{
  "title": "Concise, professional workflow title",
  "objective": "Clear statement of what this workflow accomplishes",
  "summary": "Brief executive planning summary",
  "assumptions": ["List of 3-4 realistic planning assumptions"],
  "milestones": [
    {
      "id": "ms-1",
      "title": "Milestone title",
      "description": "Expected outcome",
      "dueDate": "YYYY-MM-DD"
    }
  ],
  "workflowPhases": [
    {
      "step": 1,
      "phaseId": "phase-1",
      "name": "Phase 1: Phase Name",
      "description": "Scope of this phase",
      "prerequisite": "Prerequisite condition or 'None'",
      "deadline": "Target date string",
      "duration": "Estimated hours",
      "badge": "Badge label"
    }
  ],
  "tasks": [
    {
      "id": "task-1",
      "title": "Actionable task starting with a strong action verb",
      "description": "Detailed explanation of what needs to be done",
      "phase": "Must match a phase name above",
      "priority": "urgent" | "high" | "medium" | "low",
      "status": "todo",
      "dueDate": "YYYY-MM-DD",
      "estimatedMins": 60,
      "estimatedDuration": "1 hour",
      "dependencies": [],
      "suggestedRole": "Role title or null",
      "completionCriteria": "Specific verifiable evidence of completion",
      "subtasks": [
        { "id": "st-1", "title": "Checklist step 1", "completed": false }
      ]
    }
  ],
  "risks": [
    {
      "title": "Specific potential failure mode or operational risk",
      "mitigation": "Concrete action to mitigate"
    }
  ],
  "reminders": [
    {
      "id": "rem-1",
      "title": "Checkpoint reminder",
      "triggerTime": "T-X Days",
      "dueDate": "YYYY-MM-DD",
      "channel": "Coordination channel",
      "severity": "Urgent" | "High" | "Medium",
      "action": "Action to perform"
    }
  ]
}
`;

    let parsedData = null;

    if (config.provider === 'gemini') {
      const model = config.model || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API HTTP ${response.status}: ${errorBody.slice(0, 150)}`);
      }

      const resJson = await response.json();
      const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from Gemini API');
      parsedData = JSON.parse(rawText);

    } else if (config.provider === 'openai' || config.provider === 'custom') {
      const endpoint = config.customEndpoint || 'https://api.openai.com/v1/chat/completions';
      const model = config.model || 'gpt-4o-mini';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API HTTP ${response.status}: ${errorBody.slice(0, 150)}`);
      }

      const resJson = await response.json();
      const content = resJson?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from LLM API');
      parsedData = JSON.parse(content);
    }

    if (!parsedData || !Array.isArray(parsedData.tasks)) {
      throw new Error('LLM response did not contain a valid tasks array.');
    }

    // Enrich with IDs and metadata
    const now = new Date().toISOString();
    return {
      id: 'wf-llm-' + Date.now(),
      title: options.workflowName || parsedData.title || 'AI Generated Operations Workflow',
      objective: parsedData.objective || '',
      summary: parsedData.summary || '',
      status: 'draft',
      createdAt: now,
      deadline: options.deadline || (parsedData.tasks[parsedData.tasks.length - 1]?.dueDate) || null,
      detailLevel,
      teamSize: options.teamSize || null,
      budget: options.budget || null,
      projectId: options.projectId || 'proj-academic',
      isDemoMode: false,
      engineNotice: `Connected to Real AI (${config.provider.toUpperCase()} - ${config.model || 'Default'})`,
      assumptions: parsedData.assumptions || [],
      milestones: parsedData.milestones || [],
      workflowPhases: parsedData.workflowPhases || [],
      tasks: parsedData.tasks.map((t, idx) => ({
        ...t,
        id: t.id || `task-llm-${Date.now()}-${idx}`,
        status: 'todo',
        dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : []
      })),
      risks: parsedData.risks || [],
      reminders: parsedData.reminders || []
    };
  }

  /**
   * Interactive Workflow Refinement Engine
   * Applies user follow-up instructions directly to an existing draft while preserving prior customizations.
   */
  async refineWorkflow(currentWorkflow, instruction, options = {}) {
    if (!currentWorkflow || !instruction) return currentWorkflow;
    const lower = instruction.toLowerCase().trim();

    // Clone workflow deeply
    const updated = JSON.parse(JSON.stringify(currentWorkflow));
    if (!updated.refinementHistory) updated.refinementHistory = [];

    let changeNotes = '';

    // Refinement 1: Reduce/shorten timeline (e.g. "Reduce to 5 days", "Fit 5 days", "Compress schedule")
    const matchDays = lower.match(/(?:reduce|compress|fit|shorten|change|scale)\s*(?:the\s*plan\s*)?(?:to|in)?\s*(\d+)\s*days?/i);
    if (matchDays) {
      const newDays = parseInt(matchDays[1], 10);
      if (newDays >= 1) {
        const today = new Date();
        const oldTasks = updated.tasks || [];
        const taskCount = oldTasks.length || 1;

        oldTasks.forEach((task, idx) => {
          const scaledOffset = Math.max(1, Math.min(Math.round(((idx + 1) / taskCount) * newDays), newDays));
          const target = new Date(today);
          target.setDate(today.getDate() + scaledOffset);
          task.dueDate = target.toISOString().split('T')[0];
          task.displayDueDate = `${target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} (Day ${scaledOffset})`;
        });

        const targetFinal = new Date(today);
        targetFinal.setDate(today.getDate() + newDays);
        updated.deadline = targetFinal.toISOString().split('T')[0];

        // Update milestones
        if (Array.isArray(updated.milestones)) {
          updated.milestones.forEach((m, idx) => {
            const mOffset = Math.max(1, Math.round(((idx + 1) / updated.milestones.length) * newDays));
            const mTarget = new Date(today);
            mTarget.setDate(today.getDate() + mOffset);
            m.dueDate = mTarget.toISOString().split('T')[0];
          });
        }

        changeNotes = `Compressed timeline horizon to ${newDays} days and redistributed all task deadlines proportionally.`;
      }
    }

    // Refinement 2: Add Risk Management phase or tasks
    else if (lower.includes('risk') && (lower.includes('add') || lower.includes('phase') || lower.includes('management'))) {
      const riskPhaseName = 'Phase: Risk Management & Contingency Governance';
      const rId1 = 'task-refine-risk-1-' + Date.now();
      const rId2 = 'task-refine-risk-2-' + Date.now();

      const newRiskTasks = [
        {
          id: rId1,
          title: 'Conduct operational vulnerability audit & identify single points of failure',
          description: 'Assess power, network, budget, and personnel bottlenecks; establish emergency contact escalation roster.',
          phase: riskPhaseName,
          priority: 'urgent',
          status: 'todo',
          dueDate: updated.tasks[0]?.dueDate || new Date().toISOString().split('T')[0],
          displayDueDate: 'Early Stage Checkpoint',
          estimatedMins: 45,
          estimatedDuration: '45 mins',
          dependencies: [],
          suggestedRole: 'Risk & Quality Officer',
          completionCriteria: 'Escalation matrix and secondary failover protocols documented and published.',
          subtasks: [
            { id: 'st-rk-1', title: 'Audit venue backup power and redundant Wi-Fi switches', completed: false },
            { id: 'st-rk-2', title: 'Publish emergency hotline directory to all organizers', completed: false }
          ]
        },
        {
          id: rId2,
          title: 'Draft incident contingency runbook & attendee safety protocols',
          description: 'Define clear actions for medical first aid, equipment outage, and bad-faith participant conduct.',
          phase: riskPhaseName,
          priority: 'high',
          status: 'todo',
          dueDate: updated.tasks[Math.min(2, updated.tasks.length - 1)]?.dueDate || new Date().toISOString().split('T')[0],
          displayDueDate: 'Pre-Execution Verification',
          estimatedMins: 45,
          estimatedDuration: '45 mins',
          dependencies: [rId1],
          suggestedRole: 'Risk & Quality Officer',
          completionCriteria: 'Contingency runbook reviewed and approved by all core organizers.',
          subtasks: [
            { id: 'st-rk-3', title: 'Review campus security and first-aid station locations', completed: false }
          ]
        }
      ];

      updated.tasks.splice(2, 0, ...newRiskTasks);
      if (Array.isArray(updated.workflowPhases)) {
        updated.workflowPhases.splice(1, 0, {
          step: 2,
          phaseId: 'phase-risk-mgmt',
          name: riskPhaseName,
          description: 'Proactive mitigation of operational risks and governance of contingency reserves.',
          prerequisite: 'Initial Scoping Complete',
          deadline: 'Day 3',
          duration: '1.5 hours',
          badge: 'Risk Mitigation'
        });
      }

      changeNotes = 'Added dedicated Risk Management Phase with 2 proactive vulnerability audit & contingency tasks.';
    }

    // Refinement 3: Elevate priorities (e.g. "Give marketing higher priority" or "Make tech urgent")
    else if (lower.includes('priority') || lower.includes('urgent') || lower.includes('high')) {
      let targetKeyword = 'marketing';
      if (lower.includes('venue')) targetKeyword = 'venue';
      else if (lower.includes('tech') || lower.includes('equipment')) targetKeyword = 'equipment';
      else if (lower.includes('sponsor')) targetKeyword = 'sponsor';
      else if (lower.includes('mentor')) targetKeyword = 'mentor';
      else if (lower.includes('market') || lower.includes('publicity')) targetKeyword = 'market';

      let promotedCount = 0;
      updated.tasks.forEach(task => {
        if (task.title.toLowerCase().includes(targetKeyword) || (task.phase && task.phase.toLowerCase().includes(targetKeyword))) {
          task.priority = 'urgent';
          promotedCount++;
        }
      });

      changeNotes = `Elevated priority to "Urgent" on ${promotedCount} tasks related to "${targetKeyword}".`;
    }

    // Refinement 4: Split complex task into smaller tasks
    else if (lower.includes('split') || lower.includes('smaller')) {
      let targetIdx = updated.tasks.findIndex(t => t.title.toLowerCase().includes('venue') || t.title.toLowerCase().includes('reserve'));
      if (targetIdx === -1) targetIdx = 0;

      const parentTask = updated.tasks[targetIdx];
      const s1Id = 'task-split-1-' + Date.now();
      const s2Id = 'task-split-2-' + Date.now();

      const splitTaskA = {
        ...parentTask,
        id: s1Id,
        title: `[Part 1] Facility Inspection, Capacity Audit & Admin Permit (${parentTask.title.slice(0, 30)}...)`,
        estimatedMins: Math.round(parentTask.estimatedMins / 2),
        estimatedDuration: '45 mins',
      };

      const splitTaskB = {
        ...parentTask,
        id: s2Id,
        title: `[Part 2] AV Equipment Test, Key Access & Custodial Setup (${parentTask.title.slice(0, 30)}...)`,
        estimatedMins: Math.round(parentTask.estimatedMins / 2),
        estimatedDuration: '45 mins',
        dependencies: [s1Id]
      };

      updated.tasks.splice(targetIdx, 1, splitTaskA, splitTaskB);
      changeNotes = `Decomposed "${parentTask.title.slice(0, 45)}..." into 2 modular sub-tasks with sequential dependency.`;
    }

    // Refinement 5: Reassign tasks across organizers
    else if (lower.includes('reassign') || lower.includes('organizer') || lower.includes('role')) {
      const roles = [
        'Organizer 1 (Lead Operations)',
        'Organizer 2 (Logistics & AV)',
        'Organizer 3 (Sponsorships & Mentors)',
        'Organizer 4 (Marketing & Registration)'
      ];

      updated.tasks.forEach((t, idx) => {
        t.suggestedRole = roles[idx % roles.length];
      });

      changeNotes = 'Evenly redistributed task ownership across 4 designated organizer roles.';
    }

    // Generic Custom Instruction Fallback
    else {
      const newTaskId = 'task-refine-custom-' + Date.now();
      const newTask = {
        id: newTaskId,
        title: instruction.slice(0, 70),
        description: `Operational task added via refinement instruction: "${instruction}".`,
        phase: updated.tasks[0]?.phase || 'Phase 1: Planning',
        priority: 'high',
        status: 'todo',
        dueDate: updated.tasks[0]?.dueDate || new Date().toISOString().split('T')[0],
        displayDueDate: 'Target Scheduled',
        estimatedMins: 60,
        estimatedDuration: '1 hour',
        dependencies: [],
        suggestedRole: 'Lead Coordinator',
        completionCriteria: `Verification sign-off on: ${instruction.slice(0, 50)}`,
        subtasks: [
          { id: 'st-c-1', title: `Scope and complete directive: ${instruction.slice(0, 40)}`, completed: false }
        ]
      };

      updated.tasks.push(newTask);
      changeNotes = `Added custom operational task: "${instruction.slice(0, 50)}...".`;
    }

    updated.refinementHistory.push({
      timestamp: new Date().toISOString(),
      instruction,
      summary: changeNotes
    });

    updated.tasks = this.resolveAndCleanDependencies(updated.tasks);
    return { workflow: updated, changesSummary: changeNotes };
  }

  /**
   * Validates and normalizes workflow schema
   */
  validateWorkflowSchema(workflow) {
    if (!workflow || typeof workflow !== 'object') {
      throw new Error('Invalid workflow object generated.');
    }

    workflow.title = workflow.title || 'Operational Workflow';
    workflow.objective = workflow.objective || workflow.title;
    workflow.summary = workflow.summary || 'Operational plan';
    workflow.status = workflow.status || 'draft';
    workflow.assumptions = Array.isArray(workflow.assumptions) ? workflow.assumptions : [];
    workflow.milestones = Array.isArray(workflow.milestones) ? workflow.milestones : [];
    workflow.tasks = Array.isArray(workflow.tasks) ? workflow.tasks : [];
    workflow.risks = Array.isArray(workflow.risks) ? workflow.risks : [];
    workflow.reminders = Array.isArray(workflow.reminders) ? workflow.reminders : [];
    workflow.workflowPhases = Array.isArray(workflow.workflowPhases) ? workflow.workflowPhases : [];

    const validPriorities = ['urgent', 'high', 'medium', 'low'];
    workflow.tasks.forEach((t, idx) => {
      if (!t.id) t.id = `task-norm-${Date.now()}-${idx}`;
      if (!t.title) t.title = `Task ${idx + 1}`;
      t.priority = validPriorities.includes((t.priority || '').toLowerCase()) ? t.priority.toLowerCase() : 'medium';
      t.status = t.status || 'todo';
      t.estimatedMins = parseInt(t.estimatedMins, 10) || 45;
      t.dependencies = Array.isArray(t.dependencies) ? t.dependencies : [];
      t.subtasks = Array.isArray(t.subtasks) ? t.subtasks : [];
    });

    return workflow;
  }

  /**
   * Graph Cycle Detection & Cleanup
   * Guarantees that task dependencies form a strictly Directed Acyclic Graph (DAG).
   */
  resolveAndCleanDependencies(tasks) {
    if (!Array.isArray(tasks)) return [];
    const taskIds = new Set(tasks.map(t => t.id));

    // First filter out references to non-existent task IDs and self-dependencies
    tasks.forEach(t => {
      t.dependencies = (t.dependencies || []).filter(depId => depId && depId !== t.id && taskIds.has(depId));
    });

    // Detect cycles using DFS
    const graph = new Map();
    tasks.forEach(t => graph.set(t.id, [...t.dependencies]));

    const hasPath = (start, target, visited = new Set()) => {
      if (start === target) return true;
      visited.add(start);
      const neighbors = graph.get(start) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          if (hasPath(n, target, visited)) return true;
        }
      }
      return false;
    };

    tasks.forEach(t => {
      const validDeps = [];
      for (const depId of t.dependencies) {
        // If depId can already reach t.id, adding depId -> t would form a cycle
        if (!hasPath(depId, t.id)) {
          validDeps.push(depId);
        } else {
          console.warn(`Prevented circular dependency: Task ${t.id} cannot depend on ${depId}`);
        }
      }
      t.dependencies = validDeps;
      graph.set(t.id, [...validDeps]);
    });

    return tasks;
  }

  /**
   * Test AI Connection credentials
   */
  async testAIConnection(apiKey, provider = 'gemini', model = 'gemini-1.5-flash') {
    if (!apiKey) throw new Error('API Key is required.');
    
    if (provider === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with JSON {"status": "ok"}' }] }]
        })
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini Error ${response.status}: ${err.slice(0, 100)}`);
      }
      return { success: true, provider: 'gemini' };
    } else if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!response.ok) {
        throw new Error(`OpenAI Error ${response.status}`);
      }
      return { success: true, provider: 'openai' };
    }
    return { success: true, provider: 'demo' };
  }

  /**
   * Natural Language Parsing for Quick Add
   * E.g.: "Submit chemistry assignment by Friday priority urgent"
   */
  parseNaturalLanguage(text) {
    let cleanText = text.trim();
    let priority = 'medium';
    let dueDate = new Date().toISOString().split('T')[0];
    let quadrant = 'q2';

    // Priority extraction
    if (/\b(urgent|critical|asap|emergency)\b/i.test(cleanText)) {
      priority = 'urgent';
      quadrant = 'q1';
      cleanText = cleanText.replace(/\b(urgent|critical|asap|emergency|priority\s*urgent)\b/gi, '');
    } else if (/\b(high|important)\b/i.test(cleanText)) {
      priority = 'high';
      quadrant = 'q2';
      cleanText = cleanText.replace(/\b(high|important|priority\s*high)\b/gi, '');
    } else if (/\b(low|trivial)\b/i.test(cleanText)) {
      priority = 'low';
      quadrant = 'q4';
      cleanText = cleanText.replace(/\b(low|trivial|priority\s*low)\b/gi, '');
    }

    // Due date extraction
    const today = new Date();
    if (/\btomorrow\b/i.test(cleanText)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
      cleanText = cleanText.replace(/\btomorrow\b/gi, '');
    } else if (/\bnext week\b/i.test(cleanText)) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      dueDate = nextWeek.toISOString().split('T')[0];
      cleanText = cleanText.replace(/\bnext week\b/gi, '');
    } else if (/\bin (\d+) days?\b/i.test(cleanText)) {
      const match = cleanText.match(/\bin (\d+) days?\b/i);
      if (match) {
        const days = parseInt(match[1], 10);
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + days);
        dueDate = futureDate.toISOString().split('T')[0];
        cleanText = cleanText.replace(match[0], '');
      }
    }

    // Clean up residual words
    cleanText = cleanText
      .replace(/\b(by|at|due|on|priority)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      cleanText = 'New Task';
    }

    return {
      title: cleanText,
      priority,
      quadrant,
      dueDate,
      estimatedMins: priority === 'urgent' ? 60 : 30,
    };
  }

  /**
   * Generates dynamic AI Daily Briefing & Standup Insights
   */
  generateDailyBriefing(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done');
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done');
    const inProgress = tasks.filter(t => t.status === 'in-progress');

    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    
    let priorityRecommendation = 'All critical deadlines are currently handled. Great job!';
    if (urgentTasks.length > 0) {
      priorityRecommendation = `Top Priority Focus: "${urgentTasks[0].title}". Dedicate your first 90-minute block to this.`;
    } else if (inProgress.length > 0) {
      priorityRecommendation = `Continue momentum on: "${inProgress[0].title}". You are close to finishing it!`;
    }

    let coachingTip = 'Tip: Pair high-focus tasks with 25-minute Pomodoro sessions and zero notification interruptions.';
    if (completionRate > 75) {
      coachingTip = 'Phenomenal productivity velocity today! Consider scheduling a brief rest to avoid cognitive overload.';
    } else if (urgentTasks.length > 2) {
      coachingTip = 'Warning: Multiple urgent deadlines detected. Triage Q1 immediately and defer non-essential Q3/Q4 tasks.';
    }

    return {
      completionRate,
      urgentCount: urgentTasks.length,
      inProgressCount: inProgress.length,
      priorityRecommendation,
      coachingTip,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

// Global instance
window.aiCopilot = new AICopilotEngine();
