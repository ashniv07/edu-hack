import type { ExecutionPayload, RootCause, TracebackFrame } from '../core/types';

export interface TutorInsight {
	title: string;
	summary: string;
	status: 'success' | 'warning' | 'error';
	primaryIssue?: RootCause;
	guidedSteps: string[];
	observations: string[];
	stackFrames: TracebackFrame[];
	stdout: string;
	stderr: string;
	nextAction: string;
}

export interface TutorPanelState {
	payload?: ExecutionPayload;
	insight?: TutorInsight;
}
