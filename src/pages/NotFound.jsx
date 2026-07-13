import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound() {
  return <div className="page"><EmptyState title="Không tìm thấy trang" description="Đường dẫn này không tồn tại hoặc đã được thay đổi." action={<Link className="button" to="/"><Home size={17} /> Về trang chủ</Link>} /></div>;
}
