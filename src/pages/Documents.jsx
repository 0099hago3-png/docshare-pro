import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  DocumentCard,
  EmptyState,
  PageHeader,
} from '../components/LiveUI.jsx';

export default function Documents() {
  const { state, getUser } = useApp();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const documents = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    const result = state.documents.filter((document) => {
      const haystack = [
        document.title,
        document.description,
        document.subject,
        document.category,
        document.school,
        document.major,
        document.isbn,
        ...(document.tags || []),
      ].join(' ').toLowerCase();

      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesCategory = !categoryId || document.categoryId === categoryId;

      return matchesKeyword && matchesCategory && document.status === 'published';
    });

    return result.sort((first, second) => {
      if (sort === 'top') {
        return (
          second.likes * 3 + second.views + second.rating * 10
        ) - (
          first.likes * 3 + first.views + first.rating * 10
        );
      }

      if (sort === 'liked') return second.likes - first.likes;
      if (sort === 'viewed') return second.views - first.views;
      if (sort === 'rating') return second.rating - first.rating;
      if (sort === 'price-low') return first.price - second.price;

      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
  }, [categoryId, query, sort, state.documents]);

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="THƯ VIỆN TÀI LIỆU"
        title="Tài liệu thật từ cộng đồng"
        text="Không có dữ liệu mẫu. Tài liệu chỉ xuất hiện sau khi người dùng đăng lên Supabase."
      >
        <Link className="live-primary-link" to="/upload">+ Đăng tài liệu</Link>
      </PageHeader>

      <section className="live-filter-bar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo tên, môn học, trường, ISBN hoặc tag..."
        />

        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">Tất cả danh mục</option>
          {state.categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="top">Xếp hạng tổng hợp</option>
          <option value="liked">Nhiều tim nhất</option>
          <option value="viewed">Nhiều lượt xem nhất</option>
          <option value="rating">Đánh giá cao nhất</option>
          <option value="price-low">Giá thấp trước</option>
        </select>
      </section>

      <div className="live-result-line">
        Tìm thấy <b>{documents.length}</b> tài liệu
      </div>

      {documents.length ? (
        <div className="live-document-grid">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              author={getUser(document.authorId)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔎"
          title="Chưa có tài liệu phù hợp"
          text={state.documents.length
            ? 'Thử đổi từ khóa hoặc bộ lọc.'
            : 'Thư viện đang bắt đầu từ số 0. Hãy đăng tài liệu đầu tiên.'}
          actionTo="/upload"
          actionLabel="Đăng tài liệu"
        />
      )}
    </div>
  );
}
