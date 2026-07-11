import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  avatarFrames,
  banks,
  bannedWords,
  panelSkins,
  petAccessories,
  petCatalog,
  titleBadges,
} from '../data/defaultData.js';

import { supabase } from '../lib/supabase.js';

const AppContext = createContext(null);

const EMPTY_USER = {
  id: '',
  name: 'Người dùng DocShare',
  email: '',
  username: '',
  role: 'user',
  avatar: 'D',
  avatarImage: null,
  cover: '',
  verified: false,
  premium: false,
  level: 1,
  followers: 0,
  following: [],
  likes: 0,
  credit: 0,
  balance: 0,
  bio: '',
  school: '',
  faculty: '',
  major: '',
  joinedAt: '',
  ownedFrames: [],
  activeFrame: 'frame-classic',
  ownedTitles: [],
  activeTitle: null,
  ownedPanels: ['panel-default'],
  activePanels: {
    message: 'panel-default',
    comment: 'panel-default',
    review: 'panel-default',
  },
  ownedPets: [],
  activePets: [],
  petsVisible: false,
  ownedPetAccessories: [],
  petEquipment: {},
  petPlacement: {},
  petStats: {},
  ownedDocuments: [],
};

function emptyState() {
  return {
    currentUserId: null,
    users: [],
    documents: [],
    posts: [],
    categories: [],
    schools: [],
    reports: [],
    notifications: [],
    transactions: [],
    paymentRequests: [],
    supportTickets: [],
    bannedWords: Array.isArray(bannedWords) ? bannedWords : [],
    giftStore: [],
    giftHistory: [],
    avatarFrames: Array.isArray(avatarFrames) ? avatarFrames : [],
    petCatalog: Array.isArray(petCatalog) ? petCatalog : [],
    petAccessories: Array.isArray(petAccessories) ? petAccessories : [],
    titleBadges: Array.isArray(titleBadges) ? titleBadges : [],
    panelSkins: Array.isArray(panelSkins) ? panelSkins : [],
    banks: Array.isArray(banks) ? banks : [],
    adminLogs: [],
    mailboxThreads: [],
    likes: {
      documents: [],
      posts: [],
    },
    follows: [],
    savedPosts: [],
    savedDocuments: [],
    history: [],
    documentComments: {},
    pendingPaymentUntil: 0,
    lastGiftEffect: null,
    theme: 'light',
  };
}

function formatDate(value) {
  if (!value) return '';

  try {
    return new Date(value).toLocaleString('vi-VN');
  } catch {
    return String(value);
  }
}

function makeSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanFileName(value) {
  const source = String(value || 'file')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-');

  return source || `file-${Date.now()}`;
}

function getPublicUrl(bucket, path) {
  if (!bucket || !path) return '';

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data?.publicUrl || '';
}

async function safeQuery(query, fallback = []) {
  try {
    const { data, error } = await query;

    if (error) {
      console.warn('[Supabase]', error.message);
      return fallback;
    }

    return data ?? fallback;
  } catch (error) {
    console.warn('[Supabase]', error?.message || error);
    return fallback;
  }
}

function mapProfile(row, wallet, followerCount, followingIds, purchasedIds) {
  const name = row.full_name || row.username || row.email || 'Người dùng DocShare';

  return {
    ...EMPTY_USER,
    id: row.id,
    name,
    email: row.email || '',
    username: row.username || '',
    phone: row.phone || '',
    role: row.role || 'user',
    avatar: name.charAt(0).toUpperCase(),
    avatarImage: row.avatar_path
      ? getPublicUrl('avatars', row.avatar_path)
      : null,
    avatarPath: row.avatar_path || null,
    cover: row.cover_path
      ? getPublicUrl('avatars', row.cover_path)
      : '',
    coverPath: row.cover_path || null,
    verified: Boolean(row.verified),
    premium: Boolean(row.premium),
    premiumExpiresAt: row.premium_expires_at || null,
    level: Number(row.level || 1),
    followers: Number(followerCount || 0),
    following: followingIds || [],
    credit: Number(wallet?.credit_balance || 0),
    balance: Number(wallet?.cash_balance || 0),
    bio: row.bio || '',
    school: row.school_name || '',
    faculty: row.faculty || '',
    major: row.major || '',
    joinedAt: row.created_at || '',
    lockedUntil: row.locked_until || null,
    lockReason: row.lock_reason || '',
    status: row.status || 'active',
    ownedDocuments: purchasedIds || [],
  };
}

function mapDocument(row, stats, files, categoryMap, schoolMap) {
  const coverFile = files.find((item) => item.file_kind === 'cover');
  const demoFiles = files.filter((item) => item.file_kind === 'demo');
  const fullFiles = files.filter((item) => item.file_kind === 'full');

  return {
    id: row.id,
    authorId: row.author_id,
    categoryId: row.category_id,
    schoolId: row.school_id,
    title: row.title,
    description: row.description || '',
    subject: row.subject || '',
    category: categoryMap.get(row.category_id)?.name || '',
    school: schoolMap.get(row.school_id)?.name || '',
    faculty: row.faculty || '',
    major: row.major || '',
    isbn: row.isbn || '',
    academicYear: row.academic_year || null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    language: row.language || 'vi',
    price: Number(row.price_credit || 0),
    priceCredit: Number(row.price_credit || 0),
    visibility: row.visibility || 'public',
    status: row.status || 'draft',
    createdAt: row.created_at,
    publishedAt: row.published_at,
    views: Number(stats?.view_count || 0),
    likes: Number(stats?.like_count || 0),
    comments: Number(stats?.comment_count || 0),
    purchases: Number(stats?.purchase_count || 0),
    rating: Number(stats?.average_rating || 0),
    ratingCount: Number(stats?.rating_count || 0),
    coverPath: coverFile?.storage_path || '',
    coverPreview: coverFile
      ? getPublicUrl(coverFile.storage_bucket, coverFile.storage_path)
      : '',
    cover: coverFile
      ? getPublicUrl(coverFile.storage_bucket, coverFile.storage_path)
      : '📘',
    demoFiles,
    fullFiles,
    pages: fullFiles.reduce(
      (sum, item) => sum + Number(item.page_count || 0),
      0,
    ),
    demoPages: demoFiles.reduce(
      (sum, item) => sum + Number(item.page_count || 0),
      0,
    ),
  };
}

