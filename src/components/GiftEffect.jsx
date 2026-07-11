import { Gift, Heart, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import GiftArtwork from './GiftArtwork.jsx';

const particleCount = 24;

const themeInfo = {
  star: { title: 'Ánh sao ghi nhận', message: 'Một lời động viên nhỏ đang lan tỏa cho tác giả.', emoji: '✦' },
  coffee: { title: 'Tách cà phê động lực', message: 'Một nguồn năng lượng mới vừa được gửi đến người chia sẻ tri thức.', emoji: '☕' },
  giftbox: { title: 'Hộp quà cảm ơn', message: 'Món quà này như một lời cảm ơn chân thành cho nội dung hữu ích.', emoji: '🎁' },
  rocket: { title: 'Cất cánh bứt phá', message: 'Tài liệu này vừa nhận thêm động lực để tiếp tục lan tỏa mạnh hơn.', emoji: '🚀' },
  crown: { title: 'Khoảnh khắc vinh danh', message: 'Một lời tri ân trang trọng dành cho tác giả nổi bật.', emoji: '👑' },
  lion: { title: 'Huy chương danh giá', message: 'Tài liệu vừa nhận được sự tôn vinh nổi bật từ cộng đồng.', emoji: '🦁' },
  diamond: { title: 'Bảo thạch học thuật', message: 'Một món quà quý giá vừa thắp sáng thêm giá trị tri thức.', emoji: '💎' },
  rose: { title: 'Trái tim đồng hành', message: 'Một lời cảm ơn ấm áp vừa được gửi đi.', emoji: '🌹' },
  bouquet: { title: 'Bó nguyệt quế', message: 'Tác giả vừa nhận được sự ghi nhận đầy trang trọng.', emoji: '💐' },
  castle: { title: 'Thư viện bảo trợ', message: 'Một nghi thức tri ân lớn vừa diễn ra cho tài liệu xuất sắc.', emoji: '🏛️' },
};

export default function GiftEffect() {
  const { state } = useApp();
  const gift = state.lastGiftEffect;
  if (!gift) return null;

  const theme = themeInfo[gift.theme] || themeInfo.star;

  return (
    <div className={`gift-ceremony-v29 gift-level-${gift.effect || 'small'} gift-theme-${gift.theme || 'star'} gift-id-${gift.id || 'default'}`} role="status" aria-live="polite">
      <div className="gift-ceremony-backdrop-v29" />
      <div className="gift-particles-v29" aria-hidden="true">
        {Array.from({ length: particleCount }, (_, index) => (
          <i
            key={index}
            style={{
              '--i': index,
              '--x': `${8 + ((index * 17) % 84)}%`,
              '--delay': `${(index % 8) * 0.11}s`,
              '--duration': `${2.7 + (index % 5) * 0.35}s`,
            }}
          />
        ))}
      </div>

      <section className="gift-stage-v29 gift-stage-v35">
        <div className="gift-ribbon-v29"><Sparkles size={15}/> NGHI THỨC TRI ÂN DOCSHARE</div>
        <div className={`gift-art-stage-v29 gift-theme-stage-v35 gift-theme-stage-${gift.theme || 'star'}`}>
          <span className="gift-orbit-v29 orbit-one" />
          <span className="gift-orbit-v29 orbit-two" />
          <span className="gift-theme-burst-v35 burst-a">{theme.emoji}</span>
          <span className="gift-theme-burst-v35 burst-b">{theme.emoji}</span>
          <span className="gift-theme-burst-v35 burst-c">{theme.emoji}</span>
          <GiftArtwork gift={gift} size="ceremony" />
          {gift.effect === 'legendary' && <span className="gift-legendary-signature-v38">HUYỀN THOẠI</span>}
          <span className="gift-heart-v29 heart-one"><Heart size={17}/></span>
          <span className="gift-heart-v29 heart-two"><Sparkles size={16}/></span>
        </div>
        <small>MỘT MÓN QUÀ VỪA ĐƯỢC GỬI</small>
        <h2>{gift.name}</h2>
        <p className="gift-stage-copy-v35">{theme.message}</p>
        <div className="gift-credit-chip-v29"><Gift size={16}/><b>{gift.credit}</b> credit tri ân</div>
        <div className="gift-theme-notes-v35">
          <span>{theme.title}</span>
          <span>Hiệu ứng: {gift.effect}</span>
        </div>
        <div className="gift-stage-footer-v29"><span/><b>TRI THỨC ĐƯỢC CHIA SẺ SẼ TIẾP TỤC NẢY MẦM</b><span/></div>
      </section>
    </div>
  );
}
