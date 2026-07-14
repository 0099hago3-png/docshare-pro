import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import DocumentCard from './DocumentCard.jsx';

export default function DocumentRail({
  title,
  icon,
  documents = [],
  emptyText = 'Chưa có tài liệu.',
  linkLabel = 'Xem tất cả',
  linkTo = '/documents',
}) {
  const railRef = useRef(null);

  function scroll(direction) {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.88, 520),
      behavior: 'smooth',
    });
  }

  return (
    <section className="home-section home-section-v70-3">
      <div className="section-heading home-section-heading-v70-3">
        <div>
          {icon}
          <h2>{title}</h2>
        </div>

        <div className="home-rail-tools-v70-3">
          <button
            aria-label={`Cuộn ${title} sang trái`}
            className="home-rail-arrow-v70-3"
            onClick={() => scroll(-1)}
            type="button"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            aria-label={`Cuộn ${title} sang phải`}
            className="home-rail-arrow-v70-3"
            onClick={() => scroll(1)}
            type="button"
          >
            <ChevronRight size={17} />
          </button>
          <Link to={linkTo}>{linkLabel}</Link>
        </div>
      </div>

      {documents.length ? (
        <div className="home-document-rail-v70-3" ref={railRef}>
          {documents.map((item) => (
            <DocumentCard document={item} key={item.id} />
          ))}
        </div>
      ) : (
        <div className="home-rail-empty-v70-3">{emptyText}</div>
      )}
    </section>
  );
}
