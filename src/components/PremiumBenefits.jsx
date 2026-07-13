import {
  BadgeCheck,
  Crown,
  Gift,
  Headphones,
  Percent,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BENEFITS = [
  {
    icon: Percent,
    title: 'Giảm 10% khi mua tài liệu',
    description: 'Giá ưu đãi được tính tự động trước khi xác nhận mua.',
  },
  {
    icon: Crown,
    title: 'Huy hiệu Premium nổi bật',
    description: 'Hiện cạnh tên ở hồ sơ, bảng tin, bình luận và tài liệu.',
  },
  {
    icon: BadgeCheck,
    title: 'Khung hồ sơ cao cấp',
    description: 'Avatar và tên có hiệu ứng ánh sáng riêng của Premium.',
  },
  {
    icon: Sparkles,
    title: 'Hiệu ứng tương tác đẹp hơn',
    description: 'Tên Premium và các hoạt động nổi bật hơn trong cộng đồng.',
  },
  {
    icon: Gift,
    title: 'Hiệu ứng quà đặc biệt',
    description: 'Quà tặng và lời tri ân được hiển thị nổi bật hơn.',
  },
  {
    icon: Headphones,
    title: 'Ưu tiên hỗ trợ',
    description: 'Yêu cầu hỗ trợ của Premium được nhận diện rõ hơn.',
  },
];

export default function PremiumBenefits({
  active = false,
  expiresAt = null,
}) {
  return (
    <section className={`premium-benefits-v63 botanical-card${active ? ' is-active' : ''}`}>
      <header className="premium-benefits-v63__header">
        <div>
          <span className="premium-benefits-v63__eyebrow">
            <Crown size={14} />
            ĐẶC QUYỀN DOCSHARE PREMIUM
          </span>

          <h2>
            {active
              ? 'Bạn đang sở hữu Premium'
              : 'Nâng cấp trải nghiệm học tập'}
          </h2>

          <p>
            {active
              ? (
                <>
                  Các đặc quyền đang hoạt động
                  {expiresAt
                    ? ` đến ${new Date(expiresAt).toLocaleDateString('vi-VN')}.`
                    : '.'}
                </>
              )
              : 'Mở khóa ưu đãi mua tài liệu và bộ nhận diện Premium riêng.'}
          </p>
        </div>

        <Link className="button" to="/wallet">
          <Crown size={16} />
          {active ? 'Gia hạn Premium' : 'Xem các gói Premium'}
        </Link>
      </header>

      <div className="premium-benefits-v63__grid">
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
