import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Leaf,
  LockKeyhole,
} from 'lucide-react';
import {
  useEffect,
  useState,
} from 'react';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function ResetPassword() {
  const { toast } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    async function prepareRecovery() {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (code) {
          const { error } = await supabase.auth
            .exchangeCodeForSession(code);

          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!active) return;

        if (!data.session) {
          setInvalid(true);
        } else {
          setReady(true);
        }
      } catch {
        if (active) setInvalid(true);
      }
    }

    prepareRecovery();

    return () => {
      active = false;
    };
  }, [location.search]);

  async function submit(event) {
    event.preventDefault();

    if (password.length < 8) {
      toast('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      toast('Xác nhận mật khẩu chưa khớp.', 'error');
      return;
    }

    try {
      setBusy(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setDone(true);
      toast('Đã cập nhật mật khẩu mới.');

      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
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
          TẠO MẬT KHẨU MỚI
        </span>

        <h1>
          Bảo vệ tài khoản
          <br />
          Tiếp tục hành trình học tập
        </h1>

        <p>
          Dùng mật khẩu riêng cho DocShare và không chia sẻ
          liên kết khôi phục với bất kỳ ai.
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

        {done ? (
          <div className="forgot-success-v65">
            <span>
              <CheckCircle2 size={29} />
            </span>

            <strong>Cập nhật thành công</strong>

            <p>
              Mật khẩu mới đã được lưu. Bạn đang được chuyển về
              trang đăng nhập.
            </p>
          </div>
        ) : invalid ? (
          <div className="forgot-success-v65 is-error">
            <span>
              <KeyRound size={28} />
            </span>

            <strong>Liên kết không còn hợp lệ</strong>

            <p>
              Liên kết có thể đã hết hạn hoặc đã được sử dụng.
            </p>

            <Link
              className="button button--wide"
              to="/forgot-password"
            >
              Gửi liên kết mới
            </Link>
          </div>
        ) : !ready ? (
          <div className="forgot-success-v65">
            <span>
              <KeyRound size={27} />
            </span>

            <strong>Đang xác minh liên kết...</strong>
          </div>
        ) : (
          <>
            <span className="eyebrow">ĐẶT LẠI MẬT KHẨU</span>
            <h2>Tạo mật khẩu mới</h2>

            <p>
              Nên dùng ít nhất 8 ký tự, gồm chữ hoa, chữ thường,
              số và ký tự đặc biệt.
            </p>

            <form className="stack-form" onSubmit={submit}>
              <label>
                Mật khẩu mới *
                <span className="password-field">
                  <LockKeyhole size={17} />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Ví dụ: HocTap@2026"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword
                        ? 'Ẩn mật khẩu'
                        : 'Hiện mật khẩu'
                    }
                  >
                    {showPassword
                      ? <EyeOff size={17} />
                      : <Eye size={17} />}
                  </button>
                </span>
              </label>

              <label>
                Xác nhận mật khẩu mới *
                <span className="password-field">
                  <LockKeyhole size={17} />

                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => (
                      setConfirmPassword(event.target.value)
                    )}
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((value) => !value)}
                    aria-label={
                      showConfirm
                        ? 'Ẩn mật khẩu'
                        : 'Hiện mật khẩu'
                    }
                  >
                    {showConfirm
                      ? <EyeOff size={17} />
                      : <Eye size={17} />}
                  </button>
                </span>
              </label>

              <button
                className="button button--wide button--large"
                type="submit"
                disabled={busy}
              >
                <KeyRound size={18} />
                {busy
                  ? 'Đang cập nhật...'
                  : 'Cập nhật mật khẩu'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
