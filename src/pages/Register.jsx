import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const initialForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  school: '',
  faculty: '',
  major: '',
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useApp();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (!result.ok) {
      setError(result.message || 'Không thể đăng ký.');
      return;
    }

    if (result.needsEmailConfirmation) {
      setSuccess('Đăng ký thành công. Hãy mở email và xác nhận tài khoản rồi đăng nhập.');
      return;
    }

    navigate('/', { replace: true });
  }

  return (
    <div className="live-auth-page">
      <form className="live-auth-card live-register-card" onSubmit={handleSubmit}>
        <Link className="live-auth-brand" to="/login">
          <span>📖</span>
          <div>
            <strong>DocShare Pro</strong>
            <small>Green Academic Library</small>
          </div>
        </Link>

        <div className="live-auth-heading">
          <span className="live-eyebrow">TẠO TÀI KHOẢN MỚI</span>
          <h1>Đăng ký</h1>
          <p>Thông tin sẽ được lưu trực tiếp vào Supabase.</p>
        </div>

        {error && <div className="live-alert error">{error}</div>}
        {success && <div className="live-alert success">{success}</div>}

        <div className="live-form-grid two">
          <label className="live-field">
            <span>Họ và tên *</span>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </label>

          <label className="live-field">
            <span>Tên người dùng</span>
            <input
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
              placeholder="nguyenvana"
            />
          </label>
        </div>

        <label className="live-field">
          <span>Email *</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="tenban@email.com"
            autoComplete="email"
            required
          />
        </label>

        <div className="live-form-grid two">
          <label className="live-field">
            <span>Mật khẩu *</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="live-field">
            <span>Xác nhận mật khẩu *</span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        <div className="live-form-grid two">
          <label className="live-field">
            <span>Số điện thoại</span>
            <input
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="09..."
            />
          </label>

          <label className="live-field">
            <span>Trường</span>
            <input
              value={form.school}
              onChange={(event) => updateField('school', event.target.value)}
              placeholder="Cao đẳng Đông An"
            />
          </label>
        </div>

        <div className="live-form-grid two">
          <label className="live-field">
            <span>Khoa</span>
            <input
              value={form.faculty}
              onChange={(event) => updateField('faculty', event.target.value)}
              placeholder="Công nghệ thông tin"
            />
          </label>

          <label className="live-field">
            <span>Ngành</span>
            <input
              value={form.major}
              onChange={(event) => updateField('major', event.target.value)}
              placeholder="Lập trình ứng dụng"
            />
          </label>
        </div>

        <button className="live-primary-button" type="submit" disabled={loading}>
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>

        <p className="live-auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
