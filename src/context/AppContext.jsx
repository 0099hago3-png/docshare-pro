import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  bannedWords as defaultBannedWords,
  banks,
  categories as defaultCategories,
  documents as defaultDocuments,
  giftStore,
  avatarFrames,
  petCatalog,
  petAccessories,
  titleBadges,
  panelSkins,
  notifications as defaultNotifications,
  posts as defaultPosts,
  reports as defaultReports,
  schools as defaultSchools,
  supportTickets as defaultSupportTickets,
  transactions as defaultTransactions,
  users as defaultUsers,
} from '../data/defaultData.js';
import { hasBadWords, todayKey } from '../utils/helpers.js';

const STORAGE_KEY = 'docshare_complete_v22_advanced';
const AppContext = createContext(null);

function defaultState() {
  return {
    users: defaultUsers,
    currentUserId: 'u_admin',
    documents: defaultDocuments,
    posts: defaultPosts,
    categories: defaultCategories,
    schools: defaultSchools,
    reports: defaultReports,
    notifications: defaultNotifications,
    transactions: defaultTransactions,
    supportTickets: defaultSupportTickets,
    bannedWords: defaultBannedWords,
    giftStore,
    avatarFrames,
  petCatalog,
  petAccessories,
  titleBadges,
  panelSkins,
    banks,
    theme: 'dark',
    adminLogs: [
      { id: 'log1', action: 'Cộng 500 credit', detail: 'Admin đã cộng 500 credit cho u_user', date: '2026-07-08 10:20' },
      { id: 'log2', action: 'Duyệt Premium', detail: 'Admin đã duyệt gia hạn Premium cho u_linh', date: '2026-07-08 09:45' },
      { id: 'log3', action: 'Mở khóa tài khoản', detail: 'Admin đã mở khóa u_minh', date: '2026-07-07 21:10' },
    ],
    giftHistory: [
      { id: 'gh1', userId: 'u_admin', targetType: 'document', targetId: 'd4', giftId: 'g7', giftName: 'Sư tử tinh vân', credit: 1000, date: '2026-07-08 11:30' },
      { id: 'gh2', userId: 'u_teacher', targetType: 'document', targetId: 'd6', giftId: 'g11', giftName: 'Hành tinh pha lê', credit: 800, date: '2026-07-08 10:15' },
    ],
    likes: { documents: ['d1', 'd6'], posts: ['p1'] },
    follows: ['u_teacher'],
    savedPosts: [],
    savedDocuments: ['d3'],
    history: [
      { id: 'h1', type: 'view', targetId: 'd1', title: 'Đã xem Python cơ bản', date: '2026-07-08 10:24' },
      { id: 'h2', type: 'like', targetId: 'd6', title: 'Đã thích Giải tích 1', date: '2026-07-08 09:15' },
      { id: 'h3', type: 'comment', targetId: 'p1', title: 'Đã bình luận bài React + Vite', date: '2026-07-07 21:10' },
      { id: 'h4', type: 'download', targetId: 'd2', title: 'Đã tải tài liệu SQL', date: '2026-07-07 19:03' },
      { id: 'h5', type: 'purchase', targetId: 'd4', title: 'Đã mua tài liệu Viết tin', date: '2026-07-07 08:14' },
    ],
    pendingPaymentUntil: 0,
    lastGiftEffect: null,
    purchasedDocuments: ['d2'],
    documentComments: {
      d1: [
        { id: 'dc1', userId: 'u_user', text: 'Tài liệu giải thích rất dễ hiểu, phần ví dụ Python rất hữu ích.', rating: 5, reactions: 12, createdAt: '2026-07-08 10:10', authorReply: { userId: 'u_teacher', text: 'Cảm ơn bạn. Mình sẽ bổ sung thêm bài tập thực hành trong bản cập nhật tiếp theo.', createdAt: '2026-07-08 11:00' } },
        { id: 'dc2', userId: 'u_minh', text: 'Mình thích cách trình bày từng bước, mong tác giả cập nhật thêm bài tập.', rating: 4, reactions: 6, createdAt: '2026-07-08 11:20' },
      ],
      d4: [
        { id: 'dc3', userId: 'u_admin', text: 'Nội dung phù hợp cho sinh viên báo chí và truyền thông.', rating: 5, reactions: 9, createdAt: '2026-07-07 15:30' },
      ],
    },
  };
}

function normalizeUser(user) {
  const level = Number(user.level || 1);
  const automaticFrames = ['orbit-basic'];
  if (level >= 10) automaticFrames.push('level-lunar');
  if (level >= 30) automaticFrames.push('level-nebula');
  if (level >= 60) automaticFrames.push('level-supernova');
  if ((user.followers || 0) >= 100) automaticFrames.push('mission-100-followers');
  if ((user.followers || 0) >= 1000) automaticFrames.push('follower-galaxy');
  if ((user.likes || 0) >= 1000) automaticFrames.push('mission-1000-likes');
  if ((user.supportPoints || 0) >= 10000) automaticFrames.push('mission-10000-support');
  if (user.premium) automaticFrames.push('premium-quasar');
  if (user.role === 'admin') automaticFrames.push(...avatarFrames.map((frame) => frame.id));
  const ownedFrames = Array.from(new Set([...(user.ownedFrames || []), ...automaticFrames]));
  const automaticTitles = ['title-member'];
  if (level >= 10) automaticTitles.push('title-scholar');
  if (level >= 30) automaticTitles.push('title-expert');
  if (level >= 60) automaticTitles.push('title-legend');
  if ((user.followers || 0) >= 100) automaticTitles.push('title-100-followers');
  if ((user.followers || 0) >= 1000) automaticTitles.push('title-1000-followers');
  if ((user.supportPoints || 0) >= 10000) automaticTitles.push('title-benefactor');
  if (user.premium) automaticTitles.push('title-premium');
  const automaticPanels = ['panel-default'];
  if (level >= 10) automaticPanels.push('panel-cyan');
  if (user.premium) automaticPanels.push('panel-aurora');
  if (ownedFrames.includes('thunder-lord')) automaticPanels.push('panel-thunder');
  if (ownedFrames.includes('inferno-lord') || ownedFrames.includes('phoenix-flare')) automaticPanels.push('panel-inferno');
  if (ownedFrames.includes('aqua-emperor') || ownedFrames.includes('ocean-nebula')) automaticPanels.push('panel-tide');
  if (ownedFrames.includes('diamond-emperor') || ownedFrames.includes('rank-nebula-donor-1')) automaticPanels.push('panel-crystal');
  if (ownedFrames.includes('cosmic-dragon') || ownedFrames.includes('storm-dragon')) automaticPanels.push('panel-dragon');
  if (ownedFrames.includes('cyber-grid')) automaticPanels.push('panel-cyber');
  if (ownedFrames.includes('sakura-garden')) automaticPanels.push('panel-sakura');
  if (ownedFrames.some((id) => id.startsWith('rank-nexus-'))) automaticPanels.push('panel-royal');
  if (user.role === 'admin') {
    automaticTitles.push(...titleBadges.map((item) => item.id));
    automaticPanels.push(...panelSkins.map((item) => item.id));
  }
  const ownedTitles = Array.from(new Set([...(user.ownedTitles || []), ...automaticTitles]));
  const ownedPanels = Array.from(new Set([...(user.ownedPanels || []), ...automaticPanels]));
  const activePanels = {
    message: ownedPanels.includes(user.activePanels?.message) ? user.activePanels.message : (user.premium ? 'panel-aurora' : 'panel-default'),
    comment: ownedPanels.includes(user.activePanels?.comment) ? user.activePanels.comment : (user.premium ? 'panel-aurora' : 'panel-default'),
    review: ownedPanels.includes(user.activePanels?.review) ? user.activePanels.review : (user.premium ? 'panel-aurora' : 'panel-default'),
  };
  const starterPets = user.role === 'admin' ? petCatalog.map((pet) => pet.id) : ['pet-duck'];
  const starterAccessories = user.role === 'admin' ? petAccessories.map((item) => item.id) : [];
  const ownedPets = Array.from(new Set([...(user.ownedPets || []), ...starterPets]));
  const activePets = (user.activePets || []).filter((petId) => ownedPets.includes(petId)).slice(0, 2);
  const ownedPetAccessories = Array.from(new Set([...(user.ownedPetAccessories || []), ...starterAccessories]));
  return {
    ...user,
    avatarImage: user.avatarImage || null,
    joinedAt: user.joinedAt || '2025-01-01',
    ownedFrames,
    activeFrame: ownedFrames.includes(user.activeFrame) ? user.activeFrame : ownedFrames.at(-1) || 'orbit-basic',
    ownedTitles,
    activeTitle: ownedTitles.includes(user.activeTitle) ? user.activeTitle : (user.role === 'admin' ? 'title-admin' : user.premium ? 'title-premium' : ownedTitles.at(-1)),
    ownedPanels,
    activePanels,
    ownedPets,
    activePets: activePets.length ? activePets : ownedPets.slice(0, 1),
    petsVisible: user.petsVisible !== false,
    ownedPetAccessories,
    petEquipment: user.petEquipment || {},
    petPlacement: user.petPlacement || {},
    petStats: user.petStats || {},
  };
}

