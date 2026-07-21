# CodeMorph AI - System Architecture

> Visual diagram available at: `docs/architecture.svg`

## Implemented Features

### Core Features
- [x] **Dynamic Visualizations** - 7 error-type-specific visualizations
- [x] **Step-by-Step Debugger** - Interactive code walkthrough with variable tracking
- [x] **Progressive Hints** - 3-level hint system (Nudge → Guided → Solution)
- [x] **Code Preview** - Syntax-highlighted code with error line indication
- [x] **Multi-Language Support** - Python and Java file execution

### New Features (Recently Added)
- [x] **Inline Editor Annotations (CodeLens)** - Error hints directly in editor
- [x] **Retry Challenge System** - Interactive challenges after viewing hints
- [x] **Adaptive Puzzles** - Skill-level based puzzle system
- [x] **Educator Dashboard** - Analytics and progress tracking (demo mode)
- [x] **Error Decorations** - Gutter icons and line highlighting
- [x] **Hover Hints** - Quick hints on hover over error lines

### Planned Features
- [ ] Sanitizer Integration (ASan, MSan, UBSan)
- [ ] Compiler Integration (GCC, Clang warnings)
- [ ] Real-time Educator Dashboard (connected to classroom)
- [ ] Skill Progression System (persistent tracking)
- [ ] Peer Learning Recommendations

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              VS CODE EXTENSION                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         Extension Host (Node.js)                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │   │
│  │  │  Commands   │  │  File Runner │  │  Diagnostics│  │ WebView Manager │ │   │
│  │  │  Handler    │  │  (Py/Java)  │  │  Provider   │  │                 │ │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │   │
│  │         │                │                │                   │          │   │
│  │         └────────────────┼────────────────┼───────────────────┘          │   │
│  │                          │                │                              │   │
│  │                          ▼                ▼                              │   │
│  │              ┌─────────────────────────────────────┐                     │   │
│  │              │       Tutor Panel Controller        │                     │   │
│  │              │   (Orchestrates Analysis Flow)      │                     │   │
│  │              └─────────────────┬───────────────────┘                     │   │
│  └────────────────────────────────┼─────────────────────────────────────────┘   │
│                                   │                                             │
│  ┌────────────────────────────────┼─────────────────────────────────────────┐   │
│  │                    WebView Panel (React 19)                              │   │
│  │                                ▼                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                        App.tsx                                   │    │   │
│  │  │  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │    │   │
│  │  │  │   Overview   │   Debugger   │Visualization │    Hints     │  │    │   │
│  │  │  │     Tab      │     Tab      │     Tab      │     Tab      │  │    │   │
│  │  │  └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘  │    │   │
│  │  │         │              │              │              │          │    │   │
│  │  │         ▼              ▼              ▼              ▼          │    │   │
│  │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │    │   │
│  │  │  │   Error    │ │   Step     │ │  Dynamic   │ │Progressive │   │    │   │
│  │  │  │  Summary   │ │  Debugger  │ │Visualization││   Hints    │   │    │   │
│  │  │  │   + Code   │ │  + Vars    │ │  Router    │ │  (3-level) │   │    │   │
│  │  │  │  Preview   │ │  Panel     │ │            │ │            │   │    │   │
│  │  │  └────────────┘ └────────────┘ └─────┬──────┘ └────────────┘   │    │   │
│  │  │                                      │                          │    │   │
│  │  │                    ┌─────────────────┼─────────────────┐        │    │   │
│  │  │                    ▼                 ▼                 ▼        │    │   │
│  │  │             ┌────────────┐    ┌────────────┐    ┌────────────┐  │    │   │
│  │  │             │ArrayAccess │    │ CallStack  │    │ObjectStruct│  │    │   │
│  │  │             │DictAccess  │    │ TypeFlow   │    │ Arithmetic │  │    │   │
│  │  │             │ScopeChain  │    │MemoryLayout│    │   + More   │  │    │   │
│  │  │             └────────────┘    └────────────┘    └────────────┘  │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP POST /analyze
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND SERVER (Node.js)                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         Express.js API Layer                             │   │
│  │                    POST /analyze  |  GET /health                         │   │
│  └─────────────────────────────────────┬───────────────────────────────────┘   │
│                                        │                                        │
│  ┌─────────────────────────────────────▼───────────────────────────────────┐   │
│  │                     LangGraph Agent Orchestrator                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                        tutorGraph                                │    │   │
│  │  │                                                                  │    │   │
│  │  │   ┌──────────┐    ┌──────────────┐    ┌───────────────────┐    │    │   │
│  │  │   │  START   │───▶│ Parse Error  │───▶│ Code Analysis     │    │    │   │
│  │  │   │          │    │    Node      │    │     Node          │    │    │   │
│  │  │   └──────────┘    └──────────────┘    └─────────┬─────────┘    │    │   │
│  │  │                                                 │              │    │   │
│  │  │                          ┌──────────────────────┘              │    │   │
│  │  │                          ▼                                     │    │   │
│  │  │   ┌──────────┐    ┌──────────────┐    ┌───────────────────┐    │    │   │
│  │  │   │   END    │◀───│  Hint Gen    │◀───│ Concept Mapper    │    │    │   │
│  │  │   │          │    │    Node      │    │     Node          │    │    │   │
│  │  │   └──────────┘    └──────────────┘    └───────────────────┘    │    │   │
│  │  │                                                                │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                        │
│  ┌─────────────────────────────────────▼───────────────────────────────────┐   │
│  │                         Analysis Engines                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │   │
│  │  │ Python Analyzer │  │  Java Analyzer  │  │   C/C++ Analyzer        │  │   │
│  │  │                 │  │                 │  │   (Tree-sitter AST)     │  │   │
│  │  │ • Stack Trace   │  │ • Stack Trace   │  │ • AST Parsing           │  │   │
│  │  │ • Error Type    │  │ • Error Type    │  │ • Memory Model          │  │   │
│  │  │ • Visualization │  │ • Visualization │  │ • Pointer Analysis      │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                        │
│  ┌─────────────────────────────────────▼───────────────────────────────────┐   │
│  │                    Visualization Generator                               │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │   │
│  │  │  Error Type → Visualization Mapping                                │  │   │
│  │  │                                                                    │  │   │
│  │  │  IndexError      → array_access    (Array with indices)           │  │   │
│  │  │  KeyError        → dict_access     (Dict with keys)               │  │   │
│  │  │  TypeError       → type_flow       (Type mismatch diagram)        │  │   │
│  │  │  RecursionError  → call_stack      (Stack frames)                 │  │   │
│  │  │  NameError       → scope_chain     (Variable scopes)              │  │   │
│  │  │  ZeroDivision    → arithmetic      (Math operation)               │  │   │
│  │  │  AttributeError  → object_structure (None/null reference)         │  │   │
│  │  │  NullPointer     → memory_layout   (Stack + Heap + Pointers)      │  │   │
│  │  └───────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                        │
│  ┌─────────────────────────────────────▼───────────────────────────────────┐   │
│  │                         AI Integration                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │  │                    OpenAI GPT-4 / GPT-4o                         │    │   │
│  │  │                                                                  │    │   │
│  │  │  • Concept Identification                                        │    │   │
│  │  │  • Learning Objectives Generation                                │    │   │
│  │  │  • Progressive Hint Creation                                     │    │   │
│  │  │  • Personalized Explanations                                     │    │   │
│  │  └─────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────────┐
│   User Runs     │
│  Python/Java    │
│     File        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  File Runner    │────▶│   Captures      │
│  (Extension)    │     │  stdout/stderr  │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Error Detected │
                        │  Parse Traceback│
                        └────────┬────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │                                               │
         ▼                                               ▼
