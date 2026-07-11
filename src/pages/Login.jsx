import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (!result.ok) {
      setError(result.message || 'Không thể đăng nhập.');
      return;
    }

    navigate('/', { replace: true });
  }

  return (
    <div className="live-auth-page">
      <form className="live-auth-card" onSubmit={handleSubmit} autoComplete="on">
        <Link className="live-auth-brand" to="/login">
          <span>📖</span>
          <div>
            <strong>DocShare Pro</strong>
            <small>Green Academic Library</small>
          </div>
        </Link>

        <div className="live-auth-heading">
          <span className="live-eyebrow">TÀI KHOẢN THẬT · SUPABASE</span>
          <h1>Đăng nhập</h1>
          <p>Dùng tài khoản đã đăng ký trên hệ thống.</p>
        </div>

        {error && <div className="live-alert error">{error}</div>}

        <label className="live-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tenban@email.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="live-field">
          <span>Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            minLength={6}
            required
          />
        </label>

        <button className="live-primary-button" type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p className="live-auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
}
