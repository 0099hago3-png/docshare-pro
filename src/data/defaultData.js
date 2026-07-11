export const categories = [
  { id: 'all', name: 'Tất cả', icon: '✦', count: 8600 },
  { id: 'it', name: 'Công nghệ thông tin', icon: '⌘', count: 2458 },
  { id: 'database', name: 'Cơ sở dữ liệu', icon: '◫', count: 1236 },
  { id: 'economy', name: 'Kinh tế', icon: '◒', count: 1125 },
  { id: 'language', name: 'Ngoại ngữ', icon: '◎', count: 1654 },
  { id: 'science', name: 'Khoa học', icon: '⚛', count: 842 },
  { id: 'education', name: 'Giáo dục', icon: '◇', count: 1012 },
  { id: 'media', name: 'Báo chí - Truyền thông', icon: '▤', count: 909 },
  { id: 'math', name: 'Toán học', icon: '∑', count: 1198 },
  { id: 'law', name: 'Luật', icon: '⚖', count: 851 },
  { id: 'design', name: 'Thiết kế', icon: '◈', count: 986 },
  { id: 'architecture', name: 'Kiến trúc', icon: '⌂', count: 922 },
  { id: 'engineering', name: 'Kỹ thuật - Cơ khí', icon: '⚙', count: 1174 },
  { id: 'electronics', name: 'Điện - Điện tử', icon: 'ϟ', count: 1088 },
  { id: 'medicine', name: 'Y dược', icon: '✚', count: 1320 },
  { id: 'social', name: 'Khoa học xã hội', icon: '◉', count: 947 },
  { id: 'agriculture', name: 'Nông nghiệp', icon: '❧', count: 635 },
  { id: 'tourism', name: 'Du lịch - Nhà hàng', icon: '⌖', count: 754 },
  { id: 'finance', name: 'Tài chính - Kế toán', icon: '₫', count: 1438 },
  { id: 'management', name: 'Quản trị kinh doanh', icon: '▥', count: 1294 },
  { id: 'psychology', name: 'Tâm lý học', icon: '◌', count: 548 },
];

export const schools = [
  'Cao đẳng Đông An',
  'Đại học Bách Khoa',
  'Đại học Kinh tế Quốc dân',
  'Học viện Báo chí và Tuyên truyền',
  'Đại học Công nghệ TP.HCM',
  'Đại học Quốc gia TP.HCM',
  'Đại học Công nghệ Thông tin - ĐHQG TP.HCM',
  'Đại học Khoa học Tự nhiên - ĐHQG TP.HCM',
  'Đại học Kinh tế TP.HCM',
  'Đại học Sư phạm Kỹ thuật TP.HCM',
  'Đại học Thủ Dầu Một',
  'Đại học Bình Dương',
  'Đại học FPT',
  'Đại học RMIT Việt Nam',
  'Đại học Ngoại thương',
  'Đại học Luật TP.HCM',
  'Đại học Y Dược TP.HCM',
  'Học viện Công nghệ Bưu chính Viễn thông',
  'Cao đẳng FPT Polytechnic',
  'Cao đẳng Lý Tự Trọng TP.HCM',
  'Cao đẳng Kỹ thuật Cao Thắng',
];

const premiumMeta = {
  plan: 'Premium 12 tháng',
  purchasedAt: '2026-01-10 09:30',
  expiresAt: '2027-01-10',
  status: 'active',
  renewals: [
    { date: '2026-01-10', plan: 'Premium 12 tháng', creditBonus: 2500, status: 'approved' },
  ],
};

