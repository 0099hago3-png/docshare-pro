import {
  BookOpen,
  CalendarDays,
  Edit3,
  Gift,
  GraduationCap,
  KeyRound,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';

import Avatar from '../components/Avatar.jsx';
import DocumentCard from '../components/DocumentCard.jsx';
import DonateModal from '../components/DonateModal.jsx';
import CreatorAnalyticsPanel from '../components/CreatorAnalyticsPanel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import Modal from '../components/Modal.jsx';
import PremiumBadge, {
  isPremiumActive,
} from '../components/PremiumBadge.jsx';
import PremiumBenefits from '../components/PremiumBenefits.jsx';
import SecurityModal from '../components/SecurityModal.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  formatDate,
  getProfileName,
  normalizeError,
} from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

const EMPTY_FORM = {
  full_name: '',
  username: '',
  phone: '',
  school_name: '',
  faculty: '',
  major: '',
  bio: '',
};

export default function Profile() {
  const { id } = useParams();

  const {
    currentUser,
    refreshProfile,
    toast,
  } = useApp();

  const profileId = id || currentUser.id;

  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const isOwn = profileId === currentUser.id;
  const premium = isPremiumActive(profile);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [
        { data: profileData, error },
        { data: docs },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single(),

        supabase
          .from('documents')
          .select(`
            *,
            profiles:author_id(
              id,
              full_name,
              username,
              avatar_path,
              premium,
              premium_expires_at
            ),
            categories(id,name),
            document_files(
              file_kind,
              storage_path
            )
          `)
          .eq('author_id', profileId)
          .eq('status', 'published')
          .order('created_at', { ascending: false }),
      ]);

      if (error) throw error;

      setProfile(profileData);

      setForm({
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        phone: profileData.phone || '',
        school_name: profileData.school_name || '',
        faculty: profileData.faculty || '',
        major: profileData.major || '',
        bio: profileData.bio || '',
      });

      setDocuments((docs || []).map((item) => ({
        ...item,
        cover_path: item.document_files?.find(
          (file) => file.file_kind === 'cover',
        )?.storage_path || null,
      })));
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [profileId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(event) {
    event.preventDefault();

    try {
      setBusy(true);

      const { error } = await supabase
        .from('profiles')
        .update(form)
        .eq('id', currentUser.id);

      if (error) throw error;

      toast('Đã cập nhật hồ sơ.');
      setEditOpen(false);

      await refreshProfile();
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <Loading label="Đang tải hồ sơ..." />;
  }

  if (!profile) {
    return <EmptyState title="Không tìm thấy người dùng" />;
  }

  return (
    <div className="page profile-page profile-page--v63">
      <section className={`profile-hero botanical-card${premium ? ' is-premium-v63' : ''}`}>
        <div className="profile-hero__leaf" />

        <Avatar profile={profile} size={104} />

        <div className="profile-hero__main">
          <div className="profile-name-row">
            <h1>{getProfileName(profile)}</h1>

            <PremiumBadge profile={profile} />
          </div>

          <p>@{profile.username}</p>

          <div className="profile-meta">
            <span>
              <Mail size={15} />
              {profile.email}
            </span>

            <span>
              <GraduationCap size={15} />
              {profile.school_name || 'Chưa cập nhật trường'}
            </span>

            <span>
              <MapPin size={15} />
              {profile.faculty || 'Chưa cập nhật khoa'}
              {' · '}
              {profile.major || 'Chưa cập nhật ngành'}
            </span>

            <span>
              <CalendarDays size={15} />
              Tham gia {formatDate(profile.created_at)}
            </span>
          </div>

          <div className="public-id">
            <strong>ID người dùng:</strong>
            {' '}
            {profile.public_id}
          </div>
        </div>

        <div className="profile-actions">
          {isOwn ? (
            <>
              <button
                className="button button--outline"
                type="button"
                onClick={() => setSecurityOpen(true)}
              >
                <ShieldCheck size={17} />
                Bảo mật
              </button>

              <button
                className="button"
                type="button"
                onClick={() => setEditOpen(true)}
              >
                <Edit3 size={17} />
                Sửa hồ sơ
              </button>
            </>
          ) : (
            <button
              className="button"
              type="button"
              onClick={() => setGiftOpen(true)}
            >
              <Gift size={17} />
              Tặng quà
            </button>
          )}
        </div>
      </section>

      {isOwn && (
        <PremiumBenefits
          active={premium}
          expiresAt={profile.premium_expires_at}
        />
      )}

      {isOwn && (
        <CreatorAnalyticsPanel userId={currentUser.id} />
      )}

      <div className="profile-columns">
        <aside className="profile-about botanical-card">
          <h2>
            <UserRound size={20} />
            Giới thiệu
          </h2>

          <p>
            {profile.bio || 'Người dùng chưa viết giới thiệu.'}
          </p>

          <dl>
            <div>
              <dt>Vai trò</dt>
              <dd>
                {profile.role === 'admin'
                  ? 'Quản trị viên'
                  : profile.role === 'teacher'
                    ? 'Giảng viên'
                    : 'Thành viên'}
              </dd>
            </div>

            <div>
              <dt>Trạng thái</dt>
              <dd>
                {profile.status === 'active'
                  ? 'Đang hoạt động'
                  : profile.status}
              </dd>
            </div>

            <div>
              <dt>Cấp độ</dt>
              <dd>Lv. {profile.level || 1}</dd>
            </div>

            <div>
              <dt>Premium</dt>
              <dd>
                {premium
                  ? `Đến ${formatDate(profile.premium_expires_at)}`
                  : 'Chưa kích hoạt'}
              </dd>
            </div>
          </dl>
        </aside>

        <section className="profile-documents">
          <div className="section-heading">
            <div>
              <BookOpen size={22} />
              <h2>Tài liệu đã đăng</h2>
            </div>

            <span>{documents.length} tài liệu</span>
          </div>

          {documents.length ? (
            <div className="document-grid document-grid--3">
              {documents.map((item) => (
                <DocumentCard
                  key={item.id}
                  document={item}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa đăng tài liệu"
              description="Tài liệu do người dùng đăng sẽ xuất hiện tại đây."
            />
          )}
        </section>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Sửa hồ sơ"
        width={700}
        className="profile-edit-modal-v63 modal-card--no-scrollbar"
      >
        <form className="form-grid profile-edit-form-v63" onSubmit={save}>
          <label>
            Họ và tên
            <input
              value={form.full_name}
              onChange={(event) => setForm((value) => ({
                ...value,
                full_name: event.target.value,
              }))}
              required
            />
          </label>

          <label>
            Tên người dùng
            <input
              value={form.username}
              onChange={(event) => setForm((value) => ({
                ...value,
                username: event.target.value,
              }))}
              required
            />
          </label>

          <label>
            Số điện thoại
            <input
              value={form.phone}
              onChange={(event) => setForm((value) => ({
                ...value,
                phone: event.target.value,
              }))}
            />
          </label>

          <label>
            Trường / đơn vị
            <input
              value={form.school_name}
              onChange={(event) => setForm((value) => ({
                ...value,
                school_name: event.target.value,
              }))}
            />
          </label>

          <label>
            Khoa
            <input
              value={form.faculty}
              onChange={(event) => setForm((value) => ({
                ...value,
                faculty: event.target.value,
              }))}
            />
          </label>

          <label>
            Ngành
            <input
              value={form.major}
              onChange={(event) => setForm((value) => ({
                ...value,
                major: event.target.value,
              }))}
            />
          </label>

          <label className="span-2">
            Giới thiệu
            <textarea
              rows="5"
              value={form.bio}
              onChange={(event) => setForm((value) => ({
                ...value,
                bio: event.target.value,
              }))}
            />
          </label>

          <div className="span-2 form-actions form-actions--end">
            <button
              className="button button--ghost"
              type="button"
              onClick={() => setEditOpen(false)}
            >
              Hủy
            </button>

            <button className="button" disabled={busy}>
              <Save size={17} />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>

      <SecurityModal
        open={securityOpen}
        onClose={() => setSecurityOpen(false)}
      />

      <DonateModal
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
        receiver={profile}
        targetType="profile"
        targetId={profile.id}
      />
    </div>
  );
}
