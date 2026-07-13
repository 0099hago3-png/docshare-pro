import { Eye, EyeOff, Leaf, LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';

export default function Login() {
  const { login, toast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    try {
      setBusy(true);
      await login(email.trim(), password);
      toast('Đăng nhập thành công.');
      navigate(location.state?.from || '/', { replace: true });
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <img src="/assets/logo-mark.svg" alt="" />
        <span className="eyebrow"><Leaf size={14} /> THƯ VIỆN HỌC THUẬT</span>
        <h1>Chia sẻ tri thức<br />Kết nối cộng đồng</h1>
        <p>Một không gian học tập xanh, hiện đại và đáng tin cậy cho sinh viên, giảng viên và người yêu tri thức.</p>
      </section>
      <section className="auth-card botanical-card">
        <div className="auth-brand"><img src="/assets/logo-mark.svg" alt="" /><span><strong>DocShare Pro</strong><small>GREEN ACADEMIC LIBRARY</small></span></div>
        <span className="eyebrow">CHÀO MỪNG TRỞ LẠI</span>
        <h2>Đăng nhập</h2>
        <p>Đăng nhập để tiếp tục hành trình học tập của bạn.</p>
        <form className="stack-form" onSubmit={submit}>
          <label>Email *<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@gmail.com" required /></label>
          <label>
            Mật khẩu *
            <span className="password-field">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShow((value) => !value)}
              >
                {show
                  ? <EyeOff size={17} />
                  : <Eye size={17} />}
              </button>
            </span>
          </label>

          <div className="login-help-row-v65">
            <span>
              Quên mật khẩu hoặc không đăng nhập được?
            </span>

            <Link to="/forgot-password">
              Quên mật khẩu
            </Link>
          </div>

          <button
            className="button button--wide button--large"
            type="submit"
            disabled={busy}
          >
            <LogIn size={18} />
            {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </section>
    </main>
  );
}
