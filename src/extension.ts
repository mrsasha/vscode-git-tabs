import * as vscode from "vscode";
import { workspace, ExtensionContext, StatusBarAlignment } from "vscode";
import path = require("path");
import simpleGit, { SimpleGit, StatusResult } from "simple-git";

export function activate(context: vscode.ExtensionContext) {  
  // Workspace not using a folder. No access to git repo.
  if (!workspace.rootPath) {
    return;
  }

  const workspaceRoot = workspace.rootPath;
  let disposable = vscode.commands.registerCommand("git-tabs.showgit", () => {
    // Display a message box to the user
    vscode.window.showErrorMessage(
      `Hello World from git-tabs, using root: ${workspaceRoot}!`
    );
  });

  context.subscriptions.push(disposable);

  lookupRepo(context, workspaceRoot);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function lookupRepo(context: ExtensionContext, repoDir: string) {
  const repoPath = path.join(repoDir, ".git");
  const fs = require("fs");

  fs.access(repoPath, (err: any) => {
    if (err) {
      // No access to git repo or no repo, try to go up.
      const parentDir = path.dirname(repoDir);
      if (parentDir != repoDir) {
        lookupRepo(context, parentDir);
      }
    } else {
      const git: SimpleGit = simpleGit(repoDir);

      const status = git
        .status()
        .then((statusResult: StatusResult) => {
			checkStatus(statusResult);
        })
        .catch((err) => {
          console.error(`Error getting git status: ${err}`);
        });
    }
  });

  function checkStatus(statusResult: StatusResult) {
    console.log(`Got git status: ${JSON.stringify(statusResult)}`);
    const modified = statusResult.modified;
    console.log(
      `Modified files: ${JSON.stringify(modified)}, number: ${modified.length}`
    );

    const statusBar = vscode.window.createStatusBarItem(
      StatusBarAlignment.Left
    );
    statusBar.text = `modified files in ${repoDir}: ${modified.length}`;
    statusBar.show();
  }
}
