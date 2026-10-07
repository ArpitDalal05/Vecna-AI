import { Artifact } from "./artifactTypes";

export function computeChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16)}`;
}

export const artifactValidator = {
  validate(name: string, type: Artifact["type"], content: string): { valid: boolean; error?: string; checksum: string } {
    const checksum = computeChecksum(content || "");

    if (!name || name.trim() === "") {
      return { valid: false, error: "Artifact name cannot be empty.", checksum };
    }

    if (!content || content.trim() === "") {
      return { valid: false, error: `Artifact content for "${name}" cannot be empty.`, checksum };
    }

    if (type === "JSON" || type === "Config" || name.endsWith(".json")) {
      try {
        JSON.parse(content);
      } catch (err: any) {
        return { valid: false, error: `Invalid JSON format in "${name}": ${err.message}`, checksum };
      }
    }

    return { valid: true, checksum };
  }
};

export default artifactValidator;
