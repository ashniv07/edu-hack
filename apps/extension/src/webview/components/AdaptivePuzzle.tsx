import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

/**
 * AdaptivePuzzle - Skill-based interactive puzzle system
 *
 * Features:
 * - Dynamically adjusts difficulty based on performance
 * - Multiple puzzle types: matching, ordering, fill-in
 * - Tracks progress and skill levels
 * - Provides targeted practice for weak areas
 */

interface AdaptivePuzzleProps {
  concept: string;
  errorType: string;
  codeContext?: string;
  onComplete: (result: PuzzleResult) => void;
  initialSkillLevel?: SkillLevel;
}

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
type PuzzleType = 'matching' | 'ordering' | 'fill-in' | 'drag-drop';

interface PuzzleResult {
  success: boolean;
  attempts: number;
  timeSpent: number;
  newSkillLevel: SkillLevel;
  conceptMastery: number;
}

interface PuzzleItem {
  id: string;
  content: string;
  type?: 'code' | 'text' | 'description';
}

interface PuzzlePair {
  left: PuzzleItem;
  right: PuzzleItem;
}

export const AdaptivePuzzle: React.FC<AdaptivePuzzleProps> = ({
  concept,
  errorType,
  codeContext,
  onComplete,
  initialSkillLevel = 'beginner',
}) => {
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(initialSkillLevel);
  const [puzzleType, setPuzzleType] = useState<PuzzleType>('matching');
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Get puzzle based on concept and skill level
  const puzzle = getPuzzleForConcept(concept, errorType, skillLevel);

  const handlePuzzleComplete = useCallback((success: boolean) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const newAttempts = attempts + 1;

    // Adjust skill level based on performance
    let newSkillLevel = skillLevel;
    if (success && newAttempts === 1 && timeSpent < 30) {
      // Quick and correct - increase difficulty
      if (skillLevel === 'beginner') newSkillLevel = 'intermediate';
      else if (skillLevel === 'intermediate') newSkillLevel = 'advanced';
    } else if (!success && newAttempts >= 3) {
      // Struggling - decrease difficulty
      if (skillLevel === 'advanced') newSkillLevel = 'intermediate';
      else if (skillLevel === 'intermediate') newSkillLevel = 'beginner';
    }

    // Calculate concept mastery (0-100)
    const baseScore = success ? 70 : 30;
    const attemptPenalty = Math.min(newAttempts - 1, 3) * 10;
    const timePenalty = timeSpent > 60 ? 10 : 0;
    const conceptMastery = Math.max(0, baseScore - attemptPenalty - timePenalty);

    setSkillLevel(newSkillLevel);
    setIsComplete(true);

    onComplete({
      success,
      attempts: newAttempts,
      timeSpent,
      newSkillLevel,
      conceptMastery,
    });
  }, [attempts, skillLevel, startTime, onComplete]);

  // Render different puzzle types
  const renderPuzzle = () => {
    switch (puzzle.type) {
      case 'matching':
        return (
          <MatchingPuzzle
            pairs={puzzle.pairs!}
            onComplete={handlePuzzleComplete}
            onAttempt={() => setAttempts(a => a + 1)}
            setFeedback={setFeedback}
          />
        );
      case 'ordering':
        return (
          <OrderingPuzzle
            items={puzzle.items!}
            correctOrder={puzzle.correctOrder!}
            onComplete={handlePuzzleComplete}
            onAttempt={() => setAttempts(a => a + 1)}
            setFeedback={setFeedback}
          />
        );
      case 'fill-in':
        return (
          <FillInPuzzle
            codeTemplate={puzzle.codeTemplate!}
            blanks={puzzle.blanks!}
            correctAnswers={puzzle.correctAnswers!}
            onComplete={handlePuzzleComplete}
            onAttempt={() => setAttempts(a => a + 1)}
            setFeedback={setFeedback}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.levelBadge}>
          <span style={styles.levelIcon}>
            {skillLevel === 'beginner' ? '🌱' : skillLevel === 'intermediate' ? '🌿' : '🌳'}
          </span>
          <span style={styles.levelText}>{skillLevel}</span>
        </div>
        <h3 style={styles.title}>Practice: {concept}</h3>
        <div style={styles.stats}>
          <span style={styles.attemptBadge}>Attempt {attempts + 1}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.puzzleContainer}
          >
            <p style={styles.instructions}>{puzzle.instructions}</p>
            {renderPuzzle()}
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.completeContainer}
          >
            <span style={styles.completeIcon}>✅</span>
            <p style={styles.completeText}>Puzzle complete!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.feedbackBox}
        >
          {feedback}
        </motion.div>
      )}
    </div>
  );
};

