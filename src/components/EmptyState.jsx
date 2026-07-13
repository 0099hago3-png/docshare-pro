import { Leaf } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state botanical-card">
      <div className="empty-state__icon"><Leaf size={28} /></div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
