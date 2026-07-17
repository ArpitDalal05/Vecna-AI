import { Artifact } from "./artifactTypes";

export class ArtifactStorage {
  private storage: Map<string, Artifact[]> = new Map();

  save(artifact: Artifact) {
    const list = this.storage.get(artifact.id) || [];
    list.push(artifact);
    this.storage.set(artifact.id, list);
  }

  getLatest(id: string): Artifact | null {
    const list = this.storage.get(id);
    if (!list || list.length === 0) return null;
    return list[list.length - 1];
  }

  getVersion(id: string, version: number): Artifact | null {
    const list = this.storage.get(id);
    if (!list) return null;
    return list.find(a => a.version === version) || null;
  }

  list(): Artifact[] {
    const all: Artifact[] = [];
    for (const list of this.storage.values()) {
      if (list.length > 0) all.push(list[list.length - 1]);
    }
    return all;
  }
}

export const artifactStorage = new ArtifactStorage();
export default artifactStorage;