┌─────────────────┐                             ┌─────────────────┐
│  ExecutionPayload│                             │  POST /analyze  │
│  {               │────────────────────────────▶│  Backend API    │
│    code,         │                             │                 │
│    output,       │                             └────────┬────────┘
│    error,        │                                      │
│    language      │                                      ▼
│  }               │                             ┌─────────────────┐
└─────────────────┘                             │  LangGraph      │
                                                │  tutorGraph     │
                                                └────────┬────────┘
                                                         │
         ┌───────────────────────────────────────────────┤
         │                   │                           │
         ▼                   ▼                           ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│ parseErrorNode  │ │codeAnalysisNode │ │   conceptMapperNode     │
│                 │ │                 │ │                         │
│ Extract:        │ │ Analyze:        │ │ Identify:               │
│ • Error type    │ │ • Variables     │ │ • Concepts involved     │
│ • Line number   │ │ • Data types    │ │ • Learning objectives   │
│ • Message       │ │ • Call stack    │ │ • Common misconceptions │
└────────┬────────┘ └────────┬────────┘ └───────────┬─────────────┘
         │                   │                       │
         │                   ▼                       │
         │          ┌─────────────────┐              │
         │          │ Visualization   │              │
         │          │ Generator       │              │
         │          │                 │              │
         │          │ Generate:       │              │
         │          │ • Type-specific │              │
         │          │   viz data      │              │
         │          │ • Debugger      │              │
         │          │   steps         │              │
         │          └────────┬────────┘              │
         │                   │                       │
         └───────────────────┼───────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  hintGenNode    │
                    │                 │
                    │ Generate:       │
                    │ • Nudge hint    │
                    │ • Guided hint   │
                    │ • Solution hint │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ TutorResponse   │
                    │ {               │
                    │   insight,      │
                    │   analysis,     │
                    │   visualization,│
                    │   hints,        │
                    │   debugSteps    │
                    │ }               │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   WebView UI    │
                    │   Renders All   │
                    │   Components    │
                    └─────────────────┘
