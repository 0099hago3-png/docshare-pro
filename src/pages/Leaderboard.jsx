import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  EmptyState,
  PageHeader,
  formatNumber,
} from '../components/LiveUI.jsx';

export default function Leaderboard() {
  const { state, getUser } = useApp();

  const rankedDocuments = [...state.documents]
    .filter((document) => document.status === 'published')
    .sort((first, second) => (
      second.likes * 3 + second.views + second.rating * 10
    ) - (
      first.likes * 3 + first.views + first.rating * 10
    ));

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="XẾP HẠNG TÀI LIỆU"
        title="Tài liệu được quan tâm nhất"
        text="Xếp hạng từ trên xuống dưới bằng lượt xem, tim và đánh giá thật."
      />

      {rankedDocuments.length ? (
        <div className="live-ranking-list">
          {rankedDocuments.map((document, index) => {
            const author = getUser(document.authorId);

            return (
              <Link
                className="live-ranking-row"
                key={document.id}
                to={`/documents/${document.id}`}
              >
                <strong className={`live-rank-number rank-${index + 1}`}>
                  {index + 1}
                </strong>

                <div className="live-ranking-cover">
                  {document.coverPreview ? (
                    <img src={document.coverPreview} alt={document.title} />
                  ) : (
                    <span>📘</span>
                  )}
                </div>

                <div className="live-ranking-main">
                  <h3>{document.title}</h3>
                  <p>{author.name} · {document.subject || 'Tài liệu học tập'}</p>
                </div>

                <div className="live-ranking-stats">
                  <span>👁 {formatNumber(document.views)}</span>
                  <span>♥ {formatNumber(document.likes)}</span>
                  <span>★ {Number(document.rating || 0).toFixed(1)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🏆"
          title="Chưa có bảng xếp hạng"
          text="Khi có tài liệu và hoạt động thật, thứ hạng sẽ tự xuất hiện."
          actionTo="/upload"
          actionLabel="Đăng tài liệu đầu tiên"
        />
      )}
    </div>
  );
}
