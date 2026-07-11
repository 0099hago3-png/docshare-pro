import { useMemo, useState } from 'react';

function makeSmoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function formatCompact(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(Math.round(value));
}

export default function MarketChart({ labels = [], series = [], height = 300, title = 'Thống kê hoạt động', subtitle = 'Theo dõi hiệu suất theo thời gian' }) {
  const academicPalette = ['#24513f', '#b68a3d', '#8f6b54', '#5f7b6b', '#7a8d7b'];
  const [activeIndex, setActiveIndex] = useState(Math.max(0, labels.length - 2));
  const width = 1000;
  const padding = { left: 60, right: 24, top: 24, bottom: 42 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const maxValue = useMemo(() => Math.ceil(Math.max(1, ...series.flatMap((item) => item.values || [])) / 100) * 100, [series]);
  const pointsBySeries = useMemo(() => series.map((item, seriesIndex) => {
    const count = Math.max(1, (item.values || []).length - 1);
    const points = (item.values || []).map((value, index) => ({
      x: padding.left + (index / count) * innerW,
      y: padding.top + innerH - (value / maxValue) * innerH,
      value,
      index,
    }));
    return { ...item, color: academicPalette[seriesIndex % academicPalette.length], points, path: makeSmoothPath(points) };
  }), [series, innerH, innerW, maxValue]);
  const activeX = pointsBySeries[0]?.points?.[activeIndex]?.x ?? padding.left;

  return (
    <section className="market-chart-card market-chart-v25">
      {(title || subtitle) && <div className="market-chart-heading"><div>{title && <h3>{title}</h3>}{subtitle && <p>{subtitle}</p>}</div></div>}
      <div className="chart-legend">{series.map((item) => <span key={item.key}><i style={{ background: item.color }}/>{item.label}</span>)}</div>
      <div className="market-chart-wrap" style={{ height }}>
        <svg className="market-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={title || 'Biểu đồ'}>
          <defs>{pointsBySeries.map((item) => <linearGradient key={item.key} id={`area-${item.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={item.color} stopOpacity=".12"/><stop offset="100%" stopColor={item.color} stopOpacity="0"/></linearGradient>)}</defs>
          {[0,1,2,3,4].map((tick) => { const y = padding.top + (tick / 4) * innerH; const value = maxValue - (tick / 4) * maxValue; return <g key={tick}><line x1={padding.left} x2={width-padding.right} y1={y} y2={y} className="chart-grid-line"/><text x={padding.left-12} y={y+4} textAnchor="end" className="chart-axis-label">{formatCompact(value)}</text></g>; })}
          {labels.map((label,index) => { const count=Math.max(1,labels.length-1); const x=padding.left+(index/count)*innerW; return <g key={`${label}-${index}`}><text x={x} y={height-10} textAnchor="middle" className="chart-axis-label">{label}</text></g>; })}
          <line x1={activeX} x2={activeX} y1={padding.top} y2={padding.top+innerH} className="chart-crosshair"/>
          {pointsBySeries.map((item,seriesIndex) => {
            const bottom=padding.top+innerH;
            const area=item.points.length?`${item.path} L ${item.points.at(-1).x} ${bottom} L ${item.points[0].x} ${bottom} Z`:'';
            return <g key={item.key}>{seriesIndex===0&&<path d={area} fill={`url(#area-${item.key})`}/>}<path d={item.path} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" className="chart-line"/>{item.points.map((point)=><g key={point.index}><circle cx={point.x} cy={point.y} r={point.index===activeIndex?5.5:3.5} fill="#fffdfa" stroke={item.color} strokeWidth="2.2"/><circle cx={point.x} cy={point.y} r="18" fill="transparent" onMouseEnter={()=>setActiveIndex(point.index)} onClick={()=>setActiveIndex(point.index)} className="chart-hit"/></g>)}</g>;
          })}
        </svg>
        {!!labels.length && <div className="chart-tooltip" style={{ left:`${Math.min(84,Math.max(12,(activeX/width)*100))}%` }}><b>{labels[activeIndex]}</b>{pointsBySeries.map((item)=><span key={item.key}><i style={{background:item.color}}/>{item.label}: <strong>{formatCompact(item.points[activeIndex]?.value||0)}</strong></span>)}</div>}
      </div>
    </section>
  );
}
