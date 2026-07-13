export default function Loading({ label = 'Đang tải dữ liệu...' }) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-spinner" />
      <p>{label}</p>
    </div>
  );
}
