# AI Tutor Demo Files

## Quick Start

### Step 1: Start the Backend Server

```bash
cd /path/to/edu-hack
npm run dev --workspace=apps/backend
```

You should see:
```
AI Tutor backend listening on http://localhost:3001
```

### Step 2: Launch the Extension

1. Open VS Code
2. Open this project folder
3. Press `F5` to launch the extension in debug mode
4. A new VS Code window opens with the extension loaded

### Step 3: Run Demo Files

1. Open any demo file from `demo_files/`
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
3. Type "AI Tutor: Run Current File"
4. Watch the magic happen in the AI Tutor sidebar!

---

## Demo Files

| File | Error Type | Visualization | What It Demonstrates |
|------|------------|---------------|---------------------|
| `01_index_error.py` | IndexError | Array Access | Accessing out-of-bounds index |
| `02_none_error.py` | AttributeError | Object Structure | Accessing attribute on None |
| `03_type_error.py` | TypeError | Type Flow | Incompatible type operation |
| `04_recursion_error.py` | RecursionError | Call Stack | Missing base case |
| `05_key_error.py` | KeyError | Dict Access | Missing dictionary key |
| `06_division_error.py` | ZeroDivisionError | Arithmetic | Division by zero |

---

## Demo Flow

### For Each Demo File:

1. **Show the Code** (10 sec)
   - Point out the bug
   - Explain what it's trying to do

2. **Run AI Tutor** (5 sec)
   - `Cmd+Shift+P` → "AI Tutor: Run Current File"

3. **Overview Tab** (15 sec)
   - Show error type and message
   - Show code preview with highlighted error

4. **Visualization Tab** (20 sec)
   - Show the dynamic visualization
   - Explain what it represents

5. **Debugger Tab** (15 sec)
   - Step through the code
   - Show variable changes

6. **Hints Tab** (15 sec)
   - Show progressive hint system
   - Reveal hints one by one

---

## Recording Tips

### Screen Setup
- Resolution: 1920x1080 or higher
- Font size: Increase to 14-16px for visibility
- Theme: Dark theme recommended

### Before Recording
```bash
# Clear terminal
clear

# Make sure backend is running
npm run dev --workspace=apps/backend

# Verify health
curl http://localhost:3001/health
```

### VS Code Settings
```json
{
  "editor.fontSize": 16,
  "terminal.integrated.fontSize": 14,
  "workbench.colorTheme": "One Dark Pro"
}
```

---

## Troubleshooting

### "Extension not found"
- Make sure you pressed F5 to launch debug mode
- Check that the extension compiled successfully

### "Backend not responding"
- Check if backend is running on port 3001
- Run: `curl http://localhost:3001/health`

### "Visualization not showing"
- Make sure the file has a runtime error
- Check the backend logs for analysis errors

### "Python not found"
- Set `hackyayAiTutor.pythonPath` in VS Code settings
- Default is `python3`, try `python` if needed

---

## Key Features to Highlight

1. **Dynamic Visualizations**
   - Each error type gets a unique visualization
   - Animations make concepts clear

2. **Step-by-Step Debugger**
   - Walk through code execution
   - See variable changes in real-time

3. **Progressive Hints**
   - 3 levels: Nudge → Guided → Solution
   - Encourages self-discovery

4. **Code Preview**
   - Syntax highlighting
   - Error line indication

5. **AI Analysis**
   - Concept identification
   - Personalized learning objectives

---

## Demo Talking Points

### For Educators
> "AI Tutor provides visual explanations that help students understand WHY errors happen, not just WHAT went wrong."

### For Developers
> "Built with React, Framer Motion, LangGraph, and Tree-sitter for robust code analysis."

### For Judges
> "This solves a real educational problem - students struggle with cryptic error messages. AI Tutor makes debugging a learning experience."

---

## Files Overview

```
demo_files/
├── README.md              # This file
├── 01_index_error.py      # Array out of bounds
├── 02_none_error.py       # None/null reference
├── 03_type_error.py       # Type mismatch
├── 04_recursion_error.py  # Infinite recursion
├── 05_key_error.py        # Dict key not found
└── 06_division_error.py   # Division by zero
```

---

## Contact

For issues or questions, check the main README or open a GitHub issue.
