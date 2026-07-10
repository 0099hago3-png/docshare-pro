import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', school: '', passwordHint: '' });
  const [error, setError] = useState('');
  function submit(e) { e.preventDefault(); if (form.password !== form.confirm) return setError('Mật khẩu nhập lại không khớp.'); const res = register(form); if (!res.ok) setError(res.message); else navigate('/'); }
  return <div className="auth-page"><form className="auth-card panel" onSubmit={submit}><h1>Đăng ký</h1>{error && <div className="error-box">{error}</div>}<label>Họ tên<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label><label>Mật khẩu<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label><label>Nhập lại mật khẩu<input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required /></label><label>Gợi ý mật khẩu khi quên<input value={form.passwordHint} onChange={(e) => setForm({ ...form, passwordHint: e.target.value })} placeholder="Ví dụ: tên thú cưng + năm sinh" /></label><label>Trường<input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} /></label><button className="btn primary wide">Tạo tài khoản</button><p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></form></div>;
}
