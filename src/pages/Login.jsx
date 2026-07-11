import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login, state } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  function submit(e) { e.preventDefault(); const res = login(form.email, form.password); if (!res.ok) setError(res.message); else navigate(res.user.role === 'admin' ? '/admin' : '/'); }
  function forgot() { const u = state.users.find((x) => x.email.toLowerCase() === form.email.toLowerCase()); setHint(u ? `Gợi ý mật khẩu: ${u.passwordHint || 'Chưa có gợi ý.'}` : 'Không tìm thấy email.'); }
  return <div className="auth-page"><form className="auth-card panel" onSubmit={submit}><h1>Đăng nhập</h1><p className="muted">Demo: admin@docshare.vn / user@docshare.vn / teacher@docshare.vn - mật khẩu 123456.</p>{error && <div className="error-box">{error}</div>}<label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Mật khẩu<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><button className="btn primary wide">Đăng nhập</button><button type="button" className="link-btn" onClick={forgot}>Quên mật khẩu?</button>{hint && <p className="hint-box">{hint}</p>}<p>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p></form></div>;
}
