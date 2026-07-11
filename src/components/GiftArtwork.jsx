const giftArtMap = {
  star: '/gifts/v29/star.svg',
  coffee: '/gifts/v29/coffee.svg',
  giftbox: '/gifts/v29/giftbox.svg',
  rocket: '/gifts/v29/rocket.svg',
  crown: '/gifts/v29/crown.svg',
  lion: '/gifts/v29/lion.svg',
  diamond: '/gifts/v29/diamond.svg',
  rose: '/gifts/v29/rose.svg',
  bouquet: '/gifts/v29/bouquet.svg',
  castle: '/gifts/v29/castle.svg',
};

const premiumGiftArtMap = {
  g23: '/gifts/v38/supernova.svg',
  g24: '/gifts/v38/yacht.svg',
  g25: '/gifts/v38/emerald-crown.svg',
  g26: '/gifts/v38/nebula-diamond.svg',
  g27: '/gifts/v38/fireworks.svg',
};

export function getGiftArtwork(giftOrTheme) {
  if (typeof giftOrTheme === 'string') return giftArtMap[giftOrTheme] || giftArtMap.star;
  const gift = giftOrTheme || {};
  return gift.artwork || premiumGiftArtMap[gift.id] || giftArtMap[gift.theme] || giftArtMap.star;
}

export default function GiftArtwork({ gift, size = 'md', className = '' }) {
  const theme = gift?.theme || 'star';
  return (
    <span className={`gift-artwork-v29 gift-artwork-${size} gift-theme-${theme} ${className}`.trim()}>
      <img src={getGiftArtwork(gift)} alt={gift?.name || 'Quà tặng DocShare'} draggable="false" />
    </span>
  );
}
