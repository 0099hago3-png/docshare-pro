import {
  Camera,
  Check,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useApp } from '../context/AppContext.jsx';
import {
  getInitials,
  getProfileName,
  normalizeError,
  publicAssetUrl,
} from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';
import Modal from './Modal.jsx';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

function getExtension(file) {
  const byType = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  return byType[file?.type] || 'jpg';
}

function validateImage(file) {
  if (!file) return null;

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.';
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'Ảnh phải nhỏ hơn hoặc bằng 5 MB.';
  }

  return null;
}

function useObjectPreview(file) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  return url;
}

function ImagePicker({
  type,
  title,
  description,
  currentUrl,
  previewUrl,
  initials,
  selectedFile,
  removed,
  onSelect,
  onRemove,
}) {
  const inputRef = useRef(null);
  const isAvatar = type === 'avatar';
  const shownUrl = removed ? '' : (previewUrl || currentUrl);

  return (
    <article className={`profile-image-editor__card is-${type}`}>
      <header>
        <span>
          {isAvatar ? <Camera size={19} /> : <ImagePlus size={19} />}
        </span>

        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
      </header>

      <div className={`profile-image-editor__preview is-${type}`}>
        {shownUrl ? (
          <img src={shownUrl} alt={title} />
        ) : isAvatar ? (
          <span className="profile-image-editor__initials">
            {initials}
          </span>
        ) : (
          <div className="profile-image-editor__empty-cover">
            <UploadCloud size={28} />
            <span>Chưa có ảnh bìa</span>
          </div>
        )}

        {selectedFile && !removed && (
          <span className="profile-image-editor__selected">
            <Check size={13} />
            Đã chọn ảnh mới
          </span>
        )}

        {removed && (
          <span className="profile-image-editor__selected is-remove">
            <Trash2 size={13} />
            Sẽ xóa ảnh hiện tại
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          onSelect(file);
          event.target.value = '';
        }}
      />

      <div className="profile-image-editor__actions">
        <button
          className="button"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud size={16} />
          {shownUrl ? 'Chọn ảnh khác' : 'Chọn ảnh'}
        </button>

        {(currentUrl || previewUrl) && !removed && (
          <button
            className="button button--ghost profile-image-editor__remove"
            type="button"
            onClick={onRemove}
          >
            <Trash2 size={16} />
            Xóa ảnh
          </button>
        )}
      </div>
    </article>
  );
}

