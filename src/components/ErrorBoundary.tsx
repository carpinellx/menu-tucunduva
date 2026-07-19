import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado na aplicação:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="center-page">
          <div className="modal-box" style={{ maxWidth: 380, textAlign: 'center' }}>
            <h3>Algo deu errado</h3>
            <p className="empty-hint" style={{ marginBottom: 18 }}>
              A página encontrou um problema inesperado. Tente recarregar — se continuar
              acontecendo, avise quem cuida do site.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
