import { Link } from "react-router-dom";

export default function MessagePage({ title, message }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="glass-card max-w-lg text-center">
        <h2 className="text-3xl font-black">{title}</h2>
        <p className="mt-3 text-slate-400">{message}</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
