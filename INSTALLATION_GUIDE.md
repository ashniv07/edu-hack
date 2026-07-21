# CodeMorph AI - Installation & Testing Guide

## Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| **Windows** | ✅ Supported | Windows 10/11 |
| **macOS** | ✅ Supported | macOS 11+ (Intel & Apple Silicon) |
| **Linux** | ✅ Supported | Ubuntu 20.04+, Debian, Fedora |

## Requirements

| Dependency | Version | Required |
|------------|---------|----------|
| VS Code | 1.85+ | ✅ Yes |
| Node.js | 18+ | ✅ Yes |
| npm | 9+ | ✅ Yes |
| Python | 3.8+ | ✅ Yes (for Python files) |
| Java | 11+ | ⚪ Optional (for Java files) |
| Git | Any | ✅ Yes |

---

## Installation Instructions

### Step 1: Clone Repository

```bash
git clone https://github.com/[your-username]/edu-hack.git
cd edu-hack
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Create `apps/backend/.env`:
```env
OPENAI_API_KEY=your-openai-api-key
PORT=3001
```

### Step 4: Start Backend Server

```bash
npm run dev --workspace=apps/backend
```

Expected output:
```
AI Tutor backend listening on http://localhost:3001
```

### Step 5: Compile Extension

Open a new terminal:
```bash
npm run compile --workspace=apps/extension
```

### Step 6: Launch Extension

1. Open project in VS Code: `code .`
2. Press `F5` to launch Extension Development Host
3. A new VS Code window opens with the extension loaded

---

## Testing Instructions

### Quick Test (2 minutes)

1. In the Extension Development Host window, open:
   ```
   demo_files/01_index_error.py
   ```

2. Run command:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: `AI Tutor: Run Current File`
   - Press Enter

3. Verify the AI Tutor sidebar opens with:
   - ✅ Error analysis (Overview tab)
   - ✅ Array visualization (Visualization tab)
   - ✅ Step debugger (Debugger tab)
   - ✅ Progressive hints (Hints tab)

### Full Test Suite (5-7 minutes)

Test each demo file to verify all visualization types:

| File | Expected Visualization |
|------|----------------------|
| `demo_files/01_index_error.py` | Array with out-of-bounds index highlighted |
| `demo_files/02_none_error.py` | Object structure showing None value |
| `demo_files/03_type_error.py` | Type flow diagram |
| `demo_files/04_recursion_error.py` | Call stack frames |
| `demo_files/05_key_error.py` | Dictionary with missing key |
| `demo_files/06_division_error.py` | Arithmetic operation |

### Feature Checklist

- [ ] **Overview Tab** - Shows error summary, code preview, guided steps
- [ ] **Debugger Tab** - Play/pause/step through code, variable panel updates
- [ ] **Visualization Tab** - Dynamic visualization renders for error type
- [ ] **Hints Tab** - 3-level progressive hints reveal correctly
- [ ] **Practice Tab** - Interactive puzzles load and validate answers
- [ ] **Dashboard Tab** - Educator analytics display (demo data)
- [ ] **Inline Annotations** - CodeLens hints appear above error line

---

## Verification Commands

```bash
# Check backend health
curl http://localhost:3001/health

# Expected response:
# {"status":"ok"}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not loading | Run `npm run compile --workspace=apps/extension`, then F5 |
| Backend not responding | Ensure `npm run dev --workspace=apps/backend` is running |
| No visualization | Check backend terminal for errors |
| Python not found | Set `hackyayAiTutor.pythonPath` in VS Code settings |
| Command not found | Ensure you're in Extension Development Host window |

---

## Uninstallation

1. Stop the backend server (Ctrl+C)
2. Close VS Code
3. Delete the project folder:
   ```bash
   rm -rf edu-hack
   ```

---

## Support

- **Issues:** https://github.com/[your-username]/edu-hack/issues
- **Documentation:** See README.md and ARCHITECTURE.md
