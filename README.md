# CodeMorph AI - AI Tutor for Visual Debugging

> Transform cryptic error messages into interactive learning experiences

CodeMorph AI is a VS Code extension that helps students understand runtime errors through dynamic visualizations, progressive hints, and interactive challenges. Instead of just showing error messages, it provides visual explanations of *why* errors happen.

## Features

- **Dynamic Visualizations** - 7 error-type-specific visualizations (arrays, dictionaries, call stacks, etc.)
- **Step-by-Step Debugger** - Walk through code execution with variable tracking
- **Progressive Hints** - 3-level hint system that encourages self-discovery
- **Interactive Challenges** - Reinforce learning with adaptive puzzles
- **Inline Annotations** - CodeLens hints directly in the editor
- **Educator Dashboard** - Track student progress and identify common struggles

## Supported Languages

- Python (.py files)
- Java (.java files)

---

## Quick Start: Clone and Run

### Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Check Command |
|----------|---------|---------------|
| VS Code | Latest | - |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Python | 3.8+ | `python3 --version` or `python --version` |
| Java (optional) | 11+ | `java --version` |
| Git | Any | `git --version` |

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/your-username/edu-hack.git

# Or clone via SSH
git clone git@github.com:your-username/edu-hack.git

# Navigate to the project directory
cd edu-hack
```

### Step 2: Install Dependencies

```bash
# Install all workspace dependencies (extension + backend)
npm install
```

This installs dependencies for:
- Root workspace
- `apps/extension` - The VS Code extension
- `apps/backend` - The AI analysis backend

### Step 3: Start the Backend Server

Open a terminal and run:

```bash
# Start the backend server
npm run dev --workspace=apps/backend
```

You should see:
```
AI Tutor backend listening on http://localhost:3001
```

**Keep this terminal running** - the extension needs the backend for AI analysis.

### Step 4: Compile the Extension

Open a **new terminal** (keep the backend running) and run:

```bash
# Compile the extension
npm run compile --workspace=apps/extension
```

Or use watch mode for development:
```bash
# Auto-recompile on changes
npm run watch --workspace=apps/extension
```

### Step 5: Launch the Extension in VS Code

1. Open VS Code in the project root:
   ```bash
   code .
   ```

2. Press `F5` (or `Fn + F5` on some laptops)
   - Alternatively: Click **Run and Debug** in the sidebar → Select **Run Extension** → Click the green play button

3. A new VS Code window will open titled **[Extension Development Host]**
   - This is your testing environment
   - The extension is loaded and ready to use

### Step 6: Test the Extension

In the **Extension Development Host** window:

1. Open a demo file:
   ```
   demo_files/01_index_error.py
   ```

2. Run the AI Tutor command:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: **AI Tutor: Run Current File**
   - Press Enter

3. The AI Tutor sidebar will open with:
   - Error analysis
   - Interactive visualization
   - Step-by-step debugger
   - Progressive hints

---

## Detailed Testing Guide

### Demo Files Available

| File | Error Type | What to Observe |
|------|------------|-----------------|
| `demo_files/01_index_error.py` | IndexError | Array visualization with out-of-bounds index |
| `demo_files/02_none_error.py` | AttributeError | Object structure showing None value |
| `demo_files/03_type_error.py` | TypeError | Type flow diagram showing incompatibility |
| `demo_files/04_recursion_error.py` | RecursionError | Call stack visualization |
| `demo_files/05_key_error.py` | KeyError | Dictionary with missing key highlighted |
| `demo_files/06_division_error.py` | ZeroDivisionError | Arithmetic visualization |

### Testing Each Tab

#### 1. Overview Tab
- Shows error summary and type
- Displays code preview with error line highlighted
- Lists guided debugging steps

#### 2. Debugger Tab
- Click **Play** to auto-step through code
- Click **Step** to advance manually
- Watch variables change in the right panel
- Error line shows in red

#### 3. Visualization Tab
- Dynamic visualization specific to error type
- Animated elements show what went wrong
- Interactive components (hover for details)

#### 4. Hints Tab
- Click **Reveal Nudge** for a gentle hint
- Click **Reveal Guided Help** for more detail
- Click **Reveal Solution** for the full answer
- After viewing hints, a **Challenge** prompt appears

#### 5. Practice Tab
- Complete interactive puzzles
- Difficulty adapts to your performance
- Multiple puzzle types: matching, ordering, fill-in

#### 6. Dashboard Tab
- View student progress (demo data)
- See common struggle areas
- AI-powered recommendations

### Testing Inline Annotations

1. Open any demo file with an error
2. Run **AI Tutor: Run Current File**
3. Look for:
   - **CodeLens** hints above the error line
   - **Gutter icon** (red circle) on the error line
   - **Hover tooltip** when you mouse over the error line

---

## Project Structure

```text
edu-hack/
├── .vscode/                  # VS Code debug configuration
├── apps/
│   ├── extension/            # VS Code extension
│   │   ├── src/
│   │   │   ├── extension.ts          # Entry point
│   │   │   ├── commands/             # Command handlers
│   │   │   ├── core/                 # Core utilities
│   │   │   ├── providers/            # CodeLens, Hover providers
│   │   │   ├── ui/                   # Panel management
│   │   │   └── webview/              # React UI
│   │   │       ├── App.tsx           # Main app component
│   │   │       ├── components/       # UI components
│   │   │       ├── visualization/    # Dynamic visualizations
│   │   │       └── styles/           # Theme system
│   │   └── package.json
│   │
│   └── backend/              # AI analysis server
│       ├── src/
│       │   ├── index.ts              # Express server
│       │   ├── routes/               # API endpoints
│       │   ├── agents/               # LangGraph orchestration
│       │   ├── analysis/             # Language analyzers
│       │   └── parser/               # Tree-sitter AST
│       └── package.json
│
├── demo_files/               # Test files for demo
├── docs/                     # Documentation
│   └── architecture.svg      # Architecture diagram
├── ARCHITECTURE.md           # Detailed architecture docs
├── DEMO_SCRIPT.md           # Demo video script
├── DEMO_CHEATSHEET.md       # Quick reference for demos
└── package.json             # Root workspace config
```

---

## Available Commands

### From Repository Root

```bash
# Install all dependencies
npm install

