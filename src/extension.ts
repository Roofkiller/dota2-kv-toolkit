'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Uri from 'vscode-uri';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "dota-2-kv-toolkit" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.mergeKv', async () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        let merger = new KvMerger();
        await merger.Merge();
        vscode.window.showInformationMessage("Successfully merged KV files.");
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

    Merge = async () : Promise<void> => {
        console.log("Starting to merge.");
        return new Promise<void>((resolve, reject) => {
            vscode.workspace.findFiles('**/npc_units_custom.txt').then(async (files) => {
                await this.OnNpcFolderFound(files);
                resolve();
            });
        });
    }

    OnNpcFolderFound = async (uris : vscode.Uri[]) : Promise<void> => {
        if (uris.length == 0) {
            vscode.window.showErrorMessage("There is no 'npc_units_custom.txt' file in this project.");
            return;
        }
        if (uris.length > 1) {
            vscode.window.showErrorMessage("There are more than one 'npc_units_custom.txt' files in this project.");
            return;
        }
        let uri = uris[0];
        let npcFolder = vscode.Uri.parse(uri.path.substring(0, uri.path.lastIndexOf("/")));

        for (let i = 0; i < this.Folders.length; i++) {
            await this.JoinFolder(npcFolder, this.Folders[i], this.Keys[i]);
        }
    }

    JoinFolder = async (npcFolder : vscode.Uri, folder : string, key : string) : Promise<void> => {
        let folderPath = Uri.parse(`${npcFolder.path}/${folder}`);
        // let workspace = vscode.workspace.getWorkspaceFolder(npcFolder);
        let workspace = vscode.workspace.workspaceFolders[0];
        let targetFile = Uri.parse(`${npcFolder.path}/npc_${folder}_custom.txt`);
        return new Promise<void>((resolve, reject) => {
            vscode.workspace.findFiles(folderPath.path.replace(workspace.uri.path + "/", "") + "/*.txt").then(async files => {
                await this.MergeFiles(files, targetFile, key);
                resolve();
            });
        });
    }

    MergeFiles = async (files : vscode.Uri[], targetFile : Uri, key : string) : Promise<void> => {
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

