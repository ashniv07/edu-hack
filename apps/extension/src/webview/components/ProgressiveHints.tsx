import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type HintLevel = 'nudge' | 'guided' | 'solution';

export interface Hint {
	level: HintLevel;
	title: string;
	content: string;
	code?: string;
}

interface ProgressiveHintsProps {
	hints: Hint[];
	onRevealHint?: (level: HintLevel) => void;
	onHintViewed?: () => void;
	concept?: string;
}

export function ProgressiveHints({ hints, onRevealHint, onHintViewed, concept }: ProgressiveHintsProps) {
	const [revealedLevel, setRevealedLevel] = useState<number>(0);
	const [isExpanded, setIsExpanded] = useState(true);

	const levels: { level: HintLevel; icon: string; label: string; color: string }[] = [
		{ level: 'nudge', icon: '💡', label: 'Nudge', color: '#22c55e' },
		{ level: 'guided', icon: '🧭', label: 'Guided Help', color: '#f59e0b' },
		{ level: 'solution', icon: '✨', label: 'Solution', color: '#ef4444' },
	];

	const revealNextHint = () => {
		if (revealedLevel < hints.length) {
			const newLevel = revealedLevel + 1;
			setRevealedLevel(newLevel);
			onRevealHint?.(hints[newLevel - 1]?.level);
			// Notify that hints have been viewed (after first hint is revealed)
			if (newLevel === 1) {
				onHintViewed?.();
			}
		}
	};

	const resetHints = () => {
		setRevealedLevel(0);
	};

	const getLevelConfig = (level: HintLevel) => {
		return levels.find((l) => l.level === level) || levels[0];
	};

	const styles: Record<string, React.CSSProperties> = {
		container: {
			background: '#1e293b',
			borderRadius: '16px',
			overflow: 'hidden',
			border: '1px solid #334155',
		},
		header: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			padding: '16px 20px',
			background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
			cursor: 'pointer',
		},
		headerLeft: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
		},
		headerIcon: {
			fontSize: '24px',
		},
		headerTitle: {
			fontSize: '15px',
			fontWeight: 600,
			color: '#e2e8f0',
		},
		headerSubtitle: {
			fontSize: '12px',
			color: '#64748b',
		},
		headerRight: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
		},
		progressDots: {
			display: 'flex',
			gap: '6px',
		},
		dot: {
			width: '10px',
			height: '10px',
			borderRadius: '50%',
			transition: 'all 0.3s ease',
		},
		expandIcon: {
			color: '#64748b',
			fontSize: '14px',
			transition: 'transform 0.3s ease',
		},
		body: {
			padding: '0 20px 20px',
		},
		hintsContainer: {
			display: 'flex',
			flexDirection: 'column',
			gap: '12px',
		},
		hintCard: {
			borderRadius: '12px',
			overflow: 'hidden',
			transition: 'all 0.3s ease',
		},
		hintHeader: {
			display: 'flex',
			alignItems: 'center',
			gap: '10px',
			padding: '12px 16px',
		},
		hintIcon: {
			fontSize: '18px',
		},
		hintLabel: {
			fontSize: '13px',
			fontWeight: 600,
		},
		hintBadge: {
			marginLeft: 'auto',
			padding: '2px 8px',
			borderRadius: '10px',
			fontSize: '10px',
			fontWeight: 600,
		},
		hintContent: {
			padding: '0 16px 16px',
		},
		hintText: {
			fontSize: '13px',
			lineHeight: 1.7,
			color: '#cbd5e1',
			margin: 0,
		},
		codeBlock: {
			marginTop: '12px',
			padding: '12px',
			background: '#0f172a',
			borderRadius: '8px',
			fontFamily: 'monospace',
			fontSize: '12px',
			color: '#22c55e',
			overflowX: 'auto',
		},
		lockedCard: {
			background: 'rgba(100, 116, 139, 0.1)',
			border: '1px dashed #475569',
			borderRadius: '12px',
			padding: '16px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		lockedLeft: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
		},
		lockedIcon: {
			fontSize: '20px',
			opacity: 0.5,
		},
		lockedText: {
			color: '#64748b',
			fontSize: '13px',
		},
		revealButton: {
			padding: '8px 16px',
			borderRadius: '8px',
			border: 'none',
			fontSize: '12px',
			fontWeight: 600,
			cursor: 'pointer',
			transition: 'all 0.2s ease',
		},
		footer: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			padding: '16px 20px',
			borderTop: '1px solid #334155',
			background: '#0f172a',
		},
		footerText: {
			fontSize: '12px',
			color: '#64748b',
		},
		resetButton: {
			padding: '6px 12px',
			borderRadius: '6px',
			border: '1px solid #475569',
			background: 'transparent',
			color: '#94a3b8',
			fontSize: '11px',
			fontWeight: 500,
			cursor: 'pointer',
			transition: 'all 0.2s ease',
		},
		conceptTag: {
			padding: '4px 10px',
			borderRadius: '6px',
			background: 'rgba(139, 92, 246, 0.2)',
			color: '#a78bfa',
			fontSize: '11px',
			fontWeight: 600,
		},
	};

	return (
		<div style={styles.container}>
			<div style={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
				<div style={styles.headerLeft}>
					<span style={styles.headerIcon}>🎯</span>
					<div>
						<div style={styles.headerTitle}>Progressive Hints</div>
						<div style={styles.headerSubtitle}>
							{revealedLevel === 0
								? 'Try to solve it yourself first!'
								: `${revealedLevel} of ${hints.length} hints revealed`}
						</div>
					</div>
				</div>
				<div style={styles.headerRight}>
					{concept && <span style={styles.conceptTag}>{concept.replace(/_/g, ' ')}</span>}
					<div style={styles.progressDots}>
						{levels.map((level, idx) => (
							<motion.div
								key={level.level}
								style={{
									...styles.dot,
									background: idx < revealedLevel ? level.color : '#475569',
									boxShadow: idx < revealedLevel ? `0 0 8px ${level.color}40` : 'none',
								}}
								animate={idx < revealedLevel ? { scale: [1, 1.2, 1] } : {}}
								transition={{ duration: 0.3 }}
							/>
						))}
					</div>
					<motion.span
						style={styles.expandIcon}
						animate={{ rotate: isExpanded ? 180 : 0 }}
					>
						▼
					</motion.span>
				</div>
			</div>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						style={styles.body}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div style={styles.hintsContainer}>
							{hints.map((hint, idx) => {
								const config = getLevelConfig(hint.level);
								const isRevealed = idx < revealedLevel;
								const isNext = idx === revealedLevel;

								if (!isRevealed && !isNext) {
									return null;
								}

								if (isNext) {
									return (
										<motion.div
											key={hint.level}
											style={styles.lockedCard}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.1 }}
										>
											<div style={styles.lockedLeft}>
												<span style={styles.lockedIcon}>{config.icon}</span>
												<div>
													<div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
														{config.label}
													</div>
													<div style={styles.lockedText}>
														{idx === 0
															? "Need a little push? Click to reveal a nudge."
															: idx === 1
															? "Still stuck? Get more detailed guidance."
															: "See the full solution and explanation."}
													</div>
												</div>
											</div>
											<motion.button
												style={{
													...styles.revealButton,
													background: config.color,
													color: '#ffffff',
												}}
												onClick={revealNextHint}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												Reveal {config.label}
											</motion.button>
										</motion.div>
									);
								}

								return (
									<motion.div
										key={hint.level}
										style={{
											...styles.hintCard,
											background: `${config.color}10`,
											border: `1px solid ${config.color}30`,
										}}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: idx * 0.1 }}
									>
										<div style={styles.hintHeader}>
											<span style={styles.hintIcon}>{config.icon}</span>
											<span style={{ ...styles.hintLabel, color: config.color }}>
												{hint.title}
											</span>
											<span
												style={{
													...styles.hintBadge,
													background: `${config.color}20`,
													color: config.color,
												}}
											>
												Level {idx + 1}
											</span>
										</div>
										<div style={styles.hintContent}>
											<p style={styles.hintText}>{hint.content}</p>
											{hint.code && (
												<pre style={styles.codeBlock}>{hint.code}</pre>
											)}
										</div>
									</motion.div>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{revealedLevel > 0 && (
				<div style={styles.footer}>
					<span style={styles.footerText}>
						💪 Try to solve with minimal hints for best learning!
					</span>
					<motion.button
						style={styles.resetButton}
						onClick={resetHints}
						whileHover={{ background: '#334155' }}
						whileTap={{ scale: 0.95 }}
					>
						Reset Hints
					</motion.button>
				</div>
			)}
		</div>
	);
}

