import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import '../analytics-dashboard.css';
import { formatCompact, percentChange, toNumber } from '../lib/analytics.js';

const WIDTH = 1000;
const HEIGHT = 360;
const PADDING = { top: 26, right: 32, bottom: 52, left: 58 };
const SERIES_COLORS = ['#15945f', '#e44d4d', '#3977d8', '#d49a25'];

function pointsFor(values, min, max) {
  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const range = max - min || 1;

  return values.map((value, index) => ({
    x: values.length === 1
      ? PADDING.left + chartWidth / 2
      : PADDING.left + (index / (values.length - 1)) * chartWidth,
    y: PADDING.top + chartHeight - ((toNumber(value) - min) / range) * chartHeight,
  }));
}

function smoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const middleX = (previous.x + point.x) / 2;
    return `${path} C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function defaultFormat(value) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(toNumber(value));
}

export function MetricSparkline({ values = [], positive = true }) {
  const points = useMemo(() => {
    const safeValues = values.length ? values.map(toNumber) : [0, 0];
    const min = Math.min(...safeValues);
    const max = Math.max(...safeValues);
    const range = max - min || 1;

    return safeValues.map((value, index) => ({
      x: safeValues.length === 1 ? 45 : 4 + (index / (safeValues.length - 1)) * 84,
      y: 31 - ((value - min) / range) * 25,
    }));
  }, [values]);

  return (
    <svg className={`analytics-sparkline ${positive ? 'is-up' : 'is-down'}`} viewBox="0 0 92 36" aria-hidden="true">
      <path d={smoothPath(points)} />
    </svg>
  );
}

export function AnalyticsMetricCard({ icon: Icon, label, value, change = 0, values = [], helper }) {
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

  return (
    <article className="analytics-kpi-card">
      <span className="analytics-kpi-card__icon"><Icon size={22} /></span>
      <div className="analytics-kpi-card__content">
        <small>{label}</small>
        <strong>{value}</strong>
        <span className={`analytics-change is-${direction}`}>
          {direction === 'up' ? <ArrowUpRight size={14} /> : direction === 'down' ? <ArrowDownRight size={14} /> : <Minus size={14} />}
          {change > 0 ? '+' : ''}{change.toFixed(1)}%
          <em>{helper || 'so với kỳ trước'}</em>
        </span>
      </div>
      <MetricSparkline values={values} positive={direction !== 'down'} />
    </article>
  );
}

export default function StockAnalyticsChart({
  title,
  subtitle,
  data = [],
  series = [],
  valueFormatter = defaultFormat,
  emptyText = 'Chưa có dữ liệu trong khoảng thời gian này.',
}) {
  const [hovered, setHovered] = useState(null);

  const chart = useMemo(() => {
    const allValues = series.flatMap((item) => data.map((row) => toNumber(row[item.key])));
    let min = allValues.length ? Math.min(...allValues, 0) : 0;
    let max = allValues.length ? Math.max(...allValues, 1) : 1;
    const padding = Math.max((max - min) * 0.15, max * 0.06, 1);
    min = Math.min(0, min - padding);
    max += padding;

    return {
      min,
      max,
      lines: series.map((item, index) => {
        const values = data.map((row) => toNumber(row[item.key]));
        const points = pointsFor(values, min, max);
        return {
          ...item,
          color: item.color || SERIES_COLORS[index % SERIES_COLORS.length],
          values,
          points,
          path: smoothPath(points),
        };
      }),
    };
  }, [data, series]);

  const primary = chart.lines[0];
  const current = primary?.values.at(-1) || 0;
  const previous = primary?.values.at(-2) ?? current;
  const change = percentChange(current, previous);
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const gridTicks = Array.from({ length: 6 }, (_, index) => chart.max - (index / 5) * (chart.max - chart.min));

  return (
    <section className="stock-chart-card">
      <div className="stock-chart-card__header">
        <div>
          <span className="analytics-eyebrow">PHÂN TÍCH BIẾN ĐỘNG</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {primary && (
          <div className="stock-chart-card__quote">
            <small>{primary.label}</small>
            <strong>{valueFormatter(current, primary)}</strong>
            <span className={`analytics-change is-${direction}`}>
              {direction === 'up' ? <ArrowUpRight size={15} /> : direction === 'down' ? <ArrowDownRight size={15} /> : <Minus size={15} />}
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="stock-chart-card__legend">
        {chart.lines.map((item) => (
          <span key={item.key}><i style={{ background: item.color }} />{item.label}</span>
        ))}
      </div>

      {!data.length || !series.length ? (
        <div className="stock-chart-card__empty">{emptyText}</div>
      ) : (
        <div className="stock-chart-card__plot" onMouseLeave={() => setHovered(null)}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" role="img" aria-label={title}>
            <defs>
              {chart.lines.map((line, index) => (
                <linearGradient key={line.key} id={`analytics-area-${index}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={line.color} stopOpacity="0.23" />
                  <stop offset="100%" stopColor={line.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>

            {gridTicks.map((tick, index) => {
              const y = PADDING.top + (index / 5) * (HEIGHT - PADDING.top - PADDING.bottom);
              return (
                <g key={index}>
                  <line className="stock-grid-line" x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y} y2={y} />
                  <text className="stock-axis-text" x={PADDING.left - 10} y={y + 4} textAnchor="end">{formatCompact(tick)}</text>
                </g>
              );
            })}

            {chart.lines.map((line, lineIndex) => {
              const areaPath = line.points.length
                ? `${line.path} L ${line.points.at(-1).x} ${HEIGHT - PADDING.bottom} L ${line.points[0].x} ${HEIGHT - PADDING.bottom} Z`
                : '';

              return (
                <g key={line.key}>
                  {lineIndex === 0 && <path d={areaPath} fill={`url(#analytics-area-${lineIndex})`} />}
                  <path className="stock-line-glow" d={line.path} stroke={line.color} />
                  <path className="stock-line" d={line.path} stroke={line.color} />
                  {line.points.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r={hovered === index ? 6 : 3.5}
                      fill="#fff"
                      stroke={line.color}
                      strokeWidth="3"
                    />
                  ))}
                </g>
              );
            })}

            {data.map((row, index) => {
              const x = data.length === 1
                ? PADDING.left + (WIDTH - PADDING.left - PADDING.right) / 2
                : PADDING.left + (index / (data.length - 1)) * (WIDTH - PADDING.left - PADDING.right);
              const labelStep = Math.max(1, Math.ceil(data.length / 8));

              return (
                <g key={row.key || row.label || index} onMouseEnter={() => setHovered(index)}>
                  <rect x={x - 18} y={PADDING.top} width="36" height={HEIGHT - PADDING.top - PADDING.bottom} fill="transparent" />
                  {hovered === index && <line className="stock-crosshair" x1={x} x2={x} y1={PADDING.top} y2={HEIGHT - PADDING.bottom} />}
                  {(index === 0 || index === data.length - 1 || index % labelStep === 0) && (
                    <text className="stock-axis-text" x={x} y={HEIGHT - 20} textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'}>{row.label}</text>
                  )}
                </g>
              );
            })}
          </svg>

          {hovered != null && data[hovered] && (
            <div className="stock-tooltip" style={{ left: `${Math.min(88, Math.max(12, (hovered / Math.max(1, data.length - 1)) * 100))}%` }}>
              <strong>{data[hovered].fullLabel || data[hovered].label}</strong>
              {chart.lines.map((line) => (
                <span key={line.key}><i style={{ background: line.color }} />{line.label}<b>{valueFormatter(data[hovered][line.key], line)}</b></span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
