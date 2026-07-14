import {
  BookOpen,
  GraduationCap,
  Search,
  School,
  Tags,
  UserRound,
} from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  buildSearchSuggestions,
  normalizeSearchText,
} from '../lib/searchEngine.js';
import { supabase } from '../lib/supabase.js';

let cachedSearchIndex = null;
let searchIndexPromise = null;

async function fetchSearchIndex() {
  if (cachedSearchIndex) return cachedSearchIndex;
  if (searchIndexPromise) return searchIndexPromise;

  searchIndexPromise = Promise.all([
    supabase
      .from('documents')
      .select('id,title,description,subject,tags,created_at,profiles:author_id(id,full_name,username,email,school_name,faculty,major),categories(id,name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(250),
    supabase
      .from('profiles')
      .select('id,full_name,username,email,school_name,faculty,major,role,status')
      .neq('status', 'locked')
      .order('full_name', { ascending: true })
      .limit(250),
  ])
    .then(([documentResult, profileResult]) => {
      if (documentResult.error) throw documentResult.error;
      if (profileResult.error) throw profileResult.error;

      cachedSearchIndex = {
        documents: documentResult.data || [],
        profiles: profileResult.data || [],
      };

      return cachedSearchIndex;
    })
    .finally(() => {
      searchIndexPromise = null;
    });

  return searchIndexPromise;
}

function useSearchIndex() {
  const [index, setIndex] = useState(() => cachedSearchIndex || {
    documents: [],
    profiles: [],
  });
  const [loading, setLoading] = useState(!cachedSearchIndex);

  useEffect(() => {
    let mounted = true;

    fetchSearchIndex()
      .then((value) => {
        if (mounted) setIndex(value);
      })
      .catch((error) => {
        console.warn('Không tải được gợi ý tìm kiếm:', error?.message || error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { ...index, loading };
}

function SuggestionIcon({ type }) {
  if (type === 'author') return <UserRound size={17} />;
  if (type === 'subject') return <GraduationCap size={17} />;
  if (type === 'category') return <Tags size={17} />;
  if (type === 'school') return <School size={17} />;
  return <BookOpen size={17} />;
}

function SuggestionPanel({
  activeIndex,
  inputValue,
  loading,
  listId,
  onChoose,
  onHover,
  suggestions,
}) {
  return (
    <div className="smart-search-panel-v70-1" id={listId} role="listbox">
      <div className="smart-search-panel-v70-1__head">
        <strong>{normalizeSearchText(inputValue) ? 'Gợi ý phù hợp' : 'Gợi ý tìm kiếm'}</strong>
        <small>Tìm theo tài liệu, tác giả, username, môn học và trường</small>
      </div>

      {loading && !suggestions.length ? (
        <div className="smart-search-status-v70-1">Đang tải gợi ý...</div>
      ) : suggestions.length ? (
        <div className="smart-search-list-v70-1">
          {suggestions.map((item, index) => (
            <button
              aria-selected={activeIndex === index}
              className={activeIndex === index ? 'is-active' : ''}
              key={item.id}
              onMouseDown={(event) => {
                event.preventDefault();
                onChoose(item);
              }}
              onMouseEnter={() => onHover(index)}
              role="option"
              type="button"
            >
              <span className={`smart-search-icon-v70-1 is-${item.type}`}>
                <SuggestionIcon type={item.type} />
              </span>
              <span className="smart-search-copy-v70-1">
                <strong>{item.label}</strong>
                <small>{item.meta}</small>
              </span>
              <span className="smart-search-type-v70-1">
                {item.type === 'author' ? 'Hồ sơ' : item.type === 'document' ? 'Mở' : 'Tìm'}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="smart-search-status-v70-1">
          <Search size={18} />
          <span>
            Không có gợi ý sẵn. Nhấn <b>Enter</b> để tìm “{inputValue.trim()}”.
          </span>
        </div>
      )}
    </div>
  );
}

function useSmartSearch(value, limit = 8) {
  const { documents, profiles, loading } = useSearchIndex();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listId = useId();

  const suggestions = useMemo(
    () => buildSearchSuggestions(documents, value, limit, profiles),
    [documents, limit, profiles, value],
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  useEffect(() => {
    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, []);

  function handleKeyDown(event, choose) {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (
        suggestions.length ? (current + 1) % suggestions.length : -1
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

    if (event.key === 'Enter' && open && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      choose(suggestions[activeIndex]);
    }
  }

  return {
    activeIndex,
    handleKeyDown,
    listId,
    loading,
    open,
    rootRef,
    setActiveIndex,
    setOpen,
    suggestions,
  };
}

export function SmartSearchForm({
  buttonClassName = '',
  buttonLabel = 'Tìm kiếm',
  className = '',
  compact = false,
  onChange,
  onSubmit,
  placeholder = 'Tìm tài liệu, môn học, tác giả...',
  value,
}) {
  const smart = useSmartSearch(value, compact ? 7 : 9);

  function choose(item) {
    onChange(item.value);
    smart.setOpen(false);
    smart.setActiveIndex(-1);
    onSubmit(item.value, item);
  }

  return (
    <form
      className={`${className} smart-search-form-v70-1${compact ? ' is-compact' : ''}`.trim()}
      onSubmit={(event) => {
        event.preventDefault();
        smart.setOpen(false);
        onSubmit(value.trim(), null);
      }}
      ref={smart.rootRef}
    >
      <Search className="smart-search-leading-v70-1" size={compact ? 17 : 20} />

      <div className="smart-search-field-v70-1">
        <input
          aria-autocomplete="list"
          aria-controls={smart.listId}
          aria-expanded={smart.open}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            smart.setOpen(true);
          }}
          onFocus={() => smart.setOpen(true)}
          onKeyDown={(event) => smart.handleKeyDown(event, choose)}
          placeholder={placeholder}
          value={value}
        />

        {smart.open && (
          <SuggestionPanel
            activeIndex={smart.activeIndex}
            inputValue={value}
            listId={smart.listId}
            loading={smart.loading}
            onChoose={choose}
            onHover={smart.setActiveIndex}
            suggestions={smart.suggestions}
          />
        )}
      </div>

      <button className={buttonClassName} type="submit">{buttonLabel}</button>
    </form>
  );
}

export function SmartSearchInput({
  onChange,
  onChoose,
  placeholder = 'Tên tài liệu, tác giả, môn học, trường học...',
  value,
}) {
  const smart = useSmartSearch(value, 9);

  function choose(item) {
    onChange(item.value);
    smart.setOpen(false);
    smart.setActiveIndex(-1);
    onChoose?.(item.value, item);
  }

  return (
    <div className="smart-search-input-v70-1" ref={smart.rootRef}>
      <div className="input-icon">
        <Search size={16} />
        <input
          aria-autocomplete="list"
          aria-controls={smart.listId}
          aria-expanded={smart.open}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            smart.setOpen(true);
          }}
          onFocus={() => smart.setOpen(true)}
          onKeyDown={(event) => smart.handleKeyDown(event, choose)}
          placeholder={placeholder}
          value={value}
        />
      </div>

      {smart.open && (
        <SuggestionPanel
          activeIndex={smart.activeIndex}
          inputValue={value}
          listId={smart.listId}
          loading={smart.loading}
          onChoose={choose}
          onHover={smart.setActiveIndex}
          suggestions={smart.suggestions}
        />
      )}
    </div>
  );
}