```

---

## Component Architecture

### Extension Layer

```
apps/extension/
├── src/
│   ├── extension.ts              # Entry point, command registration
│   │
│   ├── core/
│   │   ├── types.ts              # FileInfo, ExecutionPayload
│   │   └── pythonRunner.ts       # Execute Python/Java files
│   │
│   ├── utils/
│   │   ├── activeFile.ts         # Get current editor file info
│   │   └── traceback.ts          # Parse error tracebacks
│   │
│   ├── ui/
│   │   ├── tutorPanel.ts         # WebView panel management
│   │   └── buildTutorPanelState.ts
│   │
│   ├── tutor/
│   │   ├── types.ts              # TutorPanelState, TutorInsight
│   │   └── tutorDiagnosticsProvider.ts
│   │
│   └── webview/
│       ├── App.tsx               # Main React app
│       ├── components/
│       │   ├── CodePreview.tsx   # Syntax-highlighted code
│       │   ├── StepDebugger.tsx  # Step-through debugger
│       │   └── ProgressiveHints.tsx
│       │
│       ├── visualization/
│       │   ├── types.ts
│       │   ├── components/
│       │   │   ├── DynamicVisualization.tsx
│       │   │   └── dynamic/
│       │   │       ├── ArrayAccessViz.tsx
│       │   │       ├── DictAccessViz.tsx
│       │   │       ├── TypeFlowViz.tsx
│       │   │       ├── CallStackViz.tsx
│       │   │       ├── ScopeChainViz.tsx
│       │   │       ├── ArithmeticViz.tsx
│       │   │       └── ObjectStructureViz.tsx
│       │   │
│       │   └── layout/
│       │       ├── MemoryLayoutView.tsx
│       │       ├── StackPanel.tsx
│       │       └── HeapPanel.tsx
│       │
│       └── styles/
│           └── theme.ts          # Design system
```

### Backend Layer

```
apps/backend/
├── src/
│   ├── index.ts                  # Express server entry
│   │
│   ├── routes/
│   │   └── analyze.ts            # POST /analyze endpoint
│   │
│   ├── agents/
│   │   ├── tutorGraph.ts         # LangGraph orchestration
│   │   └── nodes/
│   │       ├── parseErrorNode.ts
│   │       ├── codeAnalysisNode.ts
│   │       ├── conceptMapperNode.ts
│   │       └── hintGenNode.ts
│   │
│   ├── analysis/
│   │   ├── types.ts              # DynamicVisualization, MemoryModel
│   │   ├── pythonAnalyzer.ts     # Python-specific analysis
│   │   ├── javaAnalyzer.ts       # Java-specific analysis
│   │   └── cAnalyzer.ts          # C/C++ AST analysis
│   │
│   ├── parser/
│   │   └── treeSitter.ts         # Tree-sitter AST parsing
│   │
│   └── services/
│       └── openai.ts             # AI integration
```

---

## Visualization Type System

```
DynamicVisualization
        │
        ├── type: 'array_access'
        │   └── data: {
        │         elements: [{value, index, isValid}],
        │         accessedIndex: number,
        │         isOutOfBounds: boolean
        │       }
        │
        ├── type: 'dict_access'
        │   └── data: {
        │         entries: [{key, value}],
        │         accessedKey: string,
        │         availableKeys: string[]
        │       }
        │
        ├── type: 'type_flow'
        │   └── data: {
        │         leftType, rightType,
        │         operation, expectedType,
        │         isCompatible: boolean
        │       }
        │
        ├── type: 'call_stack'
        │   └── data: {
        │         frames: [{name, args, depth}],
        │         maxDepth, isOverflow
        │       }
        │
        ├── type: 'scope_chain'
        │   └── data: {
        │         scopes: [{name, level, variables}],
        │         undefinedVariable
        │       }
        │
        ├── type: 'arithmetic'
        │   └── data: {
        │         left, operator, right,
        │         result?, error?
        │       }
        │
        ├── type: 'object_structure'
        │   └── data: {
        │         variableName, currentValue,
        │         attemptedAccess, availableAttributes
        │       }
        │
        └── type: 'memory_layout'
            └── data: MemoryModel {
                  stackVariables: [...],
                  heapVariables: [...],
                  pointers: [...]
                }
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  React 19          │  UI Framework                              │
│  TypeScript        │  Type Safety                               │
│  Framer Motion     │  Animations                                │
│  @xyflow/react     │  Flow Diagrams (Memory Layout)             │
│  VS Code API       │  Extension Integration                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  Node.js           │  Runtime                                   │
│  Express.js        │  HTTP Server                               │
│  LangGraph         │  AI Agent Orchestration                    │
│  Tree-sitter       │  AST Parsing                               │
│  OpenAI GPT-4      │  AI Analysis & Hints                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      BUILD & TOOLS                               │
├─────────────────────────────────────────────────────────────────┤
│  npm workspaces    │  Monorepo Management                       │
│  esbuild           │  Fast Bundling                             │
│  Vitest            │  Testing                                   │
│  ESLint/Prettier   │  Code Quality                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security & Performance

