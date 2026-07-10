import { BookOpen, GraduationCap } from 'lucide-react';

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
  const hasImage = Boolean(doc?.coverPreview);
  const style = hasImage ? { backgroundImage: `linear-gradient(180deg,rgba(16,24,32,.05),rgba(16,24,32,.42)),url(${doc.coverPreview})` } : undefined;

  return (
    <div className={`book-cover book-cover-${size} book-theme-${theme} ${hasImage ? 'has-cover-image' : ''} ${className}`} style={style}>
      <span className="book-spine" />
      <span className="book-page-edge" />
      <div className="book-cover-content">
        <span className="book-imprint"><BookOpen size={13}/> DOCSHARE ACADEMIC</span>
        {!hasImage && <span className="book-emblem" aria-hidden="true">{doc?.cover || <GraduationCap size={28}/>}</span>}
        <div className="book-title-block">
          <strong>{doc?.title || 'Tài liệu học thuật'}</strong>
          <small>{doc?.subject || 'Chuyên đề học tập'}</small>
        </div>
        <div className="book-cover-footer">
          <span>{doc?.type || 'PDF'}</span>
          <span>{doc?.school || 'DocShare Library'}</span>
        </div>
      </div>
    </div>
  );
}
