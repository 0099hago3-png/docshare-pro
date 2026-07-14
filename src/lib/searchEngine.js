/**
 * DOCSHARE PRO V70.2 - SMART SEARCH ENGINE
 * Tìm kiếm không phân biệt dấu, chấm điểm theo độ liên quan,
 * hỗ trợ tài liệu, tác giả, username, môn học, danh mục và trường học.
 */

export function normalizeSearchText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase('vi-VN')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function asObject(value) {
  if (Array.isArray(value)) return value[0] || {};
  return value || {};
}

export function getDocumentProfile(document) {
  return asObject(document?.profiles || document?.author || document?.profile);
}

export function getDocumentCategory(document) {
  return asObject(document?.categories || document?.category);
}

export function getDocumentAuthorName(document) {
  const profile = getDocumentProfile(document);
  return profile.full_name || profile.username || profile.email || 'Tác giả DocShare';
}

function getDocumentFields(document) {
  const profile = getDocumentProfile(document);
  const category = getDocumentCategory(document);
  const tags = Array.isArray(document?.tags)
    ? document.tags.join(' ')
    : String(document?.tags || '');

  return {
    title: document?.title || '',
    author: profile.full_name || '',
    username: profile.username || '',
    email: profile.email || '',
    subject: document?.subject || '',
    category: category.name || '',
    school: profile.school_name || document?.school_name || '',
    faculty: profile.faculty || '',
    major: profile.major || '',
    tags,
    description: document?.description || '',
  };
}

function words(value) {
  return normalizeSearchText(value).split(' ').filter(Boolean);
}

function editDistance(left, right) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;

    for (let column = 1; column <= right.length; column += 1) {
      const old = previous[column];
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      previous[column] = Math.min(
        previous[column] + 1,
        previous[column - 1] + 1,
        diagonal + cost,
      );
      diagonal = old;
    }
  }

  return previous[right.length];
}

function fuzzyTokenMatch(queryToken, fieldTokens) {
  if (queryToken.length < 4) return false;

  return fieldTokens.some((fieldToken) => {
    if (Math.abs(fieldToken.length - queryToken.length) > 1) return false;
    const limit = queryToken.length >= 8 ? 2 : 1;
    return editDistance(queryToken, fieldToken) <= limit;
  });
}

function scoreField(rawValue, normalizedQuery, weight) {
  const value = normalizeSearchText(rawValue);
  if (!value || !normalizedQuery) return 0;

  let score = 0;

  if (value === normalizedQuery) score += weight * 2.2;
  else if (value.startsWith(normalizedQuery)) score += weight * 1.65;
  else if (value.includes(normalizedQuery)) score += weight * 1.2;

  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  const fieldTokens = value.split(' ').filter(Boolean);

  for (const token of queryTokens) {
    if (fieldTokens.includes(token)) score += weight * 0.42;
    else if (fieldTokens.some((fieldToken) => fieldToken.startsWith(token))) score += weight * 0.25;
    else if (value.includes(token)) score += weight * 0.16;
    else if (fuzzyTokenMatch(token, fieldTokens)) score += weight * 0.08;
  }

  return score;
}

export function scoreDocument(document, keyword) {
  const query = normalizeSearchText(keyword);
  if (!query) return 1;

  const fields = getDocumentFields(document);
  const weights = {
    title: 180,
    author: 190,
    username: 180,
    email: 70,
    subject: 125,
    category: 110,
    school: 95,
    faculty: 90,
    major: 90,
    tags: 90,
    description: 42,
  };

  let score = Object.entries(fields).reduce(
    (total, [key, value]) => total + scoreField(value, query, weights[key] || 30),
    0,
  );

  const combined = normalizeSearchText(Object.values(fields).join(' '));
  const queryTokens = query.split(' ').filter(Boolean);

  if (queryTokens.length > 1 && queryTokens.every((token) => combined.includes(token))) {
    score += 95;
  }

  if (normalizeSearchText(fields.author) === query || normalizeSearchText(fields.username) === query) {
    score += 260;
  }

  if (normalizeSearchText(fields.title) === query) score += 280;

  return Math.round(score);
}