export const users = [
  {
    id: 'u_admin', name: 'Quản trị viên', email: 'admin@docshare.vn', password: '123456', role: 'admin', avatar: 'A', verified: true, premium: true,
    premiumInfo: { ...premiumMeta, plan: 'Premium quản trị', expiresAt: 'Vĩnh viễn' },
    level: 99, xp: 86285, followers: 3456, following: ['u_user', 'u_teacher', 'u_minh'], likes: 9824, credit: 5000, balance: 0,
    supportPoints: 18500, creatorPoints: 15200, activityPoints: 19800, followerPoints: 17280,
    bio: 'Quản lý nội dung, giao dịch, báo cáo và hỗ trợ cộng đồng DocShare.', school: 'DocShare System', major: 'Quản trị hệ thống', cover: '', passwordHint: 'mật khẩu demo 123456', lockedUntil: null, warnings: 0,
    joinedAt: '2024-05-24', bankAccounts: [{ id: 'ba1', bank: 'Techcombank', number: '6666665261', holder: 'Nguyen Trong Hoang Giang', default: true }],
    ownedFrames: ['orbit-basic', 'premium-quasar', 'admin-singularity', 'rank-nexus-1', 'rank-nebula-donor-1', 'follower-galaxy', 'element-lightning', 'element-fire', 'element-water', 'element-wind', 'seraph-wings', 'celestial-dragon'], activeFrame: 'admin-singularity', avatarImage: null,
    ownedPets: ['pet-duck','pet-dog','pet-cat','pet-bear','pet-pig','pet-rabbit','pet-panda','pet-bird','pet-dragon','pet-phoenix'], activePets: ['pet-duck','pet-dragon'], petsVisible: true, ownedPetAccessories: ['acc-bow','acc-crown','acc-glasses','acc-scarf','acc-space','acc-star','acc-wings','acc-lightning','acc-fire','acc-water','acc-wind'], petEquipment: { 'pet-duck':'acc-bow', 'pet-dragon':'acc-crown' }, petPlacement: { 'pet-duck':'cover', 'pet-dragon':'avatar' }, petStats: { 'pet-duck': { level: 8, hunger: 82, happiness: 96 }, 'pet-dragon': { level: 12, hunger: 74, happiness: 91 } },
  },
  {
    id: 'u_user', name: 'Nguyễn Văn A', email: 'user@docshare.vn', password: '123456', role: 'user', avatar: 'N', verified: true, premium: true,
    premiumInfo: { ...premiumMeta, plan: 'Premium 12 tháng', purchasedAt: '2026-02-10 10:15', expiresAt: '2027-02-10' },
    level: 51, xp: 34870, followers: 1260, following: ['u_teacher', 'u_minh'], likes: 4260, credit: 780, balance: 175000, ownedDocuments: ['d7'],
    supportPoints: 7820, creatorPoints: 6120, activityPoints: 8900, followerPoints: 6300,
    bio: 'Sinh viên thích lập trình web, chia sẻ tài liệu học tập và ghi chú ôn thi.', school: 'Cao đẳng Đông An', major: 'Công nghệ thông tin', cover: '', passwordHint: 'tên trường + năm sinh', lockedUntil: null, warnings: 0,
    joinedAt: '2025-01-15', bankAccounts: [{ id: 'ba2', bank: 'Vietcombank', number: '001123456789', holder: 'Nguyễn Văn A', default: true }],
    ownedFrames: ['orbit-basic', 'level-lunar', 'level-nebula', 'premium-quasar', 'rank-stellar-heart-1', 'element-water'], activeFrame: 'premium-quasar', avatarImage: null,
    ownedPets: ['pet-duck','pet-cat','pet-rabbit'], activePets: ['pet-duck'], petsVisible: true, ownedPetAccessories: ['acc-bow','acc-glasses'], petEquipment: { 'pet-duck':'acc-bow' }, petPlacement: { 'pet-duck':'cover' }, petStats: { 'pet-duck': { level: 4, hunger: 78, happiness: 88 } },
  },
  {
    id: 'u_teacher', name: 'Lê Thị Hương', email: 'teacher@docshare.vn', password: '123456', role: 'teacher', avatar: 'H', verified: true, premium: true,
    premiumInfo: { ...premiumMeta, plan: 'Premium 6 tháng', purchasedAt: '2026-04-20 08:30', expiresAt: '2026-10-20' },
    level: 39, xp: 26420, followers: 2341, following: ['u_user'], likes: 6482, credit: 850, balance: 980000, ownedDocuments: ['d5'],
    supportPoints: 12450, creatorPoints: 13800, activityPoints: 13220, followerPoints: 11705,
    bio: 'Giảng viên chia sẻ giáo trình, bài giảng và đề cương ôn tập.', school: 'Đại học Bách Khoa', major: 'Cơ sở dữ liệu', cover: '', passwordHint: 'tên môn giảng dạy', lockedUntil: null, warnings: 0,
    joinedAt: '2024-08-12', bankAccounts: [{ id: 'ba3', bank: 'BIDV', number: '260123456789', holder: 'Lê Thị Hương', default: true }],
    ownedFrames: ['orbit-basic', 'level-lunar', 'level-nebula', 'premium-quasar', 'rank-nebula-donor-1', 'follower-galaxy', 'seraph-wings'], activeFrame: 'seraph-wings', avatarImage: null,
    ownedPets: ['pet-cat','pet-bird','pet-phoenix'], activePets: ['pet-cat','pet-bird'], petsVisible: true, ownedPetAccessories: ['acc-scarf','acc-star','acc-wings'], petEquipment: { 'pet-cat':'acc-scarf', 'pet-bird':'acc-star' }, petPlacement: { 'pet-cat':'cover', 'pet-bird':'buttons' }, petStats: { 'pet-cat': { level: 6, hunger: 84, happiness: 92 }, 'pet-bird': { level: 5, hunger: 76, happiness: 90 } },
  },
  {
    id: 'u_minh', name: 'Trần Minh Đức', email: 'minh@docshare.vn', password: '123456', role: 'user', avatar: 'M', verified: true, premium: false,
    premiumInfo: null,
    level: 22, xp: 12950, followers: 680, following: ['u_teacher'], likes: 1530, credit: 180, balance: 120000,
    supportPoints: 3210, creatorPoints: 4620, activityPoints: 5300, followerPoints: 3400,
    bio: 'Yêu thích phân tích dữ liệu, Excel và thiết kế slide học tập.', school: 'Đại học Kinh tế Quốc dân', major: 'Kinh doanh', cover: '', passwordHint: 'excel', lockedUntil: null, warnings: 1,
    joinedAt: '2025-09-03', bankAccounts: [], ownedFrames: ['orbit-basic', 'level-lunar', 'element-fire'], activeFrame: 'element-fire', avatarImage: null,
    ownedPets: ['pet-dog','pet-bear'], activePets: ['pet-dog'], petsVisible: true, ownedPetAccessories: ['acc-crown'], petEquipment: { 'pet-dog':'acc-crown' }, petPlacement: { 'pet-dog':'cover' }, petStats: { 'pet-dog': { level: 3, hunger: 80, happiness: 82 } },
  },
  {
    id: 'u_linh', name: 'Đỗ Thùy Linh', email: 'linh@docshare.vn', password: '123456', role: 'user', avatar: 'L', verified: true, premium: true,
    premiumInfo: { ...premiumMeta, plan: 'Premium 3 tháng', purchasedAt: '2026-06-01 13:20', expiresAt: '2026-09-01' },
    level: 28, xp: 16700, followers: 920, following: ['u_teacher'], likes: 2040, credit: 420, balance: 360000,
    supportPoints: 5560, creatorPoints: 7200, activityPoints: 6800, followerPoints: 4600,
    bio: 'Chia sẻ tài liệu ngoại ngữ và phương pháp học hiệu quả.', school: 'Đại học Công nghệ TP.HCM', major: 'Ngoại ngữ', cover: '', passwordHint: 'linh', lockedUntil: null, warnings: 0,
    joinedAt: '2025-03-18', bankAccounts: [], ownedFrames: ['orbit-basic', 'level-lunar', 'premium-quasar', 'element-wind'], activeFrame: 'element-wind', avatarImage: null,
    ownedPets: ['pet-pig','pet-rabbit'], activePets: ['pet-rabbit'], petsVisible: true, ownedPetAccessories: ['acc-star','acc-wind'], petEquipment: { 'pet-rabbit':'acc-star' }, petPlacement: { 'pet-rabbit':'cover' }, petStats: { 'pet-rabbit': { level: 4, hunger: 85, happiness: 93 } },
  },
  {
    id: 'u_anh', name: 'Vũ Hoàng Anh', email: 'anh@docshare.vn', password: '123456', role: 'teacher', avatar: 'V', verified: true, premium: true,
    premiumInfo: { ...premiumMeta, plan: 'Premium 12 tháng', purchasedAt: '2026-03-14 09:00', expiresAt: '2027-03-14' },
    level: 46, xp: 31900, followers: 1780, following: ['u_teacher','u_user'], likes: 5120, credit: 1350, balance: 740000,
    supportPoints: 8600, creatorPoints: 11100, activityPoints: 10500, followerPoints: 8900,
    bio: 'Nghiên cứu trí tuệ nhân tạo, kiến trúc phần mềm và phương pháp học dựa trên dự án.', school: 'Đại học Bách Khoa', major: 'Khoa học máy tính', cover: '', passwordHint: 'ai research', lockedUntil: null, warnings: 0,
    joinedAt: '2024-11-08', bankAccounts: [], ownedFrames: ['orbit-basic','level-lunar','level-nebula','premium-quasar','celestial-dragon'], activeFrame: 'celestial-dragon', avatarImage: null,
    ownedPets: ['pet-dragon','pet-owl'], activePets: ['pet-dragon'], petsVisible: true, ownedPetAccessories: ['acc-space','acc-lightning'], petEquipment: { 'pet-dragon':'acc-lightning' }, petPlacement: { 'pet-dragon':'avatar' }, petStats: { 'pet-dragon': { level: 9, hunger: 79, happiness: 94 } },
  },
  {
    id: 'u_quang', name: 'Phạm Quang Huy', email: 'quang@docshare.vn', password: '123456', role: 'user', avatar: 'Q', verified: true, premium: false,
    premiumInfo: null,
    level: 31, xp: 20150, followers: 845, following: ['u_anh','u_teacher'], likes: 2860, credit: 390, balance: 205000,
    supportPoints: 4800, creatorPoints: 6550, activityPoints: 7200, followerPoints: 4225,
    bio: 'Theo đuổi thiết kế hệ thống, DevOps và kỹ năng viết tài liệu kỹ thuật dễ hiểu.', school: 'Đại học Công nghệ TP.HCM', major: 'Kỹ thuật phần mềm', cover: '', passwordHint: 'devops', lockedUntil: null, warnings: 0,
    joinedAt: '2025-05-27', bankAccounts: [], ownedFrames: ['orbit-basic','level-lunar','level-nebula','element-lightning'], activeFrame: 'element-lightning', avatarImage: null,
    ownedPets: ['pet-bear','pet-panda'], activePets: ['pet-panda'], petsVisible: true, ownedPetAccessories: ['acc-glasses'], petEquipment: { 'pet-panda':'acc-glasses' }, petPlacement: { 'pet-panda':'buttons' }, petStats: { 'pet-panda': { level: 5, hunger: 83, happiness: 89 } },
  },
  {
    id: 'u_bao', name: 'Trần Gia Bảo', email: 'bao@docshare.vn', password: '123456', role: 'user', avatar: 'B', verified: false, premium: false,
    premiumInfo: null,
    level: 18, xp: 10820, followers: 390, following: ['u_linh'], likes: 1240, credit: 140, balance: 80000,
    supportPoints: 1750, creatorPoints: 3100, activityPoints: 4600, followerPoints: 1950,
    bio: 'Sinh viên yêu thích ngoại ngữ, kỹ năng thuyết trình và xây dựng thương hiệu cá nhân.', school: 'Cao đẳng Đông An', major: 'Truyền thông đa phương tiện', cover: '', passwordHint: 'bao', lockedUntil: null, warnings: 0,
    joinedAt: '2026-01-09', bankAccounts: [], ownedFrames: ['orbit-basic','level-lunar','element-wind'], activeFrame: 'element-wind', avatarImage: null,
    ownedPets: ['pet-bird','pet-pig'], activePets: ['pet-bird'], petsVisible: true, ownedPetAccessories: ['acc-scarf'], petEquipment: { 'pet-bird':'acc-scarf' }, petPlacement: { 'pet-bird':'cover' }, petStats: { 'pet-bird': { level: 2, hunger: 88, happiness: 86 } },
  },
];