export default function ProfileImageEditor({
  open,
  onClose,
  profile,
  onSaved,
}) {
  const { currentUser, refreshProfile, toast } = useApp();

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  const [busy, setBusy] = useState(false);

  const avatarPreview = useObjectPreview(avatarFile);
  const coverPreview = useObjectPreview(coverFile);

  const profileName = getProfileName(profile);
  const initials = getInitials(profileName);

  const currentAvatarUrl = useMemo(
    () => (
      profile?.avatar_path
        ? publicAssetUrl('avatars', profile.avatar_path)
        : ''
    ),
    [profile?.avatar_path],
  );

  const currentCoverUrl = useMemo(
    () => (
      profile?.cover_path
        ? publicAssetUrl('avatars', profile.cover_path)
        : ''
    ),
    [profile?.cover_path],
  );

  useEffect(() => {
    if (!open) return;

    setAvatarFile(null);
    setCoverFile(null);
    setRemoveAvatar(false);
    setRemoveCover(false);
  }, [open]);

  function selectAvatar(file) {
    const error = validateImage(file);

    if (error) {
      toast(error, 'error');
      return;
    }

    setAvatarFile(file);
    setRemoveAvatar(false);
  }

  function selectCover(file) {
    const error = validateImage(file);

    if (error) {
      toast(error, 'error');
      return;
    }

    setCoverFile(file);
    setRemoveCover(false);
  }

  async function uploadImage(file, kind) {
    if (!file) return null;

    const extension = getExtension(file);
    const path = `${currentUser.id}/${kind}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    return path;
  }

  async function removeOldFiles(paths) {
    const ownPaths = paths.filter(
      (path) => path && path.startsWith(`${currentUser.id}/`),
    );

    if (!ownPaths.length) return;

    const { error } = await supabase.storage
      .from('avatars')
      .remove(ownPaths);

    if (error) {
      console.warn('Không xóa được ảnh cũ:', error.message);
    }
  }

  async function saveImages() {
    if (
      !avatarFile
      && !coverFile
      && !removeAvatar
      && !removeCover
    ) {
      toast('Bạn chưa chọn thay đổi ảnh nào.', 'error');
      return;
    }

    const uploadedPaths = [];

    try {
      setBusy(true);

      const newAvatarPath = avatarFile
        ? await uploadImage(avatarFile, 'avatar')
        : null;

      if (newAvatarPath) uploadedPaths.push(newAvatarPath);

      const newCoverPath = coverFile
        ? await uploadImage(coverFile, 'cover')
        : null;

      if (newCoverPath) uploadedPaths.push(newCoverPath);

      const nextAvatarPath = removeAvatar
        ? null
        : (newAvatarPath || profile?.avatar_path || null);

      const nextCoverPath = removeCover
        ? null
        : (newCoverPath || profile?.cover_path || null);

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_path: nextAvatarPath,
          cover_path: nextCoverPath,
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      const oldPathsToDelete = [];

      if (
        profile?.avatar_path
        && (removeAvatar || newAvatarPath)
      ) {
        oldPathsToDelete.push(profile.avatar_path);
      }

      if (
        profile?.cover_path
        && (removeCover || newCoverPath)
      ) {
        oldPathsToDelete.push(profile.cover_path);
      }

      await removeOldFiles(oldPathsToDelete);
      await refreshProfile();
      await onSaved?.();

      toast('Đã cập nhật ảnh đại diện và ảnh bìa.');
      onClose?.();
    } catch (error) {
      if (uploadedPaths.length) {
        await supabase.storage
          .from('avatars')
          .remove(uploadedPaths);
      }

      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) onClose?.();
      }}
      title="Ảnh đại diện & ảnh bìa"
      width={820}
      className="profile-image-editor-modal-v67 modal-card--no-scrollbar"
    >
      <div className="profile-image-editor-v67">
        <div className="profile-image-editor__intro">
          <ImagePlus size={20} />

          <div>
            <strong>Tùy chỉnh hình ảnh hồ sơ</strong>
            <p>
              Hỗ trợ JPG, PNG, WEBP. Mỗi ảnh tối đa 5 MB.
              Ảnh bìa nên dùng tỷ lệ ngang khoảng 16:5.
            </p>
          </div>
        </div>

        <div className="profile-image-editor__grid">
          <ImagePicker
            type="avatar"
            title="Ảnh đại diện"
            description="Ảnh vuông sẽ hiển thị đẹp nhất."
            currentUrl={currentAvatarUrl}
            previewUrl={avatarPreview}
            initials={initials}
            selectedFile={avatarFile}
            removed={removeAvatar}
            onSelect={selectAvatar}
            onRemove={() => {
              setAvatarFile(null);
              setRemoveAvatar(true);
            }}
          />

          <ImagePicker
            type="cover"
            title="Ảnh bìa"
            description="Ảnh ngang dùng làm nền đầu trang hồ sơ."
            currentUrl={currentCoverUrl}
            previewUrl={coverPreview}
            initials={initials}
            selectedFile={coverFile}
            removed={removeCover}
            onSelect={selectCover}
            onRemove={() => {
              setCoverFile(null);
              setRemoveCover(true);
            }}
          />
        </div>

        <div className="profile-image-editor__footer">
          <button
            className="button button--ghost"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            Hủy
          </button>

          <button
            className="button"
            type="button"
            onClick={saveImages}
            disabled={busy}
          >
            {busy ? (
              <>
                <LoaderCircle className="is-spinning-v67" size={17} />
                Đang tải ảnh...
              </>
            ) : (
              <>
                <Check size={17} />
                Lưu hình ảnh
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
