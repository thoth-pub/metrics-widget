import { Providers } from '@/shared';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Providers>
			<App doi="https://doi.org/10.11647/OBP.0159" />
		</Providers>
	</StrictMode>,
);