export const documents = [
  { id: 'd1', title: 'Lập trình Python cơ bản cho người mới bắt đầu', subject: 'Lập trình cơ bản', category: 'it', school: 'Cao đẳng Đông An', authorId: 'u_teacher', type: 'PDF', price: 0, premiumOnly: false, cover: '🐍', color: 'blue', coverPreview: '/covers/python.svg', pages: 50, demoPages: 6, tags: ['python', 'lập trình', 'cơ bản'], views: 15420, downloads: 3210, likes: 1200, rating: 4.8, createdAt: '2026-07-08', files: ['python-demo.pdf', 'python-full.pdf'], gifts: [] },
  { id: 'd2', title: 'Cơ sở dữ liệu quan hệ SQL và PostgreSQL', subject: 'Cơ sở dữ liệu', category: 'database', school: 'Cao đẳng Đông An', authorId: 'u_user', type: 'PDF', price: 0, premiumOnly: false, cover: '🗄️', color: 'purple', coverPreview: '/covers/database.svg', pages: 80, demoPages: 5, tags: ['sql', 'postgresql', 'supabase'], views: 12100, downloads: 1420, likes: 982, rating: 4.9, createdAt: '2026-07-07', files: ['sql-demo.pdf', 'sql-full.pdf'], gifts: [{ userId: 'u_teacher', giftId: 'g3', gift: 'Tinh tú', credit: 50, date: '2026-07-08' }] },
  { id: 'd3', title: 'React + Vite xây dựng website chia sẻ tài liệu', subject: 'Web Frontend', category: 'it', school: 'Cao đẳng Đông An', authorId: 'u_user', type: 'DOCX', price: 0, premiumOnly: false, cover: '⚛️', color: 'cyan', coverPreview: '/covers/react.svg', pages: 36, demoPages: 4, tags: ['react', 'vite', 'frontend'], views: 8300, downloads: 890, likes: 724, rating: 4.6, createdAt: '2026-07-06', files: ['react-vite.docx'], gifts: [] },
  { id: 'd4', title: 'Kỹ năng viết tin và bản tin: từ lý thuyết đến thực hành', subject: 'Kỹ năng viết tin', category: 'media', school: 'Học viện Báo chí và Tuyên truyền', authorId: 'u_teacher', type: 'PDF', price: 0, premiumOnly: false, cover: '📰', color: 'orange', coverPreview: '/covers/media.svg', pages: 92, demoPages: 5, tags: ['báo chí', 'truyền thông', 'kỹ năng viết'], views: 18900, downloads: 2300, likes: 976, rating: 4.7, createdAt: '2026-07-05', files: ['viet-tin-demo.pdf', 'viet-tin-full.pdf'], gifts: [{ userId: 'u_admin', giftId: 'g7', gift: 'Huy chương Giám tuyển', credit: 1000, date: '2026-07-08' }] },
  { id: 'd5', title: 'Marketing căn bản và hành vi người tiêu dùng', subject: 'Marketing căn bản', category: 'economy', school: 'Đại học Kinh tế Quốc dân', authorId: 'u_teacher', type: 'PPTX', price: 90, premiumOnly: false, cover: '📈', color: 'green', coverPreview: '/covers/marketing.svg', pages: 44, demoPages: 3, tags: ['marketing', 'kinh tế'], views: 7200, downloads: 1100, likes: 650, rating: 4.5, createdAt: '2026-07-04', files: ['marketing.pptx'], gifts: [] },
  { id: 'd6', title: 'Đề cương Giải tích 1 có lời giải chi tiết', subject: 'Giải tích 1', category: 'math', school: 'Đại học Bách Khoa', authorId: 'u_user', type: 'PDF', price: 0, premiumOnly: false, cover: '∫', color: 'red', coverPreview: '/covers/calculus.svg', pages: 70, demoPages: 7, tags: ['giải tích', 'toán', 'bài tập'], views: 22300, downloads: 3900, likes: 1320, rating: 4.9, createdAt: '2026-07-08', files: ['giai-tich-demo.pdf', 'giai-tich-full.pdf'], gifts: [{ userId: 'u_teacher', giftId: 'g11', gift: 'Vương miện Danh dự', credit: 800, date: '2026-07-08' }] },
  { id: 'd7', title: 'Phân tích dữ liệu với Excel: từ cơ bản đến nâng cao', subject: 'Excel', category: 'economy', school: 'Đại học Kinh tế Quốc dân', authorId: 'u_minh', type: 'PPTX', price: 120, premiumOnly: false, cover: '📊', color: 'teal', coverPreview: '/covers/excel.svg', pages: 65, demoPages: 4, tags: ['excel', 'phân tích dữ liệu'], views: 10450, downloads: 7210, likes: 724, rating: 4.6, createdAt: '2026-07-03', files: ['excel-demo.pptx', 'excel-full.pptx'], gifts: [] },
];