# Compile extension
npm run compile --workspace=apps/extension

# Watch mode (auto-recompile)
npm run watch --workspace=apps/extension

# Start backend server
npm run dev --workspace=apps/backend

# Type-check backend
npm run check-types --workspace=apps/backend
```

### In VS Code (Extension Development Host)

| Command | Shortcut | Description |
|---------|----------|-------------|
| AI Tutor: Run Current File | - | Analyze the active file |
| Developer: Reload Window | `Cmd+R` | Reload after code changes |

---

## Troubleshooting

### Extension Not Loading

```bash
# Ensure extension is compiled
npm run compile --workspace=apps/extension

# Then press F5 to launch
```

### Backend Not Responding

```bash
# Check if backend is running
curl http://localhost:3001/health

# If not running, start it
npm run dev --workspace=apps/backend
```

### "No visualization data" Message

- Ensure the backend is running on port 3001
- Check the backend terminal for errors
- Try reloading the Extension Development Host window

### Python Not Found

1. Open VS Code Settings
2. Search for `hackyayAiTutor.pythonPath`
3. Set to your Python path (e.g., `python3`, `/usr/bin/python3`)

### Command Not Appearing

- Make sure you're in the **Extension Development Host** window (not the main editor)
- Run `Developer: Reload Window`
- Search for "AI Tutor" in the command palette

### F5 Not Working

1. Try `Fn + F5` (laptop keyboards)
2. Or use **Run and Debug** sidebar → **Run Extension** → Green play button

---

## Development Workflow

### Making Changes

1. Edit source files in `apps/extension/src/` or `apps/backend/src/`

2. If using watch mode, changes compile automatically:
   ```bash
   npm run watch --workspace=apps/extension
   ```

3. In Extension Development Host, reload:
   - Press `Cmd+R` (Mac) or `Ctrl+R` (Windows)
   - Or run `Developer: Reload Window`

4. Test your changes

### Adding New Visualizations

1. Create component in `apps/extension/src/webview/visualization/components/dynamic/`
2. Add type to `apps/backend/src/analysis/types.ts`
3. Update analyzer in `apps/backend/src/analysis/pythonAnalyzer.ts`
4. Register in `DynamicVisualization.tsx`

---

## Environment Variables

Create `.env` file in `apps/backend/`:

```env
OPENAI_API_KEY=your-api-key-here
PORT=3001
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Extension | TypeScript, VS Code API |
| UI | React 19, Framer Motion, @xyflow/react |
| Backend | Node.js, Express, LangGraph |
| AI | OpenAI GPT-4o, Codex |
| Parsing | Tree-sitter |

