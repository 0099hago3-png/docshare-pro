import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  DocumentCard,
  EmptyState,
  PageHeader,
  formatNumber,
} from '../components/LiveUI.jsx';

export default function Home() {
  const { state, currentUser, getUser, dataLoading } = useApp();

  const topDocuments = [...state.documents]
    .filter((item) => item.status === 'published')
    .sort((first, second) => (
      (second.likes * 3 + second.views + second.rating * 10)
      - (first.likes * 3 + first.views + first.rating * 10)
    ))
    .slice(0, 4);

  const newestDocuments = [...state.documents]
    .filter((item) => item.status === 'published')
    .sort((first, second) => (
      new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
    ))
    .slice(0, 4);

  return (
    <div className="live-page live-home-page">
      <section className="live-hero">
        <div className="live-hero-copy">
          <span className="live-eyebrow">THƯ VIỆN HỌC THUẬT DỮ LIỆU THẬT</span>
          <h1>Chào {currentUser?.name || 'bạn'}, bắt đầu thư viện từ số 0.</h1>
          <p>
            Không còn tài khoản, tài liệu, lượt xem, tim, bình luận hay đánh giá giả.
            Mọi hoạt động mới sẽ được lưu trực tiếp vào Supabase.
          </p>

          <div className="live-hero-actions">
            <Link className="live-primary-link" to="/upload">Đăng tài liệu đầu tiên</Link>
            <Link className="live-secondary-link" to="/documents">Xem thư viện</Link>
          </div>
        </div>

        <div className="live-hero-stats">
          <article>
            <strong>{formatNumber(state.documents.length)}</strong>
            <span>Tài liệu thật</span>
          </article>
          <article>
            <strong>{formatNumber(state.users.length)}</strong>
            <span>Tài khoản thật</span>
          </article>
          <article>
            <strong>{formatNumber(state.posts.length)}</strong>
            <span>Bài viết thật</span>
          </article>
          <article>
            <strong>{formatNumber(state.history.length)}</strong>
            <span>Lịch sử của bạn</span>
          </article>
        </div>
      </section>

      <PageHeader
        eyebrow="ĐƯỢC CỘNG ĐỒNG QUAN TÂM"
        title="Tài liệu nổi bật"
        text="Xếp hạng theo lượt xem, lượt thích và đánh giá thật."
      >
        <Link className="live-text-link" to="/leaderboard">Xem xếp hạng →</Link>
      </PageHeader>

      {dataLoading && !state.documents.length ? (
        <div className="live-inline-loading">Đang tải dữ liệu từ Supabase...</div>
      ) : topDocuments.length ? (
        <div className="live-document-grid">
          {topDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              author={getUser(document.authorId)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📚"
          title="Thư viện đang trống"
          text="Chưa có tài liệu mẫu. Hãy tự đăng tài liệu đầu tiên để bắt đầu dữ liệu thật."
          actionTo="/upload"
          actionLabel="Đăng tài liệu"
        />
      )}

      <PageHeader
        eyebrow="MỚI ĐƯỢC ĐĂNG"
        title="Tài liệu mới nhất"
        text="Chỉ hiển thị tài liệu do người dùng thật đăng lên."
      />

      {newestDocuments.length ? (
        <div className="live-document-grid">
          {newestDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              author={getUser(document.authorId)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🌱"
          title="Chưa có nội dung mới"
          text="Dữ liệu sẽ xuất hiện tại đây sau khi người dùng đăng tài liệu."
        />
      )}
    </div>
  );
}
