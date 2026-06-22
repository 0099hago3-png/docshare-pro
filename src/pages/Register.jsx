import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout.jsx";

export default function Register({ users, register }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();

    if (!form.fullName || !form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (users.some((user) => user.email === form.email)) {
      setError("Email đã tồn tại.");
      return;
    }
await register({
  fullName: form.fullName,
  email: form.email,
  password: form.password,
  role: "USER",
  enabled: true,
});

navigate("/login");
    navigate("/login");
  }

  return (
    <AuthLayout title="Đăng ký tài khoản">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="alert-error">{error}</div>}

        <input
          className="input"
          placeholder="Họ tên"
          value={form.fullName}
          onChange={(event) =>
            setForm({ ...form, fullName: event.target.value })
          }
        />

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

        <button className="btn-primary w-full justify-center">
          <CheckCircle size={18} />
          Tạo tài khoản
        </button>

        <p className="text-center text-sm text-slate-400">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-amber-300 hover:text-amber-200">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
