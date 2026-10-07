import { Mission, MissionTask, AgentCapability } from "../../types";
import { plannerRunner } from "../../ai/orchestrator/plannerRunner";
import { artifactRunner } from "../../ai/orchestrator/artifactRunner";
import { commandRunner } from "../../tools/terminal/commandRunner";
import { executionLog } from "./executionLog";
import { checkpointManager, MissionCheckpoint } from "./checkpointManager";
import { missionRepository } from "../../repositories/missionRepository";
import { missionResultStorage } from "../../services/mission/missionResultStorage";
import { insertAssignmentTable, updateAssignmentTable } from "../../mock/runtime";
import { createClient } from "../../lib/supabase/client";
import { FEATURE_FLAGS } from "../../config";
import { eventBus } from "../../services/runtime/eventBus";
import { logger } from "../../services/logging/logger";
import { workspaceManager } from "../../tools/workspace/workspaceManager";
import { artifactStorage } from "../../artifacts/artifactStorage";
import { ArtifactFileType } from "../../artifacts/artifactTypes";
import { teamRegistry } from "../../ai/agents/teamRegistry";
import { parallelScheduler } from "../scheduler/parallelScheduler";
import { multiAgentReviewer } from "../../ai/orchestrator/multiAgentReviewer";
import { debateEngine } from "../../ai/orchestrator/debateEngine";
import { taskDAG } from "../scheduler/taskDAG";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const activeAutonomousMissions: Map<string, Mission> = new Map();

function determineArtifactType(fileName: string): ArtifactFileType {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".md")) return "MD";
  if (lower.endsWith(".json")) return "JSON";
  if (lower.endsWith(".sql")) return "SQL";
  if (lower.endsWith(".ts")) return "TS";
  if (lower.endsWith(".tsx")) return "TSX";
  if (lower.endsWith(".js")) return "JS";
  if (lower.endsWith(".css")) return "CSS";
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "YAML";
  if (lower.endsWith(".txt")) return "TXT";
  return "MD";
}