// Helper function to generate hints from error analysis
export function generateHints(concept: string, errorMessage: string): Hint[] {
	const hintTemplates: Record<string, Hint[]> = {
		index_out_of_bounds: [
			{
				level: 'nudge',
				title: 'Think About Array Length',
				content: 'Remember that array indices start at 0. If an array has 5 elements, what is the last valid index?',
			},
			{
				level: 'guided',
				title: 'Check Your Index',
				content: 'The error occurs because you\'re trying to access an index that doesn\'t exist. Before accessing an element, make sure: index >= 0 AND index < len(array)',
				code: 'if 0 <= index < len(my_list):\n    value = my_list[index]',
			},
			{
				level: 'solution',
				title: 'The Fix',
				content: 'Add a bounds check before accessing the array, or use a try-except block to handle the error gracefully.',
				code: 'try:\n    value = my_list[index]\nexcept IndexError:\n    print(f"Index {index} is out of range")',
			},
		],
		key_not_found: [
			{
				level: 'nudge',
				title: 'Check the Key',
				content: 'The key you\'re looking for doesn\'t exist in the dictionary. Are you sure you spelled it correctly?',
			},
			{
				level: 'guided',
				title: 'Safe Dictionary Access',
				content: 'Use the .get() method or check if the key exists before accessing it.',
				code: 'value = my_dict.get("key", default_value)\n# or\nif "key" in my_dict:\n    value = my_dict["key"]',
			},
			{
				level: 'solution',
				title: 'The Fix',
				content: 'Either use .get() with a default value, or check key existence first.',
				code: '# Safe access with default\nvalue = my_dict.get("key", "not found")\n\n# Or check first\nif "key" in my_dict:\n    value = my_dict["key"]\nelse:\n    print("Key not found")',
			},
		],
		none_attribute_access: [
			{
				level: 'nudge',
				title: 'Something is None',
				content: 'You\'re trying to access an attribute on something that is None. Which variable might be None?',
			},
			{
				level: 'guided',
				title: 'Check for None First',
				content: 'Before accessing attributes, verify the object is not None.',
				code: 'if obj is not None:\n    value = obj.attribute',
			},
			{
				level: 'solution',
				title: 'The Fix',
				content: 'Add a None check, or investigate why the variable is None in the first place.',
				code: '# Check before access\nif result is not None:\n    print(result.data)\n\n# Or use walrus operator (Python 3.8+)\nif (result := get_result()) is not None:\n    print(result.data)',
			},
		],
		division_by_zero: [
			{
				level: 'nudge',
				title: 'Check Your Divisor',
				content: 'Division by zero is undefined. What value might be causing the divisor to be zero?',
			},
			{
				level: 'guided',
				title: 'Validate Before Dividing',
				content: 'Always check if the divisor is zero before performing division.',
				code: 'if divisor != 0:\n    result = dividend / divisor\nelse:\n    print("Cannot divide by zero")',
			},
			{
				level: 'solution',
				title: 'The Fix',
				content: 'Add a guard clause to handle the zero case appropriately.',
				code: 'def safe_divide(a, b):\n    if b == 0:\n        return None  # or raise an error\n    return a / b',
			},
		],
		infinite_recursion: [
			{
				level: 'nudge',
				title: 'Missing Base Case?',
				content: 'Recursive functions need a base case to stop. Does your function have one?',
			},
			{
				level: 'guided',
				title: 'Add a Stopping Condition',
				content: 'Every recursive function needs a condition that stops the recursion.',
				code: 'def factorial(n):\n    if n <= 1:  # Base case!\n        return 1\n    return n * factorial(n - 1)',
			},
			{
				level: 'solution',
				title: 'The Fix',
				content: 'Ensure you have a base case that returns without making another recursive call.',
				code: 'def countdown(n):\n    if n <= 0:  # Base case\n        print("Done!")\n        return\n    print(n)\n    countdown(n - 1)',
			},
		],
	};

	return hintTemplates[concept] || [
		{
			level: 'nudge',
			title: 'Analyze the Error',
			content: `Look at the error message: "${errorMessage}". What does it tell you about what went wrong?`,
		},
		{
			level: 'guided',
			title: 'Debug Step by Step',
			content: 'Add print statements before the error line to see the values of your variables.',
			code: 'print(f"Debug: variable = {variable}")',
		},
		{
			level: 'solution',
			title: 'General Debugging Approach',
			content: '1. Read the error message carefully\n2. Find the line number\n3. Check the values at that point\n4. Work backwards to find the root cause',
		},
	];
}
