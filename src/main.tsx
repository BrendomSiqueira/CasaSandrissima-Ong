import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './firebaseContext.tsx';
import { ModalProvider } from './components/ModalContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </FirebaseProvider>
  </StrictMode>,
);
