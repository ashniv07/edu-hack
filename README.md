# HackYay AI Tutor

This repository is a small monorepo with two apps:

- `apps/extension`: the VS Code extension
- `apps/backend`: the separate TypeScript backend scaffold

Right now, the extension is the working part. It can run a Python file, capture a runtime error, show a VS Code diagnostic, and open an AI Tutor view inside VS Code.

## Project Structure

```text
hackyay-ai-tutor/
  .vscode/              -> root debug configuration used during extension development
  apps/
    extension/          -> VS Code extension source and webview UI
    backend/            -> separate backend scaffold for future LangGraph work
  package.json          -> root workspace manifest and helper scripts
```

## What You Need

Install these before trying to run the project:

1. `VS Code`
2. `Node.js`
3. `Python`

Quick checks:

```powershell
node --version
python --version
```

If both commands print a version, you are good to continue.

## Root Folder To Open

Open the cloned repository root in VS Code.

Do not open `apps/extension` directly when you want to use the repo-level debug setup. The root folder already contains the correct launch configuration.

## Install Dependencies

Open a terminal in the repo root and run:

```powershell
npm install
```

What this does:

- installs workspace dependencies
- installs extension dependencies
- installs backend scaffold dependencies

You usually only need to do this once, or again after dependency changes.

## Main Commands

Run these from the repo root:

```powershell
npm run compile
npm run watch
npm run extension:compile
npm run extension:watch
npm run backend:check-types
```

What each command does:

- `npm run compile`
  - root alias for `npm run extension:compile`
  - useful if you just want the main extension build command

- `npm run watch`
  - root alias for `npm run extension:watch`
  - useful during active development

- `npm run extension:compile`
  - builds the VS Code extension once
  - runs TypeScript checks
  - runs lint
  - bundles the extension code and webview UI

- `npm run extension:watch`
  - keeps rebuilding the extension while you edit files
  - useful during active development

- `npm run backend:check-types`
  - typechecks the backend scaffold
  - useful when you start building the separate service

## How To Run The Extension

This is the most important section.

There are always **two windows** involved during extension development:

1. **Main project window**
   - this is the VS Code window where you edit the extension source code
   - you build and start debugging from here

2. **Extension Development Host**
   - this is the second VS Code window that opens when you run the extension
   - this simulates what a real user would experience
   - you test the extension here

### Step-by-step

1. Open the repo root in VS Code.

2. In the terminal, build the extension:

```powershell
npm run extension:compile
```

3. Start the extension:

- press `F5`
- on some laptops you may need `Fn + F5`
- or use `Run and Debug` in the left sidebar and choose `Run Extension`

4. A second VS Code window should open.

Its title will include:

```text
[Extension Development Host]
```

This second window is where you test the plugin.

## How To Test The Current Demo

In the **Extension Development Host** window:

1. Open this file:

```text
apps/extension/samples/divide-by-zero.py
```

2. Open the command palette:

```text
Ctrl + Shift + P
```

3. Run:

```text
AI Tutor: Run Current Python File
```

You can also use the editor title button if the file is open and active.

## What Should Happen

When you run `AI Tutor: Run Current Python File`, the extension should do all of the following:

1. Run the current Python file with `python`
2. Capture runtime output
3. Capture runtime errors
4. Create a VS Code diagnostic on the failing line
5. Open the AI Tutor view inside VS Code
6. Keep detailed logs available in the `AI Tutor` output channel if you need them

## Expected Result For `divide-by-zero.py`

The sample file intentionally causes a divide-by-zero error.

Expected behavior:

- `Problems` panel shows:
  - `ZeroDivisionError: division by zero`

- `Output` panel with `AI Tutor` selected can show:
  - runtime command
  - stdout
  - stderr
  - structured JSON payload

- the AI Tutor view opens in the left sidebar and shows:
  - Primary Issue
  - Next Action
  - Guided Steps
  - Observations
  - Traceback Frames
  - Stdout
  - Stderr

Expected stdout:

```text
First value: 12
About to divide by zero...
```

Expected runtime error:

```text
ZeroDivisionError: division by zero
```

## What The AI Tutor View Is

The AI Tutor view is a **webview inside VS Code**.

That means:

- it is not a browser tab
- it is not a terminal UI
- it is not the Output panel

It appears in the left sidebar of VS Code under the AI Tutor activity-bar icon.

## If The View Says "No run data yet"

That means the view opened before a file run completed.

Fix:

1. Keep a Python file open
2. Run `AI Tutor: Run Current Python File`
3. The view should refresh with the captured error data

## If The Command Does Not Appear

Make sure you are in the **Extension Development Host** window, not the main project window.

Then try:

1. `Developer: Reload Window` in the Extension Development Host
2. search for `AI Tutor` again in the command palette

## If F5 Does Not Work

Possible fixes:

1. Use `Fn + F5` instead of `F5`
2. Open `Run and Debug`
3. Choose `Run Extension`
4. Click the green play button

## If You Change Code

After changing extension code, use this loop:

1. Save your changes
2. Run:

```powershell
npm run extension:compile
```

or keep this running:

```powershell
npm run extension:watch
```

3. In the Extension Development Host, run:

```text
Developer: Reload Window
```

4. Test again

## Current Scope

The extension currently supports:

- Python files only
- runtime execution
- runtime error capture
- diagnostics
- AI Tutor webview rendering

The backend app is separate and currently only acts as a scaffold for future LangGraph work.
