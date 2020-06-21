import * as vscode from "vscode";
import { workspace, ExtensionContext, StatusBarAlignment } from "vscode";
import path = require("path");
import simpleGit, { SimpleGit, StatusResult } from "simple-git";
import { getColor, setTabColor } from "./settings";
import { getFileStatus } from "./fileops";

let statusBar: vscode.StatusBarItem;
let currentRepoPath: string | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Workspace not using a folder. No access to git repo.
  if (!workspace.rootPath) {
    return;
  }

  const workspaceRoot = workspace.rootPath;
  let disposable = vscode.commands.registerCommand("git-tabs.showgit", () => {
    vscode.window.showInformationMessage(
      `Howdy from git-tabs, using root: ${workspaceRoot}!`
    );
  });
  context.subscriptions.push(disposable);

  statusBar = createStatusBar();
  context.subscriptions.push(statusBar);

  //events
  let disposableChangeConfig = vscode.workspace.onDidChangeConfiguration(() => {
    checkGitStatus(currentRepoPath, true);
  });
  context.subscriptions.push(disposableChangeConfig);

  let disposableChangeText = vscode.workspace.onDidChangeTextDocument(() => {
    checkGitStatus(currentRepoPath, true);
  });
  context.subscriptions.push(disposableChangeText);

  let disposableChangeEditor = vscode.window.onDidChangeActiveTextEditor(() => {
    checkGitStatus(currentRepoPath, true);
  });
  context.subscriptions.push(disposableChangeEditor);

  lookupRepo(workspaceRoot);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function createStatusBar() {
  let sb = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    -1
  );
  sb.text = "";
  return sb;
}

function checkGitStatus(repoDir: string | undefined, updateTabs?: boolean) {
  if (repoDir === undefined) return;

  const status = simpleGit(repoDir)
    .status()
    .then((statusResult: StatusResult) => {
      console.log(`Got git status: ${JSON.stringify(statusResult)}`);
      showStatusInStatusBar(statusResult);

      if (updateTabs) {
        updateEditorTabs(statusResult);
      }
    })
    .catch((err) => {
      console.error(`Error getting git status: ${err}`);
    });
}

function showStatusInStatusBar(statusResult: StatusResult) {
  console.log(`Updating status bar`);

  if (statusBar) {
    statusBar.text = `Git branch: ${statusResult.current} -- CHG: ${statusResult.modified.length}, ADD: ${statusResult.not_added.length}, DEL: ${statusResult.deleted.length}`;
    statusBar.show();
  }
}

async function updateEditorTabs(statusResult: StatusResult) {
  console.log(`Updating editor tabs`);

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const openFilePath = vscode.workspace.asRelativePath(
    editor.document.fileName
  );

  const fileStatus = getFileStatus(openFilePath, statusResult);
  const colorForFile = getColor(fileStatus);

  console.log(
    `updateEditorTabs file: ${openFilePath}, status: ${fileStatus}, color should be: ${colorForFile}`
  );

  setTabColor(colorForFile);
}

function lookupRepo(repoDir: string) {
  console.log(`lookupRepo for ${repoDir}`);

  const repoPath = path.join(repoDir, ".git");
  const fs = require("fs");

  fs.access(repoPath, (err: any) => {
    if (err) {
      // No access to git repo or no repo, try to go up.
      const parentDir = path.dirname(repoDir);
      if (parentDir != repoDir) {
        lookupRepo(parentDir);
      } else {
        currentRepoPath = undefined;
      }
    } else {
      console.log(`Setting currentRepoPath to: ${repoDir}`);
      currentRepoPath = repoDir;
      checkGitStatus(currentRepoPath, true);
    }
  });
}
