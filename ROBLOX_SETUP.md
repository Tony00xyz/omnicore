# Roblox Studio connection

This workspace is now set up for `Rojo`, which is the easiest way to let Codex edit local files while Roblox Studio stays in sync.

## What was added

- `default.project.json`: maps this folder into Roblox services
- `roblox/src/ServerScriptService/Main.server.luau`
- `roblox/src/ReplicatedStorage/Shared/Hello.luau`
- `roblox/src/StarterPlayer/StarterPlayerScripts/Client.client.luau`

## One-time setup

1. Install the Rojo Studio plugin.
2. Install the Rojo desktop app or CLI.
3. Open this folder in your terminal.
4. Start the Rojo server:

```powershell
rojo serve
```

5. Open Roblox Studio.
6. Open the Rojo plugin and connect to `localhost:34872`.

## What happens after that

When I edit files under `roblox/src`, Rojo pushes those changes into Studio.

That means you can ask me to:

- add scripts
- build systems
- refactor modules
- wire up UI logic

and you will see the synced result in Studio.

## Important note

I cannot directly click around inside Roblox Studio from here. The connection works by syncing code through Rojo, which is the normal development workflow.
