import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from './Avatar.jsx';

function readImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function AvatarEditorModal({ open, onClose, user }) {
  const { state, setAvatarFrame, updateAvatarImage } = useApp();
  const [draft, setDraft] = useState(user?.avatarImage || { data: '', zoom: 120, x: 50, y: 50 });
  const owned = useMemo(() => new Set(user?.ownedFrames || []), [user]);
  if (!open) return null;

  async function chooseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = await readImage(file);
    setDraft({ data, zoom: 120, x: 50, y: 50 });
  }

  function saveAvatar() {
    if (draft.data) updateAvatarImage(draft);
    onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card avatar-editor-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>Chỉnh ảnh đại diện & khung</h3>
            <p className="muted">Tải ảnh, căn vị trí, chọn khung trong túi đồ.</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <div className="avatar-editor-layout">
          <div className="avatar-crop-panel">
            <div className="avatar-preview-stage">
              <Avatar user={{ ...user, avatarImage: draft }} size="xl" />
            </div>
            <label className="btn primary file-btn">
              Chọn ảnh đại diện
              <input type="file" accept="image/*" onChange={chooseFile} />
            </label>
            <label>Phóng to ảnh <input type="range" min="80" max="220" value={draft.zoom || 120} onChange={(e) => setDraft({ ...draft, zoom: Number(e.target.value) })} /></label>
            <label>Dịch ngang <input type="range" min="0" max="100" value={draft.x ?? 50} onChange={(e) => setDraft({ ...draft, x: Number(e.target.value) })} /></label>
            <label>Dịch dọc <input type="range" min="0" max="100" value={draft.y ?? 50} onChange={(e) => setDraft({ ...draft, y: Number(e.target.value) })} /></label>
            <button className="btn primary" onClick={saveAvatar}>Lưu ảnh đại diện</button>
          </div>

          <div className="frame-inventory-panel">
            <h4>Túi khung đại diện</h4>
            <p className="muted">Cấp càng cao mở khung càng đẹp. Top bảng xếp hạng tháng được tặng khung riêng.</p>
            <div className="frame-grid">
              {state.avatarFrames.map((frame) => {
                const has = owned.has(frame.id);
                const active = user?.activeFrame === frame.id;
                return (
                  <button
                    key={frame.id}
                    className={`frame-item ${frame.className} ${has ? 'owned' : 'locked'} ${active ? 'active' : ''}`}
                    onClick={() => has && setAvatarFrame(frame.id)}
                    disabled={!has}
                  >
                    <span className="frame-demo"><span>{user?.avatar || 'U'}</span></span>
                    <b>{frame.name}</b>
                    <small>{has ? frame.requirement : `Khóa · ${frame.requirement}`}</small>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Đóng</button>
          <button className="btn primary" onClick={saveAvatar}>Hoàn tất</button>
        </div>
      </div>
    </div>
  );
}
