import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  onLogin: (email: string, password: string) => Promise<string | null>;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const message = await onLogin(email, password);
    setSubmitting(false);
    if (message) setError('E-mail ou senha incorretos.');
  }

  return (
    <div className="center-page">
      <div className="modal-box" style={{ maxWidth: 380 }}>
        <h3>Área administrativa</h3>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="loginEmail">E-mail</label>
            <input
              id="loginEmail"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="loginPassword">Senha</label>
            <input
              id="loginPassword"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className="field-error">{error}</div>}
          </div>
          <div className="btn-row">
            <Link to="/" className="btn btn-ghost" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Voltar ao cardápio
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
