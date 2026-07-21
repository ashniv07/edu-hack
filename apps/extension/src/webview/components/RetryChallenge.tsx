import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RetryChallengeProps {
  errorType: string;
  errorLine: number;
  originalCode: string;
  correctSolution?: string;
  onRetryComplete: (success: boolean, attempts: number) => void;
  onSkip: () => void;
}

interface ChallengeState {
  phase: 'intro' | 'challenge' | 'feedback' | 'success' | 'showSolution';
  attempts: number;
  userAnswer: string;
  feedback: string;
  hintsUsed: number;
}

/**
 * RetryChallenge - Interactive retry mechanism
 *
 * After viewing hints, students are challenged to:
 * 1. Identify the bug themselves
 * 2. Write the fix
 * 3. Explain why it works
 *
 * Reinforces learning through active recall.
 */
export const RetryChallenge: React.FC<RetryChallengeProps> = ({
  errorType,
  errorLine,
  originalCode,
  correctSolution,
  onRetryComplete,
  onSkip,
}) => {
  const [state, setState] = useState<ChallengeState>({
    phase: 'intro',
    attempts: 0,
    userAnswer: '',
    feedback: '',
    hintsUsed: 0,
  });

  const challenges = getChallengesForError(errorType);

  const handleStartChallenge = () => {
    setState(prev => ({ ...prev, phase: 'challenge' }));
  };

  const handleSubmitAnswer = () => {
    const isCorrect = validateAnswer(state.userAnswer, challenges.expectedKeywords);

    setState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      phase: isCorrect ? 'success' : 'feedback',
      feedback: isCorrect
        ? 'Excellent! You understood the concept!'
        : getProgressiveFeedback(prev.attempts + 1, challenges.hints),
    }));

    if (isCorrect) {
      onRetryComplete(true, state.attempts + 1);
    }
  };

  const handleTryAgain = () => {
    setState(prev => ({
      ...prev,
      phase: 'challenge',
      userAnswer: '',
      hintsUsed: prev.hintsUsed + 1,
    }));
  };

  const handleShowSolution = () => {
    setState(prev => ({ ...prev, phase: 'showSolution' }));
    onRetryComplete(false, state.attempts);
  };

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        {state.phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.card}
          >
            <div style={styles.iconContainer}>
              <span style={styles.icon}>🎯</span>
            </div>
            <h2 style={styles.title}>Challenge Time!</h2>
            <p style={styles.description}>
              Now that you've seen the hints, let's test your understanding.
              Can you explain what went wrong and how to fix it?
            </p>
            <div style={styles.challengePreview}>
              <p style={styles.challengeLabel}>Your Challenge:</p>
              <p style={styles.challengeText}>{challenges.question}</p>
            </div>
            <div style={styles.buttonRow}>
              <button style={styles.primaryButton} onClick={handleStartChallenge}>
                Accept Challenge
              </button>
              <button style={styles.secondaryButton} onClick={onSkip}>
                Skip for now
              </button>
            </div>
          </motion.div>
        )}

        {state.phase === 'challenge' && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.card}
          >
            <div style={styles.header}>
              <h3 style={styles.subtitle}>
                Attempt {state.attempts + 1}
                {state.hintsUsed > 0 && (
                  <span style={styles.hintsUsedBadge}>
                    {state.hintsUsed} hint{state.hintsUsed > 1 ? 's' : ''} used
                  </span>
                )}
              </h3>
            </div>

            <div style={styles.questionBox}>
              <p style={styles.question}>{challenges.question}</p>
            </div>

            <div style={styles.codeContext}>
              <p style={styles.codeLabel}>Error on line {errorLine}:</p>
              <pre style={styles.codeSnippet}>
                {originalCode.split('\n')[errorLine - 1]?.trim() || originalCode}
              </pre>
            </div>

            <textarea
              style={styles.answerInput}
              value={state.userAnswer}
              onChange={(e) => setState(prev => ({ ...prev, userAnswer: e.target.value }))}
              placeholder="Type your explanation here..."
              rows={4}
            />

            <div style={styles.buttonRow}>
              <button
                style={styles.primaryButton}
                onClick={handleSubmitAnswer}
                disabled={!state.userAnswer.trim()}
              >
                Submit Answer
              </button>
              <button style={styles.ghostButton} onClick={onSkip}>
                I need more help
              </button>
            </div>
          </motion.div>
        )}

        {state.phase === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={styles.card}
          >
            <div style={styles.feedbackHeader}>
              <span style={styles.feedbackIcon}>🤔</span>
              <h3 style={styles.feedbackTitle}>Not quite right</h3>
            </div>

            <p style={styles.feedbackText}>{state.feedback}</p>

            {state.attempts < 3 && (
              <div style={styles.hintBox}>
                <p style={styles.hintLabel}>💡 Hint:</p>
                <p style={styles.hintText}>
                  {challenges.hints[Math.min(state.attempts - 1, challenges.hints.length - 1)]}
                </p>
              </div>
            )}

            <div style={styles.buttonRow}>
              {state.attempts < 3 ? (
                <>
                  <button style={styles.primaryButton} onClick={handleTryAgain}>
                    Try Again
                  </button>
                  <button style={styles.secondaryButton} onClick={handleShowSolution}>
                    Show Solution
                  </button>
                </>
              ) : (
                <button style={styles.primaryButton} onClick={handleShowSolution}>
                  View Solution
                </button>
              )}
            </div>

            <p style={styles.attemptCount}>
              Attempts: {state.attempts}/3
            </p>
          </motion.div>
        )}

        {state.phase === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ ...styles.card, ...styles.successCard }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              style={styles.successIcon}
            >
              🎉
            </motion.div>
            <h2 style={styles.successTitle}>Great job!</h2>
            <p style={styles.successText}>
              You correctly identified the issue and understood how to fix it.
            </p>

            <div style={styles.statsBox}>
              <div style={styles.stat}>
                <span style={styles.statValue}>{state.attempts}</span>
                <span style={styles.statLabel}>Attempts</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>{state.hintsUsed}</span>
                <span style={styles.statLabel}>Hints Used</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>
                  {state.attempts === 1 ? '⭐⭐⭐' : state.attempts === 2 ? '⭐⭐' : '⭐'}
                </span>
                <span style={styles.statLabel}>Score</span>
              </div>
            </div>

            <div style={styles.keyTakeaway}>
              <p style={styles.takeawayLabel}>Key Takeaway:</p>
              <p style={styles.takeawayText}>{challenges.takeaway}</p>
            </div>
          </motion.div>
        )}

        {state.phase === 'showSolution' && (
          <motion.div
            key="solution"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={styles.card}
          >
            <h3 style={styles.solutionTitle}>📝 Solution</h3>

            <div style={styles.solutionExplanation}>
              <p style={styles.solutionText}>{challenges.explanation}</p>
            </div>

            {correctSolution && (
              <div style={styles.codeBlock}>
                <p style={styles.codeLabel}>Fixed code:</p>
                <pre style={styles.solutionCode}>{correctSolution}</pre>
              </div>
            )}

            <div style={styles.keyTakeaway}>
              <p style={styles.takeawayLabel}>Remember:</p>
              <p style={styles.takeawayText}>{challenges.takeaway}</p>
            </div>

            <p style={styles.encouragement}>
              Don't worry! Learning from mistakes is part of the process.
              You'll get it next time! 💪
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Challenge definitions for each error type
function getChallengesForError(errorType: string): ChallengeDefinition {
  const challenges: Record<string, ChallengeDefinition> = {
    IndexError: {
      question: 'Why did the IndexError occur, and how would you prevent it?',
      expectedKeywords: ['index', 'bounds', 'length', 'range', 'check', 'valid'],
      hints: [
        'Think about what indices are valid for this list',
        'Remember: list indices go from 0 to length-1',
        'Consider checking if the index is within bounds before accessing',
      ],
      explanation:
        'IndexError occurs when you try to access an element at an index that doesn\'t exist. ' +
        'Arrays/lists are 0-indexed, so a list of length 3 has valid indices 0, 1, and 2.',
      takeaway: 'Always verify that your index is less than the length of the list.',
    },
    KeyError: {
      question: 'What caused the KeyError and how can you safely access dictionary values?',
      expectedKeywords: ['key', 'dictionary', 'exist', 'get', 'check', 'in'],
      hints: [
        'The key you used doesn\'t exist in the dictionary',
        'Think about using .get() or checking with "in" first',
        'Consider: what happens if you access a key that isn\'t there?',
      ],
      explanation:
        'KeyError happens when you try to access a dictionary key that doesn\'t exist. ' +
        'Use dict.get(key) for safe access (returns None if missing) or check with "if key in dict".',
      takeaway: 'Use .get() method or check key existence before accessing dictionary values.',
    },
    TypeError: {
      question: 'Why did the TypeError occur and what types were involved?',
      expectedKeywords: ['type', 'string', 'int', 'convert', 'incompatible', 'operation'],
      hints: [
        'Think about the types of the values involved',
        'Can you perform this operation between these types?',
        'Consider converting types before the operation',
      ],
      explanation:
        'TypeError occurs when you try to perform an operation on incompatible types, ' +
        'like adding a string to an integer. Convert types explicitly using str(), int(), etc.',
      takeaway: 'Ensure operands have compatible types before performing operations.',
    },
    RecursionError: {
      question: 'What causes infinite recursion and how do you stop it?',
      expectedKeywords: ['base', 'case', 'stop', 'condition', 'return', 'infinite'],
      hints: [
        'A recursive function needs a way to stop calling itself',
        'Think about when the function should NOT make another recursive call',
        'This is called a "base case" - the condition that ends recursion',
      ],
      explanation:
        'RecursionError happens when a function calls itself indefinitely. ' +
        'Every recursive function needs a base case - a condition that returns without making another recursive call.',
      takeaway: 'Always define a base case that stops the recursion.',
    },
    NameError: {
      question: 'Why wasn\'t the variable recognized and how do you fix it?',
      expectedKeywords: ['define', 'declare', 'scope', 'typo', 'before', 'assignment'],
      hints: [
        'The variable name wasn\'t found - why might that be?',
        'Consider: was it defined before being used?',
        'Check for typos in variable names',
      ],
      explanation:
        'NameError occurs when you use a variable that hasn\'t been defined yet. ' +
        'Make sure variables are assigned before use and check for typos.',
      takeaway: 'Define variables before using them and double-check spelling.',
    },
    ZeroDivisionError: {
      question: 'What caused division by zero and how do you prevent it?',
      expectedKeywords: ['zero', 'divide', 'check', 'divisor', 'condition', 'before'],
      hints: [
        'You can\'t divide any number by zero',
        'Think about checking the divisor before dividing',
        'What if the input that causes the division is zero?',
      ],
      explanation:
        'ZeroDivisionError occurs when you try to divide by zero. ' +
        'Always check if the divisor is zero before performing division.',
      takeaway: 'Check if the divisor is zero before dividing.',
    },
    AttributeError: {
      question: 'Why did the AttributeError occur and how do you handle None values?',
      expectedKeywords: ['none', 'null', 'attribute', 'check', 'object', 'method'],
      hints: [
        'The object might be None instead of the expected type',
        'Think about what happens when you call a method on None',
        'Consider checking if the object is not None first',
      ],
      explanation:
        'AttributeError often occurs when you try to access an attribute or method on None. ' +
        'This happens when a function returns None or a variable wasn\'t properly initialized.',
      takeaway: 'Check if an object is not None before accessing its attributes.',
    },
  };

  return (
    challenges[errorType] || {
      question: 'What caused this error and how would you fix it?',
      expectedKeywords: ['fix', 'error', 'cause', 'solution'],
      hints: [
        'Think about what the error message is telling you',
        'Look at the line where the error occurred',
        'Consider what value or condition caused the issue',
      ],
      explanation: 'Review the error message carefully - it usually tells you exactly what went wrong.',
      takeaway: 'Read error messages carefully - they contain valuable debugging information.',
    }
  );
}

function validateAnswer(answer: string, expectedKeywords: string[]): boolean {
  const lowerAnswer = answer.toLowerCase();
  const matchedKeywords = expectedKeywords.filter(keyword =>
    lowerAnswer.includes(keyword.toLowerCase())
  );
  // Consider correct if at least 2 keywords are mentioned
  return matchedKeywords.length >= 2 && answer.length > 20;
}

function getProgressiveFeedback(attempt: number, hints: string[]): string {
  if (attempt === 1) {
    return 'Good try! Think more specifically about what went wrong with the data/types involved.';
  } else if (attempt === 2) {
    return 'Getting closer! Focus on the specific condition or check that was missing.';
  }
  return 'You\'ve made a good effort. Let\'s look at the solution together.';
}

interface ChallengeDefinition {
  question: string;
  expectedKeywords: string[];
  hints: string[];
  explanation: string;
  takeaway: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
  },
  card: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  successCard: {
    background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  iconContainer: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  icon: {
    fontSize: '48px',
  },
  title: {
    color: '#f1f5f9',
    fontSize: '24px',
    fontWeight: 700,
    textAlign: 'center',
    margin: '0 0 12px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: '16px',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  description: {
    color: '#94a3b8',
    textAlign: 'center',
    margin: '0 0 20px 0',
    lineHeight: 1.6,
  },
  challengePreview: {
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  challengeLabel: {
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: 600,
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
  },
  challengeText: {
    color: '#e2e8f0',
    margin: 0,
    fontSize: '15px',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  secondaryButton: {
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#818cf8',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  ghostButton: {
    background: 'transparent',
    color: '#64748b',
    border: 'none',
    padding: '12px 24px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  header: {
    marginBottom: '16px',
  },
  hintsUsedBadge: {
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 500,
  },
  questionBox: {
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  question: {
    color: '#e2e8f0',
    margin: 0,
    fontSize: '15px',
    fontWeight: 500,
  },
  codeContext: {
    marginBottom: '16px',
  },
  codeLabel: {
    color: '#64748b',
    fontSize: '12px',
    margin: '0 0 8px 0',
  },
  codeSnippet: {
    background: '#0f172a',
    borderRadius: '6px',
    padding: '12px',
    color: '#f87171',
    fontFamily: 'monospace',
    fontSize: '13px',
    margin: 0,
    overflow: 'auto',
  },
  answerInput: {
    width: '100%',
    background: '#0f172a',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    color: '#e2e8f0',
    fontFamily: 'inherit',
    fontSize: '14px',
    resize: 'vertical',
    marginBottom: '16px',
    outline: 'none',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  feedbackIcon: {
    fontSize: '32px',
  },
  feedbackTitle: {
    color: '#fbbf24',
    margin: 0,
  },
  feedbackText: {
    color: '#94a3b8',
    marginBottom: '16px',
  },
  hintBox: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    borderLeft: '3px solid #f59e0b',
  },
  hintLabel: {
    color: '#fbbf24',
    fontWeight: 600,
    margin: '0 0 4px 0',
    fontSize: '13px',
  },
  hintText: {
    color: '#e2e8f0',
    margin: 0,
    fontSize: '14px',
  },
  attemptCount: {
    color: '#64748b',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '12px',
  },
  successIcon: {
    fontSize: '64px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  successTitle: {
    color: '#34d399',
    textAlign: 'center',
    margin: '0 0 8px 0',
  },
  successText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: '24px',
  },
  statsBox: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginBottom: '24px',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    display: 'block',
    color: '#e2e8f0',
    fontSize: '24px',
    fontWeight: 700,
  },
  statLabel: {
    color: '#64748b',
    fontSize: '12px',
  },
  keyTakeaway: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    borderLeft: '3px solid #10b981',
  },
  takeawayLabel: {
    color: '#34d399',
    fontWeight: 600,
    margin: '0 0 4px 0',
    fontSize: '13px',
  },
  takeawayText: {
    color: '#e2e8f0',
    margin: 0,
    fontSize: '14px',
  },
  solutionTitle: {
    color: '#e2e8f0',
    marginBottom: '16px',
  },
  solutionExplanation: {
    marginBottom: '16px',
  },
  solutionText: {
    color: '#94a3b8',
    lineHeight: 1.6,
  },
  codeBlock: {
    marginBottom: '16px',
  },
  solutionCode: {
    background: '#0f172a',
    borderRadius: '6px',
    padding: '12px',
    color: '#34d399',
    fontFamily: 'monospace',
    fontSize: '13px',
    margin: 0,
    overflow: 'auto',
  },
  encouragement: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
  },
};

export default RetryChallenge;