export const posts = [
  {
    id: 'p1', authorId: 'u_user', postType: 'link', title: 'Kiến trúc React hiện đại: từ cấu trúc thư mục đến trải nghiệm người dùng',
    content: 'Mình vừa hoàn thiện bộ ghi chú React + Vite theo hướng component hóa, tối ưu luồng dữ liệu và thiết kế giao diện có khả năng mở rộng. Tài liệu phù hợp cho sinh viên đang làm đồ án web hoặc muốn xây dựng sản phẩm thật.',
    documentId: 'd3', sharedUrl: '/documents/d3', likes: 1326, shares: 18, createdAt: '2026-07-08 09:20', reports: 0,
    gifts: [{ userId: 'u_admin', giftId: 'g5', gift: 'Tên lửa lượng tử', credit: 300 }, { userId: 'u_teacher', giftId: 'g1', gift: 'Mảnh sao', credit: 10 }],
    comments: [
      { id: 'c1', userId: 'u_teacher', text: 'Cách bạn tổ chức nội dung rất mạch lạc. Phần kiến trúc component đặc biệt hữu ích cho sinh viên mới.', reactions: 15, replies: [{ id: 'r1', userId: 'u_user', text: 'Em cảm ơn cô. Em đang bổ sung thêm phần quản lý trạng thái và kiểm thử ạ.' }] },
      { id: 'c2', userId: 'u_minh', text: 'Mình mong có thêm sơ đồ luồng dữ liệu và ví dụ tối ưu hiệu năng.', reactions: 8, replies: [] },
    ],
  },
  {
    id: 'p2', authorId: 'u_teacher', postType: 'question', title: 'Chuyển đổi hệ quản trị dữ liệu: từ SQL Server đến PostgreSQL/Supabase',
    content: 'Tuần này mình mở phiên thảo luận chuyên sâu về thiết kế schema, chuyển đổi kiểu dữ liệu, RLS và chiến lược migration an toàn. Các bạn đang làm dự án thực tế có thể để lại câu hỏi hoặc tình huống cụ thể.',
    documentId: 'd2', sharedUrl: '/documents/d2', likes: 628, shares: 8, createdAt: '2026-07-06 15:40', reports: 0, gifts: [],
    comments: [{ id:'c3', userId:'u_quang', text:'Cô có thể chia sẻ thêm cách thiết kế policy RLS cho bảng tài liệu và bình luận không ạ?', reactions:11, replies:[] }],
  },
  {
    id: 'p3', authorId: 'u_anh', postType: 'question', title: 'Tư duy hệ thống trong kỷ nguyên trí tuệ nhân tạo',
    content: 'AI không chỉ là mô hình hay công cụ. Giá trị thật nằm ở cách chúng ta đặt vấn đề, đánh giá dữ liệu, kiểm chứng kết quả và tích hợp công nghệ vào quy trình có trách nhiệm. Bạn đang dùng AI để học tập theo cách nào?',
    documentId: null, sharedUrl: '', likes: 914, shares: 31, createdAt: '2026-07-07 20:10', reports: 0, gifts: [],
    comments: [{ id:'c4', userId:'u_linh', text:'Mình dùng AI để tạo câu hỏi ôn tập nhưng luôn đối chiếu lại với giáo trình.', reactions:17, replies:[] }],
  },
  {
    id: 'p4', authorId: 'u_minh', postType: 'link', title: 'Phân tích dữ liệu có chiều sâu: kể chuyện bằng con số thay vì chỉ tạo biểu đồ',
    content: 'Một dashboard tốt cần trả lời được câu hỏi kinh doanh, làm nổi bật xu hướng và giúp người xem đưa ra quyết định. Mình chia sẻ bộ slide về cách chọn chỉ số, xây dựng câu chuyện dữ liệu và tránh những biểu đồ gây hiểu nhầm.',
    documentId: 'd7', sharedUrl: '/documents/d7', likes: 506, shares: 22, createdAt: '2026-07-05 18:30', reports: 0, gifts: [], comments: [],
  },
  {
    id: 'p5', authorId: 'u_linh', postType: 'question', title: 'Học ngoại ngữ bền vững: xây dựng hệ thống thay vì chạy theo động lực',
    content: 'Mình đang thử phương pháp học theo chu kỳ: tiếp nhận ngắn, ôn cách quãng, nói lại bằng ngôn ngữ của mình và áp dụng vào tình huống thật. Mọi người có thói quen nào giúp duy trì việc học lâu dài không?',
    documentId: null, sharedUrl: '', likes: 382, shares: 12, createdAt: '2026-07-04 08:45', reports: 0, gifts: [], comments: [],
  },
  {
    id: 'p6', authorId: 'u_quang', postType: 'question', title: 'Thiết kế phần mềm có khả năng mở rộng: bắt đầu từ những quyết định nhỏ',
    content: 'Tách trách nhiệm rõ ràng, đặt tên nhất quán, ghi lại quyết định kiến trúc và tự động hóa kiểm thử là những điều nhỏ nhưng tạo khác biệt lớn khi dự án phát triển. Theo bạn, lỗi thiết kế nào thường gây tốn thời gian nhất?',
    documentId: null, sharedUrl: '', likes: 274, shares: 9, createdAt: '2026-07-03 21:05', reports: 0, gifts: [], comments: [],
  },
];

export const notifications = [
  { id: 'n1', title: 'Có người thích tài liệu', text: 'Tài liệu Python của bạn vừa nhận thêm lượt thích.', to: '/documents/d1', unread: true, important: false, kind: 'like', date: '2 phút trước' },
  { id: 'n2', title: 'Giao dịch chờ xác nhận', text: 'Yêu cầu nạp credit đang chờ admin xử lý.', to: '/wallet', unread: true, important: true, kind: 'wallet', date: '5 phút trước' },
  { id: 'n3', title: 'Báo cáo mới', text: 'Có báo cáo nội dung cần kiểm tra.', to: '/admin', unread: true, important: true, kind: 'report', date: '10 phút trước' },
  { id: 'n4', title: 'Bạn nhận được khung mới', text: 'Khung Mùa Thu Học Thuật đã được thêm vào bộ sưu tập theo mùa.', to: '/profile', unread: false, important: false, kind: 'frame', date: '1 giờ trước' },
];

export const reports = [
  { id: 'rp1', type: 'document', targetId: 'd4', userId: 'u_teacher', reporterId: 'u_user', reason: 'Nghi ngờ trùng lặp nội dung', status: 'pending', createdAt: '2026-07-08 10:12' },
  { id: 'rp2', type: 'post', targetId: 'p2', userId: 'u_teacher', reporterId: 'u_admin', reason: 'Cần kiểm tra link đính kèm', status: 'pending', createdAt: '2026-07-08 10:18' },
];

export const supportTickets = [
  { id: 's1', userId: 'u_user', title: 'Không nhận được credit', status: 'open', answer: 'Admin đang kiểm tra giao dịch.' },
];