function applyRankingFrames(baseState) {
  const rewardMap = new Map();
  const titleRewardMap = new Map();
  const addTitle = (userId, titleId) => titleRewardMap.set(userId, [...(titleRewardMap.get(userId) || []), titleId]);
  const add = (userId, frameId) => rewardMap.set(userId, [...(rewardMap.get(userId) || []), frameId]);
  const assignBoard = (items, board, scoreFn) => {
    [...items].sort((a, b) => scoreFn(b) - scoreFn(a)).slice(0, 10).forEach((item, index) => {
      const userId = item.authorId || item.id;
      if (index === 0) {
        const topFrame = {
          members: 'rank-nexus-1', authors: 'rank-quasar-creator-1', donate: 'rank-nebula-donor-1',
          liked: 'rank-stellar-heart-1', views: 'rank-oracle-view-1', downloads: 'rank-comet-download-1', posts: 'rank-nova-post-1',
        }[board];
        if (topFrame) add(userId, topFrame);
        const topTitle = { members:'title-top-member', authors:'title-top-author', donate:'title-top-donor', liked:'title-top-liked', views:'title-top-view', downloads:'title-top-download', posts:'title-top-post' }[board];
        if (topTitle) addTitle(userId, topTitle);
      } else if (board === 'members' && index === 1) add(userId, 'rank-nexus-2');
      else if (board === 'members' && index === 2) add(userId, 'rank-nexus-3');
      else if (board === 'members' && index < 10) add(userId, 'rank-nexus-10');
    });
  };
  assignBoard(baseState.users, 'members', (u) => (u.activityPoints || 0) + (u.level || 0) * 100);
  assignBoard(baseState.users, 'authors', (u) => u.creatorPoints || 0);
  assignBoard(baseState.users, 'donate', (u) => u.supportPoints || 0);
  assignBoard(baseState.documents, 'liked', (d) => d.likes || 0);
  assignBoard(baseState.documents, 'views', (d) => d.views || 0);
  assignBoard(baseState.documents, 'downloads', (d) => d.downloads || 0);
  assignBoard(baseState.posts, 'posts', (p) => (p.likes || 0) + (p.comments?.length || 0) * 20);
  return {
    ...baseState,
    theme: 'dark',
    users: baseState.users.map((user) => normalizeUser({
      ...user,
      ownedFrames: Array.from(new Set([...(user.ownedFrames || []), ...(rewardMap.get(user.id) || [])])),
      ownedTitles: Array.from(new Set([...(user.ownedTitles || []), ...(titleRewardMap.get(user.id) || [])])),
    })),
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const base = !saved ? defaultState() : { ...defaultState(), ...JSON.parse(saved) };
    return { ...applyRankingFrames(base), avatarFrames, petCatalog, petAccessories, titleBadges, panelSkins };
  } catch {
    const base = defaultState();
    return { ...applyRankingFrames(base), avatarFrames, petCatalog, petAccessories, titleBadges, panelSkins };
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.dataset.theme = 'dark';
  }, [state]);

  const currentUser = useMemo(() => state.users.find((user) => user.id === state.currentUserId) || null, [state.users, state.currentUserId]);

  function patch(updater) {
    setState((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
  }

  function showToast(message) {
    setToast(message);
    window.clearTimeout(window.__docshareToast);
    window.__docshareToast = window.setTimeout(() => setToast(''), 2500);
  }

  function addAdminLog(action, detail) {
    patch((prev) => ({
      ...prev,
      adminLogs: [{ id: 'log_' + Date.now(), action, detail, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
  }

  function getUser(id) {
    return state.users.find((user) => user.id === id) || state.users[0];
  }

  function login(email, password) {
    const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
    if (!user) return { ok: false, message: 'Email hoặc mật khẩu không đúng.' };
    if (user.lockedUntil === 'forever') return { ok: false, message: 'Tài khoản đã bị khóa vĩnh viễn.' };
    patch({ currentUserId: user.id });
    return { ok: true, user };
  }

  function register(payload) {
    if (state.users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase())) {
      return { ok: false, message: 'Email đã tồn tại.' };
    }
    const user = {
      id: 'u_' + Date.now(),
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: 'user',
      avatar: payload.name.charAt(0).toUpperCase(),
      verified: false,
      premium: false,
      level: 1,
      followers: 0,
      following: [],
      likes: 0,
      credit: 0,
      balance: 0,
      bio: 'Thành viên mới của DocShare.',
      school: payload.school || 'Chưa cập nhật',
      major: 'Chưa cập nhật',
      cover: '',
      passwordHint: payload.passwordHint || '',
      lockedUntil: null,
      warnings: 0,
      bankAccounts: [],
      ownedFrames: ['orbit-basic'],
      activeFrame: 'orbit-basic',
      avatarImage: null,
      ownedPets: ['pet-duck'],
      activePets: ['pet-duck'],
      petsVisible: true,
      ownedPetAccessories: [],
      petEquipment: {},
      petPlacement: { 'pet-duck': 'cover' },
      petStats: { 'pet-duck': { level: 1, hunger: 80, happiness: 85 } },
    };
    patch((prev) => ({ ...prev, users: [...prev.users, user], currentUserId: user.id }));
    return { ok: true };
  }

  function logout() {
    patch({ currentUserId: null });
  }

  function toggleTheme() {
    patch((prev) => ({ ...prev, theme: 'dark' }));
  }

  function markNotification(id) {
    const item = state.notifications.find((notice) => notice.id === id);
    patch((prev) => ({ ...prev, notifications: prev.notifications.map((notice) => notice.id === id ? { ...notice, unread: false } : notice) }));
    return item?.to || '/';
  }

  function markAllNotifications() {
    patch((prev) => ({ ...prev, notifications: prev.notifications.map((notice) => ({ ...notice, unread: false })) }));
  }

  function toggleLikeDocument(id) {
    patch((prev) => {
      const exists = prev.likes.documents.includes(id);
      return {
        ...prev,
        likes: { ...prev.likes, documents: exists ? prev.likes.documents.filter((item) => item !== id) : [...prev.likes.documents, id] },
        documents: prev.documents.map((doc) => doc.id === id ? { ...doc, likes: Math.max(0, doc.likes + (exists ? -1 : 1)) } : doc),
        history: exists ? prev.history : [{ id: 'h_' + Date.now(), type: 'like', targetId: id, title: `Đã thích tài liệu`, date: new Date().toLocaleString('vi-VN') }, ...prev.history],
      };
    });
  }

  function toggleLikePost(id) {
    patch((prev) => {
      const exists = prev.likes.posts.includes(id);
      return {
        ...prev,
        likes: { ...prev.likes, posts: exists ? prev.likes.posts.filter((item) => item !== id) : [...prev.likes.posts, id] },
        posts: prev.posts.map((post) => post.id === id ? { ...post, likes: Math.max(0, post.likes + (exists ? -1 : 1)) } : post),
      };
    });
  }

  function addHistory(item) {
    patch((prev) => ({ ...prev, history: [{ id: 'h_' + Date.now(), date: new Date().toLocaleString('vi-VN'), ...item }, ...prev.history] }));
  }

  function toggleSavePost(postId) {
    patch((prev) => {
      const saved = prev.savedPosts || [];
      const exists = saved.includes(postId);
      return {
        ...prev,
        savedPosts: exists ? saved.filter((id) => id !== postId) : [...saved, postId],
      };
    });
    showToast((state.savedPosts || []).includes(postId) ? 'Đã bỏ lưu bài viết.' : 'Đã lưu bài viết.');
  }

  function toggleSaveDocument(docId) {
    const wasSaved = (state.savedDocuments || []).includes(docId);
    patch((prev) => {
      const saved = prev.savedDocuments || [];
      const exists = saved.includes(docId);
      return {
        ...prev,
        savedDocuments: exists ? saved.filter((id) => id !== docId) : [...saved, docId],
        history: exists ? prev.history : [{ id: 'h_' + Date.now(), type: 'saved', targetId: docId, title: 'Đã thêm tài liệu vào yêu thích', date: new Date().toLocaleString('vi-VN') }, ...prev.history],
      };
    });
    showToast(wasSaved ? 'Đã bỏ tài liệu khỏi yêu thích.' : 'Đã thêm tài liệu vào yêu thích.');
  }

  function toggleFollow(userId) {
    patch((prev) => ({
      ...prev,
      follows: prev.follows.includes(userId) ? prev.follows.filter((id) => id !== userId) : [...prev.follows, userId],
    }));
  }

  function updateProfile(payload) {
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, ...payload, avatar: payload.avatar || user.avatar } : user),
    }));
    showToast('Đã cập nhật hồ sơ.');
  }

  function changePassword(oldPassword, newPassword, confirmPassword, hint) {
    if (!currentUser || currentUser.password !== oldPassword) return { ok: false, message: 'Mật khẩu cũ không đúng.' };
    if (!newPassword || newPassword.length < 6) return { ok: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
    if (newPassword !== confirmPassword) return { ok: false, message: 'Mật khẩu xác nhận không khớp.' };
    patch((prev) => ({ ...prev, users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, password: newPassword, passwordHint: hint || user.passwordHint } : user) }));
    return { ok: true };
  }


  function unlockFrame(userId, frameId) {
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === userId ? { ...user, ownedFrames: Array.from(new Set([...(user.ownedFrames || []), frameId])) } : user),
    }));
  }

  function setAvatarFrame(frameId) {
    if (!currentUser) return false;
    if (!(currentUser.ownedFrames || []).includes(frameId)) {
      showToast('Bạn chưa sở hữu khung này. Hãy tăng cấp, lên Premium hoặc đạt top bảng xếp hạng.');
      return false;
    }
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, activeFrame: frameId } : user),
    }));
    showToast('Đã đổi khung đại diện.');
    return true;
  }

  function setActiveTitle(titleId) {
    if (!currentUser) return false;
    if (!(currentUser.ownedTitles || []).includes(titleId)) {
      showToast('Bạn chưa sở hữu danh hiệu này.');
      return false;
    }
    patch((prev) => ({ ...prev, users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, activeTitle: titleId } : user) }));
    showToast('Đã sử dụng danh hiệu mới.');
    return true;
  }

  function setPanelSkin(kind, skinId) {
    if (!currentUser || !['message','comment','review'].includes(kind)) return false;
    if (!(currentUser.ownedPanels || []).includes(skinId)) {
      showToast('Bạn chưa sở hữu giao diện bảng này.');
      return false;
    }
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, activePanels: { ...(user.activePanels || {}), [kind]: skinId } } : user),
    }));
    showToast(`Đã áp dụng giao diện cho ${kind === 'message' ? 'tin nhắn' : kind === 'comment' ? 'bình luận' : 'đánh giá'}.`);
    return true;
  }

  function updateAvatarImage(avatarImage) {
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, avatarImage } : user),
    }));
    showToast('Đã cập nhật ảnh đại diện.');
  }

  function buyPet(petId) {
    const pet = petCatalog.find((item) => item.id === petId);
    if (!currentUser || !pet) return false;
    if ((currentUser.ownedPets || []).includes(petId)) {
      showToast('Thú cưng này đã ở trong túi của bạn.');
      return true;
    }
    if ((currentUser.credit || 0) < pet.price) {
      showToast('Bạn không đủ credit để mua thú cưng này.');
      return false;
    }
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === prev.currentUserId ? {
        ...user,
        credit: Math.max(0, (user.credit || 0) - pet.price),
        ownedPets: Array.from(new Set([...(user.ownedPets || []), petId])),
        petStats: { ...(user.petStats || {}), [petId]: { level: 1, hunger: 82, happiness: 88 } },
        petPlacement: { ...(user.petPlacement || {}), [petId]: 'cover' },
      } : user),
      transactions: [{ id:'pet_'+Date.now(), userId:prev.currentUserId, type:'pet', amount:0, credit:pet.price, status:'done', note:`Mua thú cưng ${pet.name}`, date:todayKey() }, ...(prev.transactions || [])],
    }));
    showToast(`${pet.name} đã được thêm vào túi thú cưng.`);
    return true;
  }

  function toggleActivePet(petId) {
    if (!currentUser || !(currentUser.ownedPets || []).includes(petId)) return false;
    const current = (currentUser.activePets || []).slice(0, 2);
    const exists = current.includes(petId);
    if (!exists && current.length >= 2) {
      showToast('Bạn chỉ được mang tối đa 2 thú cưng ra ảnh bìa. Hãy cho một bạn vào túi trước.');
      return false;
    }
    patch((prev) => ({ ...prev, users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, activePets: exists ? (user.activePets || []).filter((id) => id !== petId) : [...(user.activePets || []), petId].slice(0, 2) } : user) }));
    showToast(exists ? 'Đã đưa thú cưng về túi.' : 'Thú cưng đã xuất hiện trên ảnh bìa.');
    return true;
  }

  function togglePetsVisibility() {
    if (!currentUser) return;
    patch((prev) => ({ ...prev, users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, petsVisible: user.petsVisible === false } : user) }));
    showToast(currentUser.petsVisible === false ? 'Đã hiện thú cưng.' : 'Đã tạm ẩn thú cưng.');
  }

  function feedPet(petId) {
    if (!currentUser || !(currentUser.ownedPets || []).includes(petId)) return;
    patch((prev) => ({ ...prev, users: prev.users.map((user) => {
      if (user.id !== prev.currentUserId) return user;
      const old = user.petStats?.[petId] || { level:1, hunger:70, happiness:80 };
      return { ...user, petStats: { ...(user.petStats || {}), [petId]: { ...old, hunger: Math.min(100, old.hunger + 14), happiness: Math.min(100, old.happiness + 4), level: old.hunger > 92 && old.happiness > 92 ? old.level + 1 : old.level } } };
    }) }));
    showToast('Thú cưng đã ăn no và vui hơn.');
  }

  function petPet(petId, silent = false) {
    if (!currentUser || !(currentUser.ownedPets || []).includes(petId)) return;
    patch((prev) => ({ ...prev, users: prev.users.map((user) => {
      if (user.id !== prev.currentUserId) return user;
      const old = user.petStats?.[petId] || { level:1, hunger:70, happiness:80 };
      return { ...user, petStats: { ...(user.petStats || {}), [petId]: { ...old, happiness: Math.min(100, old.happiness + 6) } } };
    }) }));
    if (!silent) showToast('Bạn vừa vuốt ve thú cưng ♥');
  }

  function buyPetAccessory(accessoryId) {
    const accessory = petAccessories.find((item) => item.id === accessoryId);
    if (!currentUser || !accessory) return false;
    if ((currentUser.ownedPetAccessories || []).includes(accessoryId)) return true;
    if ((currentUser.credit || 0) < accessory.price) {
      showToast('Bạn không đủ credit để mua phụ kiện này.');
      return false;
    }
    patch((prev) => ({ ...prev, users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, credit: Math.max(0, (user.credit || 0) - accessory.price), ownedPetAccessories: Array.from(new Set([...(user.ownedPetAccessories || []), accessoryId])) } : user) }));
    showToast(`${accessory.name} đã được thêm vào túi phụ kiện.`);
    return true;
  }

  function equipPetAccessory(petId, accessoryId) {
    if (!currentUser || !(currentUser.ownedPets || []).includes(petId)) return false;
    if (accessoryId && !(currentUser.ownedPetAccessories || []).includes(accessoryId)) return false;
    patch((prev) => ({ ...prev, users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, petEquipment: { ...(user.petEquipment || {}), [petId]: accessoryId } } : user) }));
    showToast(accessoryId ? 'Đã trang bị phụ kiện cho thú cưng.' : 'Đã tháo phụ kiện.');
    return true;
  }

  function setPetPlacement(petId, placement) {
    if (!currentUser || !['cover','avatar','buttons'].includes(placement)) return false;
    patch((prev) => ({ ...prev, users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, petPlacement: { ...(user.petPlacement || {}), [petId]: placement } } : user) }));
    showToast('Đã đổi vị trí của thú cưng.');
    return true;
  }

  function addBankAccount(payload) {
    const account = { id: 'ba_' + Date.now(), ...payload, default: !currentUser?.bankAccounts?.length };
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === prev.currentUserId ? { ...user, bankAccounts: [...(user.bankAccounts || []), account] } : user),
    }));
    showToast('Đã lưu tài khoản ngân hàng.');
  }

  function addReport({ type, targetId, userId, reason, customReason }) {
    const report = { id: 'rp_' + Date.now(), type, targetId, userId, reporterId: state.currentUserId, reason: customReason || reason, status: 'pending', createdAt: todayKey() };
    patch((prev) => ({
      ...prev,
      reports: [report, ...prev.reports],
      notifications: [{ id: 'n_' + Date.now(), title: 'Báo cáo đã gửi', text: 'Admin sẽ kiểm tra nội dung bạn báo cáo.', to: '/support', unread: true }, ...prev.notifications],
    }));
    showToast('Đã gửi báo cáo cho admin xem xét.');
  }

  function addPost(content, documentId, title = '') {
    if (hasBadWords(content, state.bannedWords)) {
      showToast('Bài đăng chứa từ vi phạm, vui lòng chỉnh lại.');
      return false;
    }
    const post = { id: 'p_' + Date.now(), authorId: state.currentUserId, title: title.trim() || (content.includes('?') ? content.split('?')[0] + '?' : 'Góc chia sẻ tri thức'), content, documentId, likes: 0, shares: 0, reports: 0, createdAt: new Date().toLocaleString('vi-VN'), gifts: [], comments: [] };
    patch((prev) => ({ ...prev, posts: [post, ...prev.posts], history: [{ id: 'h_' + Date.now(), type: 'post', targetId: post.id, title: 'Đã đăng bài mới', date: new Date().toLocaleString('vi-VN') }, ...prev.history] }));
    showToast('Đăng bài thành công.');
    return true;
  }

  function addComment(postId, text) {
    if (hasBadWords(text, state.bannedWords)) {
      showToast('Bình luận chứa từ vi phạm.');
      return;
    }
    patch((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => post.id === postId ? { ...post, comments: [...post.comments, { id: 'c_' + Date.now(), userId: prev.currentUserId, text, reactions: 0, replies: [] }] } : post),
      history: [{ id: 'h_' + Date.now(), type: 'comment', targetId: postId, title: 'Đã bình luận bài đăng', date: new Date().toLocaleString('vi-VN') }, ...prev.history],
    }));
  }

  function replyComment(postId, commentId, text) {
    patch((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => post.id === postId ? {
        ...post,
        comments: post.comments.map((comment) => comment.id === commentId ? { ...comment, replies: [...(comment.replies || []), { id: 'r_' + Date.now(), userId: prev.currentUserId, text }] } : comment),
      } : post),
    }));
  }

  function reactComment(postId, commentId) {
    patch((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => post.id === postId ? {
        ...post,
        comments: post.comments.map((comment) => comment.id === commentId ? { ...comment, reactions: (comment.reactions || 0) + 1 } : comment),
      } : post),
    }));
  }


  function editPostComment(postId, commentId, text) {
    const value = String(text || '').trim();
    if (!value) return false;
    if (hasBadWords(value, state.bannedWords)) { showToast('Bình luận chứa từ vi phạm.'); return false; }
    patch((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => post.id === postId ? {
        ...post,
        comments: (post.comments || []).map((comment) => comment.id === commentId && (comment.userId === prev.currentUserId || currentUser?.role === 'admin') ? { ...comment, text: value, editedAt: new Date().toLocaleString('vi-VN') } : comment),
      } : post),
    }));
    showToast('Đã cập nhật bình luận.');
    return true;
  }

  function deletePostComment(postId, commentId) {
    patch((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => post.id === postId ? { ...post, comments: (post.comments || []).filter((comment) => !(comment.id === commentId && (comment.userId === prev.currentUserId || currentUser?.role === 'admin'))) } : post),
    }));
    showToast('Đã xóa bình luận.');
  }

  function reportPostComment(postId, commentId, userId, reason, customReason = '') {
    const detail = reason === 'other' ? customReason : reason;
    patch((prev) => ({ ...prev, reports: [{ id:'rp_'+Date.now(), type:'comment', targetId:commentId, parentId:postId, userId, reporterId:prev.currentUserId, reason:detail || 'Bình luận không phù hợp', status:'pending', createdAt:new Date().toLocaleString('vi-VN') }, ...(prev.reports || [])] }));
    showToast('Đã gửi báo cáo bình luận cho Admin.');
  }

  function donatePost(postId, gift) {
    const post = state.posts.find((item) => item.id === postId);
    if (!post || !currentUser || currentUser.credit < gift.credit) {
      showToast('Không đủ credit để tặng quà.');
      return false;
    }
    const creatorShare = Math.max(1, Math.floor(gift.credit * 0.3));
    patch((prev) => ({
      ...prev,
      lastGiftEffect: { ...gift, time: Date.now() },
      users: prev.users.map((user) => user.id === prev.currentUserId
        ? { ...user, credit: user.credit - gift.credit, supportPoints: (user.supportPoints || 0) + gift.credit }
        : user.id === post.authorId
          ? { ...user, credit: (user.credit || 0) + creatorShare, creatorPoints: (user.creatorPoints || 0) + creatorShare }
          : user),
      giftHistory: [{ id: 'gh_' + Date.now(), userId: prev.currentUserId, recipientId: post.authorId, targetType: 'post', targetId: postId, giftId: gift.id, giftName: gift.name, credit: gift.credit, creatorShare, date: new Date().toLocaleString('vi-VN') }, ...(prev.giftHistory || [])],
      posts: prev.posts.map((item) => item.id === postId ? { ...item, gifts: [...(item.gifts || []), { userId: prev.currentUserId, giftId: gift.id, gift: gift.icon + ' ' + gift.name, credit: gift.credit, creatorShare, date: new Date().toLocaleString('vi-VN') }] } : item),
      transactions: [
        { id: 't_' + Date.now(), userId: prev.currentUserId, type: 'gift', amount: 0, credit: gift.credit, status: 'done', note: `Tặng ${gift.name}`, date: todayKey() },
        { id: 't_share_' + Date.now(), userId: post.authorId, type: 'gift_income', amount: 0, credit: creatorShare, status: 'done', note: `Nhận 30% credit từ ${gift.name}`, date: todayKey() },
        ...prev.transactions,
      ],
      notifications: [{ id: 'n_' + Date.now(), userId: post.authorId, title: 'Bạn nhận được quà tặng', text: `${currentUser.name} đã tặng ${gift.icon} ${gift.name}. Bạn nhận ${creatorShare} credit (30%).`, to: '/feed', unread: true, important: gift.effect === 'mega' || gift.effect === 'legendary', kind: 'credit', date: 'Vừa xong' }, ...prev.notifications],
    }));
    showToast(`Đã gửi ${gift.icon} ${gift.name}. Tác giả nhận ${creatorShare} credit.`);
    setTimeout(() => patch((prev) => ({ ...prev, lastGiftEffect: null })), gift.effect === 'legendary' ? 9000 : gift.effect === 'mega' ? 7200 : gift.effect === 'big' ? 5200 : 3600);
    return true;
  }

  function donateDocument(docId, gift) {
    const doc = state.documents.find((item) => item.id === docId);
    if (!doc || !currentUser || currentUser.credit < gift.credit) {
      showToast('Không đủ credit để tặng quà.');
      return false;
    }
    const creatorShare = Math.max(1, Math.floor(gift.credit * 0.3));
    patch((prev) => ({
      ...prev,
      lastGiftEffect: { ...gift, time: Date.now() },
      users: prev.users.map((user) => user.id === prev.currentUserId
        ? { ...user, credit: user.credit - gift.credit, supportPoints: (user.supportPoints || 0) + gift.credit }
        : user.id === doc.authorId
          ? { ...user, credit: (user.credit || 0) + creatorShare, creatorPoints: (user.creatorPoints || 0) + creatorShare }
          : user),
      giftHistory: [{ id: 'gh_' + Date.now(), userId: prev.currentUserId, recipientId: doc.authorId, targetType: 'document', targetId: docId, giftId: gift.id, giftName: gift.name, credit: gift.credit, creatorShare, date: new Date().toLocaleString('vi-VN') }, ...(prev.giftHistory || [])],
      documents: prev.documents.map((item) => item.id === docId ? { ...item, gifts: [...(item.gifts || []), { userId: prev.currentUserId, giftId: gift.id, gift: gift.icon + ' ' + gift.name, credit: gift.credit, creatorShare, date: new Date().toLocaleString('vi-VN') }] } : item),
      transactions: [
        { id: 't_' + Date.now(), userId: prev.currentUserId, type: 'gift', amount: 0, credit: gift.credit, status: 'done', note: `Tặng quà cho tài liệu: ${gift.name}`, date: todayKey() },
        { id: 't_share_' + Date.now(), userId: doc.authorId, type: 'gift_income', amount: 0, credit: creatorShare, status: 'done', note: `Nhận 30% credit từ ${gift.name}`, date: todayKey() },
        ...prev.transactions,
      ],
      notifications: [{ id: 'n_' + Date.now(), userId: doc.authorId, title: 'Tài liệu nhận được quà', text: `${currentUser.name} đã tặng ${gift.icon} ${gift.name}. Bạn nhận ${creatorShare} credit (30%).`, to: `/documents/${docId}`, unread: true, important: gift.effect === 'mega' || gift.effect === 'legendary', kind: 'credit', date: 'Vừa xong' }, ...prev.notifications],
    }));
    showToast(`Đã gửi ${gift.icon} ${gift.name}. Tác giả nhận ${creatorShare} credit.`);
    setTimeout(() => patch((prev) => ({ ...prev, lastGiftEffect: null })), gift.effect === 'legendary' ? 9000 : gift.effect === 'mega' ? 7200 : gift.effect === 'big' ? 5200 : 3600);
    return true;
  }


  function buyDocument(docId) {
    const doc = state.documents.find((item) => item.id === docId);
    if (!doc || !currentUser) return { ok: false, message: 'Không tìm thấy tài liệu hoặc bạn chưa đăng nhập.' };
    if ((state.purchasedDocuments || []).includes(docId) || doc.price <= 0) return { ok: true, already: true };
    if (currentUser.credit < doc.price) return { ok: false, message: 'Bạn không đủ credit để mua tài liệu.' };
    patch((prev) => ({
      ...prev,
      purchasedDocuments: Array.from(new Set([...(prev.purchasedDocuments || []), docId])),
      users: prev.users.map((user) => user.id === prev.currentUserId
        ? { ...user, credit: Math.max(0, user.credit - doc.price) }
        : user.id === doc.authorId
          ? { ...user, balance: (user.balance || 0) + doc.price * 700 }
          : user),
      transactions: [{ id: 't_' + Date.now(), userId: prev.currentUserId, type: 'buy', amount: 0, credit: doc.price, status: 'done', note: `Mua ${doc.title}`, date: todayKey() }, ...prev.transactions],
      history: [{ id: 'h_' + Date.now(), type: 'purchase', targetId: docId, title: `Đã mua ${doc.title}`, date: new Date().toLocaleString('vi-VN') }, ...prev.history],
      notifications: [{ id: 'n_' + Date.now(), title: 'Mua tài liệu thành công', text: `Bạn đã mở khóa ${doc.title}.`, to: `/documents/${docId}`, unread: true }, ...prev.notifications],
    }));
    showToast('Mua tài liệu thành công. Nút tải đã được mở.');
    return { ok: true };
  }

  function addDocumentComment(docId, text, rating = 5) {
    if (!text.trim()) return false;
    if (hasBadWords(text, state.bannedWords)) {
      showToast('Bình luận chứa từ vi phạm.');
      return false;
    }
    patch((prev) => ({
      ...prev,
      documentComments: {
        ...(prev.documentComments || {}),
        [docId]: [...(prev.documentComments?.[docId] || []), {
          id: 'dc_' + Date.now(),
          userId: prev.currentUserId,
          text: text.trim(),
          rating: Number(rating || 5),
          reactions: 0,
          createdAt: new Date().toLocaleString('vi-VN'),
        }],
      },
      history: [{ id: 'h_' + Date.now(), type: 'comment', targetId: docId, title: 'Đã bình luận tài liệu', date: new Date().toLocaleString('vi-VN') }, ...prev.history],
    }));
    showToast('Đã gửi đánh giá.');
    return true;
  }

  function reactDocumentComment(docId, commentId) {
    patch((prev) => ({
      ...prev,
      documentComments: {
        ...(prev.documentComments || {}),
        [docId]: (prev.documentComments?.[docId] || []).map((comment) => comment.id === commentId ? { ...comment, reactions: (comment.reactions || 0) + 1 } : comment),
      },
    }));
  }

  function replyDocumentComment(docId, commentId, text) {
    if (!text.trim()) return false;
    patch((prev) => ({
      ...prev,
      documentComments: {
        ...(prev.documentComments || {}),
        [docId]: (prev.documentComments?.[docId] || []).map((comment) => comment.id === commentId ? {
          ...comment,
          authorReply: { userId: prev.currentUserId, text: text.trim(), createdAt: new Date().toLocaleString('vi-VN') },
        } : comment),
      },
    }));
    showToast('Đã trả lời đánh giá.');
    return true;
  }


  function editDocumentComment(docId, commentId, text, rating) {
    const value = String(text || '').trim();
    if (!value) return false;
    if (hasBadWords(value, state.bannedWords)) { showToast('Nội dung chứa từ vi phạm.'); return false; }
    patch((prev) => ({
      ...prev,
      documentComments: {
        ...(prev.documentComments || {}),
        [docId]: (prev.documentComments?.[docId] || []).map((comment) => comment.id === commentId && (comment.userId === prev.currentUserId || currentUser?.role === 'admin') ? { ...comment, text:value, rating:Number(rating || comment.rating || 5), editedAt:new Date().toLocaleString('vi-VN') } : comment),
      },
    }));
    showToast('Đã cập nhật đánh giá.');
    return true;
  }

  function deleteDocumentComment(docId, commentId) {
    patch((prev) => ({
      ...prev,
      documentComments: {
        ...(prev.documentComments || {}),
        [docId]: (prev.documentComments?.[docId] || []).filter((comment) => !(comment.id === commentId && (comment.userId === prev.currentUserId || currentUser?.role === 'admin'))),
      },
    }));
    showToast('Đã xóa đánh giá.');
  }

  function reportDocumentComment(docId, commentId, userId, reason, customReason = '') {
    const detail = reason === 'other' ? customReason : reason;
    patch((prev) => ({ ...prev, reports: [{ id:'rdc_'+Date.now(), type:'comment', targetId:commentId, parentId:docId, userId, reporterId:prev.currentUserId, reason:detail || 'Đánh giá không phù hợp', status:'pending', createdAt:new Date().toLocaleString('vi-VN') }, ...(prev.reports || [])] }));
    showToast('Đã gửi báo cáo đánh giá cho Admin.');
  }

  function uploadDocument(data) {
    if (hasBadWords(`${data.title} ${data.subject}`, state.bannedWords)) {
      showToast('Tài liệu chứa từ vi phạm, vui lòng chỉnh lại.');
      return false;
    }
    const doc = {
      id: 'd_' + Date.now(),
      title: data.title,
      subject: data.subject,
      description: data.description || '',
      category: data.category,
      school: data.school,
      authorId: state.currentUserId,
      type: data.type,
      price: Number(data.price || 0),
      premiumOnly: false,
      cover: data.coverEmoji || data.coverFileName || '📘',
      color: data.color || 'blue',
      demoPages: data.demoFileName ? 5 : 0,
      tags: data.tags || [],
      views: 0,
      downloads: 0,
      likes: 0,
      rating: 0,
      createdAt: todayKey(),
      coverFileName: data.coverFileName,
      coverPreview: data.coverPreview || '',
      visibility: data.visibility || 'public',
      demoFileName: data.demoFileName,
      fullFileNames: data.fullFileNames || [],
    };
    patch((prev) => ({ ...prev, documents: [doc, ...prev.documents] }));
    showToast('Đăng tài liệu thành công.');
    return true;
  }

  function requestTopup(amount, credit) {
    const now = Date.now();
    if (state.pendingPaymentUntil > now) {
      showToast('Bạn đang có giao dịch chờ xác thực. Vui lòng đợi 5 phút.');
      return false;
    }
    patch((prev) => ({
      ...prev,
      pendingPaymentUntil: now + 5 * 60 * 1000,
      transactions: [{ id: 't_' + Date.now(), userId: prev.currentUserId, type: 'topup', amount, credit, status: 'pending', note: 'Chờ admin xác nhận', date: todayKey() }, ...prev.transactions],
      notifications: [{ id: 'n_' + Date.now(), title: 'Đã gửi yêu cầu nạp credit', text: 'Thanh toán đang được xác thực trong 5 phút.', to: '/wallet', unread: true }, ...prev.notifications],
    }));
    return true;
  }

  function requestPremium(plan) {
    const now = Date.now();
    if (state.pendingPaymentUntil > now) {
      showToast('Bạn đang có giao dịch chờ xác thực. Vui lòng đợi 5 phút.');
      return false;
    }
    patch((prev) => ({
      ...prev,
      pendingPaymentUntil: now + 5 * 60 * 1000,
      transactions: [{ id: 't_' + Date.now(), userId: prev.currentUserId, type: 'premium', amount: plan.price, credit: plan.bonus, status: 'pending', note: plan.name, date: todayKey() }, ...prev.transactions],
    }));
    return true;
  }

  function requestWithdraw(payload) {
    patch((prev) => ({
      ...prev,
      transactions: [{ id: 't_' + Date.now(), userId: prev.currentUserId, type: 'withdraw', amount: Number(payload.amount), credit: 0, status: 'pending', note: `${payload.bank} - ${payload.number}`, date: todayKey() }, ...prev.transactions],
    }));
    showToast('Đã gửi yêu cầu rút tiền cho admin.');
  }

  function adminApproveTransaction(id) {
    let approvedTx = null;
    patch((prev) => {
      const tx = prev.transactions.find((item) => item.id === id);
      if (!tx) return prev;
      approvedTx = tx;
      const months = tx.type === 'premium' ? (tx.note.includes('12') ? 12 : tx.note.includes('6') ? 6 : tx.note.includes('3') ? 3 : 1) : 0;
      const now = new Date();
      const expires = new Date(now);
      expires.setMonth(expires.getMonth() + months);
      return {
        ...prev,
        users: prev.users.map((user) => user.id === tx.userId ? {
          ...user,
          credit: user.credit + (tx.type === 'topup' || tx.type === 'premium' ? tx.credit : 0),
          premium: tx.type === 'premium' ? true : user.premium,
          premiumInfo: tx.type === 'premium' ? {
            plan: tx.note,
            purchasedAt: now.toLocaleString('vi-VN'),
            expiresAt: expires.toISOString().slice(0, 10),
            status: 'active',
            renewals: [...(user.premiumInfo?.renewals || []), { date: now.toISOString().slice(0,10), plan: tx.note, creditBonus: tx.credit, status: 'approved' }],
          } : user.premiumInfo,
          balance: tx.type === 'withdraw' ? Math.max(0, (user.balance || 0) - tx.amount) : user.balance,
        } : user),
        transactions: prev.transactions.map((item) => item.id === id ? { ...item, status: 'done', approvedAt: now.toLocaleString('vi-VN') } : item),
        notifications: [{ id: 'n_' + Date.now(), title: 'Yêu cầu đã được duyệt', text: tx.type === 'premium' ? `Gói ${tx.note} đã được kích hoạt.` : tx.type === 'withdraw' ? 'Yêu cầu rút tiền đã được thanh toán.' : 'Credit đã được cộng vào tài khoản.', to: tx.type === 'premium' ? '/wallet' : '/history', unread: true, important: true, kind: 'admin', date: 'Vừa xong' }, ...prev.notifications],
        adminLogs: [{ id: 'log_' + Date.now(), action: `Duyệt ${tx.type}`, detail: `Đã duyệt ${tx.type} cho ${tx.userId}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
      };
    });
    if (approvedTx) showToast('Đã duyệt yêu cầu.');
  }

  function adminRejectTransaction(id, reason) {
    patch((prev) => ({ ...prev, transactions: prev.transactions.map((item) => item.id === id ? { ...item, status: 'rejected', rejectReason: reason || 'Không hợp lệ' } : item), adminLogs: [{ id: 'log_' + Date.now(), action: 'Từ chối giao dịch', detail: `${id}: ${reason || 'Không hợp lệ'}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])] }));
    showToast('Đã từ chối yêu cầu.');
  }

  function adminLockUser(id, days, reason) {
    const lockedUntil = days === 'forever' ? 'forever' : `${days} ngày`;
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === id ? { ...user, lockedUntil, lockReason: reason, warnings: (user.warnings || 0) + 1 } : user),
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Khóa tài khoản', detail: `${id} - ${reason} - ${lockedUntil}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
      notifications: [{ id: 'n_' + Date.now(), title: 'Tài khoản bị xử lý', text: `Lý do: ${reason}. Thời hạn: ${lockedUntil}`, to: '/profile', unread: true }, ...prev.notifications],
    }));
  }

  function adminUnlockUser(id) {
    patch((prev) => ({ ...prev, users: prev.users.map((user) => user.id === id ? { ...user, lockedUntil: null, lockReason: '' } : user), adminLogs: [{ id: 'log_' + Date.now(), action: 'Mở khóa tài khoản', detail: `Đã mở khóa ${id}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])] }));
    showToast('Đã mở khóa tài khoản.');
  }

  function adminDeleteDocument(id, reason) {
    const doc = state.documents.find((item) => item.id === id);
    patch((prev) => ({
      ...prev,
      documents: prev.documents.filter((item) => item.id !== id),
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Xóa tài liệu', detail: `${doc?.title || id} - ${reason}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
      notifications: [{ id: 'n_' + Date.now(), title: 'Tài liệu đã bị xóa', text: `${doc?.title || 'Tài liệu'} bị xóa. Lý do: ${reason}`, to: '/history', unread: true }, ...prev.notifications],
    }));
    showToast('Đã xóa tài liệu và gửi thông báo.');
  }

  function adminRevokeCredit(userId, credit, reason) {
    const amount = Math.max(0, Number(credit || 0));
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === userId ? { ...user, credit: Math.max(0, (user.credit || 0) - amount) } : user),
      transactions: [{ id: 't_' + Date.now(), userId, type: 'revoke', amount: 0, credit: amount, status: 'done', note: reason || 'Admin thu hồi credit', date: todayKey() }, ...prev.transactions],
      notifications: [{ id: 'n_' + Date.now(), userId, title: 'Credit đã được điều chỉnh', text: `Admin đã thu hồi ${amount.toLocaleString('vi-VN')} credit. Lý do: ${reason || 'Điều chỉnh hệ thống'}.`, to: '/wallet', unread: true, important: true, kind: 'credit', date: 'Vừa xong' }, ...prev.notifications],
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Thu hồi credit', detail: `Thu hồi ${amount} credit của ${userId}: ${reason || 'Điều chỉnh hệ thống'}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã thu hồi credit.');
  }

  function adminAddCredit(userId, credit, reason = 'Admin cộng credit') {
    const amount = Math.max(0, Number(credit || 0));
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === userId ? { ...user, credit: (user.credit || 0) + amount } : user),
      transactions: [{ id: 't_' + Date.now(), userId, type: 'admin-credit', amount: 0, credit: amount, status: 'done', note: reason, date: todayKey() }, ...prev.transactions],
      notifications: [{ id: 'n_' + Date.now(), title: 'Admin đã cộng credit', text: `Bạn nhận được ${amount.toLocaleString('vi-VN')} credit.`, to: '/wallet', unread: true, important: true, kind: 'credit', date: 'Vừa xong' }, ...prev.notifications],
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Cộng credit', detail: `Cộng ${amount} credit cho ${userId}: ${reason}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã cộng credit.');
  }

  function adminGrantFrame(userId, frameId) {
    const frame = avatarFrames.find((item) => item.id === frameId);
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === userId ? { ...user, ownedFrames: Array.from(new Set([...(user.ownedFrames || []), frameId])) } : user),
      notifications: [{ id: 'n_' + Date.now(), title: 'Bạn nhận được khung mới', text: `Admin đã trao khung ${frame?.name || frameId}.`, to: '/profile', unread: true, important: true, kind: 'frame', date: 'Vừa xong' }, ...prev.notifications],
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Trao khung', detail: `Trao ${frame?.name || frameId} cho ${userId}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã trao khung avatar.');
  }

  function adminUnlockAllFrames(userId) {
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === userId ? { ...user, ownedFrames: avatarFrames.map((frame) => frame.id) } : user),
      notifications: [{ id: 'n_' + Date.now(), title: 'Đã mở toàn bộ khung', text: 'Admin đã mở toàn bộ khung avatar cho tài khoản của bạn.', to: '/profile', unread: true, important: true, kind: 'frame', date: 'Vừa xong' }, ...prev.notifications],
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Mở toàn bộ khung', detail: `Đã mở toàn bộ khung cho ${userId}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã mở toàn bộ khung.');
  }

  function adminSendNotification(userId, title, text, to = '/profile') {
    patch((prev) => ({
      ...prev,
      notifications: [{ id: 'n_' + Date.now(), userId, title, text, to, unread: true, important: true, kind: 'admin', date: 'Vừa xong' }, ...prev.notifications],
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Gửi thông báo', detail: `Gửi cho ${userId}: ${title}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã gửi thông báo.');
  }

  function adminResolveReport(reportId, action, note = '') {
    const report = state.reports.find((item) => item.id === reportId);
    patch((prev) => ({
      ...prev,
      reports: prev.reports.map((item) => item.id === reportId ? { ...item, status: 'resolved', action, adminNote: note, resolvedAt: new Date().toLocaleString('vi-VN') } : item),
      notifications: report?.userId ? [{ id: 'n_' + Date.now(), userId: report.userId, title: 'Báo cáo đã được xử lý', text: `${action}. ${note}`.trim(), to: report.type === 'document' ? `/documents/${report.targetId}` : '/feed', unread: true, important: action !== 'Bỏ qua', kind: 'admin', date: 'Vừa xong' }, ...prev.notifications] : prev.notifications,
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Xử lý báo cáo', detail: `${reportId} - ${action} - ${note}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã xử lý báo cáo.');
  }

  function adminDeletePost(postId, reason = 'Vi phạm quy định cộng đồng') {
    const post = state.posts.find((item) => item.id === postId);
    patch((prev) => ({
      ...prev,
      posts: prev.posts.filter((item) => item.id !== postId),
      notifications: [{ id: 'n_' + Date.now(), userId: post?.authorId, title: 'Bài đăng đã bị xóa', text: `Lý do: ${reason}.`, to: '/history', unread: true, important: true, kind: 'admin', date: 'Vừa xong' }, ...prev.notifications],
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Xóa bài đăng', detail: `${postId} - ${reason}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã xóa bài đăng và gửi thông báo.');
  }

  function adminChangeRole(userId, role) {
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === userId ? { ...user, role } : user),
      notifications: [{ id: 'n_' + Date.now(), userId, title: 'Quyền tài khoản đã thay đổi', text: `Vai trò mới: ${role}.`, to: '/profile', unread: true, important: true, kind: 'admin', date: 'Vừa xong' }, ...prev.notifications],
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Đổi quyền tài khoản', detail: `${userId} → ${role}`, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã cập nhật quyền tài khoản.');
  }

  function adminToggleVerified(userId) {
    const target = state.users.find((user) => user.id === userId);
    patch((prev) => ({
      ...prev,
      users: prev.users.map((user) => user.id === userId ? { ...user, verified: !user.verified } : user),
      notifications: [{ id: 'n_' + Date.now(), userId, title: target?.verified ? 'Đã thu hồi tích xanh' : 'Bạn đã được cấp tích xanh', text: target?.verified ? 'Tích xanh của tài khoản đã được thu hồi.' : 'Chúc mừng! Admin đã xác minh tài khoản của bạn.', to: '/profile', unread: true, important: true, kind: 'frame', date: 'Vừa xong' }, ...prev.notifications],
      adminLogs: [{ id: 'log_' + Date.now(), action: target?.verified ? 'Thu hồi tích xanh' : 'Cấp tích xanh', detail: userId, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast(target?.verified ? 'Đã thu hồi tích xanh.' : 'Đã cấp tích xanh.');
  }

  function adminAddBannedWord(word) {
    const value = String(word || '').trim().toLowerCase();
    if (!value) return false;
    patch((prev) => ({
      ...prev,
      bannedWords: Array.from(new Set([...(prev.bannedWords || []), value])),
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Thêm từ khóa vi phạm', detail: value, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã thêm từ khóa vi phạm.');
    return true;
  }

  function adminRemoveBannedWord(word) {
    patch((prev) => ({
      ...prev,
      bannedWords: (prev.bannedWords || []).filter((item) => item !== word),
      adminLogs: [{ id: 'log_' + Date.now(), action: 'Xóa từ khóa vi phạm', detail: word, date: new Date().toLocaleString('vi-VN') }, ...(prev.adminLogs || [])],
    }));
    showToast('Đã xóa từ khóa vi phạm.');
  }

  function resetDemo() {
    localStorage.removeItem(STORAGE_KEY);
    setState({ ...applyRankingFrames(defaultState()), avatarFrames, petCatalog, petAccessories, titleBadges, panelSkins });
    showToast('Đã reset dữ liệu demo.');
  }

  const value = {
    state,
    currentUser,
    toast,
    showToast,
    patch,
    getUser,
    login,
    register,
    logout,
    toggleTheme,
    markNotification,
    markAllNotifications,
    toggleLikeDocument,
    toggleLikePost,
    toggleSavePost,
    toggleSaveDocument,
    addHistory,
    toggleFollow,
    updateProfile,
    changePassword,
    unlockFrame,
    setAvatarFrame,
    setActiveTitle,
    setPanelSkin,
    updateAvatarImage,
    buyPet,
    toggleActivePet,
    togglePetsVisibility,
    feedPet,
    petPet,
    buyPetAccessory,
    equipPetAccessory,
    setPetPlacement,
    addBankAccount,
    addReport,
    addPost,
    addComment,
    replyComment,
    reactComment,
    editPostComment,
    deletePostComment,
    reportPostComment,
    donatePost,
    donateDocument,
    buyDocument,
    addDocumentComment,
    reactDocumentComment,
    replyDocumentComment,
    editDocumentComment,
    deleteDocumentComment,
    reportDocumentComment,
    uploadDocument,
    requestTopup,
    requestPremium,
    requestWithdraw,
    adminApproveTransaction,
    adminRejectTransaction,
    adminLockUser,
    adminUnlockUser,
    adminDeleteDocument,
    adminDeletePost,
    adminChangeRole,
    adminToggleVerified,
    adminAddBannedWord,
    adminRemoveBannedWord,
    adminRevokeCredit,
    adminAddCredit,
    adminGrantFrame,
    adminUnlockAllFrames,
    adminSendNotification,
    adminResolveReport,
    resetDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
