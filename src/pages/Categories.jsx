import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { EmptyState, PageHeader } from '../components/LiveUI.jsx';

export default function Categories() {
  const { state } = useApp();

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="PHÂN LOẠI HỌC THUẬT"
        title="Danh mục tài liệu"
        text="Danh mục được lấy trực tiếp từ bảng categories trong Supabase."
      />

      {state.categories.length ? (
        <div className="live-category-grid">
          {state.categories.map((category) => {
            const count = state.documents.filter(
              (document) => document.categoryId === category.id,
            ).length;

            return (
              <Link
                className="live-category-card"
                key={category.id}
                to={`/documents?category=${category.id}`}
              >
                <span>📚</span>
                <h3>{category.name}</h3>
                <p>{category.description || 'Danh mục tài liệu học tập.'}</p>
                <b>{count} tài liệu</b>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🗂️"
          title="Chưa có danh mục"
          text="Bạn có thể tạo danh mục thật trong Supabase → Table Editor → categories. Tài liệu vẫn có thể đăng mà không chọn danh mục."
          actionTo="/upload"
          actionLabel="Đăng tài liệu"
        />
      )}
    </div>
  );
}
