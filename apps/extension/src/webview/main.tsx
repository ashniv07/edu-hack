import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import type { TutorPanelState } from './types';

declare global {
	interface Window {
		__AI_TUTOR_STATE__?: TutorPanelState;
	}
}

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('AI Tutor webview root element was not found.');
}

createRoot(rootElement).render(<App initialState={window.__AI_TUTOR_STATE__ ?? {}} />);
