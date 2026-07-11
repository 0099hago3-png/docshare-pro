import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  DocumentCard,
  EmptyState,
  PageHeader,
  UserAvatar,
  formatNumber,
} from '../components/LiveUI.jsx';

export default function Profile() {
  const { id } = useParams();
  const {
    state,
    currentUser,
    getUser,
    toggleFollow,
    updateProfile,
    updateAvatarImage,
  } = useApp();

  const profile = id ? getUser(id) : currentUser;
  const isOwner = profile?.id === currentUser?.id;
  const following = state.follows.includes(profile?.id);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    phone: '',
    school: '',
    faculty: '',
    major: '',
    bio: '',
  });

  useEffect(() => {
    if (!profile) return;

    setForm({
      name: profile.name || '',
      username: profile.username || '',
      phone: profile.phone || '',
      school: profile.school || '',
      faculty: profile.faculty || '',
      major: profile.major || '',
      bio: profile.bio || '',
    });
  }, [profile]);

  const documents = useMemo(() => (
    state.documents.filter((document) => document.authorId === profile?.id)
  ), [profile?.id, state.documents]);

  if (!profile?.id) {
    return (
      <div className="live-page">
        <EmptyState
          icon="👤"
          title="Không tìm thấy hồ sơ"
          text="Tài khoản này không tồn tại hoặc bạn chưa đăng nhập."
        />
      </div>
    );
  }

  function updateField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    const ok = await updateProfile(form);
    setSaving(false);
    if (ok) setEditing(false);
  }

  return (
    <div className="live-page">
      <section className="live-profile-hero">
        <div className="live-profile-cover" />

        <div className="live-profile-content">
          <div className="live-profile-avatar-wrap">
            <UserAvatar user={profile} size="xl" />

            {isOwner && (
              <label className="live-avatar-upload">
                Đổi ảnh
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) updateAvatarImage(file);
                  }}
                />
              </label>
            )}
          </div>

          <div className="live-profile-main">
            <div className="live-profile-name-row">
              <h1>{profile.name}</h1>
              {profile.verified && <span className="live-verified">✓</span>}
              {profile.premium && <span className="live-premium">Premium</span>}
              <span className="live-role-pill">{profile.role}</span>
            </div>

            <p>@{profile.username || profile.id.slice(0, 8)}</p>
            <p>{profile.bio || 'Chưa có giới thiệu.'}</p>

            <div className="live-profile-meta">
              <span>🏫 {profile.school || 'Chưa cập nhật trường'}</span>
              <span>🎓 {profile.major || 'Chưa cập nhật ngành'}</span>
              <span>📅 Tham gia {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('vi-VN') : ''}</span>
            </div>
          </div>

          <div className="live-profile-actions">
            {isOwner ? (
              <button className="live-primary-button" type="button" onClick={() => setEditing((value) => !value)}>
                {editing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
              </button>
            ) : (
              <button className="live-primary-button" type="button" onClick={() => toggleFollow(profile.id)}>
                {following ? '✓ Đang theo dõi' : '+ Theo dõi'}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="live-profile-stats">
        <article><strong>{formatNumber(profile.followers)}</strong><span>Người theo dõi</span></article>
        <article><strong>{formatNumber(profile.following?.length)}</strong><span>Đang theo dõi</span></article>
        <article><strong>{formatNumber(documents.length)}</strong><span>Tài liệu</span></article>
        <article><strong>{formatNumber(profile.level)}</strong><span>Cấp độ</span></article>
      </div>

      {editing && isOwner && (
        <form className="live-panel live-profile-form" onSubmit={saveProfile}>
          <h2>Cập nhật hồ sơ</h2>

          <div className="live-form-grid two">
            <label className="live-field">
              <span>Họ và tên</span>
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
            </label>

            <label className="live-field">
              <span>Tên người dùng</span>
              <input value={form.username} onChange={(event) => updateField('username', event.target.value)} required />
            </label>
          </div>

          <div className="live-form-grid two">
            <label className="live-field">
              <span>Số điện thoại</span>
              <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
            </label>

            <label className="live-field">
              <span>Trường</span>
              <input value={form.school} onChange={(event) => updateField('school', event.target.value)} />
            </label>
          </div>

          <div className="live-form-grid two">
            <label className="live-field">
              <span>Khoa</span>
              <input value={form.faculty} onChange={(event) => updateField('faculty', event.target.value)} />
            </label>

            <label className="live-field">
              <span>Ngành</span>
              <input value={form.major} onChange={(event) => updateField('major', event.target.value)} />
            </label>
          </div>

          <label className="live-field">
            <span>Giới thiệu</span>
            <textarea value={form.bio} onChange={(event) => updateField('bio', event.target.value)} />
          </label>

          <button className="live-primary-button" type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </form>
      )}

      <PageHeader
        eyebrow="THƯ VIỆN CÁ NHÂN"
        title={`Tài liệu của ${profile.name}`}
        text="Chỉ hiển thị tài liệu thật đã đăng lên Supabase."
      >
        {isOwner && <Link className="live-primary-link" to="/upload">+ Đăng tài liệu</Link>}
      </PageHeader>

      {documents.length ? (
        <div className="live-document-grid">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} author={profile} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📚"
          title="Chưa có tài liệu"
          text={isOwner ? 'Hãy đăng tài liệu đầu tiên của bạn.' : 'Người dùng này chưa đăng tài liệu.'}
          actionTo={isOwner ? '/upload' : undefined}
          actionLabel={isOwner ? 'Đăng tài liệu' : undefined}
        />
      )}
    </div>
  );
}