### Content Security Policy (WebView)
```
default-src 'none';
script-src ${webview.cspSource};
style-src ${webview.cspSource} 'unsafe-inline';
img-src ${webview.cspSource} data:;
font-src ${webview.cspSource};
```

### Performance Optimizations
- **Lazy Loading**: Visualization components loaded on-demand
- **Memoization**: React.memo for expensive renders
- **Debouncing**: File change detection debounced
- **Caching**: Analysis results cached per file hash

---

## Future Architecture (Planned)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLANNED ENHANCEMENTS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ Sanitizer       │     │ Compiler        │                    │
│  │ Integration     │     │ Integration     │                    │
│  │ (ASan, MSan)    │     │ (GCC, Clang)    │                    │
│  └────────┬────────┘     └────────┬────────┘                    │
│           │                       │                              │
│           └───────────┬───────────┘                              │
│                       ▼                                          │
│           ┌─────────────────────┐                                │
│           │  Enhanced Error     │                                │
│           │  Detection Layer    │                                │
│           └─────────────────────┘                                │
│                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ Adaptive Puzzle │     │ Inline Editor   │                    │
│  │ System          │     │ Annotations     │                    │
│  │ (Skill-based)   │     │ (CodeLens)      │                    │
│  └─────────────────┘     └─────────────────┘                    │
│                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ Retry After     │     │ Educator        │                    │
│  │ Challenge       │     │ Dashboard       │                    │
│  │ Mechanism       │     │ (Analytics)     │                    │
│  └─────────────────┘     └─────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