export const transactions = [
  { id: 't1', userId: 'u_user', type: 'topup', amount: 50000, credit: 100, status: 'done', note: 'Nạp credit', date: '2026-07-07' },
  { id: 't3', userId: 'u_teacher', type: 'withdraw', amount: 300000, credit: 0, status: 'pending', note: 'BIDV - 260123456789', date: '2026-07-08' },
  { id: 't4', userId: 'u_linh', type: 'premium', amount: 249000, credit: 900, status: 'pending', note: 'Premium 3 tháng', date: '2026-07-08' },
];

export const bannedWords = ['lừa đảo', 'đồi trụy', 'cờ bạc', 'hack', 'spam', 'phản động', 'thù ghét', 'chửi tục', 'mua bán tài khoản', 'link độc'];

export const giftStore = [
  { id:'g1', name:'Dấu trang Tri thức', icon:'✦', credit:10, effect:'small', sound:null, theme:'star' },
  { id:'g2', name:'Tách cà phê Học giả', icon:'☕', credit:20, effect:'small', sound:null, theme:'coffee' },
  { id:'g3', name:'Ngôi sao Ghi nhận', icon:'✧', credit:50, effect:'medium', sound:null, theme:'star' },
  { id:'g4', name:'Hộp thư Cảm ơn', icon:'❦', credit:80, effect:'medium', sound:null, theme:'giftbox' },
  { id:'g5', name:'Huy hiệu Cống hiến', icon:'◆', credit:300, effect:'big', sound:null, theme:'rocket' },
  { id:'g6', name:'Kỷ niệm chương Bạc', icon:'◈', credit:500, effect:'big', sound:null, theme:'crown' },
  { id:'g7', name:'Huy chương Giám tuyển', icon:'◉', credit:1000, effect:'mega', sound:null, theme:'lion' },
  { id:'g8', name:'Bảo thạch Học thuật', icon:'◇', credit:1500, effect:'mega', sound:null, theme:'diamond' },
  { id:'g9', name:'Trái tim Đồng hành', icon:'♥', credit:100, effect:'medium', sound:null, theme:'rose' },
  { id:'g10', name:'Bó nguyệt quế', icon:'❧', credit:150, effect:'medium', sound:null, theme:'bouquet' },
  { id:'g11', name:'Vương miện Danh dự', icon:'♛', credit:800, effect:'big', sound:null, theme:'crown' },
  { id:'g12', name:'Thư viện Bảo trợ', icon:'⌂', credit:2200, effect:'mega', sound:null, theme:'castle' },
  { id:'g13', name:'Ngôi sao Cổ vũ', icon:'✹', credit:30, effect:'small', sound:null, theme:'star' },
  { id:'g14', name:'Tách Espresso Đêm Khuya', icon:'☕', credit:60, effect:'medium', sound:null, theme:'coffee' },
  { id:'g15', name:'Hộp Quà Tri Ân', icon:'🎁', credit:120, effect:'medium', sound:null, theme:'giftbox' },
  { id:'g16', name:'Hoa Hồng Khích Lệ', icon:'🌹', credit:180, effect:'medium', sound:null, theme:'rose' },
  { id:'g17', name:'Bó Hoa Vinh Danh', icon:'💐', credit:260, effect:'big', sound:null, theme:'bouquet' },
  { id:'g18', name:'Tên Lửa Bứt Phá', icon:'🚀', credit:420, effect:'big', sound:null, theme:'rocket' },
  { id:'g19', name:'Vương Miện Học Giả', icon:'👑', credit:900, effect:'mega', sound:null, theme:'crown' },
  { id:'g20', name:'Linh Vật Sư Tử Vàng', icon:'🦁', credit:1300, effect:'mega', sound:null, theme:'lion' },
  { id:'g21', name:'Kim Cương Thành Tựu', icon:'💎', credit:1800, effect:'mega', sound:null, theme:'diamond' },
  { id:'g22', name:'Lâu Đài Tri Thức', icon:'🏛️', credit:3000, effect:'legendary', sound:null, theme:'castle' },
  { id:'g23', name:'Siêu Tân Tinh Tri Ân', icon:'🌟', credit:3600, effect:'legendary', sound:null, theme:'star', artwork:'/gifts/v38/supernova.svg' },
  { id:'g24', name:'Du Thuyền Học Giả', icon:'🚢', credit:4200, effect:'legendary', sound:null, theme:'castle', artwork:'/gifts/v38/yacht.svg' },
  { id:'g25', name:'Vương Miện Ngọc Lục Bảo', icon:'👑', credit:5000, effect:'legendary', sound:null, theme:'crown', artwork:'/gifts/v38/emerald-crown.svg' },
  { id:'g26', name:'Tinh Vân Kim Cương', icon:'💠', credit:6500, effect:'legendary', sound:null, theme:'diamond', artwork:'/gifts/v38/nebula-diamond.svg' },
  { id:'g27', name:'Lễ Hội Pháo Hoa Tri Thức', icon:'🎆', credit:8888, effect:'legendary', sound:null, theme:'rocket', artwork:'/gifts/v38/fireworks.svg' },
];

