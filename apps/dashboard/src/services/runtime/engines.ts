import { Assignment, Decision, HiveEvent, AgentLog } from "../../types";
import { eventBus } from "./eventBus";
import { logger } from "../logging/logger";

class HiveSimulationEngine {
  private tickInterval: NodeJS.Timeout | null = null;
  private assignments: Assignment[] = [];
  private decisions: Decision[] = [];
  private liveLogs: string[] = [];
  private onlineAgentCount = 24875;
  private latency = 24;
  private activeThreads = 142;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Generate initial assignments
    this.assignments = [
      { id: "A1", agentId: "AGENT_DEB_01", taskTitle: "Audit codebase for over-engineering", status: "RUNNING", priority: "CRITICAL", progress: 42, startedAt: new Date().toISOString() },
      { id: "A2", agentId: "AGENT_OPT_05", taskTitle: "Optimize WebGL shader pipeline", status: "RUNNING", priority: "HIGH", progress: 65, startedAt: new Date().toISOString() },
      { id: "A3", agentId: "AGENT_MEM_12", taskTitle: "Consolidate episodic memory vectors", status: "PENDING", priority: "MEDIUM", progress: 0, startedAt: new Date().toISOString() },
      { id: "A4", agentId: "AGENT_SEC_02", taskTitle: "Monitor Supabase session redirects", status: "COMPLETED", priority: "HIGH", progress: 100, startedAt: new Date().toISOString(), completedAt: new Date().toISOString() },
    ];

    // Generate initial decisions
    this.decisions = [
      { id: "D1", title: "Scale Hive capacity to OMEGA-10", description: "Deploy 5,000 additional autonomous containers to handle concurrent indexing tasks.", status: "DEBATING", consensusPercentage: 84.5, yesVotes: 420, noVotes: 77, createdAt: new Date().toISOString() },
      { id: "D2", title: "De-prioritize flat layout renderers", description: "Switch UI grids globally to glassmorphic holographic design configurations.", status: "RESOLVED", consensusPercentage: 99.2, yesVotes: 512, noVotes: 4, createdAt: new Date().toISOString() },
    ];

    // Generate initial terminal logs
    const now = new Date();
    this.liveLogs = [
      `[${now.toLocaleTimeString()}] VECNA_OS // KERNEL INITIALIZED`,
      `[${now.toLocaleTimeString()}] NET_IF // SECURE PORT CONNECTION: SHIELD ACTIVE`,
      `[${now.toLocaleTimeString()}] CORE // NEURAL MATRIX SYNAPSES ARCS COMPUTED`,
      `[${now.toLocaleTimeString()}] AGENTS // REGISTERED 24,875 SHARDS SUCCESSFULLY`,
    ];
  }

  start() {
    if (this.tickInterval) return;

    logger.info("RUNTIME", "INITIALIZE", "Hive Mind OS Simulation Engine online");
    
    // Run simulation loop tick every 3 seconds
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 3000);
  }

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
      logger.info("RUNTIME", "TERMINATE", "Hive Mind OS Simulation Engine offline");
    }
  }

  private tick() {
    // 1. Core metric fluctuations
    this.onlineAgentCount += Math.floor(Math.random() * 5) - 2;
    this.latency = Math.max(12, Math.min(95, this.latency + Math.floor(Math.random() * 7) - 3));
    this.activeThreads = Math.max(120, Math.min(180, this.activeThreads + Math.floor(Math.random() * 5) - 2));

    // 2. Process tasks and progress rates
    this.assignments = this.assignments.map(task => {
      if (task.status === "RUNNING") {
        const nextProgress = Math.min(100, task.progress + Math.floor(Math.random() * 15) + 5);
        const status = nextProgress === 100 ? "COMPLETED" : "RUNNING";
        return {
          ...task,
          progress: nextProgress,
          status,
          completedAt: status === "COMPLETED" ? new Date().toISOString() : undefined
        };
      } else if (task.status === "PENDING" && Math.random() < 0.35) {
        return { ...task, status: "RUNNING", progress: 10 };
      }
      return task;
    });

    // Recycle and introduce new active tasks
    const activeTasks = this.assignments.filter(t => t.status === "RUNNING");
    if (activeTasks.length < 3) {
      const id = "A" + (this.assignments.length + 1);
      const mockTitles = [
        "Consolidate vector memory shards",
        "Balancing WebGL custom shaders vertex arrays",
        "Re-indexing local SQLite context storage",
        "Evaluating consensus status of Proposed overrides",
        "Resolving authorization token callbacks from Supabase"
      ];
      const newTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
      
      this.assignments.push({
        id,
        agentId: `AGENT_NODE_${Math.floor(Math.random() * 32)}`,
        taskTitle: newTitle,
        status: "RUNNING",
        priority: Math.random() < 0.3 ? "CRITICAL" : "HIGH",
        progress: 10,
        startedAt: new Date().toISOString()
      });
    }

    // 3. Generate structured simulated process terminal logs
    const mockLogStatements = [
      "SYNAPSE // Re-routing filaments to optimal nodes",
      "MEMORY // Flushing local index buffers to episodic vector storage",
      "COMPUTE // Recalculating particle positions inside WebGL buffer",
      "DECISION // Consensus update on node deployment overrides",
      "CORE // Heartbeat status ping: 98.7% health verified",
      "SECURITY // Authenticating session parameters on route guard"
    ];
    const logStatement = mockLogStatements[Math.floor(Math.random() * mockLogStatements.length)];
    const logEntry = `[${new Date().toLocaleTimeString()}] ${logStatement}`;
    
    this.liveLogs.push(logEntry);
    if (this.liveLogs.length > 50) this.liveLogs.shift();

    // 4. Update proposed decisions and simulate voting
    this.decisions = this.decisions.map(dec => {
      if (dec.status === "DEBATING") {
        const addedYes = Math.floor(Math.random() * 10);
        const addedNo = Math.floor(Math.random() * 3);
        const total = dec.yesVotes + dec.noVotes + addedYes + addedNo;
        const consensus = total > 0 
          ? parseFloat(((dec.yesVotes + addedYes) / total * 100).toFixed(1)) 
          : dec.consensusPercentage;
        
        return {
          ...dec,
          yesVotes: dec.yesVotes + addedYes,
          noVotes: dec.noVotes + addedNo,
          consensusPercentage: consensus,
          status: consensus > 92 && total > 580 ? "RESOLVED" as const : "DEBATING" as const
        };
      }
      return dec;
    });

    // 5. Emit event to eventBus to propagate state changes
    eventBus.emit("HIVE_TICK", {
      onlineAgentCount: this.onlineAgentCount,
      latency: this.latency,
      activeThreads: this.activeThreads,
      assignments: this.assignments,
      decisions: this.decisions,
      liveLogs: this.liveLogs
    });
  }

  getMetrics() {
    return {
      onlineAgentCount: this.onlineAgentCount,
      latency: this.latency,
      activeThreads: this.activeThreads,
      assignments: this.assignments,
      decisions: this.decisions,
      liveLogs: this.liveLogs
    };
  }
}

export const hiveSimulation = new HiveSimulationEngine();
export default hiveSimulation;
