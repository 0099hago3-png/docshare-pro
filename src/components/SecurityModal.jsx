import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';
import Modal from './Modal.jsx';

const INITIAL_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
}) {
  return (
    <label className="security-password-field">
      <span>{label}</span>

      <div>
        <LockKeyhole size={16} />

        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          required
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

export default function SecurityModal({
  open,
  onClose,
}) {
  const { currentUser, toast } = useApp();

  const [form, setForm] = useState(INITIAL_FORM);
  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [busy, setBusy] = useState(false);

  function close() {
    if (busy) return;

    setForm(INITIAL_FORM);
    onClose?.();
  }

  async function submit(event) {
    event.preventDefault();

    if (form.newPassword.length < 8) {
      toast('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast('Xác nhận mật khẩu mới chưa khớp.', 'error');
      return;
    }

    if (form.currentPassword === form.newPassword) {
      toast('Mật khẩu mới phải khác mật khẩu hiện tại.', 'error');
      return;
    }

    try {
      setBusy(true);

      const { error: verifyError } = await supabase.auth
        .signInWithPassword({
          email: currentUser.email,
          password: form.currentPassword,
        });

      if (verifyError) {
        throw new Error('Mật khẩu hiện tại không đúng.');
      }

      const { error } = await supabase.auth.updateUser({
        password: form.newPassword,
      });

      if (error) throw error;

      toast('Đổi mật khẩu thành công.');
      setForm(INITIAL_FORM);
      onClose?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Bảo mật"
      width={560}
      className="security-modal-v63 modal-card--no-scrollbar"
    >
      <form className="security-form-v63" onSubmit={submit}>
        <div className="security-form-v63__intro">
          <span>
            <ShieldCheck size={23} />
          </span>

          <div>
            <strong>Bảo vệ tài khoản</strong>
            <p>
              Mật khẩu mới nên có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
            </p>
          </div>
        </div>

        <PasswordField
          label="Mật khẩu hiện tại"
          value={form.currentPassword}
          onChange={(event) => setForm((current) => ({
            ...current,
            currentPassword: event.target.value,
          }))}
          visible={visible.current}
          onToggle={() => setVisible((current) => ({
            ...current,
            current: !current.current,
          }))}
          placeholder="Nhập mật khẩu đang dùng"
        />

        <PasswordField
          label="Mật khẩu mới"
          value={form.newPassword}
          onChange={(event) => setForm((current) => ({
            ...current,
            newPassword: event.target.value,
          }))}
          visible={visible.next}
          onToggle={() => setVisible((current) => ({
            ...current,
            next: !current.next,
          }))}
          placeholder="Ví dụ: HocTap@2026"
        />

        <PasswordField
          label="Xác nhận mật khẩu mới"
          value={form.confirmPassword}
          onChange={(event) => setForm((current) => ({
            ...current,
            confirmPassword: event.target.value,
          }))}
          visible={visible.confirm}
          onToggle={() => setVisible((current) => ({
            ...current,
            confirm: !current.confirm,
          }))}
          placeholder="Nhập lại mật khẩu mới"
        />

        <div className="security-form-v63__note">
          <KeyRound size={16} />
          Gợi ý: dùng mật khẩu riêng cho DocShare, không dùng lại mật khẩu email.
        </div>

        <div className="form-actions form-actions--end">
          <button
            className="button button--ghost"
            type="button"
            onClick={close}
            disabled={busy}
          >
            Hủy
          </button>

          <button
            className="button"
            type="submit"
            disabled={
              busy
              || !form.currentPassword
              || !form.newPassword
              || !form.confirmPassword
            }
          >
            <ShieldCheck size={16} />
            {busy ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