export const petCatalog = [
  { id:'pet-duck', name:'Vịt Bông', species:'duck', rarity:'Phổ biến', price:0, color:'#fff7d6', phrase:'Cạp cạp! Hôm nay mình học gì nè?', phrases:['Cạp cạp! Hôm nay mình học gì nè?','Mình đi một vòng rồi quay lại nha!'], interaction:'waddle', description:'Một chú vịt trắng nhỏ xíu, thích vẫy cánh và đi lạch bạch.' },
  { id:'pet-dog', name:'Cún Mochi', species:'dog', rarity:'Phổ biến', price:80, color:'#ffd6a5', phrase:'Gâu! Mình sẽ giữ năng lượng học tập cho bạn!', phrases:['Gâu! Mình sẽ giữ năng lượng học tập cho bạn!','Ném bóng đi, mình bắt cho!'], interaction:'wag', description:'Cún tai nâu thân thiện, luôn chạy theo khi bạn di chuyển.' },
  { id:'pet-cat', name:'Mèo Neko', species:'cat', rarity:'Phổ biến', price:90, color:'#cbd5e1', phrase:'Meo~ nghỉ một chút rồi học tiếp nhé.', phrases:['Meo~ nghỉ một chút rồi học tiếp nhé.','Vuốt đầu mình thêm chút nữa nha.'], interaction:'rub', description:'Mèo xám tinh nghịch, thích ngồi cạnh avatar.' },
  { id:'pet-bear', name:'Gấu Brownie', species:'bear', rarity:'Hiếm', price:150, color:'#c58b5b', phrase:'Ôm một cái rồi mình cùng cố gắng nha!', phrases:['Ôm một cái rồi mình cùng cố gắng nha!','Mình vẫy tay chào nè!'], interaction:'hug', description:'Gấu nâu ấm áp, thường vẫy tay ở góc ảnh bìa.' },
  { id:'pet-pig', name:'Heo Pinky', species:'pig', rarity:'Phổ biến', price:100, color:'#ffb6c8', phrase:'Ụt ịt! Đừng quên lưu tài liệu hay nhé!', phrases:['Ụt ịt! Đừng quên lưu tài liệu hay nhé!','Mình nằm đây nghỉ một chút nha.'], interaction:'roll', description:'Heo hồng nhỏ hay nằm nghỉ trên các nút.' },
  { id:'pet-rabbit', name:'Thỏ Mây', species:'rabbit', rarity:'Hiếm', price:180, color:'#f8fafc', phrase:'Nhảy một bước, tiến thêm một bài học!', phrases:['Nhảy một bước, tiến thêm một bài học!','Bắt được mình không?'], interaction:'hop', description:'Thỏ trắng tai dài, thích nhảy qua những vì sao.' },
  { id:'pet-panda', name:'Gấu Trúc Mực', species:'panda', rarity:'Hiếm', price:220, color:'#f8fafc', phrase:'Mình mang trà rồi, bạn mang kiến thức nhé!', phrases:['Mình mang trà rồi, bạn mang kiến thức nhé!','Đeo kính lên, học thôi nào.'], interaction:'wave', description:'Gấu trúc hiền, đeo kính trông như một học giả.' },
  { id:'pet-bird', name:'Chim Nắng', species:'bird', rarity:'Hiếm', price:260, color:'#fde68a', phrase:'Chíp chíp! Có thông báo mới đó!', phrases:['Chíp chíp! Có thông báo mới đó!','Mình bay một vòng nha!'], interaction:'fly', description:'Chim nhỏ có thể đậu gần nút thông báo.' },
  { id:'pet-owl', name:'Cú Tri Thức', species:'owl', rarity:'Sử thi', price:520, color:'#c4b5fd', phrase:'Kiến thức chỉ sáng khi được chia sẻ.', phrases:['Kiến thức chỉ sáng khi được chia sẻ.','Hãy đọc chậm và suy nghĩ sâu.'], interaction:'blink', description:'Cú học giả mang theo cuốn sách nhỏ và ánh trăng.' },
  { id:'pet-dragon', name:'Rồng Tinh Vân', species:'dragon', rarity:'Huyền thoại', price:1200, color:'#a78bfa', phrase:'Gừ~ mình sẽ bay quanh bảo vệ kho tri thức!', phrases:['Gừ~ mình sẽ bay quanh bảo vệ kho tri thức!','Ta thấy một luồng năng lượng mới.'], interaction:'roar', description:'Rồng tím tí hon bay lượn chậm, để lại vệt sao.' },
  { id:'pet-phoenix', name:'Phượng Hoàng Con', species:'phoenix', rarity:'Huyền thoại', price:1500, color:'#fb923c', phrase:'Mỗi lần học lại là một lần tái sinh mạnh mẽ hơn!', phrases:['Mỗi lần học lại là một lần tái sinh mạnh mẽ hơn!','Hãy nhìn đôi cánh của ta!'], interaction:'flare', description:'Phượng hoàng nhỏ vỗ cánh, rơi vài hạt lửa lấp lánh.' },
  { id:'pet-fox', name:'Cáo Sương', species:'fox', rarity:'Sử thi', price:650, color:'#fda4af', phrase:'Mình tìm thấy một tài liệu hay cho bạn nè!', phrases:['Mình tìm thấy một tài liệu hay cho bạn nè!','Đi theo mình, góc này có điều thú vị đó!'], interaction:'spin', description:'Cáo nhỏ nhanh nhẹn, thích khám phá các góc ảnh bìa.' },
  { id:'pet-duck-spear', name:'Vịt Phóng Lợn', species:'duckSpear', rarity:'Sử thi', price:980, color:'#fff7d6', phrase:'Ẩu rồi nha ní!', phrases:['Ẩu rồi nha ní!','Muốn gì? Nói lẹ coi ní!','Để tui chỉ mũi phóng lợn vô chỗ đó nha!'], interaction:'point', description:'Chú vịt dân chơi cầm phóng lợn, thỉnh thoảng chỉ mũi và nói câu hài hước.' },
  { id:'pet-dragon-adult', name:'Thiên Long Trưởng Thành', species:'dragonAdult', rarity:'Huyền thoại', price:2600, color:'#7c3aed', phrase:'Ta sẽ canh giữ kho tri thức này.', phrases:['Ta sẽ canh giữ kho tri thức này.','Hãy tiến lên, người học việc.','Ta nghe thấy tiếng gọi của tri thức.'], interaction:'roar', description:'Rồng trưởng thành thân dài, bay lượn chậm và để lại dải sáng.' },
  { id:'pet-phoenix-adult', name:'Phượng Hoàng Bất Diệt', species:'phoenixAdult', rarity:'Huyền thoại', price:2800, color:'#fb5b2a', phrase:'Mỗi lần vấp ngã là một lần tái sinh.', phrases:['Mỗi lần vấp ngã là một lần tái sinh.','Ngọn lửa tri thức sẽ không bao giờ tắt.'], interaction:'flare', description:'Phượng hoàng trưởng thành tung cánh lớn, tạo mưa lửa và ánh sáng.' },
  { id:'pet-nebula-elder', name:'Cổ Long Tinh Vân', species:'nebulaElder', rarity:'Siêu huyền thoại', price:8888, color:'#6d28d9', phrase:'...', phrases:['...','Ta đã thức giấc.','Những vì sao đang quan sát ngươi.'], interaction:'awaken', description:'Cổ long khổng lồ nằm dưới ảnh bìa. Đôi mắt lâu lâu mở ra, nhìn quanh rồi khép lại.' },
  { id:'pet-koi', name:'Cá Chép Mây', species:'koi', rarity:'Hiếm', price:420, color:'#7dd3fc', phrase:'Bơi qua một vòng rồi học tiếp nhé!', phrases:['Bơi qua một vòng rồi học tiếp nhé!','Dòng chảy hôm nay thật êm.'], interaction:'splash', description:'Cá chép nhỏ bơi trong luồng mây nước quanh ảnh bìa.' },
  { id:'pet-hamster', name:'Hamster Bánh Bao', species:'hamster', rarity:'Phổ biến', price:120, color:'#fcd7a8', phrase:'Cho mình một hạt nữa đi!', phrases:['Cho mình một hạt nữa đi!','Mình cất kiến thức trong má nè!'], interaction:'nibble', description:'Hamster má phúng phính, chạy chân nhỏ rất nhanh và ôm hạt.' },
];