function mapDocumentComments(rows, reactionRows) {
  const reactionCount = new Map();

  reactionRows.forEach((item) => {
    reactionCount.set(
      item.comment_id,
      Number(reactionCount.get(item.comment_id) || 0) + 1,
    );
  });

  const mapped = rows.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    userId: row.user_id,
    parentId: row.parent_id,
    text: row.content,
    content: row.content,
    status: row.status,
    reactions: Number(reactionCount.get(row.id) || 0),
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  }));

  const result = {};

  mapped
    .filter((item) => !item.parentId)
    .forEach((item) => {
      const replies = mapped.filter((reply) => reply.parentId === item.id);
      const firstReply = replies[0];

      const record = {
        ...item,
        replies,
        authorReply: firstReply
          ? {
              userId: firstReply.userId,
              text: firstReply.text,
              createdAt: firstReply.createdAt,
            }
          : null,
      };

      if (!result[item.documentId]) {
        result[item.documentId] = [];
      }

      result[item.documentId].push(record);
    });

  return result;
}

function mapPostComments(rows, reactionRows) {
  const reactionCount = new Map();

  reactionRows.forEach((item) => {
    reactionCount.set(
      item.comment_id,
      Number(reactionCount.get(item.comment_id) || 0) + 1,
    );
  });

  const mapped = rows.map((row) => ({
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    parentId: row.parent_id,
    text: row.content,
    content: row.content,
    status: row.status,
    reactions: Number(reactionCount.get(row.id) || 0),
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  }));

  return mapped
    .filter((item) => !item.parentId)
    .map((item) => ({
      ...item,
      replies: mapped.filter((reply) => reply.parentId === item.id),
    }));
}

function mapNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind || 'system',
    title: row.title,
    text: row.content,
    content: row.content,
    to: row.target_url || '/',
    unread: !row.is_read,
    important: Boolean(row.important),
    date: formatDate(row.created_at),
    createdAt: row.created_at,
  };
}

function mapTransaction(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: 0,
    credit: Math.abs(Number(row.amount || 0)),
    signedCredit: Number(row.amount || 0),
    balanceAfter: Number(row.balance_after || 0),
    status: 'done',
    note: row.note || '',
    date: formatDate(row.created_at),
    createdAt: row.created_at,
  };
}

function mapPaymentRequest(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: Number(row.amount_vnd || 0),
    credit: Number(row.credit_amount || 0),
    plan: row.plan_code || '',
    status: row.status,
    note: row.transfer_note || row.admin_note || '',
    date: formatDate(row.created_at),
    createdAt: row.created_at,
  };
}

