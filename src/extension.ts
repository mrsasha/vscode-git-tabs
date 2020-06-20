import * as vscode from "vscode";
import { workspace, ExtensionContext, StatusBarAlignment } from "vscode";
import path = require("path");
import simpleGit, { SimpleGit, StatusResult } from "simple-git";

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

  statusBar = createStatusBar();

  //events
  //   vscode.window.onDidChangeActiveTextEditor(OnStatusBarUpdate);
  vscode.workspace.onDidChangeConfiguration(() =>
    checkGitStatus(currentRepoPath)
  );
  vscode.workspace.onDidSaveTextDocument(() => checkGitStatus(currentRepoPath));
  vscode.workspace.onDidCreateFiles(() => checkGitStatus(currentRepoPath));
  vscode.workspace.onDidDeleteFiles(() => checkGitStatus(currentRepoPath));
  vscode.workspace.onDidRenameFiles(() => checkGitStatus(currentRepoPath));

  context.subscriptions.push(disposable);
  context.subscriptions.push(statusBar);

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

function checkGitStatus(repoDir: string | undefined) {
  console.log(`Checking status for: ${repoDir}`);
  if (repoDir === undefined) return;

  const status = simpleGit(repoDir)
    .status()
    .then((statusResult: StatusResult) => {
      console.log(`Got git status: ${JSON.stringify(statusResult)}`);
      showStatusInStatusBar(statusResult, repoDir);
    })
    .catch((err) => {
      console.error(`Error getting git status: ${err}`);
    });
}

function showStatusInStatusBar(statusResult: StatusResult, repoDir: string) {
  console.log(
    `Modified: ${statusResult.modified.length}, Not added: ${statusResult.not_added}`
  );

  if (statusBar) {
    statusBar.text = `Git branch: ${statusResult.current} -- CHG: ${statusResult.modified.length}, ADD: ${statusResult.not_added.length}, DEL: ${statusResult.deleted.length}`;
    statusBar.show();
  }
}

function lookupRepo(repoDir: string) {
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
      checkGitStatus(currentRepoPath);
    }
  });
}