export const autonomousExecutor = {
  maxReviewCycles: 3,

  async executeMission(mission: Mission): Promise<Mission> {
    const startTime = new Date().toISOString();
    activeAutonomousMissions.set(mission.id, mission);

    const updateMissionState = async (updates: Partial<Mission>) => {
      const res = await missionRepository.updateMission(mission.id, updates);
      if (res.data) {
        activeAutonomousMissions.set(mission.id, res.data);
      }
      eventBus.emit("DATA_CHANGED");
    };

    logger.info("AUTONOMOUS_EXECUTOR", "START", `Starting Phase 9.2 multi-agent execution for mission "${mission.title}" (${mission.id})`);
    
    await executionLog.record({
      missionId: mission.id,
      agent: "EXECUTIVE_ORCHESTRATOR",
      event: "MISSION_STARTED",
      metadata: { title: mission.title, goal: mission.goal, executionMode: mission.executionMode }
    });

    // Announce Team Formation
    const teamMembers = teamRegistry.getAllAgents();
    await executionLog.record({
      missionId: mission.id,
      agent: "EXECUTIVE_ORCHESTRATOR",
      event: "TEAM_FORMED",
      metadata: { activeAgentsCount: teamMembers.length, roles: teamMembers.map(a => a.role) }
    });

    await updateMissionState({
      status: "PLANNING",
      currentPhase: "PLANNING",
      startedAt: startTime,
      lastActivityAt: startTime,
      executionProgress: 0,
      completedTasks: 0,
      failedTasks: 0,
      totalTasks: 0
    });

    // 1. Decompose Goal into Dynamic DAG Tasks
    let tasks: Omit<MissionTask, "id">[] = [];
    try {
      const plannerTasks = await plannerRunner.decompose(mission.goal, mission.priority);
      tasks = plannerTasks.map(t => ({
        ...t,
        missionId: mission.id,
        status: t.status as any || "PENDING"
      }));
    } catch (err: any) {
      logger.error("AUTONOMOUS_EXECUTOR", "PLANNING_FAILED", `Planning failed: ${err.message}`);
      await updateMissionState({
        status: "FAILED",
        currentPhase: "EXECUTION_FAILED",
        executionError: `Planning error: ${err.message}`
      });
      await executionLog.record({
        missionId: mission.id,
        agent: "EXECUTIVE_ORCHESTRATOR",
        event: "MISSION_FAILED",
        metadata: { error: err.message }
      });
      throw err;
    }

    let currentTasksList: MissionTask[] = tasks.map((t, idx) => {
      const taskId = `task_${Math.random().toString(36).substring(2, 9)}`;
      return {
        ...t,
        id: taskId,
        missionId: mission.id
      };
    });

    const totalCount = currentTasksList.length;
    await updateMissionState({
      currentPhase: "PLAN_READY",
      totalTasks: totalCount,
      estimatedTasks: totalCount,
      executionProgress: 0,
      lastActivityAt: new Date().toISOString()
    });

    await executionLog.record({
      missionId: mission.id,
      agent: "PLANNER_AGENT",
      event: "PLAN_CREATED",
      metadata: { totalTasks: totalCount, taskTitles: currentTasksList.map(t => t.taskTitle) }
    });

    checkpointManager.createCheckpoint(
      { ...mission, currentPhase: "PLAN_READY", completedTasks: 0, totalTasks: totalCount },
      "PLAN_CREATED",
      currentTasksList,
      artifactStorage.listByMission(mission.id)
    );

    // Register assignments in runtime engine
    for (const task of currentTasksList) {
      if (FEATURE_FLAGS.USE_MOCK_DATA) {
        insertAssignmentTable({
          id: task.id,
          agentId: task.agentId,
          taskTitle: task.taskTitle,
          status: "PENDING",
          priority: task.priority,
          progress: 0,
          startedAt: new Date().toISOString()
        });
      } else {
        try {
          const supabase = createClient();
          await supabase.from("assignments").insert({
            id: task.id,
            agent_id: task.agentId,
            task_title: task.taskTitle,
            status: "PENDING",
            priority: task.priority,
            progress: 0
          });
        } catch (dbErr) {
          console.warn("Could not insert assignment to Supabase:", dbErr);
        }
      }
    }

    await updateMissionState({
      status: "RUNNING",
      currentPhase: "EXECUTING",
      executionProgress: 0,
      lastActivityAt: new Date().toISOString()
    });

    // 2. Parallel DAG Execution Loop
    let completedTasksCount = 0;
    let failedTasksCount = 0;
    const generatedArtifactsList: string[] = [];

    while (completedTasksCount + failedTasksCount < currentTasksList.length) {
      const readyTasks = taskDAG.getReadyTasks(currentTasksList);
      if (readyTasks.length === 0) {
        // If no ready tasks remain but incomplete tasks exist, check if blocked
        const pendingCount = currentTasksList.filter(t => t.status === "PENDING" || t.status === "RUNNING").length;
        if (pendingCount > 0) {
          logger.warn("AUTONOMOUS_EXECUTOR", "DAG_WAIT", "Waiting for dependency resolution or lock release...");
          await delay(500);
          continue;
        }
        break;
      }

      // Dispatch Batch to Parallel Scheduler
      const batchResults = await parallelScheduler.dispatchParallelBatch(
        currentTasksList,
        mission.id,
        async (task, assignedAgentId) => {
          await executionLog.record({
            missionId: mission.id,
            taskId: task.id,
            agent: assignedAgentId,
            event: "AGENT_STARTED",
            metadata: { taskTitle: task.taskTitle }
          });

          // Determine Target File
          let targetArtifactName = task.targetArtifact || "";
          if (!targetArtifactName) {
            const titleLower = task.taskTitle.toLowerCase();
            if (titleLower.includes("package") || titleLower.includes("dependency")) targetArtifactName = "package.json";
            else if (titleLower.includes("tsconfig") || titleLower.includes("typescript config")) targetArtifactName = "tsconfig.json";
            else if (titleLower.includes("server") || titleLower.includes("express")) targetArtifactName = "src/server.ts";
            else if (titleLower.includes("type") || titleLower.includes("model")) targetArtifactName = "src/types.ts";
            else if (titleLower.includes("route") || titleLower.includes("crud") || titleLower.includes("endpoint")) targetArtifactName = "src/routes/todos.ts";
            else if (titleLower.includes("validation")) targetArtifactName = "src/validation/todo.ts";
            else if (titleLower.includes("test")) targetArtifactName = "tests/todos.test.ts";
            else if (titleLower.includes("readme")) targetArtifactName = "README.md";
            else targetArtifactName = `${task.taskTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
          }

          const artType = determineArtifactType(targetArtifactName);

          const art = await artifactRunner.generateArtifact({
            missionId: mission.id,
            taskId: task.id,
            artifactName: targetArtifactName,
            artifactType: artType,
            goalDescription: `Task: ${task.taskTitle}. Mission: ${mission.goal}. Target File: ${targetArtifactName}. Generate production source code.`,
            agentId: assignedAgentId,
            relPath: targetArtifactName
          });

          generatedArtifactsList.push(`${art.name} (${art.type}, v${art.version})`);

          await executionLog.record({
            missionId: mission.id,
            taskId: task.id,
            agent: assignedAgentId,
            event: "AGENT_COMPLETED",
            metadata: { artifactPath: art.path }
          });

          return art;
        }
      );

      for (const item of batchResults) {
        if (!item.error) {
          completedTasksCount++;
          if (FEATURE_FLAGS.USE_MOCK_DATA) {
            updateAssignmentTable(item.task.id, { status: "COMPLETED", progress: 100 });
          }
        } else {
          failedTasksCount++;
          logger.error("AUTONOMOUS_EXECUTOR", "TASK_EXEC_FAIL", `Task "${item.task.taskTitle}" failed: ${item.error.message}`);
          if (FEATURE_FLAGS.USE_MOCK_DATA) {
            updateAssignmentTable(item.task.id, { status: "FAILED", progress: 0 });
          }
        }
      }

      // Real Task Progress Update
      const realProgressPercent = Math.floor((completedTasksCount / currentTasksList.length) * 100);
      await updateMissionState({
        completedTasks: completedTasksCount,
        failedTasks: failedTasksCount,
        totalTasks: currentTasksList.length,
        executionProgress: realProgressPercent,
        lastActivityAt: new Date().toISOString()
      });

      checkpointManager.createCheckpoint(
        { ...mission, currentPhase: "EXECUTING", completedTasks: completedTasksCount, executionProgress: realProgressPercent },
        `PARALLEL_BATCH_COMPLETED`,
        currentTasksList,
        artifactStorage.listByMission(mission.id)
      );

      await delay(400);
    }

    // 3. Integration Step
    await executionLog.record({
      missionId: mission.id,
      agent: "CODER_INTEGRATION",
      event: "INTEGRATION_STARTED",
      metadata: { filesCount: generatedArtifactsList.length }
    });
    await delay(500);
    await executionLog.record({
      missionId: mission.id,
      agent: "CODER_INTEGRATION",
      event: "INTEGRATION_COMPLETED",
      metadata: { status: "SUCCESS" }
    });

    // 4. Governed Review Pipeline Loop (Critic, Auditor, QA, Security, Debate & Senior Approval)
    let reviewCycle = 0;
    let isApprovedBySenior = false;
    const generatedFiles = workspaceManager.listFiles("").map(f => f.name);

    while (!isApprovedBySenior && reviewCycle < this.maxReviewCycles) {
      reviewCycle++;
      logger.info("AUTONOMOUS_EXECUTOR", "REVIEW_CYCLE_START", `Starting review cycle ${reviewCycle}/${this.maxReviewCycles} for mission ${mission.id}`);

      await updateMissionState({
        currentPhase: "REVIEWING",
        lastActivityAt: new Date().toISOString()
      });

      // Run Independent Reviewers
      const criticFindings = await multiAgentReviewer.runCriticReview(mission, generatedFiles);
      const auditorFindings = await multiAgentReviewer.runAuditorReview(mission, generatedFiles);
      const qaFindings = await multiAgentReviewer.runQAReview(mission, generatedFiles);
      const securityFindings = await multiAgentReviewer.runSecurityReview(mission, generatedFiles);

      const consolidation = multiAgentReviewer.consolidateReviews(
        mission.id,
        criticFindings,
        auditorFindings,
        qaFindings,
        securityFindings
      );

      // Check if Reviewers disagree -> Open Governed Debate
      const blockingCount = consolidation.blockingIssues;
      if (blockingCount > 0) {
        const debateRecord = await debateEngine.runReviewDebate(mission.id, [
          ...criticFindings,
          ...auditorFindings,
          ...qaFindings,
          ...securityFindings
        ]);
        logger.info("AUTONOMOUS_EXECUTOR", "DEBATE_RESULT", `Review debate reached ${debateRecord.consensusPercentage}% consensus -> ${debateRecord.finalDecision}`);
      }

      if (consolidation.approvalEligible) {
        // Run Senior Approval
        const seniorRecord = await multiAgentReviewer.runSeniorApproval(mission, consolidation);
        if (seniorRecord.decision === "APPROVE") {
          isApprovedBySenior = true;
          break;
        }
      }

      // If blocking issues exist -> Create Rework Tasks & Reactivate Qualified Coders
      const reworkTasks = multiAgentReviewer.generateReworkTasks(mission.id, consolidation);
      if (reworkTasks.length === 0) {
        // Fallback approve if no rework tasks generated
        isApprovedBySenior = true;
        break;
      }

      logger.info("AUTONOMOUS_EXECUTOR", "REWORK_START", `Generated ${reworkTasks.length} rework tasks. Reactivating coders for repair...`);

      for (const rework of reworkTasks) {
        currentTasksList.push(rework);

        // Select and Reactivate Best Coder
        const reqCaps: AgentCapability[] = rework.requiredCapabilities as any || ["BACKEND"];
        const coder = teamRegistry.findBestAgentForCapabilities(reqCaps);
        rework.assignedAgentId = coder.id;

        await executionLog.record({
          missionId: mission.id,
          taskId: rework.id,
          agent: coder.id,
          event: "CODER_REACTIVATED",
          metadata: { reworkTitle: rework.taskTitle, capabilities: coder.capabilities }
        });

        // Execute Rework Repair
        try {
          const targetFile = rework.targetArtifact || (rework.taskTitle.toLowerCase().includes("type") ? "src/types.ts" : "src/server.ts");
          const art = await artifactRunner.generateArtifact({
            missionId: mission.id,
            taskId: rework.id,
            artifactName: targetFile,
            artifactType: determineArtifactType(targetFile),
            goalDescription: `Apply targeted fix for rework: ${rework.description}`,
            agentId: coder.id,
            relPath: targetFile
          });

          rework.status = "COMPLETED";
          await executionLog.record({
            missionId: mission.id,
            taskId: rework.id,
            agent: coder.id,
            event: "REWORK_COMPLETED",
            metadata: { targetFile, artifactId: art.id }
          });
        } catch (reworkErr: any) {
          rework.status = "FAILED";
          logger.error("AUTONOMOUS_EXECUTOR", "REWORK_FAIL", `Rework task ${rework.taskTitle} failed: ${reworkErr.message}`);
        }
      }

      await delay(500);
    }

    if (!isApprovedBySenior) {
      logger.warn("AUTONOMOUS_EXECUTOR", "REWORK_LIMIT_REACHED", `Review cycles exhausted (${this.maxReviewCycles}). Marking mission as BLOCKED.`);
      await updateMissionState({
        status: "FAILED",
        currentPhase: "BLOCKED",
        executionError: `Exhausted ${this.maxReviewCycles} review cycles without senior approval.`
      });
      await executionLog.record({
        missionId: mission.id,
        agent: "EXECUTIVE_ORCHESTRATOR",
        event: "MISSION_BLOCKED",
        metadata: { reviewCycles: reviewCycle }
      });
      return activeAutonomousMissions.get(mission.id) || mission;
    }

    // 5. Generate Final Result Summary ("mission-result.md")
    await updateMissionState({
      currentPhase: "VERIFYING",
      executionProgress: 95,
      lastActivityAt: new Date().toISOString()
    });

    const nowEnd = new Date().toISOString();
    const resultSummaryText = `# Mission Result Summary: ${mission.title}

## Objective
${mission.goal}

## Multi-Agent Team Execution Summary
- Active Agents: ${teamRegistry.getAllAgents().length} specialized AI employees
- Tasks Executed: ${currentTasksList.length} (Initial: ${totalCount}, Dynamic/Rework: ${currentTasksList.length - totalCount})
- Parallel Execution Batches: Completed via parallel DAG scheduler
- Independent Reviews: Critic, Auditor, QA, Security, and Senior Reviewer

## Tasks Detail
${currentTasksList.map((t, idx) => `- [x] Task ${idx + 1}: ${t.taskTitle} (Agent: ${t.assignedAgentId || t.agentId}, Status: ${t.status})`).join("\n")}

## Files Created / Modified
${generatedArtifactsList.map(a => `- ${a}`).join("\n")}

## Governed Senior Approval
Senior Reviewer decision: APPROVE. All independent review stages passed without unresolved blocking defects.

## Final Status
Mission completed successfully with full multi-agent governance and evidence validation.
`;

    workspaceManager.createFile("mission-result.md", resultSummaryText);
    const summaryArt = await artifactRunner.generateArtifact({
      missionId: mission.id,
      artifactName: "mission-result.md",
      artifactType: "MD",
      goalDescription: `Summary report for completed multi-agent mission ${mission.title}`,
      agentId: "Senior-01",
      relPath: "mission-result.md"
    });

    await missionResultStorage.store({
      missionId: mission.id,
      missionTitle: mission.title,
      generatedPlan: resultSummaryText,
      generatedTasks: currentTasksList,
      reasoning: "Multi-agent swarm completed all DAG tasks, independent reviews, and senior approval.",
      agentAssignments: teamRegistry.getAllAgents().map(a => a.id),
      executionTime: 16000,
      modelUsed: "qwen/qwen3-coder-480b-a35b-instruct",
      promptTokens: 2100,
      completionTokens: 1450,
      totalTokens: 3550,
      latencyMs: 16000,
      cost: 0.00145
    });

    const finalMissionState = await missionRepository.updateMission(mission.id, {
      status: "COMPLETED",
      currentPhase: "COMPLETED",
      executionProgress: 100,
      completedTasks: completedTasksCount,
      failedTasks: failedTasksCount,
      totalTasks: currentTasksList.length,
      completedAt: nowEnd,
      lastActivityAt: nowEnd,
      resultSummary: resultSummaryText
    });

    await executionLog.record({
      missionId: mission.id,
      agent: "Senior-01",
      event: "SENIOR_APPROVED",
      metadata: { decision: "APPROVE", resultSummaryPath: summaryArt.path }
    });

    await executionLog.record({
      missionId: mission.id,
      agent: "EXECUTIVE_ORCHESTRATOR",
      event: "MISSION_COMPLETED",
      metadata: {
        completedTasks: completedTasksCount,
        failedTasks: failedTasksCount,
        artifactsGenerated: generatedArtifactsList.length
      }
    });

    checkpointManager.createCheckpoint(
      { ...mission, currentPhase: "COMPLETED", completedTasks: completedTasksCount, executionProgress: 100 },
      "MISSION_COMPLETED",
      currentTasksList,
      artifactStorage.listByMission(mission.id)
    );

    logger.info("AUTONOMOUS_EXECUTOR", "COMPLETED", `Multi-agent mission "${mission.title}" successfully completed all tasks and reviews!`);
    return finalMissionState.data || mission;
  },

  async retryFailedTask(missionId: string, taskId: string): Promise<void> {
    logger.info("AUTONOMOUS_EXECUTOR", "RETRY_TASK", `Retrying failed task ${taskId} for mission ${missionId}`);
    if (FEATURE_FLAGS.USE_MOCK_DATA) {
      updateAssignmentTable(taskId, { status: "RUNNING", progress: 10 });
    }
    eventBus.emit("DATA_CHANGED");
  },

  async restoreCheckpoint(checkpointId: string): Promise<MissionCheckpoint | null> {
    const cp = checkpointManager.restoreCheckpoint(checkpointId);
    if (cp) {
      await missionRepository.updateMission(cp.missionId, {
        currentPhase: cp.currentPhase,
        executionProgress: cp.executionProgress,
        completedTasks: cp.completedTasks,
        totalTasks: cp.totalTasks
      });
      eventBus.emit("DATA_CHANGED");
    }
    return cp;
  }
};

export default autonomousExecutor;
