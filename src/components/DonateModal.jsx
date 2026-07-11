import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Crown, Gem, Gift, Heart, Info, Plus, Search, Sparkles, Star, Timer, WandSparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { formatNumber } from '../utils/helpers.js';
import GiftArtwork from './GiftArtwork.jsx';

const categories = [
  { id: 'starter', label: 'Quà khởi đầu', icon: Gift, description: 'Dễ tặng, gọn nhẹ' },
  { id: 'support', label: 'Quà ủng hộ', icon: Heart, description: 'Khích lệ tác giả' },
  { id: 'premium', label: 'Quà cao cấp', icon: Crown, description: 'Trang trọng, nổi bật' },
  { id: 'legendary', label: 'Quà huyền thoại', icon: Gem, description: 'Hiệu ứng đặc biệt' },
];

const effectLabels = {
  small: 'Hiệu ứng nhỏ',
  medium: 'Hiệu ứng vừa',
  big: 'Hiệu ứng lớn',
  mega: 'Hiệu ứng sân khấu',
  legendary: 'Legendary',
};

const effectDuration = {
  small: '4 giây',
  medium: '5 giây',
  big: '6 giây',
  mega: '7 giây',
  legendary: '9 giây',
};

const effectDescription = {
  star: 'Ánh sao vàng xuất hiện quanh món quà và lan tỏa thành các hạt sáng nhỏ.',
  coffee: 'Hơi ấm, hạt cà phê và những chiếc lá chuyển động nhẹ quanh tách cà phê.',
  giftbox: 'Hộp quà mở ra cùng dải ruy băng, pháo giấy và những hạt sáng vui mắt.',
  rocket: 'Tên lửa cất cánh, tạo vệt lửa và mưa sao băng trên toàn màn hình.',
  crown: 'Vương miện xuất hiện giữa quầng sáng vàng cùng hiệu ứng vinh danh trang trọng.',
  lion: 'Huy chương sư tử tỏa sáng, tạo vòng hào quang mạnh và hiệu ứng sân khấu.',
  diamond: 'Kim cương phản chiếu ánh sáng xanh tím, tạo tinh vân và tia sáng lấp lánh.',
  rose: 'Cánh hoa hồng bay chậm cùng ánh sáng lung linh, thể hiện lời tri ân tinh tế.',
  bouquet: 'Bó hoa bung nở, lá và cánh hoa chuyển động nhẹ như một màn chúc mừng.',
  castle: 'Không gian thư viện huyền thoại mở ra với cột sáng, sao vàng và hiệu ứng bảo trợ.',
};

function getCategory(gift) {
  if (gift.effect === 'legendary') return 'legendary';
  if (gift.credit <= 100) return 'starter';
  if (gift.credit <= 500) return 'support';
  return 'premium';
}

function getRarity(gift) {
  if (gift.effect === 'legendary') return 'Huyền thoại';
  if (gift.effect === 'mega') return 'Sử thi';
  if (gift.effect === 'big') return 'Cao cấp';
  if (gift.effect === 'medium') return 'Hiếm';
  return 'Phổ biến';
}

