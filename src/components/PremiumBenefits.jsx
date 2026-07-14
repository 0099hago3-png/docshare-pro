import {
  BadgeCheck,
  Crown,
  Frame,
  Gift,
  Headphones,
  Percent,
  ShoppingCart,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BENEFITS = [
  {
    icon: Percent,
    title: 'Giảm 10% mọi tài liệu trả phí',
    description: 'Giá Premium được tính tự động cả khi mua lẻ và thanh toán giỏ hàng.',
  },
  {
    icon: Gift,
    title: 'Nhận bonus credit khi mua hoặc gia hạn',
    description: 'Mỗi gói Premium có số credit tặng kèm và được cộng sau khi Admin duyệt.',
  },
  {
    icon: ShoppingCart,
    title: 'Thanh toán nhiều tài liệu một lượt',
    description: 'Thêm tài liệu vào giỏ, xem tổng giá và áp dụng ưu đãi Premium ngay khi thanh toán.',
  },
  {
    icon: Frame,
    title: 'Khung ảnh bìa tài liệu độc quyền',
    description: 'Tác giả Premium có thể chọn hiệu ứng khung xanh, lá cây hoặc ánh sáng cho tài liệu của mình.',
  },
  {
    icon: Crown,
    title: 'Tên Premium nhiều màu có hiệu ứng',
    description: 'Huy hiệu nổi bật cạnh tên ở hồ sơ, bảng tin, bình luận, tài liệu và bảng xếp hạng.',
  },
  {
    icon: Sparkles,
    title: 'Hiệu ứng quà tặng nâng cao',
    description: 'Quà được trình diễn sinh động hơn ở tài liệu, bảng tin và bình luận.',
  },
  {
    icon: BadgeCheck,
    title: 'Nhận diện tài khoản uy tín',
    description: 'Khung avatar xanh Premium giúp tài khoản nổi bật mà không che ảnh đại diện.',
  },
  {
    icon: Zap,
    title: 'Ưu tiên trải nghiệm mới',
    description: 'Được ưu tiên sử dụng các tính năng cộng đồng và cá nhân hóa mới của DocShare Pro.',
  },
  {
    icon: Headphones,
    title: 'Ưu tiên hỗ trợ',
    description: 'Yêu cầu hỗ trợ của thành viên Premium được nhận diện rõ để xử lý nhanh hơn.',
  },
];

export default function PremiumBenefits({
  active = false,
  expiresAt = null,
  compact = false,
}) {
  return (
    <section className={`premium-benefits-v63 premium-benefits-v70 botanical-card${active ? ' is-active' : ''}${compact ? ' is-compact-v70' : ''}`}>
      <header className="premium-benefits-v63__header">
        <div>
          <span className="premium-benefits-v63__eyebrow">
            <Crown size={14} />
            ĐẶC QUYỀN DOCSHARE PREMIUM
          </span>

          <h2>
            {active
              ? 'Premium đang hoạt động trên tài khoản'
              : 'Nâng cấp để học tập và chia sẻ hiệu quả hơn'}
          </h2>

          <p>
            {active
              ? (
                <>
                  Bạn đang được áp dụng toàn bộ quyền lợi
                  {expiresAt
                    ? ` đến ${new Date(expiresAt).toLocaleDateString('vi-VN')}.`
                    : '.'}
                </>
              )
              : 'Giảm giá tài liệu, nhận bonus credit, mở khung bìa độc quyền và nhiều hiệu ứng cộng đồng.'}
          </p>
        </div>

        <Link className="button" to="/wallet?open=premium">
          <Crown size={16} />
          {active ? 'Gia hạn và nhận bonus' : 'Xem gói Premium'}
        </Link>
      </header>

      <div className="premium-benefits-v63__grid premium-benefits-v70__grid">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <article key={title}>
            <span>
              <Icon size={19} />
            </span>

            <div>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
