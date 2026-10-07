import { ProviderFactory } from "../providers/ProviderFactory";
import { FEATURE_FLAGS } from "../../config";
import { logger } from "../../services/logging/logger";
import { logAIExecution } from "./observability";
import { contextBuilder } from "../context/contextBuilder";
import { artifactManager } from "../../artifacts/artifactManager";
import { artifactValidator } from "../../artifacts/artifactValidator";
import { workspaceManager } from "../../tools/workspace/workspaceManager";
import { eventBus } from "../../services/runtime/eventBus";
import { Artifact, ArtifactFileType } from "../../artifacts/artifactTypes";
import { executionLog } from "../../runtime/execution/executionLog";

export interface GenerateArtifactRequest {
  missionId: string;
  taskId?: string;
  artifactName: string;
  artifactType: ArtifactFileType;
  goalDescription: string;
  agentId?: string;
  relPath?: string;
}

export const artifactRunner = {
  async generateArtifact(req: GenerateArtifactRequest): Promise<Artifact> {
    const { missionId, taskId, artifactName, artifactType, goalDescription, agentId = "Synapse-01", relPath } = req;

    await executionLog.record({
      missionId,
      taskId,
      agent: agentId,
      event: "TASK_STARTED",
      metadata: { artifactName, artifactType }
    });

    if (!FEATURE_FLAGS.USE_REAL_AI) {
      logger.info("AI_ORCHESTRATOR", "ARTIFACT_SIMULATION", `Simulating generation for artifact "${artifactName}"`);
      const simContent = `# ${artifactName}\n\nGenerated payload for task: ${goalDescription}\n\n* Status: Completed via simulated Swarm mode.`;
      
      const artPath = relPath || artifactName;
      workspaceManager.createFile(artPath, simContent);
      const art = artifactManager.createArtifact(artifactName, artifactType, simContent, missionId, agentId, artPath);
      
      eventBus.emit("ARTIFACT_CREATED", art);
      await executionLog.record({
        missionId,
        taskId,
        agent: agentId,
        event: "ARTIFACT_CREATED",
        metadata: { artifactId: art.id, artifactName, path: artPath }
      });
      return art;
    }

    const provider = ProviderFactory.getProvider();
    if (!provider) {
      throw new Error("No active LLM provider available for artifact generation.");
    }

    const systemPrompt = contextBuilder.buildSystemPrompt("artifactGeneration");
    const userPrompt = contextBuilder.buildUserPrompt(`Generate the full content for the artifact "${artifactName}" (Type: ${artifactType}).
Objective Context: ${goalDescription}

Instructions:
- Provide the complete, production-grade file content for "${artifactName}".
- Do not use dummy placeholders.
- Ensure format matches file extension (${artifactType}).
- Do not wrap in extra markdown backticks if outputting standard text/markdown/SQL unless required.`, {
      workspace: "Engineering"
    });

    await executionLog.record({
      missionId,
      taskId,
      agent: agentId,
      event: "LLM_REQUEST",
      metadata: { model: "qwen/qwen3-coder-480b-a35b-instruct", promptName: "artifactGeneration" }
    });

    const startTime = Date.now();
    try {
      const res = await provider.generate(userPrompt, systemPrompt, {
        temperature: 0.2,
        model: "qwen/qwen3-coder-480b-a35b-instruct"
      });

      const latencyMs = Date.now() - startTime;
      await logAIExecution({
        agentId,
        missionId,
        provider: provider.constructor.name,
        model: res.modelUsed,
        promptTokens: res.promptTokens,
        completionTokens: res.completionTokens,
        latencyMs,
        status: "SUCCESS"
      });

      await executionLog.record({
        missionId,
        taskId,
        agent: agentId,
        event: "LLM_RESPONSE",
        metadata: { latencyMs, promptTokens: res.promptTokens, completionTokens: res.completionTokens }
      });

      let content = res.text.trim();
      if (content.startsWith("```")) {
        content = content.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```$/, "").trim();
      }

      const val = artifactValidator.validate(artifactName, artifactType, content);
      if (!val.valid) {
        logger.warn("ARTIFACT_RUNNER", "VALIDATION_WARNING", val.error || "Artifact validation warning");
      }

      const artPath = relPath || artifactName;
      workspaceManager.createFile(artPath, content);
      const artifact = artifactManager.createArtifact(artifactName, artifactType, content, missionId, agentId, artPath);

      eventBus.emit("ARTIFACT_CREATED", artifact);

      await executionLog.record({
        missionId,
        taskId,
        agent: agentId,
        event: "ARTIFACT_CREATED",
        metadata: { artifactId: artifact.id, artifactName, path: artPath, checksum: artifact.checksum }
      });

      logger.info("ARTIFACT_RUNNER", "SUCCESS", `Generated artifact "${artifactName}" for mission ${missionId}`);
      return artifact;

    } catch (err: any) {
      await logAIExecution({
        agentId,
        missionId,
        provider: provider ? provider.constructor.name : "UNKNOWN",
        model: "UNKNOWN",
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: Date.now() - startTime,
        status: "FAILURE"
      });
      logger.error("ARTIFACT_RUNNER", "FAIL", `Artifact generation failed: ${err.message}`);
      throw err;
    }
  }
};

export default artifactRunner;