export default function DonateModal({ open, onClose, mode = 'post', targetId }) {
  const { state, currentUser, donatePost, donateDocument, getUser } = useApp();
  const [selectedId, setSelectedId] = useState(state.giftStore?.[0]?.id || '');
  const [category, setCategory] = useState('starter');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    const first = state.giftStore?.[0];
    setSelectedId(first?.id || '');
    setCategory(first ? getCategory(first) : 'starter');
    setSearch('');
  }, [open, state.giftStore]);

  const filteredGifts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const list = (state.giftStore || []).filter((gift) => {
      const matchCategory = getCategory(gift) === category;
      const matchKeyword = !keyword || `${gift.name} ${gift.credit} ${gift.theme}`.toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.credit - b.credit;
      if (sort === 'price-desc') return b.credit - a.credit;
      if (sort === 'rarity') return ['small', 'medium', 'big', 'mega', 'legendary'].indexOf(b.effect) - ['small', 'medium', 'big', 'mega', 'legendary'].indexOf(a.effect);
      return Number(String(b.id).replace(/\D/g, '')) - Number(String(a.id).replace(/\D/g, ''));
    });
  }, [state.giftStore, category, search, sort]);

  useEffect(() => {
    if (!open) return;
    if (!filteredGifts.some((gift) => gift.id === selectedId)) {
      setSelectedId(filteredGifts[0]?.id || '');
    }
  }, [filteredGifts, open, selectedId]);

  const selected = (state.giftStore || []).find((gift) => gift.id === selectedId) || filteredGifts[0] || null;
  const canAfford = selected ? Number(currentUser?.credit || 0) >= selected.credit : false;
  const target = mode === 'document'
    ? state.documents.find((item) => item.id === targetId)
    : state.posts.find((item) => item.id === targetId);
  const recipientId = mode === 'document' ? target?.authorId : target?.authorId;
  const recipient = recipientId ? getUser(recipientId) : null;
  const targetLabel = mode === 'document' ? 'tài liệu' : 'bài đăng';

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !selected) return null;

  function submit() {
    const ok = mode === 'document' ? donateDocument(targetId, selected) : donatePost(targetId, selected);
    if (ok) onClose();
  }

  return createPortal(
    <div className="gift-window-backdrop-v38 gift-window-portal-v39" onMouseDown={onClose}>
      <section className="gift-window-v38" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Hộp quà tặng tri ân">
        <header className="gift-window-titlebar-v38">
          <div className="window-dots-v38" aria-hidden="true"><i/><i/><i/></div>
          <div className="gift-window-heading-v38">
            <span><Sparkles size={14}/> DOCSHARE GIFT CENTER</span>
            <h2>Hộp quà tặng tri ân</h2>
            <p>Gửi tặng yêu thương · Lan tỏa tri thức · Kết nối cộng đồng</p>
          </div>
          <button className="gift-window-close-v38" onClick={onClose} aria-label="Đóng cửa sổ">×</button>
        </header>

        <div className="gift-target-strip-v39">
          <div>
            <span>ĐANG GỬI QUÀ CHO {targetLabel.toUpperCase()}</span>
            <b>{target?.title || target?.content || 'Nội dung DocShare'}</b>
          </div>
          <div className="gift-target-recipient-v39">
            <span>Người nhận</span>
            <b>{recipient?.name || 'Tác giả DocShare'}</b>
          </div>
        </div>

        <div className="gift-window-body-v38">
          <aside className="gift-category-panel-v38">
            <nav>
              {categories.map(({ id, label, icon: Icon, description }) => {
                const count = (state.giftStore || []).filter((gift) => getCategory(gift) === id).length;
                return (
                  <button key={id} className={category === id ? 'active' : ''} onClick={() => setCategory(id)}>
                    <Icon size={20}/>
                    <span><b>{label}</b><small>{description}</small></span>
                    <em>{count}</em>
                  </button>
                );
              })}
            </nav>

            <div className="gift-sidebar-art-v38">
              <GiftArtwork gift={{ id: 'g4', name: 'Hộp quà tri ân', theme: 'giftbox' }} size="catalog" />
              <p>Mỗi món quà là một lời tri ân đầy ý nghĩa dành cho người bạn trân quý.</p>
              <Heart size={18}/>
            </div>
          </aside>

          <main className="gift-catalog-panel-v38">
            <div className="gift-catalog-toolbar-v38">
              <div>
                <h3><Gift size={18}/> Chọn món quà bạn muốn gửi</h3>
                <p>{filteredGifts.length} món quà trong danh mục này</p>
              </div>
              <div className="gift-catalog-controls-v38">
                <label><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm quà..."/></label>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                  <option value="rarity">Độ hiếm</option>
                </select>
              </div>
            </div>

            <div className="gift-catalog-grid-v38 custom-scroll">
              {filteredGifts.map((gift) => (
                <button
                  type="button"
                  key={gift.id}
                  className={`gift-catalog-card-v38 ${gift.id === selected.id ? 'active' : ''} rarity-${gift.effect}`}
                  onClick={() => setSelectedId(gift.id)}
                >
                  <span className="gift-card-effect-v38">{effectLabels[gift.effect]}</span>
                  <GiftArtwork gift={gift} size="catalog" />
                  {gift.effect === 'legendary' && <span className="gift-legendary-badge-v38">Legendary</span>}
                  <div>
                    <h4>{gift.name}</h4>
                    <p><b>{formatNumber(gift.credit)}</b><span>credit</span></p>
                  </div>
                </button>
              ))}
              {!filteredGifts.length && <div className="gift-empty-v38"><Search size={30}/><h4>Không tìm thấy quà</h4><p>Thử từ khóa khác hoặc đổi danh mục.</p></div>}
            </div>

            <div className="gift-catalog-tip-v38"><WandSparkles size={16}/><span>Mẹo: quà cấp cao sẽ có hiệu ứng toàn màn hình nổi bật hơn trong phòng tài liệu.</span></div>
          </main>

          <aside className={`gift-preview-panel-v38 theme-${selected.theme} effect-${selected.effect}`}>
            <div className="gift-preview-visual-v38">
              <span className="gift-preview-effect-v38">{effectLabels[selected.effect]}</span>
              <div className="gift-preview-sparkles-v38" aria-hidden="true"><i/><i/><i/><i/><i/></div>
              <GiftArtwork gift={selected} size="ceremony" />
              <h3>{selected.name}</h3>
              <p><b>{formatNumber(selected.credit)}</b> credit</p>
            </div>

            <div className="gift-preview-details-v38">
              <h4><Sparkles size={16}/> Mô tả hiệu ứng</h4>
              <p>{effectDescription[selected.theme] || 'Món quà xuất hiện với ánh sáng và chuyển động riêng sau khi gửi.'}</p>
              <dl>
                <div><dt><Timer size={14}/> Thời gian hiển thị</dt><dd>{effectDuration[selected.effect]}</dd></div>
                <div><dt><Star size={14}/> Khu vực hiển thị</dt><dd>{selected.effect === 'small' ? 'Giữa màn hình' : 'Toàn màn hình'}</dd></div>
                <div><dt><Gem size={14}/> Độ hiếm</dt><dd>{getRarity(selected)}</dd></div>
              </dl>
            </div>

            <button className="gift-send-button-v38" onClick={submit} disabled={!canAfford}>
              <Gift size={19}/>{canAfford ? 'Gửi quà tặng' : 'Không đủ credit'}
            </button>
            <div className="gift-balance-v38">
              <span>Số dư của bạn: <b>{formatNumber(currentUser?.credit || 0)} credit</b></span>
              <button type="button" title="Nạp thêm credit"><Plus size={14}/></button>
            </div>
            {!canAfford && <p className="gift-balance-warning-v38"><Info size={14}/> Bạn cần thêm {formatNumber(selected.credit - Number(currentUser?.credit || 0))} credit.</p>}
          </aside>
        </div>
      </section>
    </div>,
    document.body,
  );
}
