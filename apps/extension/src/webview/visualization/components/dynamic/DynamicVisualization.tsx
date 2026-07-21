import React from 'react';
import type { DynamicVisualization as DynamicVizType } from '../../../../tutor/types';
import { ArrayAccessViz } from './ArrayAccessViz';
import { DictAccessViz } from './DictAccessViz';
import { TypeFlowViz } from './TypeFlowViz';
import { CallStackViz } from './CallStackViz';
import { ScopeChainViz } from './ScopeChainViz';
import { ArithmeticViz } from './ArithmeticViz';
import { ObjectStructureViz } from './ObjectStructureViz';

interface DynamicVisualizationProps {
	visualization: DynamicVizType;
	concept: string;
}

export function DynamicVisualization({ visualization, concept }: DynamicVisualizationProps) {
	const renderVisualization = () => {
		switch (visualization.type) {
			case 'array_access':
				return <ArrayAccessViz data={visualization.data} />;
			case 'dict_access':
				return <DictAccessViz data={visualization.data} />;
			case 'type_flow':
				return <TypeFlowViz data={visualization.data} />;
			case 'call_stack':
				return <CallStackViz data={visualization.data} />;
			case 'scope_chain':
				return <ScopeChainViz data={visualization.data} />;
			case 'arithmetic':
				return <ArithmeticViz data={visualization.data} />;
			case 'object_structure':
				return <ObjectStructureViz data={visualization.data} />;
			case 'memory_layout':
			default:
				// Memory layout is handled by the parent MemoryVisualization component
				return (
					<div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
						Switch to Memory Layout tab for detailed view
					</div>
				);
		}
	};

	const getTitle = () => {
		switch (visualization.type) {
			case 'array_access': return 'Array Index Error';
			case 'dict_access': return 'Dictionary Key Error';
			case 'type_flow': return 'Type Mismatch';
			case 'call_stack': return 'Recursion Stack';
			case 'scope_chain': return 'Variable Scope';
			case 'arithmetic': return 'Arithmetic Error';
			case 'object_structure': return 'Object Structure';
			default: return 'Memory Layout';
		}
	};

	const styles: Record<string, React.CSSProperties> = {
		container: {
			background: '#1a1a2e',
			borderRadius: '12px',
			padding: '20px',
			minHeight: '300px',
		},
		header: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			marginBottom: '20px',
		},
		title: {
			fontSize: '16px',
			fontWeight: 600,
			color: '#ffffff',
			margin: 0,
		},
		badge: {
			background: '#3b82f6',
			color: '#ffffff',
			padding: '4px 10px',
			borderRadius: '12px',
			fontSize: '11px',
			fontWeight: 600,
			textTransform: 'uppercase' as const,
		},
		content: {
			background: '#0f0f1a',
			borderRadius: '8px',
			padding: '16px',
		},
	};

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<h3 style={styles.title}>{getTitle()}</h3>
				<span style={styles.badge}>{concept.replace(/_/g, ' ')}</span>
			</div>
			<div style={styles.content}>
				{renderVisualization()}
			</div>
		</div>
	);
}