export const petAccessories = [
  { id:'acc-bow', name:'Nơ đỏ', icon:'🎀', price:20, type:'fashion', description:'Chiếc nơ mềm làm thú cưng đáng yêu hơn.' },
  { id:'acc-crown', name:'Vương miện mini', icon:'👑', price:70, type:'fashion', description:'Vương miện nhỏ cho boss thật quyền lực.' },
  { id:'acc-glasses', name:'Kính tròn học giả', icon:'👓', price:45, type:'fashion', description:'Kính tròn dành cho thú cưng mê kiến thức.' },
  { id:'acc-scarf', name:'Khăn quàng đỏ', icon:'🧣', price:35, type:'fashion', description:'Khăn ấm mềm mại cho những ngày học khuya.' },
  { id:'acc-space', name:'Mũ phi hành gia', icon:'🪐', price:120, type:'special', description:'Mũ không gian với kính phản quang.' },
  { id:'acc-star', name:'Kẹp sao', icon:'⭐', price:55, type:'fashion', description:'Ngôi sao nhỏ phát sáng trên đầu.' },
  { id:'acc-wings', name:'Cánh thiên thần', icon:'🪽', price:180, type:'aura', description:'Đôi cánh trắng nhấp nhô nhẹ phía sau.' },
  { id:'acc-lightning', name:'Hào quang lôi điện', icon:'⚡', price:220, type:'aura', description:'Tia điện nhỏ chớp quanh thú cưng.' },
  { id:'acc-fire', name:'Hào quang lửa', icon:'🔥', price:220, type:'aura', description:'Ngọn lửa ấm chuyển động dưới chân.' },
  { id:'acc-water', name:'Bong bóng nước', icon:'🫧', price:220, type:'aura', description:'Bong bóng trong suốt bay quanh thú cưng.' },
  { id:'acc-wind', name:'Gió lá', icon:'🍃', price:220, type:'aura', description:'Làn gió nhẹ cuốn lá bay vòng quanh.' },
];

export function getPetById(id) {
  return petCatalog.find((pet) => pet.id === id) || petCatalog[0];
}

export function getPetAccessoryById(id) {
  return petAccessories.find((item) => item.id === id) || null;
}

export const banks = [
  { id: 'techcombank', name: 'Techcombank', short: 'TCB' },
  { id: 'vietcombank', name: 'Vietcombank', short: 'VCB' },
  { id: 'bidv', name: 'BIDV', short: 'BIDV' },
  { id: 'mbbank', name: 'MB Bank', short: 'MB' },
  { id: 'acb', name: 'ACB', short: 'ACB' },
  { id: 'vietinbank', name: 'VietinBank', short: 'VTB' },
  { id: 'agribank', name: 'Agribank', short: 'AGR' },
  { id: 'vpbank', name: 'VPBank', short: 'VPB' },
];

export const avatarFrames = [
  { id:'frame-classic', name:'Khung Trang Sách', className:'frame-classic', tier:1, type:'basic', requirement:'Mặc định', season:'Nền tảng', description:'Viền ngà mỏng ôm sát avatar.' },
  { id:'frame-ink', name:'Khung Mực Xanh', className:'frame-ink', tier:1, type:'basic', requirement:'Mặc định', season:'Nền tảng', description:'Đường mực xanh thư viện thanh lịch.' },
  { id:'frame-paper', name:'Khung Giấy Cổ', className:'frame-paper', tier:1, type:'basic', requirement:'Mặc định', season:'Nền tảng', description:'Tông giấy kem gần gũi.' },
  { id:'frame-oxford', name:'Khung Oxford', className:'frame-oxford', tier:2, type:'level', minLevel:10, requirement:'Đạt cấp 10', season:'Học giả', description:'Xanh lá đậm trưởng thành.' },
  { id:'frame-laurel', name:'Khung Lá Nguyệt Quế', className:'frame-laurel', tier:2, type:'level', minLevel:15, requirement:'Đạt cấp 15', season:'Học giả', description:'Cành lá ôm hai bên avatar.' },
  { id:'frame-bronze', name:'Khung Gỗ Đồng', className:'frame-bronze', tier:2, type:'level', minLevel:20, requirement:'Đạt cấp 20', season:'Học giả', description:'Sắc gỗ đồng ấm.' },
  { id:'frame-emerald', name:'Khung Lá Ngọc', className:'frame-emerald', tier:3, type:'premium', requirement:'Premium', season:'Bảo trợ', description:'Xanh ngọc tự nhiên.' },
  { id:'frame-sapphire', name:'Khung Sương Sớm', className:'frame-sapphire', tier:3, type:'premium', requirement:'Premium', season:'Bảo trợ', description:'Xanh biển nhẹ và sáng.' },
  { id:'frame-platinum', name:'Khung Bạch Diệp', className:'frame-platinum', tier:3, type:'premium', requirement:'Premium', season:'Bảo trợ', description:'Bạc lá cây tinh tế.' },
  { id:'frame-spring-laurel', name:'Khung Mùa Xuân', className:'frame-spring-laurel', tier:4, type:'season', requirement:'Phần thưởng mùa Xuân', season:'Mùa Xuân 2026', description:'Lá non và hoa nhỏ ôm sát.' },
  { id:'frame-summer-olive', name:'Khung Ô Liu Hè', className:'frame-summer-olive', tier:4, type:'season', requirement:'Phần thưởng mùa Hè', season:'Mùa Hè 2026', description:'Lá ô liu xanh đậm.' },
  { id:'frame-autumn-gold', name:'Khung Thu Vàng', className:'frame-autumn-gold', tier:4, type:'season', requirement:'Top 10 mùa Thu', season:'Mùa Thu 2026', description:'Lá thu vàng đồng.' },
  { id:'frame-winter-silver', name:'Khung Đông Tùng', className:'frame-winter-silver', tier:4, type:'season', requirement:'Phần thưởng mùa Đông', season:'Mùa Đông 2026', description:'Lá tùng bạc tối giản.' },
  { id:'frame-scholar', name:'Khung Học Giả', className:'frame-scholar', tier:5, type:'rank', requirement:'Top thành viên học tập', season:'Bảng xếp hạng', description:'Cành sách và lá xanh.' },
  { id:'frame-author', name:'Khung Tác Giả', className:'frame-author', tier:5, type:'rank', requirement:'Top tác giả', season:'Bảng xếp hạng', description:'Bút mảnh và vòng lá.' },
  { id:'frame-curator', name:'Khung Giám Tuyển', className:'frame-curator', tier:5, type:'admin', requirement:'Quản trị viên', season:'Quản trị', description:'Huy hiệu xanh thư viện.' },
  { id:'frame-archive', name:'Khung Thủ Thư', className:'frame-archive', tier:5, type:'mission', requirement:'Hoàn thành nhiệm vụ lưu trữ', season:'Nhiệm vụ', description:'Gỗ thư viện và lá nguyệt quế.' },
  { id:'frame-citation', name:'Khung Trích Dẫn', className:'frame-citation', tier:6, type:'mission', requirement:'10.000 điểm đóng góp', season:'Nhiệm vụ', description:'Dấu trích dẫn và nhánh lá.' },
  { id:'frame-manuscript', name:'Khung Bản Thảo', className:'frame-manuscript', tier:6, type:'event', requirement:'Sự kiện viết học thuật', season:'Sự kiện', description:'Mực cổ và hoa văn trang sách.' },
  { id:'frame-patron', name:'Khung Bảo Trợ', className:'frame-patron', tier:6, type:'rank', requirement:'Nhà bảo trợ nổi bật', season:'Bảng xếp hạng', description:'Vàng đồng cao cấp với vòng lá.' },
];