export function AppProvider({ children }) {
  const [state, setState] = useState(emptyState);
  const [toast, setToast] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const mountedRef = useRef(true);

  function showToast(message) {
    setToast(String(message || ''));

    window.clearTimeout(window.__docshareToast);

    window.__docshareToast = window.setTimeout(() => {
      setToast('');
    }, 2800);
  }

  function patch(updater) {
    setState((previous) => (
      typeof updater === 'function'
        ? updater(previous)
        : {
            ...previous,
            ...updater,
          }
    ));
  }

  async function loadAll(userId, options = {}) {
    if (!userId) {
      if (mountedRef.current) {
        setState(emptyState());
      }
      return;
    }

    if (!options.silent) {
      setDataLoading(true);
    }

    const [
      profiles,
      wallets,
      categories,
      schools,
      documents,
      documentFiles,
      documentStats,
      documentLikes,
      documentBookmarks,
      documentComments,
      documentCommentReactions,
      documentRatings,
      documentPurchases,
      follows,
      posts,
      postStats,
      postLikes,
      postBookmarks,
      postComments,
      postCommentReactions,
      gifts,
      giftTransactions,
      notifications,
      activityHistory,
      creditTransactions,
      paymentRequests,
      reports,
      supportTickets,
      adminLogs,
      mailThreads,
      mailMembers,
      mailMessages,
    ] = await Promise.all([
      safeQuery(supabase.from('profiles').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('wallets').select('*')),
      safeQuery(supabase.from('categories').select('*').order('name')),
      safeQuery(supabase.from('schools').select('*').order('name')),
      safeQuery(supabase.from('documents').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('document_files').select('*').order('created_at')),
      safeQuery(supabase.from('document_stats').select('*')),
      safeQuery(supabase.from('document_likes').select('*')),
      safeQuery(supabase.from('document_bookmarks').select('*')),
      safeQuery(supabase.from('document_comments').select('*').order('created_at')),
      safeQuery(supabase.from('document_comment_reactions').select('*')),
      safeQuery(supabase.from('document_ratings').select('*')),
      safeQuery(supabase.from('document_purchases').select('*')),
      safeQuery(supabase.from('follows').select('*')),
      safeQuery(supabase.from('posts').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('post_stats').select('*')),
      safeQuery(supabase.from('post_likes').select('*')),
      safeQuery(supabase.from('post_bookmarks').select('*')),
      safeQuery(supabase.from('post_comments').select('*').order('created_at')),
      safeQuery(supabase.from('post_comment_reactions').select('*')),
      safeQuery(supabase.from('gifts').select('*').eq('active', true).order('sort_order')),
      safeQuery(supabase.from('gift_transactions').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('notifications').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('activity_history').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('credit_transactions').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('payment_requests').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('reports').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('support_tickets').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('admin_logs').select('*').order('created_at', { ascending: false })),
      safeQuery(supabase.from('mail_threads').select('*').order('updated_at', { ascending: false })),
      safeQuery(supabase.from('mail_thread_members').select('*')),
      safeQuery(supabase.from('mail_messages').select('*').order('created_at')),
    ]);

    const categoryMap = new Map(categories.map((item) => [item.id, item]));
    const schoolMap = new Map(schools.map((item) => [item.id, item]));
    const walletMap = new Map(wallets.map((item) => [item.user_id, item]));
    const statsMap = new Map(documentStats.map((item) => [item.document_id, item]));
    const postStatsMap = new Map(postStats.map((item) => [item.post_id, item]));

    const purchasedByUser = new Map();

    documentPurchases.forEach((item) => {
      if (!purchasedByUser.has(item.buyer_id)) {
        purchasedByUser.set(item.buyer_id, []);
      }

      purchasedByUser.get(item.buyer_id).push(item.document_id);
    });

    const followingByUser = new Map();
    const followerCount = new Map();

    follows.forEach((item) => {
      if (!followingByUser.has(item.follower_id)) {
        followingByUser.set(item.follower_id, []);
      }

      followingByUser.get(item.follower_id).push(item.following_id);
      followerCount.set(
        item.following_id,
        Number(followerCount.get(item.following_id) || 0) + 1,
      );
    });

    const mappedUsers = profiles.map((profile) => mapProfile(
      profile,
      walletMap.get(profile.id),
      followerCount.get(profile.id),
      followingByUser.get(profile.id) || [],
      purchasedByUser.get(profile.id) || [],
    ));

    const mappedDocuments = documents.map((document) => mapDocument(
      document,
      statsMap.get(document.id),
      documentFiles.filter((file) => file.document_id === document.id),
      categoryMap,
      schoolMap,
    ));

    const mappedPostComments = mapPostComments(
      postComments,
      postCommentReactions,
    );

    const mappedPosts = posts.map((post) => ({
      id: post.id,
      authorId: post.author_id,
      documentId: post.document_id,
      title: post.title || '',
      content: post.content,
      visibility: post.visibility,
      status: post.status,
      createdAt: formatDate(post.created_at),
      createdAtRaw: post.created_at,
      likes: Number(postStatsMap.get(post.id)?.like_count || 0),
      comments: mappedPostComments.filter((item) => item.postId === post.id),
      gifts: giftTransactions
        .filter((item) => item.target_type === 'post' && item.target_id === post.id)
        .map((item) => ({
          id: item.id,
          userId: item.sender_id,
          recipientId: item.receiver_id,
          giftId: item.gift_id,
          credit: item.cost_credit,
          date: formatDate(item.created_at),
        })),
    }));

    const mappedGiftStore = gifts.map((gift) => ({
      id: gift.id,
      name: gift.name,
      icon: gift.icon || '🎁',
      image: gift.image_path
        ? getPublicUrl('document-covers', gift.image_path)
        : '',
      imagePath: gift.image_path || '',
      credit: Number(gift.credit_price || 0),
      creatorSharePercent: Number(gift.creator_share_percent || 30),
      active: Boolean(gift.active),
      sortOrder: Number(gift.sort_order || 0),
    }));

    const mappedMailboxThreads = mailThreads.map((thread) => {
      const members = mailMembers.filter((item) => item.thread_id === thread.id);
      const currentMember = members.find((item) => item.user_id === userId);

      return {
        id: thread.id,
        subject: thread.subject,
        category: thread.category,
        participants: members.map((item) => item.user_id),
        updatedAt: formatDate(thread.updated_at),
        unreadBy: members.filter((item) => !item.is_read).map((item) => item.user_id),
        starredBy: members.filter((item) => item.is_starred).map((item) => item.user_id),
        archivedBy: members.filter((item) => item.is_archived).map((item) => item.user_id),
        deletedBy: members.filter((item) => item.is_deleted).map((item) => item.user_id),
        isRead: currentMember?.is_read || false,
        messages: mailMessages
          .filter((message) => message.thread_id === thread.id)
          .map((message) => ({
            id: message.id,
            senderId: message.sender_id,
            text: message.content,
            time: formatDate(message.created_at),
            createdAt: message.created_at,
          })),
      };
    });

    const mappedPayments = paymentRequests.map(mapPaymentRequest);

    const nextState = {
      ...emptyState(),
      currentUserId: userId,
      users: mappedUsers,
      documents: mappedDocuments,
      posts: mappedPosts,
      categories,
      schools,
      giftStore: mappedGiftStore,
      giftHistory: giftTransactions.map((item) => ({
        id: item.id,
        userId: item.sender_id,
        recipientId: item.receiver_id,
        targetType: item.target_type,
        targetId: item.target_id,
        giftId: item.gift_id,
        credit: Number(item.cost_credit || 0),
        creatorShare: Number(item.receiver_credit || 0),
        date: formatDate(item.created_at),
      })),
      reports: reports.map((item) => ({
        id: item.id,
        reporterId: item.reporter_id,
        type: item.target_type,
        targetId: item.target_id,
        userId: item.reported_user_id,
        reason: item.reason,
        detail: item.detail,
        status: item.status,
        action: item.admin_action,
        createdAt: formatDate(item.created_at),
      })),
      notifications: notifications.map(mapNotification),
      transactions: [
        ...creditTransactions.map(mapTransaction),
        ...mappedPayments,
      ].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
      paymentRequests: mappedPayments,
      supportTickets: supportTickets.map((item) => ({
        id: item.id,
        userId: item.user_id,
        subject: item.subject,
        content: item.content,
        status: item.status,
        priority: item.priority,
        createdAt: formatDate(item.created_at),
        updatedAt: formatDate(item.updated_at),
      })),
      adminLogs: adminLogs.map((item) => ({
        id: item.id,
        adminId: item.admin_id,
        action: item.action,
        detail: item.detail,
        targetType: item.target_type,
        targetId: item.target_id,
        date: formatDate(item.created_at),
      })),
      mailboxThreads: mappedMailboxThreads,
      likes: {
        documents: documentLikes
          .filter((item) => item.user_id === userId)
          .map((item) => item.document_id),
        posts: postLikes
          .filter((item) => item.user_id === userId)
          .map((item) => item.post_id),
      },
      follows: follows
        .filter((item) => item.follower_id === userId)
        .map((item) => item.following_id),
      savedDocuments: documentBookmarks
        .filter((item) => item.user_id === userId)
        .map((item) => item.document_id),
      savedPosts: postBookmarks
        .filter((item) => item.user_id === userId)
        .map((item) => item.post_id),
      history: activityHistory.map((item) => ({
        id: item.id,
        type: item.action_type,
        targetType: item.target_type,
        targetId: item.target_id,
        title: item.title || item.action_type,
        metadata: item.metadata || {},
        date: formatDate(item.created_at),
        createdAt: item.created_at,
      })),
      documentComments: mapDocumentComments(
        documentComments,
        documentCommentReactions,
      ),
      documentRatings,
      documentPurchases,
    };

    if (mountedRef.current) {
      setState(nextState);
      setDataLoading(false);
    }
  }

  async function refreshData(options = {}) {
    if (!state.currentUserId) return;
    await loadAll(state.currentUserId, options);
  }

  useEffect(() => {
    mountedRef.current = true;

    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('docshare_'))
      .forEach((key) => window.localStorage.removeItem(key));

    document.documentElement.dataset.theme = 'light';

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        console.error(error);
      }

      const userId = data?.session?.user?.id || null;

      if (userId) {
        await loadAll(userId);
      } else if (mountedRef.current) {
        setState(emptyState());
      }

      if (mountedRef.current) {
        setAuthLoading(false);
      }
    });

    const {
      data: {
        subscription,
      },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(async () => {
        const userId = session?.user?.id || null;

        if (userId) {
          await loadAll(userId);
        } else if (mountedRef.current) {
          setState(emptyState());
        }

        if (mountedRef.current) {
          setAuthLoading(false);
        }
      }, 0);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === state.currentUserId) || null,
    [state.currentUserId, state.users],
  );

  function getUser(id) {
    return state.users.find((user) => user.id === id)
      || (id === currentUser?.id ? currentUser : null)
      || {
        ...EMPTY_USER,
        id: id || '',
      };
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email || '').trim(),
      password: String(password || ''),
    });

    if (error) {
      return {
        ok: false,
        message: error.message === 'Invalid login credentials'
          ? 'Email hoặc mật khẩu không đúng.'
          : error.message,
      };
    }

    const userId = data?.user?.id;

    if (userId) {
      await loadAll(userId);
    }

    return {
      ok: true,
      user: data?.user,
    };
  }

  async function register(payload) {
    const email = String(payload.email || '').trim();
    const password = String(payload.password || '');
    const fullName = String(payload.name || payload.fullName || '').trim();
    const username = String(payload.username || '').trim()
      || `${makeSlug(fullName) || 'user'}-${Date.now().toString().slice(-5)}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
          phone: String(payload.phone || '').trim(),
          school_name: String(payload.school || payload.schoolName || '').trim(),
          faculty: String(payload.faculty || '').trim(),
          major: String(payload.major || '').trim(),
        },
      },
    });

    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }

    if (data?.session?.user?.id) {
      await loadAll(data.session.user.id);
    }

    return {
      ok: true,
      needsEmailConfirmation: !data?.session,
    };
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      showToast(error.message);
      return false;
    }

    setState(emptyState());
    return true;
  }

  function toggleTheme() {
    patch({ theme: 'light' });
  }

  async function markNotification(id) {
    const item = state.notifications.find((notice) => notice.id === id);

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    patch((previous) => ({
      ...previous,
      notifications: previous.notifications.map((notice) => (
        notice.id === id
          ? {
              ...notice,
              unread: false,
            }
          : notice
      )),
    }));

    return item?.to || '/';
  }

  async function markAllNotifications() {
    if (!currentUser) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false);

    patch((previous) => ({
      ...previous,
      notifications: previous.notifications.map((notice) => ({
        ...notice,
        unread: false,
      })),
    }));
  }

  async function addHistory(item) {
    if (!currentUser) return false;

    const { error } = await supabase
      .from('activity_history')
      .insert({
        user_id: currentUser.id,
        action_type: item.type || item.actionType || 'activity',
        target_type: item.targetType || 'document',
        target_id: item.targetId || null,
        title: item.title || '',
        metadata: item.metadata || {},
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function toggleLikeDocument(documentId) {
    if (!currentUser) return false;

    const exists = state.likes.documents.includes(documentId);

    const operation = exists
      ? supabase
          .from('document_likes')
          .delete()
          .eq('document_id', documentId)
          .eq('user_id', currentUser.id)
      : supabase
          .from('document_likes')
          .insert({
            document_id: documentId,
            user_id: currentUser.id,
          });

    const { error } = await operation;

    if (error) {
      showToast(error.message);
      return false;
    }

    if (!exists) {
      await addHistory({
        type: 'like',
        targetType: 'document',
        targetId: documentId,
        title: 'Đã thích tài liệu',
      });
    } else {
      await refreshData({ silent: true });
    }

    showToast(exists ? 'Đã bỏ thích tài liệu.' : 'Đã thích tài liệu.');
    return true;
  }

  async function toggleLikePost(postId) {
    if (!currentUser) return false;

    const exists = state.likes.posts.includes(postId);

    const operation = exists
      ? supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id)
      : supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: currentUser.id,
          });

    const { error } = await operation;

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast(exists ? 'Đã bỏ thích bài viết.' : 'Đã thích bài viết.');
    return true;
  }

  async function toggleSaveDocument(documentId) {
    if (!currentUser) return false;

    const exists = state.savedDocuments.includes(documentId);

    const operation = exists
      ? supabase
          .from('document_bookmarks')
          .delete()
          .eq('document_id', documentId)
          .eq('user_id', currentUser.id)
      : supabase
          .from('document_bookmarks')
          .insert({
            document_id: documentId,
            user_id: currentUser.id,
          });

    const { error } = await operation;

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast(exists ? 'Đã bỏ lưu tài liệu.' : 'Đã lưu tài liệu.');
    return true;
  }

  async function toggleSavePost(postId) {
    if (!currentUser) return false;

    const exists = state.savedPosts.includes(postId);

    const operation = exists
      ? supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id)
      : supabase
          .from('post_bookmarks')
          .insert({
            post_id: postId,
            user_id: currentUser.id,
          });

    const { error } = await operation;

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast(exists ? 'Đã bỏ lưu bài viết.' : 'Đã lưu bài viết.');
    return true;
  }

  async function toggleFollow(userId) {
    if (!currentUser || !userId || userId === currentUser.id) return false;

    const exists = state.follows.includes(userId);

    const operation = exists
      ? supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
      : supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userId,
          });

    const { error } = await operation;

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast(exists ? 'Đã bỏ theo dõi.' : 'Đã theo dõi.');
    return true;
  }

  async function updateProfile(payload) {
    if (!currentUser) return false;

    const updates = {
      full_name: payload.name ?? payload.fullName ?? currentUser.name,
      username: payload.username ?? currentUser.username,
      phone: payload.phone ?? currentUser.phone ?? null,
      school_name: payload.school ?? payload.schoolName ?? currentUser.school ?? null,
      faculty: payload.faculty ?? currentUser.faculty ?? null,
      major: payload.major ?? currentUser.major ?? null,
      bio: payload.bio ?? currentUser.bio ?? '',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã cập nhật hồ sơ.');
    return true;
  }

  async function updateAvatarImage(file) {
    if (!currentUser || !(file instanceof File)) {
      showToast('Hãy chọn một ảnh hợp lệ.');
      return false;
    }

    const path = `${currentUser.id}/avatar-${Date.now()}-${cleanFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      showToast(uploadError.message);
      return false;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        avatar_path: path,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentUser.id);

    if (profileError) {
      showToast(profileError.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã cập nhật ảnh đại diện.');
    return true;
  }

  async function changePassword(oldPassword, newPassword, confirmPassword) {
    if (!currentUser) {
      return {
        ok: false,
        message: 'Bạn chưa đăng nhập.',
      };
    }

    if (String(newPassword || '').length < 6) {
      return {
        ok: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        ok: false,
        message: 'Mật khẩu xác nhận không khớp.',
      };
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: oldPassword,
    });

    if (verifyError) {
      return {
        ok: false,
        message: 'Mật khẩu cũ không đúng.',
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: true,
    };
  }

  function canAccessDocument(document, user = currentUser) {
    if (!document) return false;
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (document.authorId === user.id) return true;
    if (Number(document.price || 0) <= 0) return true;
    return (user.ownedDocuments || []).includes(document.id);
  }

  function getDocumentPreviewPageCount(document, user = currentUser) {
    if (!document) return 0;

    return canAccessDocument(document, user)
      ? Number(document.pages || document.demoPages || 1)
      : Number(document.demoPages || 1);
  }

  async function recordDocumentView(documentId) {
    if (!currentUser) return false;

    const { error } = await supabase.rpc('record_document_view', {
      p_document_id: documentId,
    });

    if (error) {
      console.warn(error.message);
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function purchaseDocument(documentId) {
    if (!currentUser) {
      showToast('Bạn cần đăng nhập để mua tài liệu.');
      return false;
    }

    const { data, error } = await supabase.rpc('purchase_document', {
      p_document_id: documentId,
    });

    if (error) {
      showToast(error.message);
      return false;
    }

    if (!data?.ok) {
      if (data?.code === 'INSUFFICIENT_CREDIT') {
        showToast(`Không đủ credit. Bạn có ${data.balance || 0} credit.`);
      } else {
        showToast('Không thể mua tài liệu.');
      }

      return false;
    }

    await refreshData({ silent: true });

    if (data.code === 'PURCHASED') {
      showToast('Mua tài liệu thành công.');
    } else {
      showToast('Bạn đã có quyền truy cập tài liệu.');
    }

    return true;
  }

  async function getDocumentDownloadUrl(documentId, kind = 'full') {
    const fileKind = kind === 'demo' ? 'demo' : 'full';

    const { data: files, error } = await supabase
      .from('document_files')
      .select('*')
      .eq('document_id', documentId)
      .eq('file_kind', fileKind)
      .order('created_at');

    if (error || !files?.length) {
      showToast('Chưa có file phù hợp để tải.');
      return null;
    }

    const file = files[0];

    if (file.storage_bucket === 'documents-private') {
      const { data, error: signedError } = await supabase.storage
        .from(file.storage_bucket)
        .createSignedUrl(file.storage_path, 120);

      if (signedError) {
        showToast(signedError.message);
        return null;
      }

      return data?.signedUrl || null;
    }

    return getPublicUrl(file.storage_bucket, file.storage_path);
  }

  async function uploadDocument(data) {
    if (!currentUser) {
      showToast('Bạn cần đăng nhập để đăng tài liệu.');
      return false;
    }

    const title = String(data.title || '').trim();

    if (!title) {
      showToast('Hãy nhập tên tài liệu.');
      return false;
    }

    const documentPayload = {
      author_id: currentUser.id,
      category_id: data.categoryId || null,
      school_id: data.schoolId || null,
      title,
      description: String(data.description || '').trim(),
      subject: String(data.subject || '').trim() || null,
      faculty: String(data.faculty || '').trim() || null,
      major: String(data.major || '').trim() || null,
      isbn: String(data.isbn || '').trim() || null,
      academic_year: data.academicYear
        ? Number(data.academicYear)
        : null,
      tags: Array.isArray(data.tags)
        ? data.tags
        : String(data.tags || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
      language: data.language || 'vi',
      price_credit: Math.max(0, Number(data.price || data.priceCredit || 0)),
      visibility: data.visibility || 'public',
      status: 'draft',
    };

    const { data: inserted, error: insertError } = await supabase
      .from('documents')
      .insert(documentPayload)
      .select('*')
      .single();

    if (insertError) {
      showToast(insertError.message);
      return false;
    }

    const documentId = inserted.id;
    const fileRows = [];

    async function uploadFile(bucket, file, fileKind) {
      if (!(file instanceof File)) return true;

      const storagePath = `${currentUser.id}/${documentId}/${Date.now()}-${cleanFileName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      fileRows.push({
        document_id: documentId,
        owner_id: currentUser.id,
        file_kind: fileKind,
        storage_bucket: bucket,
        storage_path: storagePath,
        original_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size || null,
        page_count: null,
      });

      return true;
    }

    try {
      await uploadFile('document-covers', data.coverFile, 'cover');
      await uploadFile('document-demos', data.demoFile, 'demo');

      const fullFiles = Array.isArray(data.fullFiles)
        ? data.fullFiles
        : data.fullFile instanceof File
          ? [data.fullFile]
          : [];

      for (const file of fullFiles) {
        await uploadFile('documents-private', file, 'full');
      }

      if (fileRows.length) {
        const { error: fileError } = await supabase
          .from('document_files')
          .insert(fileRows);

        if (fileError) {
          throw fileError;
        }
      }

      const { error: publishError } = await supabase
        .from('documents')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (publishError) {
        throw publishError;
      }
    } catch (error) {
      await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      showToast(error.message || 'Tải file thất bại.');
      return false;
    }

    await addHistory({
      type: 'upload',
      targetType: 'document',
      targetId: documentId,
      title: `Đã đăng tài liệu ${title}`,
    });

    await refreshData({ silent: true });
    showToast('Đăng tài liệu thành công.');
    return documentId;
  }

  async function addDocumentComment(documentId, text, rating = 5) {
    if (!currentUser || !String(text || '').trim()) return false;

    const { error: commentError } = await supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        user_id: currentUser.id,
        content: String(text).trim(),
      });

    if (commentError) {
      showToast(commentError.message);
      return false;
    }

    const ratingNumber = Math.max(1, Math.min(5, Number(rating || 5)));

    const { error: ratingError } = await supabase
      .from('document_ratings')
      .upsert({
        document_id: documentId,
        user_id: currentUser.id,
        rating: ratingNumber,
        review: String(text).trim(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'document_id,user_id',
      });

    if (ratingError) {
      console.warn(ratingError.message);
    }

    await addHistory({
      type: 'comment',
      targetType: 'document',
      targetId: documentId,
      title: 'Đã bình luận và đánh giá tài liệu',
      metadata: {
        rating: ratingNumber,
      },
    });

    await refreshData({ silent: true });
    showToast('Đã gửi bình luận và đánh giá.');
    return true;
  }

  async function replyDocumentComment(documentId, commentId, text) {
    if (!currentUser || !String(text || '').trim()) return false;

    const { error } = await supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        user_id: currentUser.id,
        parent_id: commentId,
        content: String(text).trim(),
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã trả lời bình luận.');
    return true;
  }

  async function reactDocumentComment(_documentId, commentId) {
    if (!currentUser) return false;

    const { data: existing } = await supabase
      .from('document_comment_reactions')
      .select('comment_id')
      .eq('comment_id', commentId)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    const operation = existing
      ? supabase
          .from('document_comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id)
      : supabase
          .from('document_comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: currentUser.id,
            reaction: 'heart',
          });

    const { error } = await operation;

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function editDocumentComment(_documentId, commentId, text, rating) {
    if (!currentUser || !String(text || '').trim()) return false;

    const { error } = await supabase
      .from('document_comments')
      .update({
        content: String(text).trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (error) {
      showToast(error.message);
      return false;
    }

    if (rating) {
      const comment = Object.values(state.documentComments)
        .flat()
        .find((item) => item.id === commentId);

      if (comment?.documentId) {
        await supabase
          .from('document_ratings')
          .upsert({
            document_id: comment.documentId,
            user_id: currentUser.id,
            rating: Math.max(1, Math.min(5, Number(rating))),
            review: String(text).trim(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'document_id,user_id',
          });
      }
    }

    await refreshData({ silent: true });
    showToast('Đã cập nhật bình luận.');
    return true;
  }

  async function deleteDocumentComment(_documentId, commentId) {
    const { error } = await supabase
      .from('document_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã xóa bình luận.');
    return true;
  }

  async function addPost(content, documentId, title = '') {
    if (!currentUser || !String(content || '').trim()) return false;

    const { error } = await supabase
      .from('posts')
      .insert({
        author_id: currentUser.id,
        document_id: documentId || null,
        title: String(title || '').trim() || null,
        content: String(content).trim(),
        visibility: 'public',
        status: 'visible',
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đăng bài thành công.');
    return true;
  }

  async function addComment(postId, text) {
    if (!currentUser || !String(text || '').trim()) return false;

    const { error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        content: String(text).trim(),
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function replyComment(postId, commentId, text) {
    if (!currentUser || !String(text || '').trim()) return false;

    const { error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        parent_id: commentId,
        content: String(text).trim(),
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function reactComment(_postId, commentId) {
    if (!currentUser) return false;

    const { data: existing } = await supabase
      .from('post_comment_reactions')
      .select('comment_id')
      .eq('comment_id', commentId)
      .eq('user_id', currentUser.id)
      .maybeSingle();

    const operation = existing
      ? supabase
          .from('post_comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUser.id)
      : supabase
          .from('post_comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: currentUser.id,
            reaction: 'heart',
          });

    const { error } = await operation;

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function editPostComment(_postId, commentId, text) {
    if (!String(text || '').trim()) return false;

    const { error } = await supabase
      .from('post_comments')
      .update({
        content: String(text).trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function deletePostComment(_postId, commentId) {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function addReport({ type, targetId, userId, reason, customReason }) {
    if (!currentUser) return false;

    const targetTypeMap = {
      document: 'document',
      post: 'post',
      comment: 'post_comment',
      document_comment: 'document_comment',
      user: 'user',
    };

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: currentUser.id,
        target_type: targetTypeMap[type] || type || 'post',
        target_id: targetId,
        reported_user_id: userId || null,
        reason: String(reason || customReason || 'Nội dung không phù hợp'),
        detail: String(customReason || '').trim() || null,
        status: 'pending',
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã gửi báo cáo.');
    return true;
  }

  async function reportPostComment(postId, commentId, userId, reason, customReason = '') {
    return addReport({
      type: 'post_comment',
      targetId: commentId,
      userId,
      reason,
      customReason: `${customReason || ''}${postId ? ` | Bài: ${postId}` : ''}`.trim(),
    });
  }

  async function reportDocumentComment(documentId, commentId, userId, reason, customReason = '') {
    return addReport({
      type: 'document_comment',
      targetId: commentId,
      userId,
      reason,
      customReason: `${customReason || ''}${documentId ? ` | Tài liệu: ${documentId}` : ''}`.trim(),
    });
  }

  async function donate(targetType, targetId, receiverId, gift) {
    if (!currentUser || !gift || !receiverId) return false;

    const { data, error } = await supabase.rpc('send_gift', {
      p_gift_id: gift.id,
      p_receiver_id: receiverId,
      p_target_type: targetType,
      p_target_id: targetId || null,
    });

    if (error) {
      showToast(error.message);
      return false;
    }

    if (!data?.ok) {
      if (data?.code === 'INSUFFICIENT_CREDIT') {
        showToast(`Không đủ credit. Bạn có ${data.balance || 0} credit.`);
      } else if (data?.code === 'CANNOT_GIFT_SELF') {
        showToast('Bạn không thể tự tặng quà cho mình.');
      } else {
        showToast('Không thể gửi quà.');
      }

      return false;
    }

    patch({
      lastGiftEffect: {
        ...gift,
        time: Date.now(),
      },
    });

    window.setTimeout(() => {
      patch({ lastGiftEffect: null });
    }, 3500);

    await refreshData({ silent: true });
    showToast('Đã gửi quà.');
    return true;
  }

  async function donatePost(postId, gift) {
    const post = state.posts.find((item) => item.id === postId);

    return donate('post', postId, post?.authorId, gift);
  }

  async function donateDocument(documentId, gift) {
    const document = state.documents.find((item) => item.id === documentId);

    return donate('document', documentId, document?.authorId, gift);
  }

  async function requestTopup(amount, credit) {
    if (!currentUser) return false;

    const { error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: currentUser.id,
        type: 'topup',
        amount_vnd: Math.max(0, Number(amount || 0)),
        credit_amount: Math.max(0, Number(credit || 0)),
        status: 'pending',
        transfer_note: `NAP ${currentUser.id.slice(0, 8)}`,
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã gửi yêu cầu nạp credit.');
    return true;
  }

  async function requestPremium(plan) {
    if (!currentUser) return false;

    const { error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: currentUser.id,
        type: 'premium',
        amount_vnd: Math.max(0, Number(plan?.price || 0)),
        credit_amount: Math.max(0, Number(plan?.bonus || 0)),
        plan_code: plan?.code || plan?.name || 'premium',
        status: 'pending',
        transfer_note: `PREMIUM ${currentUser.id.slice(0, 8)}`,
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã gửi yêu cầu Premium.');
    return true;
  }

  async function addBankAccount(payload) {
    if (!currentUser) return false;

    const { error } = await supabase
      .from('bank_accounts')
      .insert({
        user_id: currentUser.id,
        bank_code: payload.bankCode || payload.bank || '',
        bank_name: payload.bankName || payload.bank || '',
        account_number: payload.number || payload.accountNumber || '',
        account_name: payload.name || payload.accountName || '',
        is_default: Boolean(payload.default),
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    showToast('Đã lưu tài khoản ngân hàng.');
    return true;
  }

  async function requestWithdraw(payload) {
    if (!currentUser) return false;

    const { error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: currentUser.id,
        type: 'withdraw',
        amount_vnd: Math.max(0, Number(payload.amount || 0)),
        credit_amount: 0,
        status: 'pending',
        transfer_note: `${payload.bank || ''} - ${payload.number || ''}`.trim(),
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã gửi yêu cầu rút tiền.');
    return true;
  }

  async function createSupportTicket(subject, content, priority = 'normal') {
    if (!currentUser) return false;

    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: currentUser.id,
        subject: String(subject || '').trim(),
        content: String(content || '').trim(),
        priority,
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã gửi yêu cầu hỗ trợ.');
    return true;
  }

  async function markMailboxThreadRead(threadId, userId = currentUser?.id) {
    if (!threadId || !userId) return false;

    await supabase
      .from('mail_thread_members')
      .update({ is_read: true })
      .eq('thread_id', threadId)
      .eq('user_id', userId);

    await refreshData({ silent: true });
    return true;
  }

  async function toggleMailboxStar(threadId, userId = currentUser?.id) {
    const thread = state.mailboxThreads.find((item) => item.id === threadId);
    const starred = (thread?.starredBy || []).includes(userId);

    const { error } = await supabase
      .from('mail_thread_members')
      .update({ is_starred: !starred })
      .eq('thread_id', threadId)
      .eq('user_id', userId);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function archiveMailboxThread(threadId, userId = currentUser?.id) {
    const { error } = await supabase
      .from('mail_thread_members')
      .update({ is_archived: true })
      .eq('thread_id', threadId)
      .eq('user_id', userId);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã lưu trữ thư.');
    return true;
  }

  async function restoreMailboxThread(threadId, userId = currentUser?.id) {
    const { error } = await supabase
      .from('mail_thread_members')
      .update({
        is_archived: false,
        is_deleted: false,
      })
      .eq('thread_id', threadId)
      .eq('user_id', userId);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã khôi phục thư.');
    return true;
  }

  async function deleteMailboxThread(threadId, userId = currentUser?.id) {
    const { error } = await supabase
      .from('mail_thread_members')
      .update({ is_deleted: true })
      .eq('thread_id', threadId)
      .eq('user_id', userId);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã chuyển thư vào thùng rác.');
    return true;
  }

  async function sendMailboxMessage(threadId, text) {
    if (!currentUser || !String(text || '').trim()) return false;

    const { error } = await supabase
      .from('mail_messages')
      .insert({
        thread_id: threadId,
        sender_id: currentUser.id,
        content: String(text).trim(),
      });

    if (error) {
      showToast(error.message);
      return false;
    }

    await supabase
      .from('mail_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    await refreshData({ silent: true });
    showToast('Đã gửi thư.');
    return true;
  }

  async function createMailboxThread(recipientId, subject, text = '', category = 'user') {
    if (!currentUser || !recipientId) return null;

    const { data: thread, error: threadError } = await supabase
      .from('mail_threads')
      .insert({
        subject: String(subject || '').trim() || 'Trao đổi mới',
        category,
        created_by: currentUser.id,
      })
      .select('*')
      .single();

    if (threadError) {
      showToast(threadError.message);
      return null;
    }

    const { error: memberError } = await supabase
      .from('mail_thread_members')
      .insert([
        {
          thread_id: thread.id,
          user_id: currentUser.id,
          is_read: true,
        },
        {
          thread_id: thread.id,
          user_id: recipientId,
          is_read: false,
        },
      ]);

    if (memberError) {
      showToast(memberError.message);
      return null;
    }

    if (String(text || '').trim()) {
      await supabase
        .from('mail_messages')
        .insert({
          thread_id: thread.id,
          sender_id: currentUser.id,
          content: String(text).trim(),
        });
    }

    await refreshData({ silent: true });
    showToast('Đã tạo cuộc trò chuyện.');
    return thread.id;
  }

  async function adminApproveTransaction(id) {
    const { error } = await supabase
      .from('payment_requests')
      .update({
        status: 'approved',
        processed_by: currentUser?.id || null,
        processed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã duyệt trạng thái yêu cầu.');
    return true;
  }

  async function adminRejectTransaction(id, reason) {
    const { error } = await supabase
      .from('payment_requests')
      .update({
        status: 'rejected',
        admin_note: reason || 'Không hợp lệ',
        processed_by: currentUser?.id || null,
        processed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã từ chối yêu cầu.');
    return true;
  }

  async function adminLockUser(id, days, reason) {
    const lockedUntil = days === 'forever'
      ? '9999-12-31T23:59:59.000Z'
      : new Date(Date.now() + Number(days || 1) * 86400000).toISOString();

    const { error } = await supabase
      .from('profiles')
      .update({
        status: days === 'forever' ? 'banned' : 'locked',
        locked_until: lockedUntil,
        lock_reason: reason || 'Vi phạm quy định',
      })
      .eq('id', id);

    if (error) {
      showToast('Hãy khóa tài khoản trong Supabase Dashboard hoặc bổ sung quyền Admin RPC.');
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function adminUnlockUser(id) {
    const { error } = await supabase
      .from('profiles')
      .update({
        status: 'active',
        locked_until: null,
        lock_reason: null,
      })
      .eq('id', id);

    if (error) {
      showToast('Hãy mở khóa trong Supabase Dashboard hoặc bổ sung quyền Admin RPC.');
      return false;
    }

    await refreshData({ silent: true });
    return true;
  }

  async function adminDeleteDocument(id) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã xóa tài liệu.');
    return true;
  }

  async function adminDeletePost(id) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã xóa bài viết.');
    return true;
  }

  async function adminResolveReport(reportId, action, note = '') {
    const { error } = await supabase
      .from('reports')
      .update({
        status: 'resolved',
        admin_action: action,
        handled_by: currentUser?.id || null,
        handled_at: new Date().toISOString(),
        detail: note || null,
      })
      .eq('id', reportId);

    if (error) {
      showToast(error.message);
      return false;
    }

    await refreshData({ silent: true });
    showToast('Đã xử lý báo cáo.');
    return true;
  }

  function unavailable(message = 'Chức năng này chưa có bảng Supabase tương ứng.') {
    showToast(message);
    return false;
  }

  function resetDemo() {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('docshare_'))
      .forEach((key) => window.localStorage.removeItem(key));

    showToast('Dữ liệu demo cũ trên trình duyệt đã được xóa.');
    refreshData({ silent: true });
  }

  const value = {
    state,
    currentUser,
    toast,
    authLoading,
    dataLoading,
    showToast,
    patch,
    refreshData,
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
    canAccessDocument,
    getDocumentPreviewPageCount,
    recordDocumentView,
    purchaseDocument,
    getDocumentDownloadUrl,
    addHistory,
    toggleFollow,
    updateProfile,
    changePassword,
    updateAvatarImage,
    uploadDocument,
    addDocumentComment,
    reactDocumentComment,
    replyDocumentComment,
    editDocumentComment,
    deleteDocumentComment,
    reportDocumentComment,
    addPost,
    addComment,
    replyComment,
    reactComment,
    editPostComment,
    deletePostComment,
    reportPostComment,
    donatePost,
    donateDocument,
    addBankAccount,
    requestTopup,
    requestPremium,
    requestWithdraw,
    createSupportTicket,
    addReport,
    markMailboxThreadRead,
    toggleMailboxStar,
    archiveMailboxThread,
    restoreMailboxThread,
    deleteMailboxThread,
    sendMailboxMessage,
    createMailboxThread,
    adminApproveTransaction,
    adminRejectTransaction,
    adminLockUser,
    adminUnlockUser,
    adminDeleteDocument,
    adminDeletePost,
    adminResolveReport,
    adminChangeRole: () => unavailable('Đổi quyền tài khoản trực tiếp trong Supabase → Table Editor → profiles.'),
    adminToggleVerified: () => unavailable('Cấp tích xanh trực tiếp trong Supabase → Table Editor → profiles.'),
    adminAddBannedWord: () => unavailable(),
    adminRemoveBannedWord: () => unavailable(),
    adminRevokeCredit: () => unavailable('Điều chỉnh credit cần RPC Admin phía Supabase.'),
    adminAddCredit: () => unavailable('Điều chỉnh credit cần RPC Admin phía Supabase.'),
    adminGrantFrame: () => unavailable(),
    adminUnlockAllFrames: () => unavailable(),
    adminSendNotification: () => unavailable('Gửi thông báo Admin cần RPC hoặc Edge Function.'),
    unlockFrame: () => unavailable(),
    setAvatarFrame: () => unavailable(),
    setActiveTitle: () => unavailable(),
    setPanelSkin: () => unavailable(),
    buyPet: () => unavailable(),
    toggleActivePet: () => unavailable(),
    togglePetsVisibility: () => unavailable(),
    feedPet: () => unavailable(),
    petPet: () => unavailable(),
    buyPetAccessory: () => unavailable(),
    equipPetAccessory: () => unavailable(),
    setPetPlacement: () => unavailable(),
    resetDemo,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp phải được dùng bên trong AppProvider.');
  }

  return context;
}
