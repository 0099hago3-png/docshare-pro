import { Lock } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout.jsx";

export default function Login({ login }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(form.email, form.password);

    setLoading(false);

    if (!result.success) {
      setError(result.message || "Đăng nhập thất bại.");
      return;
    }

    navigate("/");
  }

  return (
    <AuthLayout title="Đăng nhập">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="alert-error">{error}</div>}

        <input
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={(event) =>
            setForm({ ...form, email: event.target.value })
          }
        />

        <input
          className="input"
          placeholder="Mật khẩu"
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm({ ...form, password: event.target.value })
          }
        />

        <button
          className="btn-primary w-full justify-center"
          disabled={loading}
        >
          <Lock size={18} />
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-amber-300 hover:text-amber-200">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}