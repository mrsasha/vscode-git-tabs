import { StatusResult } from "simple-git";

export enum FileSCMStatus {
  ADDED,
  CONFLICTING,
  DELETED,
  MODIFIED,
  UNKNOWN,
  UNTRACKED,
}

export function getFileStatus(
  filePath: string,
  statusResult: StatusResult
): FileSCMStatus {
  if (statusResult.created.includes(filePath)) {
    return FileSCMStatus.UNTRACKED;
  } else if (statusResult.conflicted.includes(filePath)) {
    return FileSCMStatus.CONFLICTING;
  } else if (statusResult.deleted.includes(filePath)) {
    return FileSCMStatus.DELETED;
  } else if (statusResult.modified.includes(filePath)) {
    return FileSCMStatus.MODIFIED;
  } else if (statusResult.not_added.includes(filePath)) {
    return FileSCMStatus.UNTRACKED;
  } else if (statusResult.staged.includes(filePath)) {
    return FileSCMStatus.ADDED;
  } else {
    return FileSCMStatus.UNKNOWN;
  }
}
