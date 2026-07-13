export const GIFT_TIERS = [
  {
    key: 'seedling',
    label: 'Mầm xanh',
    min: 0,
    max: 10,
    description: 'Hiệu ứng lá xanh nhẹ nhàng',
  },
  {
    key: 'blossom',
    label: 'Nở hoa',
    min: 11,
    max: 50,
    description: 'Hiệu ứng hoa và ánh sáng',
  },
  {
    key: 'radiant',
    label: 'Tỏa sáng',
    min: 51,
    max: 200,
    description: 'Hiệu ứng sao lấp lánh',
  },
  {
    key: 'royal',
    label: 'Vinh danh',
    min: 201,
    max: 500,
    description: 'Hiệu ứng hào quang và pháo sáng',
  },
  {
    key: 'legendary',
    label: 'Huyền thoại',
    min: 501,
    max: Number.POSITIVE_INFINITY,
    description: 'Hiệu ứng 7 màu toàn màn hình',
  },
];

export function getGiftTier(giftOrPrice) {
  const price = Number(
    typeof giftOrPrice === 'object'
      ? giftOrPrice?.credit_price
      : giftOrPrice
  ) || 0;

  return GIFT_TIERS.find((tier) => price >= tier.min && price <= tier.max)
    || GIFT_TIERS[0];
}

export function getGiftTierLabel(giftOrPrice) {
  return getGiftTier(giftOrPrice).label;
}
