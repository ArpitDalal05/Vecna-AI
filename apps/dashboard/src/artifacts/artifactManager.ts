import { Artifact } from "./artifactTypes";
import { artifactStorage } from "./artifactStorage";
import { logger } from "../services/logging/logger";

export const artifactManager = {
  createArtifact(
    name: string,
    type: Artifact["type"],
    content: string,
    missionId: string,
    authorAgent: string
  ): Artifact {
    const id = `art_${Math.random().toString(36).substring(2, 9)}`;
    const newArt: Artifact = {
      id,
      version: 1,
      timestamp: new Date().toISOString(),
      missionId,
      authorAgent,
      status: "CREATED",
      type,
      content,
      name
    };

    artifactStorage.save(newArt);
    logger.info("ARTIFACT", "CREATED", `Artifact "${name}" (${type}) created by agent ${authorAgent}.`, { id });
    return newArt;
  },

  updateArtifact(id: string, content: string, authorAgent: string): Artifact {
    const latest = artifactStorage.getLatest(id);
    if (!latest) {
      throw new Error(`Artifact with ID ${id} not found.`);
    }

    const updated: Artifact = {
      ...latest,
      version: latest.version + 1,
      timestamp: new Date().toISOString(),
      authorAgent,
      content
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
  }
};
export default artifactManager;
