import { GraduationCap, Sparkles } from 'lucide-react';

export default function TeacherBadge({ profile, compact = false, className = '' }) {
  if (profile?.role !== 'teacher') return null;

  return (
    <span
      className={[
        'teacher-badge-v70',
        compact ? 'is-compact' : '',
        className,
      ].filter(Boolean).join(' ')}
      title="Tài khoản giảng viên"
    >
      <GraduationCap size={compact ? 12 : 14} />
      <strong>Giảng viên</strong>
      <Sparkles size={compact ? 9 : 10} />
    </span>
  );
}
