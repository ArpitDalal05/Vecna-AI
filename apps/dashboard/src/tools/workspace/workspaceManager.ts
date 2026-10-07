import { fileOperations, FileMetadata } from "./fileOperations";
import { getWorkspaceRoot } from "./pathResolver";
import { logger } from "../../services/logging/logger";

export const workspaceManager = {
  getRoot(): string {
    return getWorkspaceRoot();
  },

  listFiles(subDir = ""): FileMetadata[] {
    return fileOperations.listFiles(subDir);
  },

  readFile(relPath: string): string {
    logger.info("WORKSPACE", "READ_FILE", `Reading workspace file "${relPath}"`);
    return fileOperations.readFile(relPath);
  },

  createFile(relPath: string, content: string): void {
    logger.info("WORKSPACE", "CREATE_FILE", `Creating workspace file "${relPath}" (${content.length} bytes)`);
    fileOperations.createFile(relPath, content);
  },

  editFile(relPath: string, content: string): void {
    logger.info("WORKSPACE", "EDIT_FILE", `Updating workspace file "${relPath}" (${content.length} bytes)`);
    fileOperations.editFile(relPath, content);
  },

  renameFile(oldRelPath: string, newRelPath: string): void {
    logger.info("WORKSPACE", "RENAME_FILE", `Renaming workspace file "${oldRelPath}" -> "${newRelPath}"`);
    fileOperations.renameFile(oldRelPath, newRelPath);
  },

  createDirectory(relPath: string): void {
    logger.info("WORKSPACE", "CREATE_DIR", `Creating workspace directory "${relPath}"`);
    fileOperations.createDirectory(relPath);
  },

  deleteFile(relPath: string): void {
    logger.info("WORKSPACE", "DELETE_FILE", `Deleting workspace file/dir "${relPath}"`);
    fileOperations.deleteFile(relPath);
  },

  getFileMetadata(relPath: string): FileMetadata {
    return fileOperations.getFileMetadata(relPath);
  }
};

export default workspaceManager;
