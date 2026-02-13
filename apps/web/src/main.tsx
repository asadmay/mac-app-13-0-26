import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { AppRoot } from '@telegram-apps/telegram-ui';
import '@telegram-apps/telegram-ui/dist/styles.css';
import './app/global.css';

// Error boundary for production
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h1>😔 Что-то пошло не так</h1>
          <p>Попробуйте перезагрузить приложение</p>
          <button onClick={() => window.location.reload()}>Перезагрузить</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <AppRoot>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AppRoot>
  </React.StrictMode>,
);
