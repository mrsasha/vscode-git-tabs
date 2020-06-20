import * as vscode from "vscode";
import { FileSCMStatus } from "./fileops";

type ColorCustomization = { [key: string]: string | undefined } | undefined;

const COLOR_CUSTOMIZATIONS = "colorCustomizations";

const invertHex = (hex?: string) => {
  if (!hex) {
    return;
  }

  return Number(hex.replace("#", "0x")) > 0xffffff / 2 ? "#000000" : "#ffffff";
};

export function getColor(fileStatus: FileSCMStatus): string {
  const settings = vscode.workspace.getConfiguration("workbench");
  console.log(`settings: ${JSON.stringify(settings)}`);

  const currentColorCustomization: ColorCustomization =
    settings.get(COLOR_CUSTOMIZATIONS) || {};

  const defaultFileColor = "#FFFFFF";
  const defaultAddedFileColor = "#6FC2E9";
  const defaultConflictingFileColor = "#E51400";
  const defaultDeletedFileColor = "68217A";
  const defaultIgnoredFileColor = "#9C9C9C";
  const defaultModifiedFileColor = "#E5C365";
  const defaultUntrackedFileColor = "#007ACC";

  const addedFileColor =
    currentColorCustomization["gitDecoration.addedResourceForeground"];
  const conflictingFileColor =
    currentColorCustomization["gitDecoration.conflictingResourceForeground"];
  const deletedFileColor =
    currentColorCustomization["gitDecoration.deletedResourceForeground"];
  const ignoredFileColor =
    currentColorCustomization["gitDecoration.ignoredResourceForeground"];
  const modifiedFileColor =
    currentColorCustomization["gitDecoration.modifiedResourceForeground"];
  const untrackedFileColor =
    currentColorCustomization["gitDecoration.untrackedResourceForeground"];

  switch (fileStatus) {
    case FileSCMStatus.ADDED:
      return addedFileColor ? addedFileColor : defaultAddedFileColor;
    case FileSCMStatus.CONFLICTING:
      return conflictingFileColor
        ? conflictingFileColor
        : defaultConflictingFileColor;
    case FileSCMStatus.DELETED:
      return deletedFileColor ? deletedFileColor : defaultDeletedFileColor;
    case FileSCMStatus.IGNORED:
      return ignoredFileColor ? ignoredFileColor : defaultIgnoredFileColor;
    case FileSCMStatus.MODIFIED:
      return modifiedFileColor ? modifiedFileColor : defaultModifiedFileColor;
    case FileSCMStatus.UNTRACKED:
      return untrackedFileColor
        ? untrackedFileColor
        : defaultUntrackedFileColor;
    case FileSCMStatus.UNKNOWN:
      return defaultFileColor;
    default:
      return defaultFileColor;
  }
}

