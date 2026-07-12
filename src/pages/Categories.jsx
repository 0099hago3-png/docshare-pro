import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { EmptyState, PageHeader } from '../components/LiveUI.jsx';
import CategoryIcon, { getCategoryIconInfo } from '../components/CategoryIcon.jsx';

export default function Categories() {
  const { state } = useApp();

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="PHÂN LOẠI HỌC THUẬT"
        title="Danh mục tài liệu"
        text="Danh mục được quản trị viên tạo trong Supabase. Người dùng chỉ chọn danh mục khi đăng tài liệu."
      />

      {state.categories.length ? (
        <div className="live-category-grid live-category-grid-v42">
          {state.categories.map((category) => {
            const count = state.documents.filter(
              (document) => document.categoryId === category.id,
            ).length;
            const iconInfo = getCategoryIconInfo(category);

            return (
              <Link
                className={`live-category-card live-category-card-v42 category-${iconInfo.key}`}
                key={category.id}
                to={`/documents?category=${category.id}`}
              >
                <span className="live-category-icon-v42">
                  <CategoryIcon category={category} size={30} />
                </span>
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
          text="Danh mục chỉ do quản trị viên thêm trong Supabase SQL Editor."
          actionTo="/upload"
          actionLabel="Đăng tài liệu"
        />
      )}
    </div>
  );
}
