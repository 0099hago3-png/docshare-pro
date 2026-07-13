import {
  ArrowLeft,
  Leaf,
  Mail,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function ForgotPassword() {
  const { toast } = useApp();

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event) {
    event.preventDefault();

    try {
      setBusy(true);

      const redirectTo = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      );

      if (error) throw error;

      setSent(true);
      toast('Đã gửi liên kết đặt lại mật khẩu.');
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page auth-page--forgot-v65">
      <section className="auth-visual">
        <img src="/assets/logo-mark.svg" alt="" />

        <span className="eyebrow">
          <Leaf size={14} />
          BẢO MẬT TÀI KHOẢN
        </span>

        <h1>
          Khôi phục quyền truy cập
          <br />
          An toàn và nhanh chóng
        </h1>

        <p>
          DocShare sẽ gửi một liên kết bảo mật tới email đã đăng ký.
          Liên kết chỉ dùng để tạo mật khẩu mới cho tài khoản của bạn.
        </p>
      </section>

      <section className="auth-card botanical-card">
        <div className="auth-brand">
          <img src="/assets/logo-mark.svg" alt="" />

          <span>
            <strong>DocShare Pro</strong>
            <small>GREEN ACADEMIC LIBRARY</small>
          </span>
        </div>

        <span className="eyebrow">QUÊN MẬT KHẨU</span>
        <h2>Nhận liên kết đặt lại</h2>

        {sent ? (
          <div className="forgot-success-v65">
            <span>
              <Mail size={27} />
            </span>

            <strong>Kiểm tra hộp thư của bạn</strong>

            <p>
              Liên kết đặt lại mật khẩu đã được gửi tới:
              <b>{email}</b>
            </p>

            <small>
              Không thấy email? Kiểm tra mục Spam hoặc chờ khoảng 1–2 phút.
            </small>

            <button
              className="button button--wide"
              type="button"
              onClick={() => setSent(false)}
            >
              Gửi lại bằng email khác
            </button>
          </div>
        ) : (
          <>
            <p>
              Nhập đúng email đã dùng khi đăng ký tài khoản DocShare.
            </p>

            <form className="stack-form" onSubmit={submit}>
              <label>
                Email tài khoản *
                <div className="auth-icon-field-v65">
                  <Mail size={17} />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ban@gmail.com"
                    required
                  />
                </div>
              </label>

              <div className="forgot-hint-v65">
                <strong>Gợi ý</strong>
                <span>
                  Hãy dùng email đã đăng ký. Không nhập ID người dùng
                  hoặc tên hiển thị.
                </span>
              </div>

              <button
                className="button button--wide button--large"
                type="submit"
                disabled={busy}
              >
                <Send size={18} />
                {busy
                  ? 'Đang gửi liên kết...'
                  : 'Gửi liên kết đặt lại mật khẩu'}
              </button>
            </form>
          </>
        )}

        <p className="auth-switch">
          <Link to="/login">
            <ArrowLeft size={15} />
            Quay lại đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}