export function getFrameById(id) {
  return avatarFrames.find((frame) => frame.id === id) || avatarFrames[0];
}


export const titleBadges = [
  { id:'title-member', name:'Thành viên DocShare', className:'title-member', icon:'✦', type:'basic', tier:1, requirement:'Mặc định', description:'Danh hiệu khởi đầu.' },
  { id:'title-scholar', name:'Học giả chăm chỉ', className:'title-scholar', icon:'📘', type:'level', tier:2, requirement:'Cấp 10', description:'Dành cho người học hoạt động đều.' },
  { id:'title-expert', name:'Chuyên gia tri thức', className:'title-expert', icon:'⚡', type:'level', tier:3, requirement:'Cấp 30', description:'Danh hiệu neon cho người dùng giàu kinh nghiệm.' },
  { id:'title-legend', name:'Huyền thoại DocShare', className:'title-legend', icon:'👑', type:'level', tier:6, requirement:'Cấp 60', description:'Chữ vàng chuyển sáng chậm.' },
  { id:'title-premium', name:'PREMIUM ELITE', className:'title-premium', icon:'◆', type:'premium', tier:5, requirement:'Tài khoản Premium', description:'Danh hiệu 7 màu dành cho Premium.' },
  { id:'title-admin', name:'SYSTEM OVERLORD', className:'title-admin', icon:'🛡', type:'admin', tier:7, requirement:'Quản trị viên', description:'Danh hiệu quản trị tối cao.' },
  { id:'title-top-member', name:'TOP 1 THÀNH VIÊN', className:'title-top-member', icon:'🏆', type:'rank', tier:7, requirement:'Top 1 thành viên', description:'Hiệu ứng cúp vàng và tia sáng.' },
  { id:'title-top-author', name:'TOP 1 TÁC GIẢ', className:'title-top-author', icon:'✒', type:'rank', tier:7, requirement:'Top 1 tác giả', description:'Danh hiệu bút vàng.' },
  { id:'title-top-donor', name:'VƯƠNG GIẢ ỦNG HỘ', className:'title-top-donor', icon:'💎', type:'rank', tier:7, requirement:'Top 1 ủng hộ', description:'Hiệu ứng kim cương tím.' },
  { id:'title-top-liked', name:'TRÁI TIM CỘNG ĐỒNG', className:'title-top-liked', icon:'♥', type:'rank', tier:6, requirement:'Top 1 yêu thích', description:'Nhịp sáng hồng.' },
  { id:'title-top-view', name:'MẮT THẦN TRI THỨC', className:'title-top-view', icon:'◉', type:'rank', tier:6, requirement:'Top 1 lượt xem', description:'Ánh lam quét qua chữ.' },
  { id:'title-top-download', name:'THỦ LĨNH LƯU TRỮ', className:'title-top-download', icon:'⇩', type:'rank', tier:6, requirement:'Top 1 lượt tải', description:'Hiệu ứng dữ liệu rơi.' },
  { id:'title-top-post', name:'TIẾNG NÓI DẪN ĐẦU', className:'title-top-post', icon:'💬', type:'rank', tier:6, requirement:'Top 1 bài đăng', description:'Hiệu ứng sóng âm.' },
  { id:'title-100-followers', name:'NGƯỜI KẾT NỐI', className:'title-connect', icon:'∞', type:'mission', tier:3, requirement:'100 người theo dõi', description:'Danh hiệu kết nối cộng đồng.' },
  { id:'title-1000-followers', name:'NGÔI SAO ẢNH HƯỞNG', className:'title-influencer', icon:'★', type:'mission', tier:5, requirement:'1.000 người theo dõi', description:'Hiệu ứng sao nhấp nháy.' },
  { id:'title-benefactor', name:'ÂN NHÂN HOÀNG KIM', className:'title-benefactor', icon:'♛', type:'mission', tier:6, requirement:'10.000 điểm ủng hộ', description:'Danh hiệu vàng cho nhà hảo tâm.' },
];

export const panelSkins = [
  { id:'panel-default', name:'Tối giản', className:'panel-skin-default', icon:'▣', tier:1, type:'basic', requirement:'Mặc định', description:'Khung mảnh, dễ đọc.' },
  { id:'panel-cyan', name:'Mạch Lam', className:'panel-skin-cyan', icon:'⌁', tier:2, type:'level', requirement:'Cấp 10', description:'Viền xanh quét nhẹ.' },
  { id:'panel-thunder', name:'Lôi Điện', className:'panel-skin-thunder', icon:'⚡', tier:5, type:'event', requirement:'Khung Lôi Thần', description:'Tia điện chạy ở góc bảng.' },
  { id:'panel-inferno', name:'Hỏa Diệm', className:'panel-skin-inferno', icon:'🔥', tier:5, type:'event', requirement:'Khung Hỏa Vương', description:'Ánh lửa thở chậm phía dưới.' },
  { id:'panel-tide', name:'Thủy Triều', className:'panel-skin-tide', icon:'🌊', tier:4, type:'event', requirement:'Khung Hải Đế', description:'Sóng nước chuyển động ở chân bảng.' },
  { id:'panel-aurora', name:'Premium Aurora', className:'panel-skin-aurora', icon:'◆', tier:5, type:'premium', requirement:'Premium', description:'Viền 7 màu chuyển động chậm.' },
  { id:'panel-royal', name:'Hoàng Gia', className:'panel-skin-royal', icon:'♛', tier:6, type:'rank', requirement:'Top bảng xếp hạng', description:'Góc vàng và huy hiệu vương miện.' },
  { id:'panel-crystal', name:'Pha Lê', className:'panel-skin-crystal', icon:'◇', tier:5, type:'event', requirement:'Sự kiện Kim Cương', description:'Mặt kính phản sáng.' },
  { id:'panel-dragon', name:'Long Ấn', className:'panel-skin-dragon', icon:'🐉', tier:7, type:'event', requirement:'Khung Long Vương', description:'Long văn chạy nhẹ ở mép bảng.' },
  { id:'panel-cyber', name:'Cyber Grid', className:'panel-skin-cyber', icon:'⌘', tier:4, type:'event', requirement:'25 nhiệm vụ công nghệ', description:'Lưới số và vệt scan.' },
  { id:'panel-sakura', name:'Hoa Anh Đào', className:'panel-skin-sakura', icon:'🌸', tier:3, type:'event', requirement:'Sự kiện mùa xuân', description:'Cánh hoa rơi rất nhẹ.' },
  { id:'panel-admin', name:'Admin Core', className:'panel-skin-admin', icon:'🛡', tier:7, type:'admin', requirement:'Admin', description:'Giao diện lõi quản trị.' },
];

export function getTitleById(id) {
  return titleBadges.find((item) => item.id === id) || titleBadges[0];
}

export function getPanelSkinById(id) {
  return panelSkins.find((item) => item.id === id) || panelSkins[0];
}