---

## How AI is Used

CodeMorph AI leverages **OpenAI's GPT-4o** and **Codex** models throughout the analysis pipeline:

### LangGraph Agent Orchestration

The backend uses **LangGraph** to orchestrate multiple AI agents in a directed graph:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Parse Error │ ──▶ │ Code Analysis│ ──▶ │Concept Mapper│ ──▶ │  Hint Gen   │
│    Node     │     │    Node     │     │    Node     │     │    Node     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### AI Model Usage by Feature

| Feature | Model | How It's Used |
|---------|-------|---------------|
| **Error Analysis** | GPT-4o | Analyzes stack traces and identifies root cause of errors |
| **Code Understanding** | Codex | Parses code structure, identifies variables, and tracks data flow |
| **Concept Identification** | GPT-4o | Maps errors to CS concepts (e.g., "array indexing", "recursion") |
| **Hint Generation** | GPT-4o | Creates 3-level progressive hints tailored to the specific error |
| **Analogy Creation** | GPT-4o | Generates real-world analogies to explain abstract concepts |
| **Quiz Generation** | GPT-4o | Creates comprehension questions based on the error context |
| **Misconception Detection** | GPT-4o | Identifies common student misconceptions related to the error |

### Detailed AI Pipeline

#### 1. Error Parsing Node
```
Input: Raw stderr output, stack trace
Model: Pattern matching + GPT-4o fallback
Output: Structured error object (type, line, message)
```

#### 2. Code Analysis Node (Codex-Powered)
```
Input: Source code + error location
Model: Codex for code understanding
Process:
  - AST parsing via Tree-sitter
  - Variable tracking and scope analysis
  - Data flow analysis to error point
  - Memory model construction
Output: CodeAnalysisResult with visualization data
```

#### 3. Concept Mapper Node
```
Input: Error type + code context
Model: GPT-4o
Prompt: "Given this {error_type} in the context of {code_snippet},
         identify the CS concept being tested and common misconceptions."
Output:
  - concept: "array_indexing" | "recursion" | "null_reference" | etc.
  - difficulty: "beginner" | "intermediate" | "advanced"
  - misconception: "Students often forget arrays are 0-indexed"
  - learning_objectives: ["Understand array bounds", "Use len() before access"]
```

#### 4. Hint Generation Node
```
Input: Error + concept + code
Model: GPT-4o
Prompt: "Generate 3 progressive hints for this {error_type}:
         Level 1 (Nudge): A gentle push without giving away the answer
         Level 2 (Guided): More specific guidance with examples
         Level 3 (Solution): Full explanation with corrected code"
Output: Array of 3 hints with increasing detail
```

### Example AI Interaction

When a student runs code with an `IndexError`:

```python
# Student's buggy code
numbers = [1, 2, 3]
print(numbers[5])  # IndexError!
```

**GPT-4o Analysis Response:**
```json
{
  "concept": "array_indexing",
  "difficulty": "beginner",
  "root_cause": "Accessing index 5 in a list of length 3",
  "misconception": "Student may not understand 0-based indexing or forgot to check bounds",
  "hints": [
    {
      "level": "nudge",
      "content": "Think about how many elements are in your list and what indices are valid."
    },
    {
      "level": "guided",
      "content": "Your list has 3 elements. In Python, indices start at 0, so valid indices are 0, 1, and 2. You're trying to access index 5."
    },
    {
      "level": "solution",
      "content": "Add a bounds check: if index < len(numbers): print(numbers[index])"
    }
  ],
  "analogy": "Imagine a bookshelf with 3 books. You can't grab the 6th book - it doesn't exist!"
}
```

### API Configuration

```env
# apps/backend/.env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o          # Primary model for analysis
OPENAI_CODEX_MODEL=code-davinci-002  # For code understanding (if available)
```

### Cost Optimization

- **Caching**: Responses are cached by error signature to avoid redundant API calls
- **Streaming**: Hints stream to UI for faster perceived response
- **Fallbacks**: Local pattern matching handles common errors without API calls
- **Token Limits**: Prompts are optimized to minimize token usage

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly with demo files
5. Submit a pull request

---

## License

MIT License - See LICENSE file for details
