export const ROUTES = {
  home: '/',
  documents: '/documents',
  categories: '/categories',
  feed: '/feed',
  leaderboard: '/leaderboard',
  upload: '/upload',
  wallet: '/wallet',
  gifts: '/gifts',
  messages: '/messages',
  history: '/history',
  support: '/support',
  admin: '/admin',
};

export const DOCUMENT_LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'Tiếng Anh' },
  { value: 'ja', label: 'Tiếng Nhật' },
  { value: 'ko', label: 'Tiếng Hàn' },
  { value: 'zh', label: 'Tiếng Trung' },
];

export const ACADEMIC_YEARS = Array.from({ length: 16 }, (_, index) => new Date().getFullYear() - index);

export const PREMIUM_PACKAGES = [
  { code: 'premium_1m', name: 'Premium 1 tháng', months: 1, amount: 29000 },
  { code: 'premium_3m', name: 'Premium 3 tháng', months: 3, amount: 79000 },
  { code: 'premium_6m', name: 'Premium 6 tháng', months: 6, amount: 149000 },
  { code: 'premium_12m', name: 'Premium 12 tháng', months: 12, amount: 269000 },
];

export const CREDIT_PACKAGES = [
  { amount: 10000, credit: 20 },
  { amount: 20000, credit: 40 },
  { amount: 50000, credit: 100 },
  { amount: 100000, credit: 220 },
  { amount: 200000, credit: 460 },
  { amount: 500000, credit: 1200 },
  { amount: 1000000, credit: 2500 },
  { amount: 2000000, credit: 5200 },
];

export const BANK_CONFIG = {
  bankCode: 'TCB',
  bankName: 'Techcombank',
  accountNumber: 'DIEN_SO_TAI_KHOAN',
  accountName: 'DOCSHARE PRO',
};
