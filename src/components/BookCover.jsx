import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';

const themeMap = {
  blue: 'oxford',
  purple: 'plum',
  orange: 'terracotta',
  green: 'forest',
  red: 'burgundy',
  cyan: 'slate',
  teal: 'emerald',
};

export default function BookCover({ doc, size = 'card', className = '' }) {
  const theme = themeMap[doc?.color] || 'oxford';
  const image = useMemo(() => doc?.coverPreview || doc?.coverImage || '', [doc]);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(image) && !imageFailed;

  return (
    <div
      className={`book-cover book-cover-${size} book-theme-${theme} ${showImage ? 'has-cover-image' : 'is-placeholder'} ${className}`}
      aria-label={`Ảnh bìa ${doc?.title || 'tài liệu'}`}
    >
      <span className="book-spine" />
      <span className="book-page-edge" />
      {showImage ? (
        <img
          className="book-cover-image"
          src={image}
          alt={`Ảnh bìa ${doc?.title || 'tài liệu'}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="book-cover-placeholder" aria-hidden="true">
          <span><BookOpen size={34} /></span>
          <strong>{doc?.subject || 'Tài liệu học tập'}</strong>
          <p>{doc?.title || 'DocShare Pro'}</p>
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  );
}
