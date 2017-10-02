# VS Code DotA 2 KV Toolkit

This VS Code extension provides some additional features which should enhance the workflow with Valves KV-files.

Download here: https://marketplace.visualstudio.com/items?itemName=nicholasgao.dota-2-kv-toolkit

## Features

* `Merge KVs` (`Shift+Alt+M`) command which automatically builds the `npc_units_custom.txt`, `npc_abilities_custom.txt`, `npc_heroes_custom.txt` and `npc_items_custom.txt` based on the `units`, `abilities`, `heroes`, and `items` folders located in your `scripts/npc` folder.

* `Auto Merge KVs` calls automatically `Merge KVs` as soon as a file inside the `scripts/npc` folder has changed.

## Known Issues

* Merging kvs can lead to a loss in the previous `npc_*_custom.txt` files.
* Auto merge only works in a workspace without folder junctions.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of DotA 2 KV Toolkit
