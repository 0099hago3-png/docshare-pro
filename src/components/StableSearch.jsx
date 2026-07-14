import {
  BookOpen,
  Search,
  Tags,
  UserRound,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { supabase } from '../lib/supabase.js';

let searchIndexCache = null;
let searchIndexPromise = null;

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function profileName(profile) {
  return profile?.full_name || profile?.username || profile?.email || 'Người dùng';
}

async function loadSearchIndex() {
  if (searchIndexCache) return searchIndexCache;
  if (searchIndexPromise) return searchIndexPromise;

  searchIndexPromise = Promise.all([
    supabase
      .from('documents')
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        categories(id,name),
        profiles:author_id(id,full_name,username,email,avatar_path)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(120),

    supabase
      .from('profiles')
      .select('id,full_name,username,email,avatar_path,role')
      .limit(120),
  ]).then(([documentResult, profileResult]) => {
    const index = {
      documents: documentResult.error ? [] : (documentResult.data || []),
      profiles: profileResult.error ? [] : (profileResult.data || []),
    };

    searchIndexCache = index;
    searchIndexPromise = null;

    return index;
  }).catch((error) => {
    searchIndexPromise = null;
    console.warn('Không tải được dữ liệu gợi ý tìm kiếm:', error?.message || error);

    return {
      documents: [],
      profiles: [],
    };
  });

  return searchIndexPromise;
}

function buildSuggestions(index, keyword, limit) {
  const query = normalize(keyword);

  if (!query) return [];

  const documentItems = index.documents
    .map((document) => {
      const author = document.profiles;
      const category = document.categories;
      const title = document.title || 'Tài liệu';
      const haystack = normalize([
        title,
        document.description,
        category?.name,
        author?.full_name,
        author?.username,
        author?.email,
      ].filter(Boolean).join(' '));

      if (!haystack.includes(query)) return null;

      let score = 1;
      if (normalize(title).startsWith(query)) score += 8;
      if (normalize(title).includes(query)) score += 5;
      if (normalize(category?.name).includes(query)) score += 3;
      if (normalize(profileName(author)).includes(query)) score += 2;

      return {
        id: `document-${document.id}`,
        type: 'document',
        label: title,
        meta: `${category?.name || 'Tài liệu'} · ${profileName(author)}`,
        to: `/documents/${document.id}`,
        value: title,
        score,
      };
    })
    .filter(Boolean);

  const profileItems = index.profiles
    .map((profile) => {
      const name = profileName(profile);
      const haystack = normalize([
        name,
        profile.username,
        profile.email,
        profile.role,
      ].filter(Boolean).join(' '));

      if (!haystack.includes(query)) return null;

      let score = 1;
      if (normalize(name).startsWith(query)) score += 7;
      if (normalize(profile.username).startsWith(query)) score += 5;
      if (normalize(profile.email).startsWith(query)) score += 4;

      return {
        id: `profile-${profile.id}`,
        type: 'profile',
        label: name,
        meta: `@${profile.username || 'thành viên'}${profile.role === 'teacher' ? ' · Giảng viên' : ''}`,
        to: `/profile/${profile.id}`,
        value: name,
        score,
      };
    })
    .filter(Boolean);

  return [...documentItems, ...profileItems]
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, 'vi'))
    .slice(0, limit);
}

function SuggestionIcon({ type }) {
  if (type === 'profile') return <UserRound size={16} />;
  if (type === 'category') return <Tags size={16} />;
  return <BookOpen size={16} />;
}

export default function StableSearch({
  buttonLabel = 'Tìm kiếm',
  className = '',
  compact = false,
  onSubmit,
  placeholder = 'Tìm tài liệu, môn học, tác giả...',
}) {
  const [keyword, setKeyword] = useState('');
  const [index, setIndex] = useState({
    documents: [],
    profiles: [],
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    loadSearchIndex().then((data) => {
      if (!mounted) return;
      setIndex(data);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function closeOnOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', closeOnOutside);

    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
    };
  }, []);

  const suggestions = useMemo(
    () => buildSuggestions(index, keyword, compact ? 7 : 9),
    [compact, index, keyword],
  );

  const canShow = open && keyword.trim().length > 0;

  function choose(item) {
    setKeyword(item.value);
    setOpen(false);
    setActiveIndex(-1);
    onSubmit(item.value, item);
  }

  function submit(event) {
    event.preventDefault();

    const value = keyword.trim();

    setOpen(false);
    setActiveIndex(-1);
    onSubmit(value, null);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (
        suggestions.length
          ? (current + 1) % suggestions.length
          : -1
      ));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (
        suggestions.length
          ? (current <= 0 ? suggestions.length - 1 : current - 1)
          : -1
      ));
      return;
    }

    if (
      event.key === 'Enter'
      && canShow
      && activeIndex >= 0
      && suggestions[activeIndex]
    ) {
      event.preventDefault();
      choose(suggestions[activeIndex]);
    }
  }

  return (
    <div
      className={`stable-search-v78${compact ? ' is-compact' : ''} ${className}`.trim()}
      ref={rootRef}
    >
      <form className="stable-search-v78__form" onSubmit={submit}>
        <Search className="stable-search-v78__leading" size={compact ? 16 : 20} />

        <input
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (keyword.trim()) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          aria-expanded={canShow}
          aria-autocomplete="list"
        />

        <button type="submit">
          {buttonLabel}
        </button>
      </form>

      {canShow ? (
        <div className="stable-search-v78__panel" role="listbox">
          <div className="stable-search-v78__head">
            <strong>Gợi ý tìm kiếm</strong>
            <small>Tài liệu và người dùng phù hợp</small>
          </div>

          {loading && !suggestions.length ? (
            <div className="stable-search-v78__status">
              Đang tải gợi ý...
            </div>
          ) : suggestions.length ? (
            <div className="stable-search-v78__list">
              {suggestions.map((item, indexValue) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === indexValue}
                  className={activeIndex === indexValue ? 'is-active' : ''}
                  onMouseEnter={() => setActiveIndex(indexValue)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(item);
                  }}
                >
                  <span className={`stable-search-v78__icon is-${item.type}`}>
                    <SuggestionIcon type={item.type} />
                  </span>

                  <span className="stable-search-v78__copy">
                    <strong>{item.label}</strong>
                    <small>{item.meta}</small>
                  </span>

                  <span className="stable-search-v78__type">
                    {item.type === 'profile' ? 'Hồ sơ' : 'Mở'}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="stable-search-v78__status">
              Không có gợi ý. Nhấn Enter hoặc nút {buttonLabel} để tìm “{keyword.trim()}”.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
