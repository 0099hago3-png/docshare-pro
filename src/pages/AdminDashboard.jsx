import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  EmptyState,
  PageHeader,
  formatNumber,
} from '../components/LiveUI.jsx';

export default function AdminDashboard() {
  const {
    state,
    adminApproveTransaction,
    adminRejectTransaction,
    adminDeleteDocument,
    adminDeletePost,
    adminResolveReport,
  } = useApp();

  const [tab, setTab] = useState('overview');

  const pendingPayments = useMemo(() => (
    state.paymentRequests.filter((item) => item.status === 'pending')
  ), [state.paymentRequests]);

  const pendingReports = useMemo(() => (
    state.reports.filter((item) => item.status === 'pending')
  ), [state.reports]);

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="QUẢN TRỊ DỮ LIỆU THẬT"
        title="Trung tâm Admin"
        text="Không còn số liệu mẫu. Tất cả thống kê dưới đây lấy trực tiếp từ Supabase."
      />

      <div className="live-admin-stats">
        <article><strong>{formatNumber(state.users.length)}</strong><span>Tài khoản</span></article>
        <article><strong>{formatNumber(state.documents.length)}</strong><span>Tài liệu</span></article>
        <article><strong>{formatNumber(state.posts.length)}</strong><span>Bài viết</span></article>
        <article><strong>{formatNumber(pendingPayments.length)}</strong><span>Giao dịch chờ</span></article>
        <article><strong>{formatNumber(pendingReports.length)}</strong><span>Báo cáo chờ</span></article>
      </div>

      <div className="live-filter-tabs">
        {[
          ['overview', 'Tổng quan'],
          ['users', 'Tài khoản'],
          ['documents', 'Tài liệu'],
          ['posts', 'Bài viết'],
          ['payments', 'Thanh toán'],
          ['reports', 'Báo cáo'],
          ['logs', 'Nhật ký'],
        ].map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? 'active' : ''}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="live-admin-overview">
          <section className="live-panel">
            <h2>Dữ liệu mới nhất</h2>
            <p>Database đã bắt đầu từ số 0. Khi người dùng thao tác thật, số liệu sẽ tự tăng.</p>
            <ul className="live-check-list">
              <li className="done">Tài khoản: Supabase Auth + profiles</li>
              <li className="done">Tài liệu: documents + Storage</li>
              <li className="done">Lượt xem: document_views</li>
              <li className="done">Tim: document_likes / post_likes</li>
              <li className="done">Bình luận: document_comments / post_comments</li>
              <li className="done">Đánh giá: document_ratings</li>
              <li className="done">Lịch sử: activity_history</li>
            </ul>
          </section>

          <section className="live-panel">
            <h2>Việc cần làm</h2>
            <p>
              Tạo tài khoản Admin thật trong Supabase Authentication, sau đó đổi cột role trong bảng profiles thành admin.
            </p>
          </section>
        </div>
      )}

      {tab === 'users' && (
        state.users.length ? (
          <div className="live-table-wrap">
            <table className="live-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Credit</th>
                </tr>
              </thead>
              <tbody>
                {state.users.map((user) => (
                  <tr key={user.id}>
                    <td><Link to={`/users/${user.id}`}>{user.name}</Link></td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>{formatNumber(user.credit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="👥" title="Chưa có tài khoản" text="Tạo tài khoản trong Authentication hoặc đăng ký trên website." />
        )
      )}

      {tab === 'documents' && (
        state.documents.length ? (
          <div className="live-table-wrap">
            <table className="live-table">
              <thead>
                <tr>
                  <th>Tài liệu</th>
                  <th>Tác giả</th>
                  <th>Trạng thái</th>
                  <th>Lượt xem</th>
                  <th>Tim</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {state.documents.map((document) => (
                  <tr key={document.id}>
                    <td><Link to={`/documents/${document.id}`}>{document.title}</Link></td>
                    <td>{state.users.find((user) => user.id === document.authorId)?.name || '—'}</td>
                    <td>{document.status}</td>
                    <td>{formatNumber(document.views)}</td>
                    <td>{formatNumber(document.likes)}</td>
                    <td>
                      <button
                        className="live-danger-button"
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Xóa tài liệu “${document.title}”?`)) {
                            adminDeleteDocument(document.id);
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="📚" title="Chưa có tài liệu" text="Không có dữ liệu mẫu." />
        )
      )}

      {tab === 'posts' && (
        state.posts.length ? (
          <div className="live-table-wrap">
            <table className="live-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Nội dung</th>
                  <th>Tim</th>
                  <th>Bình luận</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {state.posts.map((post) => (
                  <tr key={post.id}>
                    <td>{post.title || 'Không tiêu đề'}</td>
                    <td>{post.content.slice(0, 100)}</td>
                    <td>{post.likes}</td>
                    <td>{post.comments.length}</td>
                    <td>
                      <button
                        className="live-danger-button"
                        type="button"
                        onClick={() => {
                          if (window.confirm('Xóa bài viết này?')) adminDeletePost(post.id);
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="📝" title="Chưa có bài viết" text="Bảng tin đang trống." />
        )
      )}

      {tab === 'payments' && (
        state.paymentRequests.length ? (
          <div className="live-table-wrap">
            <table className="live-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Credit</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {state.paymentRequests.map((item) => (
                  <tr key={item.id}>
                    <td>{state.users.find((user) => user.id === item.userId)?.name || item.userId}</td>
                    <td>{item.type}</td>
                    <td>{formatNumber(item.amount)} đ</td>
                    <td>{formatNumber(item.credit)}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.status === 'pending' ? (
                        <div className="live-inline-actions">
                          <button type="button" onClick={() => adminApproveTransaction(item.id)}>Duyệt</button>
                          <button type="button" className="danger" onClick={() => adminRejectTransaction(item.id, 'Không hợp lệ')}>Từ chối</button>
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="💳" title="Chưa có yêu cầu thanh toán" text="Không có dữ liệu mẫu." />
        )
      )}

      {tab === 'reports' && (
        state.reports.length ? (
          <div className="live-table-wrap">
            <table className="live-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Lý do</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {state.reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.type}</td>
                    <td>{report.reason}</td>
                    <td>{report.status}</td>
                    <td>
                      {report.status === 'pending' ? (
                        <button type="button" onClick={() => adminResolveReport(report.id, 'Đã xem xét', 'Đã xử lý trong hệ thống.')}>Đánh dấu đã xử lý</button>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="🚩" title="Chưa có báo cáo" text="Không có dữ liệu mẫu." />
        )
      )}

      {tab === 'logs' && (
        state.adminLogs.length ? (
          <div className="live-history-list">
            {state.adminLogs.map((log) => (
              <article className="live-history-item" key={log.id}>
                <div className="live-history-icon">🛡️</div>
                <div>
                  <span>{log.action}</span>
                  <h3>{log.detail || 'Không có chi tiết'}</h3>
                  <small>{log.date}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon="🛡️" title="Chưa có nhật ký Admin" text="Bảng admin_logs đang trống." />
        )
      )}
    </div>
  );
}
