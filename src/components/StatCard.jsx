export default function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 inline-flex rounded-2xl bg-amber-400 p-3 text-slate-950">
        {icon}
      </div>

      <p className="text-sm text-slate-400">{label}</p>
      <h4 className="text-3xl font-black">{value}</h4>
    </div>
  );
}
