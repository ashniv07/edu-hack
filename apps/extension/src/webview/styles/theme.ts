// AI Tutor Design System
// A modern, educational-focused design system

export const theme = {
	colors: {
		// Primary palette
		primary: {
			50: '#eff6ff',
			100: '#dbeafe',
			200: '#bfdbfe',
			300: '#93c5fd',
			400: '#60a5fa',
			500: '#3b82f6',
			600: '#2563eb',
			700: '#1d4ed8',
			800: '#1e40af',
			900: '#1e3a8a',
		},
		// Secondary (Purple)
		secondary: {
			50: '#faf5ff',
			100: '#f3e8ff',
			200: '#e9d5ff',
			300: '#d8b4fe',
			400: '#c084fc',
			500: '#a855f7',
			600: '#9333ea',
			700: '#7c3aed',
			800: '#6b21a8',
			900: '#581c87',
		},
		// Success (Green)
		success: {
			50: '#f0fdf4',
			100: '#dcfce7',
			200: '#bbf7d0',
			300: '#86efac',
			400: '#4ade80',
			500: '#22c55e',
			600: '#16a34a',
			700: '#15803d',
			800: '#166534',
			900: '#14532d',
		},
		// Warning (Amber)
		warning: {
			50: '#fffbeb',
			100: '#fef3c7',
			200: '#fde68a',
			300: '#fcd34d',
			400: '#fbbf24',
			500: '#f59e0b',
			600: '#d97706',
			700: '#b45309',
			800: '#92400e',
			900: '#78350f',
		},
		// Error (Red)
		error: {
			50: '#fef2f2',
			100: '#fee2e2',
			200: '#fecaca',
			300: '#fca5a5',
			400: '#f87171',
			500: '#ef4444',
			600: '#dc2626',
			700: '#b91c1c',
			800: '#991b1b',
			900: '#7f1d1d',
		},
		// Neutral (Slate)
		neutral: {
			50: '#f8fafc',
			100: '#f1f5f9',
			200: '#e2e8f0',
			300: '#cbd5e1',
			400: '#94a3b8',
			500: '#64748b',
			600: '#475569',
			700: '#334155',
			800: '#1e293b',
			900: '#0f172a',
			950: '#020617',
		},
	},

	// Gradients
	gradients: {
		primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
		secondary: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
		success: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
		warning: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
		dark: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
		glow: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
	},

	// Shadows
	shadows: {
		sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
		md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
		glow: {
			primary: '0 0 20px rgba(59, 130, 246, 0.3)',
			success: '0 0 20px rgba(34, 197, 94, 0.3)',
			error: '0 0 20px rgba(239, 68, 68, 0.3)',
			warning: '0 0 20px rgba(245, 158, 11, 0.3)',
		},
		inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
	},

	// Border radius
	radius: {
		none: '0',
		sm: '4px',
		md: '8px',
		lg: '12px',
		xl: '16px',
		'2xl': '20px',
		'3xl': '24px',
		full: '9999px',
	},

	// Spacing
	spacing: {
		0: '0',
		1: '4px',
		2: '8px',
		3: '12px',
		4: '16px',
		5: '20px',
		6: '24px',
		8: '32px',
		10: '40px',
		12: '48px',
		16: '64px',
		20: '80px',
	},

	// Typography
	typography: {
		fontFamily: {
			sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
			mono: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
		},
		fontSize: {
			xs: '11px',
			sm: '12px',
			base: '14px',
			lg: '16px',
			xl: '18px',
			'2xl': '20px',
			'3xl': '24px',
			'4xl': '30px',
		},
		fontWeight: {
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
		lineHeight: {
			tight: 1.25,
			normal: 1.5,
			relaxed: 1.75,
		},
	},

	// Animation
	animation: {
		duration: {
			fast: '150ms',
			normal: '300ms',
			slow: '500ms',
		},
		easing: {
			default: 'cubic-bezier(0.4, 0, 0.2, 1)',
			in: 'cubic-bezier(0.4, 0, 1, 1)',
			out: 'cubic-bezier(0, 0, 0.2, 1)',
			inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
			bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
		},
	},

	// Z-index
	zIndex: {
		base: 0,
		dropdown: 10,
		modal: 100,
		tooltip: 1000,
	},
};

// Helper to create consistent component styles
export const createStyles = {
	card: (variant: 'default' | 'elevated' | 'outlined' = 'default'): React.CSSProperties => {
		const base: React.CSSProperties = {
			borderRadius: theme.radius.xl,
			padding: theme.spacing[5],
			transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
		};

		switch (variant) {
			case 'elevated':
				return {
					...base,
					background: theme.colors.neutral[800],
					boxShadow: theme.shadows.lg,
				};
			case 'outlined':
				return {
					...base,
					background: 'transparent',
					border: `1px solid ${theme.colors.neutral[700]}`,
				};
			default:
				return {
					...base,
					background: theme.colors.neutral[800],
					border: `1px solid ${theme.colors.neutral[700]}`,
				};
		}
	},

	button: (variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary'): React.CSSProperties => {
		const base: React.CSSProperties = {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: theme.spacing[2],
			padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
			borderRadius: theme.radius.lg,
			fontSize: theme.typography.fontSize.sm,
			fontWeight: theme.typography.fontWeight.semibold,
			fontFamily: theme.typography.fontFamily.sans,
			border: 'none',
			cursor: 'pointer',
			transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
		};

		switch (variant) {
			case 'primary':
				return {
					...base,
					background: theme.gradients.primary,
					color: '#ffffff',
				};
			case 'secondary':
				return {
					...base,
					background: theme.colors.neutral[700],
					color: theme.colors.neutral[100],
				};
			case 'ghost':
				return {
					...base,
					background: 'transparent',
					color: theme.colors.neutral[300],
				};
			case 'danger':
				return {
					...base,
					background: theme.colors.error[600],
					color: '#ffffff',
				};
			default:
				return base;
		}
	},

	badge: (color: 'primary' | 'success' | 'warning' | 'error' | 'neutral' = 'primary'): React.CSSProperties => {
		const colorMap = {
			primary: { bg: theme.colors.primary[500], text: '#ffffff' },
			success: { bg: theme.colors.success[500], text: '#ffffff' },
			warning: { bg: theme.colors.warning[500], text: '#000000' },
			error: { bg: theme.colors.error[500], text: '#ffffff' },
			neutral: { bg: theme.colors.neutral[600], text: theme.colors.neutral[100] },
		};

		const colors = colorMap[color];

		return {
			display: 'inline-flex',
			alignItems: 'center',
			padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
			borderRadius: theme.radius.full,
			fontSize: theme.typography.fontSize.xs,
			fontWeight: theme.typography.fontWeight.semibold,
			background: colors.bg,
			color: colors.text,
		};
	},

	input: (): React.CSSProperties => ({
		width: '100%',
		padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
		borderRadius: theme.radius.lg,
		border: `1px solid ${theme.colors.neutral[600]}`,
		background: theme.colors.neutral[900],
		color: theme.colors.neutral[100],
		fontSize: theme.typography.fontSize.base,
		fontFamily: theme.typography.fontFamily.sans,
		outline: 'none',
		transition: `border-color ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
	}),

	text: (variant: 'title' | 'subtitle' | 'body' | 'caption' | 'code' = 'body'): React.CSSProperties => {
		const variants = {
			title: {
				fontSize: theme.typography.fontSize['2xl'],
				fontWeight: theme.typography.fontWeight.bold,
				color: theme.colors.neutral[50],
				lineHeight: theme.typography.lineHeight.tight,
			},
			subtitle: {
				fontSize: theme.typography.fontSize.lg,
				fontWeight: theme.typography.fontWeight.semibold,
				color: theme.colors.neutral[200],
				lineHeight: theme.typography.lineHeight.tight,
			},
			body: {
				fontSize: theme.typography.fontSize.base,
				fontWeight: theme.typography.fontWeight.normal,
				color: theme.colors.neutral[300],
				lineHeight: theme.typography.lineHeight.relaxed,
			},
			caption: {
				fontSize: theme.typography.fontSize.sm,
				fontWeight: theme.typography.fontWeight.normal,
				color: theme.colors.neutral[400],
				lineHeight: theme.typography.lineHeight.normal,
			},
			code: {
				fontSize: theme.typography.fontSize.sm,
				fontFamily: theme.typography.fontFamily.mono,
				color: theme.colors.success[400],
				background: theme.colors.neutral[900],
				padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
				borderRadius: theme.radius.md,
			},
		};

		return variants[variant];
	},
};

export type Theme = typeof theme;
