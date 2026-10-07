import { Artifact } from "./artifactTypes";
import { artifactStorage } from "./artifactStorage";
import { artifactValidator, computeChecksum } from "./artifactValidator";
import { logger } from "../services/logging/logger";

export const artifactManager = {
  createArtifact(
    name: string,
    type: Artifact["type"],
    content: string,
    missionId: string,
    authorAgent: string,
    relPath?: string
  ): Artifact {
    const validation = artifactValidator.validate(name, type, content);
    if (!validation.valid) {
      logger.warn("ARTIFACT", "VALIDATION_FAILED", validation.error || "Artifact validation failed");
    }

    const id = `art_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const newArt: Artifact = {
      id,
      missionId,
      name,
      path: relPath || name,
      type,
      version: 1,
      status: "CREATED",
      createdAt: now,
      updatedAt: now,
      createdBy: authorAgent,
      authorAgent,
      content,
      checksum: validation.checksum || computeChecksum(content),
      timestamp: now
    };

    artifactStorage.save(newArt);
    logger.info("ARTIFACT", "CREATED", `Artifact "${name}" (${type}) created for mission ${missionId} by ${authorAgent}.`, { id });
    return newArt;
  },

  updateArtifact(id: string, content: string, authorAgent: string): Artifact {
    const latest = artifactStorage.getLatest(id);
    if (!latest) {
      throw new Error(`Artifact with ID ${id} not found.`);
    }

    const now = new Date().toISOString();
    const updated: Artifact = {
      ...latest,
      version: latest.version + 1,
      updatedAt: now,
      authorAgent,
      createdBy: authorAgent,
      content,
      checksum: computeChecksum(content),
      timestamp: now
    };

    artifactStorage.save(updated);
    logger.info("ARTIFACT", "UPDATED", `Artifact "${latest.name}" updated to version ${updated.version} by ${authorAgent}.`, { id });
    return updated;
  },

  getArtifact(id: string): Artifact | null {
    return artifactStorage.getLatest(id);
  },

  listArtifacts(): Artifact[] {
    return artifactStorage.list();
  },

  listArtifactsByMission(missionId: string): Artifact[] {
    return artifactStorage.listByMission(missionId);
  }
};

export default artifactManager;
