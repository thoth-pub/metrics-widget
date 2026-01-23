import { Providers } from '@/shared';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Providers>
			<App doi="https://doi.org/10.36615/9781776402304" />
		</Providers>
	</StrictMode>,
);