export function rankDocuments(documents = [], keyword = '') {
  const query = normalizeSearchText(keyword);
  const list = Array.isArray(documents) ? documents : [];

  if (!query) return [...list];

  return list
    .map((document) => ({
      document,
      score: scoreDocument(document, query),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return new Date(right.document?.created_at || 0) - new Date(left.document?.created_at || 0);
    })
    .map((item) => item.document);
}

function suggestionScore(value, query, base = 100) {
  const normalizedValue = normalizeSearchText(value);
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) return base;
  if (!normalizedValue) return 0;
  if (normalizedValue === normalizedQuery) return base + 700;
  if (normalizedValue.startsWith(normalizedQuery)) return base + 470;
  if (normalizedValue.includes(normalizedQuery)) return base + 320;

  const queryTokens = words(normalizedQuery);
  const valueTokens = words(normalizedValue);
  let score = 0;

  for (const token of queryTokens) {
    if (valueTokens.includes(token)) score += 130;
    else if (valueTokens.some((valueToken) => valueToken.startsWith(token))) score += 90;
    else if (fuzzyTokenMatch(token, valueTokens)) score += 35;
  }

  return score ? base + score : 0;
}

function pushUnique(target, seen, item) {
  const key = item.id || `${item.type}:${normalizeSearchText(item.value)}`;
  if (!item.value || seen.has(key)) return;
  seen.add(key);
  target.push(item);
}

function profileSearchValue(profile) {
  return [
    profile?.full_name,
    profile?.username,
    profile?.email,
    profile?.school_name,
    profile?.faculty,
    profile?.major,
  ].filter(Boolean).join(' ');
}

export function buildSearchSuggestions(
  documents = [],
  keyword = '',
  limit = 8,
  profiles = [],
) {
  const list = Array.isArray(documents) ? documents : [];
  const profileList = Array.isArray(profiles) ? profiles : [];
  const query = normalizeSearchText(keyword);
  const candidates = [];
  const seen = new Set();

  profileList.forEach((profile, index) => {
    const displayName = profile.full_name || profile.username || profile.email || '';
    const score = suggestionScore(profileSearchValue(profile), query, 360) + Math.max(0, 100 - index);

    if (displayName && (!query || score > 360)) {
      pushUnique(candidates, seen, {
        id: `author-profile-${profile.id}`,
        type: 'author',
        value: displayName,
        label: displayName,
        meta: [
          'Tác giả',
          profile.username ? `@${profile.username}` : null,
          profile.school_name || profile.major || null,
        ].filter(Boolean).join(' · '),
        to: `/profile/${profile.id}`,
        score: score + 220,
      });
    }
  });

  list.forEach((document, index) => {
    const profile = getDocumentProfile(document);
    const category = getDocumentCategory(document);
    const authorName = getDocumentAuthorName(document);
    const recentBonus = Math.max(0, 80 - index);

    const documentScore = query
      ? scoreDocument(document, query) + 160
      : 300 + recentBonus;

    if (!query || documentScore > 160) {
      pushUnique(candidates, seen, {
        id: `document-${document.id}`,
        type: 'document',
        value: document.title,
        label: document.title,
        meta: `Tài liệu · ${authorName}`,
        to: `/documents/${document.id}`,
        score: documentScore,
      });
    }

    const authorValue = profile.full_name || profile.username || '';
    const authorScore = suggestionScore(profileSearchValue(profile), query, 260) + recentBonus;
    if (profile.id && authorValue && (!query || authorScore > 260)) {
      pushUnique(candidates, seen, {
        id: `author-profile-${profile.id}`,
        type: 'author',
        value: authorValue,
        label: authorValue,
        meta: profile.username ? `Tác giả · @${profile.username}` : 'Tác giả DocShare',
        to: `/profile/${profile.id}`,
        score: authorScore + 140,
      });
    }

    const values = [
      ['subject', document.subject, 'Môn học', 170],
      ['category', category.name, 'Danh mục', 150],
      ['school', profile.school_name, 'Trường học', 135],
    ];

    values.forEach(([type, value, meta, base]) => {
      const score = suggestionScore(value, query, base) + recentBonus;
      if (value && (!query || score > base)) {
        pushUnique(candidates, seen, {
          id: `${type}-${normalizeSearchText(value)}`,
          type,
          value,
          label: value,
          meta,
          score,
        });
      }
    });
  });

  return candidates
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, limit));
}