// Matching Puzzle Component
interface MatchingPuzzleProps {
  pairs: PuzzlePair[];
  onComplete: (success: boolean) => void;
  onAttempt: () => void;
  setFeedback: (feedback: string | null) => void;
}

const MatchingPuzzle: React.FC<MatchingPuzzleProps> = ({
  pairs,
  onComplete,
  onAttempt,
  setFeedback,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [wrongMatches, setWrongMatches] = useState<string[]>([]);

  const shuffledRight = React.useMemo(
    () => [...pairs].sort(() => Math.random() - 0.5).map(p => p.right),
    [pairs]
  );

  const handleLeftClick = (id: string) => {
    if (matches[id]) return; // Already matched
    setSelectedLeft(id);
    setFeedback(null);
  };

  const handleRightClick = (rightId: string) => {
    if (!selectedLeft) {
      setFeedback('Select an item from the left side first');
      return;
    }

    onAttempt();

    // Find the correct pair
    const correctPair = pairs.find(p => p.left.id === selectedLeft);
    const isCorrect = correctPair?.right.id === rightId;

    if (isCorrect) {
      const newMatches = { ...matches, [selectedLeft]: rightId };
      setMatches(newMatches);
      setSelectedLeft(null);
      setFeedback('Correct! ✓');

      // Check if puzzle is complete
      if (Object.keys(newMatches).length === pairs.length) {
        setTimeout(() => onComplete(true), 500);
      }
    } else {
      setWrongMatches([...wrongMatches, selectedLeft]);
      setSelectedLeft(null);
      setFeedback('Not quite - try again!');

      // Reset wrong match highlight
      setTimeout(() => {
        setWrongMatches(w => w.filter(id => id !== selectedLeft));
      }, 1000);
    }
  };

  return (
    <div style={styles.matchingContainer}>
      <div style={styles.matchColumn}>
        <div style={styles.columnLabel}>Concept</div>
        {pairs.map(pair => (
          <motion.div
            key={pair.left.id}
            onClick={() => handleLeftClick(pair.left.id)}
            style={{
              ...styles.matchItem,
              ...(selectedLeft === pair.left.id ? styles.selectedItem : {}),
              ...(matches[pair.left.id] ? styles.matchedItem : {}),
              ...(wrongMatches.includes(pair.left.id) ? styles.wrongItem : {}),
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {pair.left.content}
            {matches[pair.left.id] && <span style={styles.checkmark}>✓</span>}
          </motion.div>
        ))}
      </div>

      <div style={styles.matchArrow}>→</div>

      <div style={styles.matchColumn}>
        <div style={styles.columnLabel}>Definition</div>
        {shuffledRight.map(item => {
          const isMatched = Object.values(matches).includes(item.id);
          return (
            <motion.div
              key={item.id}
              onClick={() => handleRightClick(item.id)}
              style={{
                ...styles.matchItem,
                ...(isMatched ? styles.matchedItem : {}),
              }}
              whileHover={!isMatched ? { scale: 1.02 } : {}}
              whileTap={!isMatched ? { scale: 0.98 } : {}}
            >
              {item.content}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Ordering Puzzle Component
interface OrderingPuzzleProps {
  items: PuzzleItem[];
  correctOrder: string[];
  onComplete: (success: boolean) => void;
  onAttempt: () => void;
  setFeedback: (feedback: string | null) => void;
}

const OrderingPuzzle: React.FC<OrderingPuzzleProps> = ({
  items,
  correctOrder,
  onComplete,
  onAttempt,
  setFeedback,
}) => {
  const [order, setOrder] = useState<PuzzleItem[]>(
    () => [...items].sort(() => Math.random() - 0.5)
  );

  const handleCheckOrder = () => {
    onAttempt();
    const currentOrder = order.map(item => item.id);
    const isCorrect = currentOrder.every((id, index) => id === correctOrder[index]);

    if (isCorrect) {
      setFeedback('Perfect order! ✓');
      onComplete(true);
    } else {
      setFeedback('Not quite right - try rearranging the steps');
    }
  };

  return (
    <div style={styles.orderingContainer}>
      <p style={styles.orderingHint}>Drag to reorder the steps:</p>
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={setOrder}
        style={styles.reorderGroup}
      >
        {order.map((item, index) => (
          <Reorder.Item key={item.id} value={item} style={styles.reorderItem}>
            <span style={styles.orderNumber}>{index + 1}</span>
            <span style={styles.orderContent}>{item.content}</span>
            <span style={styles.dragHandle}>⋮⋮</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <button style={styles.checkButton} onClick={handleCheckOrder}>
        Check Order
      </button>
    </div>
  );
};

// Fill-in Puzzle Component
interface FillInPuzzleProps {
  codeTemplate: string;
  blanks: { id: string; position: number }[];
  correctAnswers: Record<string, string[]>;
  onComplete: (success: boolean) => void;
  onAttempt: () => void;
  setFeedback: (feedback: string | null) => void;
}

const FillInPuzzle: React.FC<FillInPuzzleProps> = ({
  codeTemplate,
  blanks,
  correctAnswers,
  onComplete,
  onAttempt,
  setFeedback,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleInputChange = (blankId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const handleCheck = () => {
    onAttempt();

    let allCorrect = true;
    for (const blank of blanks) {
      const userAnswer = (answers[blank.id] || '').trim().toLowerCase();
      const validAnswers = correctAnswers[blank.id]?.map(a => a.toLowerCase()) || [];
      if (!validAnswers.includes(userAnswer)) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setFeedback('All correct! ✓');
      onComplete(true);
    } else {
      setFeedback('Some answers need fixing - check your inputs');
    }
  };

  // Render code with input blanks
  const renderCodeWithBlanks = () => {
    let code = codeTemplate;
    blanks.forEach(blank => {
      const input = `__BLANK_${blank.id}__`;
      code = code.replace(`{${blank.id}}`, input);
    });

    const parts = code.split(/__BLANK_(.+?)__/);

    return (
      <pre style={styles.codeBlock}>
        {parts.map((part, index) => {
          const blank = blanks.find(b => b.id === part);
          if (blank) {
            return (
              <input
                key={index}
                type="text"
                value={answers[blank.id] || ''}
                onChange={(e) => handleInputChange(blank.id, e.target.value)}
                style={styles.blankInput}
                placeholder="___"
              />
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </pre>
    );
  };

  return (
    <div style={styles.fillInContainer}>
      <p style={styles.fillInHint}>Fill in the blanks to fix the code:</p>
      {renderCodeWithBlanks()}
      <button style={styles.checkButton} onClick={handleCheck}>
        Check Answers
      </button>
    </div>
  );
};

// Puzzle generator based on concept and skill level
interface PuzzleDefinition {
  type: PuzzleType;
  instructions: string;
  pairs?: PuzzlePair[];
  items?: PuzzleItem[];
  correctOrder?: string[];
  codeTemplate?: string;
  blanks?: { id: string; position: number }[];
  correctAnswers?: Record<string, string[]>;
}

function getPuzzleForConcept(
  concept: string,
  errorType: string,
  skillLevel: SkillLevel
): PuzzleDefinition {
  const puzzles: Record<string, Record<SkillLevel, PuzzleDefinition>> = {
    IndexError: {
      beginner: {
        type: 'matching',
        instructions: 'Match each list operation with its result:',
        pairs: [
          { left: { id: 'l1', content: 'my_list = [1, 2, 3]' }, right: { id: 'r1', content: 'Creates list with 3 elements' } },
          { left: { id: 'l2', content: 'my_list[0]' }, right: { id: 'r2', content: 'Gets first element (1)' } },
          { left: { id: 'l3', content: 'my_list[3]' }, right: { id: 'r3', content: 'IndexError! Out of bounds' } },
          { left: { id: 'l4', content: 'len(my_list)' }, right: { id: 'r4', content: 'Returns 3' } },
        ],
      },
      intermediate: {
        type: 'ordering',
        instructions: 'Order these steps to safely access a list element:',
        items: [
          { id: 'step1', content: 'Get the desired index' },
          { id: 'step2', content: 'Check if index < len(list)' },
          { id: 'step3', content: 'Check if index >= 0' },
          { id: 'step4', content: 'Access the element' },
        ],
        correctOrder: ['step1', 'step3', 'step2', 'step4'],
      },
      advanced: {
        type: 'fill-in',
        instructions: 'Complete the code to safely access the list:',
        codeTemplate: `def safe_get(my_list, index):
    if index {check1} 0 and index {check2} len(my_list):
        return my_list[index]
    return None`,
        blanks: [
          { id: 'check1', position: 0 },
          { id: 'check2', position: 1 },
        ],
        correctAnswers: {
          check1: ['>=', '>= 0'],
          check2: ['<', '< len'],
        },
      },
    },
    KeyError: {
      beginner: {
        type: 'matching',
        instructions: 'Match each dictionary operation with its behavior:',
        pairs: [
          { left: { id: 'l1', content: 'dict["key"]' }, right: { id: 'r1', content: 'Raises KeyError if missing' } },
          { left: { id: 'l2', content: 'dict.get("key")' }, right: { id: 'r2', content: 'Returns None if missing' } },
          { left: { id: 'l3', content: '"key" in dict' }, right: { id: 'r3', content: 'Checks if key exists' } },
          { left: { id: 'l4', content: 'dict.keys()' }, right: { id: 'r4', content: 'Returns all keys' } },
        ],
      },
      intermediate: {
        type: 'fill-in',
        instructions: 'Fix the code to safely access the dictionary:',
        codeTemplate: `student = {"name": "Alice", "grade": 95}

# Safe way 1: Use get()
score = student.{method}("score", 0)

# Safe way 2: Check first
if "score" {operator} student:
    score = student["score"]`,
        blanks: [
          { id: 'method', position: 0 },
          { id: 'operator', position: 1 },
        ],
        correctAnswers: {
          method: ['get'],
          operator: ['in'],
        },
      },
      advanced: {
        type: 'ordering',
        instructions: 'Order these approaches from safest to most risky:',
        items: [
          { id: 'a1', content: 'dict.get(key, default_value)' },
          { id: 'a2', content: 'if key in dict: dict[key]' },
          { id: 'a3', content: 'try: dict[key] except KeyError' },
          { id: 'a4', content: 'dict[key] (direct access)' },
        ],
        correctOrder: ['a1', 'a2', 'a3', 'a4'],
      },
    },
    RecursionError: {
      beginner: {
        type: 'matching',
        instructions: 'Match recursion concepts:',
        pairs: [
          { left: { id: 'l1', content: 'Base case' }, right: { id: 'r1', content: 'Stops the recursion' } },
          { left: { id: 'l2', content: 'Recursive case' }, right: { id: 'r2', content: 'Calls itself with smaller input' } },
          { left: { id: 'l3', content: 'Stack overflow' }, right: { id: 'r3', content: 'Too many nested calls' } },
          { left: { id: 'l4', content: 'Termination' }, right: { id: 'r4', content: 'When recursion ends' } },
        ],
      },
      intermediate: {
        type: 'fill-in',
        instructions: 'Add the missing base case:',
        codeTemplate: `def countdown(n):
    # Base case - stop when n reaches 0
    if n {comparison} 0:
        {action}
    print(n)
    countdown(n - 1)`,
        blanks: [
          { id: 'comparison', position: 0 },
          { id: 'action', position: 1 },
        ],
        correctAnswers: {
          comparison: ['<=', '< 1', '== 0'],
          action: ['return', 'return None'],
        },
      },
      advanced: {
        type: 'ordering',
        instructions: 'Order the execution of factorial(3):',
        items: [
          { id: 's1', content: 'factorial(3) calls factorial(2)' },
          { id: 's2', content: 'factorial(2) calls factorial(1)' },
          { id: 's3', content: 'factorial(1) returns 1 (base case)' },
          { id: 's4', content: 'factorial(2) returns 2 * 1 = 2' },
          { id: 's5', content: 'factorial(3) returns 3 * 2 = 6' },
        ],
        correctOrder: ['s1', 's2', 's3', 's4', 's5'],
      },
    },
  };

  // Get puzzle for the concept or return a default
  const conceptPuzzles = puzzles[errorType];
  if (conceptPuzzles) {
    return conceptPuzzles[skillLevel];
  }

  // Default puzzle
  return {
    type: 'matching',
    instructions: 'Match the concepts:',
    pairs: [
      { left: { id: 'l1', content: 'Error' }, right: { id: 'r1', content: 'Something went wrong' } },
      { left: { id: 'l2', content: 'Debug' }, right: { id: 'r2', content: 'Find and fix issues' } },
      { left: { id: 'l3', content: 'Fix' }, right: { id: 'r3', content: 'Solve the problem' } },
    ],
  };
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(99, 102, 241, 0.2)',
    padding: '6px 12px',
    borderRadius: '16px',
  },
  levelIcon: {
    fontSize: '16px',
  },
  levelText: {
    color: '#a5b4fc',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  title: {
    color: '#e2e8f0',
    margin: 0,
    flex: 1,
    fontSize: '16px',
  },
  stats: {
    display: 'flex',
    gap: '8px',
  },
  attemptBadge: {
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 500,
  },
  puzzleContainer: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  instructions: {
    color: '#94a3b8',
    marginBottom: '16px',
    fontSize: '14px',
  },
  completeContainer: {
    background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  completeIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '12px',
  },
  completeText: {
    color: '#34d399',
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  },
  feedbackBox: {
    marginTop: '12px',
    padding: '10px 16px',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    textAlign: 'center',
  },
  matchingContainer: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  matchColumn: {
    flex: 1,
  },
  columnLabel: {
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: '8px',
    paddingLeft: '8px',
  },
  matchItem: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '8px',
    color: '#e2e8f0',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedItem: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.2)',
    boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.3)',
  },
  matchedItem: {
    borderColor: '#10b981',
    background: 'rgba(16, 185, 129, 0.15)',
    cursor: 'default',
  },
  wrongItem: {
    borderColor: '#ef4444',
    background: 'rgba(239, 68, 68, 0.15)',
    animation: 'shake 0.3s',
  },
  checkmark: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  matchArrow: {
    color: '#64748b',
    fontSize: '20px',
    paddingTop: '40px',
  },
  orderingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  orderingHint: {
    color: '#64748b',
    fontSize: '12px',
    margin: 0,
  },
  reorderGroup: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  reorderItem: {
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '8px',
    color: '#e2e8f0',
    fontSize: '13px',
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  orderNumber: {
    background: '#6366f1',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
  },
  orderContent: {
    flex: 1,
  },
  dragHandle: {
    color: '#64748b',
    cursor: 'grab',
  },
  checkButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'center',
    marginTop: '8px',
  },
  fillInContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  fillInHint: {
    color: '#64748b',
    fontSize: '12px',
    margin: 0,
  },
  codeBlock: {
    background: '#0f172a',
    borderRadius: '8px',
    padding: '16px',
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontSize: '13px',
    lineHeight: 1.6,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
  },
  blankInput: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid #6366f1',
    borderRadius: '4px',
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontSize: '13px',
    padding: '2px 8px',
    width: '80px',
    outline: 'none',
  },
};

export default AdaptivePuzzle;
