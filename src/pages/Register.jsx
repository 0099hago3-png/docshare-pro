import { Leaf, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';

const initial = { fullName: '', username: '', email: '', password: '', confirmPassword: '', phone: '', schoolName: '', faculty: '', major: '' };

export default function Register() {
  const { register, toast } = useApp();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (form.password.length < 6) return toast('Mật khẩu cần ít nhất 6 ký tự.', 'error');
    if (form.password !== form.confirmPassword) return toast('Mật khẩu xác nhận chưa khớp.', 'error');
    try {
      setBusy(true);
      const data = await register(form);
      if (data.session) {
        toast('Tạo tài khoản thành công.');
        navigate('/', { replace: true });
      } else {
        toast('Tài khoản đã được tạo. Hãy kiểm tra email xác nhận.', 'info');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page auth-page--register">
      <section className="auth-visual">
        <img src="/assets/logo-mark.svg" alt="" />
        <span className="eyebrow"><Leaf size={14} /> BẮT ĐẦU HÀNH TRÌNH</span>
        <h1>Tạo hồ sơ học thuật<br />của riêng bạn</h1>
        <p>Đăng tài liệu, xây dựng cộng đồng và lưu lại mọi dấu mốc học tập bằng dữ liệu thật.</p>
      </section>
      <section className="auth-card auth-card--wide botanical-card">
        <div className="auth-brand"><img src="/assets/logo-mark.svg" alt="" /><span><strong>DocShare Pro</strong><small>GREEN ACADEMIC LIBRARY</small></span></div>
        <span className="eyebrow">TẠO TÀI KHOẢN MỚI</span>
        <h2>Đăng ký</h2>
        <p>Thông tin sẽ được lưu trực tiếp vào Supabase.</p>
        <form className="form-grid" onSubmit={submit}>
          <label>Họ và tên *<input value={form.fullName} onChange={set('fullName')} required /></label>
          <label>Tên người dùng *<input value={form.username} onChange={set('username')} required /></label>
          <label className="span-2">Email *<input type="email" value={form.email} onChange={set('email')} required /></label>
          <label>Mật khẩu *<input type="password" value={form.password} onChange={set('password')} required /></label>
          <label>Xác nhận mật khẩu *<input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required /></label>
          <label>Số điện thoại<input value={form.phone} onChange={set('phone')} /></label>
          <label>Trường / đơn vị<input value={form.schoolName} onChange={set('schoolName')} /></label>
          <label>Khoa<input value={form.faculty} onChange={set('faculty')} /></label>
          <label>Ngành<input value={form.major} onChange={set('major')} /></label>
          <div className="span-2"><button className="button button--wide button--large" type="submit" disabled={busy}><UserPlus size={18} /> {busy ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</button></div>
        </form>
        <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </section>
    </main>
  );
}
