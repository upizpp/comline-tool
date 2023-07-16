import path = require("path");
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	const commandCount = 5;
	const replaceDict : { [key: string]: () => string } = {
		workspace() {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (workspaceFolders && workspaceFolders.length > 0) {
				return workspaceFolders[0].uri.fsPath;
			}
			return "";
		},
		file() {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				return activeEditor.document.uri.fsPath;
			}
			return "";
		},
		filename() {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				const path = activeEditor.document.uri.fsPath;
				const res = path.split("/").pop();
				if (res !== undefined){
					return res;
				}
			}
			return "";
		},
		filenameWOext(){
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				const path = activeEditor.document.uri.fsPath;
				const res = path.split("/").pop()?.split(".").pop();
				if (res !== undefined){
					return res;
				}
			}
			return "";
		},
		dir() {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				const fileUri = activeEditor.document.uri;
				return path.dirname(fileUri.fsPath);
			}
			return "";
		},
	};

	let terminal: vscode.Terminal;

	for (let i = 1; i <= commandCount; i++) {
		let disposable = vscode.commands.registerCommand(
			`comline-tool.command${i}`,
			() => {
				const config = vscode.workspace.getConfiguration("comline-tool");
				if (
					terminal === undefined ||
					terminal.exitStatus !== undefined
				) {
					terminal = vscode.window.createTerminal("Terminal");
					terminal.show();
				}
				let command: string = config.get(
					`command${i}_setting`
				) as string;
				for (let key in replaceDict) {
					if (replaceDict.hasOwnProperty(key)) {
					  const value = replaceDict[key]();
					  command = command.replace(`$\{${key}\}`, value);
					}
				  }
				terminal.sendText(command);
			}
		);

		context.subscriptions.push(disposable);
	}
}
