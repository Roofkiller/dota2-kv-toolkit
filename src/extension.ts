'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { connect } from 'net';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "dota-2-kv-toolkit" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.mergeKv', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        let merging = merger.Merge();
        merging.then(() => {
            vscode.window.showInformationMessage("Successfully merged KV files.");
        });
        merging.catch(() => {
            vscode.window.showErrorMessage("Could not find a 'scripts/npc' folder.");
        });
    });

    let disposable2 = vscode.commands.registerCommand('extension.autoMergeKv', () => {
        merger.ToggleWatching();
        if (merger.IsWatching()) {
            vscode.window.showInformationMessage("Started watching kv files.");
        } else {
            vscode.window.showInformationMessage("Stopped watching kv files.");
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class KvMerger {
    Folders = [
        "abilities",
        "units",
        "items",
        "heroes"
    ];
    Keys = [
        "DOTAAbilities",
        "DOTAUnits",
        "DOTAAbilities",
        "DOTAHeroes"
    ];

    _fileWatcher : vscode.FileSystemWatcher = null;

    ToggleWatching = () => {
        if (this.IsWatching()) {
            this._fileWatcher.dispose();
            this._fileWatcher = null;
            console.log("Stopped watching kv files.");
        } else {
            this._fileWatcher = vscode.workspace.createFileSystemWatcher('**scripts/npc/*/*.txt');
            this._fileWatcher.onDidChange(this._WatchMerge);
            this._fileWatcher.onDidCreate(this._WatchMerge);
            this._fileWatcher.onDidDelete(this._WatchMerge);
            console.log("Started watching kv files.");
        }
    }

    IsWatching = () : boolean => {
        return this._fileWatcher != null;
    }

    _WatchMerge = (uri : vscode.Uri) : void => {
        this.Merge();
    }

    Merge = async () : Promise<void> => {
        console.log("Starting to merge.");
        return new Promise<void>((resolve, reject) => {
            let foundFiles = vscode.workspace.findFiles('**/npc_units_custom.txt');
            foundFiles.then(async files => {
                let promise = this.OnNpcFolderFound(files);
                promise.then(() => {
                    console.log("Merged.");
                    resolve();
                });
                promise.catch(() => {
                    console.log("Failed to merge.");
                    reject();
                });
            }, reason => {
                console.log("Could not find a 'npc_units_custom.txt' file.");
                reject();
            });
        });
    }

    OnNpcFolderFound = async (uris : vscode.Uri[]) : Promise<void> => {
        if (uris.length == 0) {
            return Promise.reject("There is no 'npc_units_custom.txt' file.");
        }
        if (uris.length > 1) {
            return Promise.reject("There is more than one 'npc_units_custom.txt' file.");
        }
        let uri = uris[0];
        let npcFolder = vscode.Uri.parse(uri.path.substring(0, uri.path.lastIndexOf("/")));

        for (let i = 0; i < this.Folders.length; i++) {
            await this.JoinFolder(npcFolder, this.Folders[i], this.Keys[i]);
        }
    }

    JoinFolder = async (npcFolder : vscode.Uri, folder : string, key : string) : Promise<void> => {
        let folderPath = vscode.Uri.parse(`${npcFolder.path}/${folder}`);
        // let workspace = vscode.workspace.getWorkspaceFolder(npcFolder);
        let workspace = vscode.workspace.workspaceFolders[0];
        let targetFile = vscode.Uri.parse(`${npcFolder.path}/npc_${folder}_custom.txt`);
        let path = folderPath.path.substring(3).replace(workspace.uri.path.substring(3) + "/", "") + "/**/*.txt"
        return new Promise<void>((resolve, reject) => {
            vscode.workspace.findFiles(path).then(async files => {
                let promise = this.MergeFiles(files, targetFile, key);
                promise.then(resolve);
                promise.catch(reject);
            });
        });
    }

    MergeFiles = async (files : vscode.Uri[], targetFile : vscode.Uri, key : string) : Promise<void> => {
        let result = `"${key}"\n{\n`;
        for(let file of files ){
            let content = await ReadFile(file.fsPath, 'utf8');
            //Add indents
            result += content.replace(/^(?!\s*$)/mg, ' '.repeat(4));
        }
        result += "\n}";
        await WriteFile(targetFile.fsPath, result);
    }
}

function WriteFile(fileName, data): Promise<void>
{
    return new Promise<void>((resolve, reject) =>
    {
        fs.writeFile(fileName, data, (err) => 
        {
            if (err)
            {
                reject(err);    
            }
            else
            {
                resolve();
            }
        });
    });        
}

function ReadFile(fileName, encoding): Promise<string>
{
    return new Promise<string>((resolve, reject) =>
    {
        fs.readFile(fileName, encoding, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(String(data));
            }
        });
    });
}

let merger = new KvMerger();

