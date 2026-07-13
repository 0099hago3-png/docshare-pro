import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  LineChart,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import './market-chart.css';

const RANGE_OPTIONS = [
  { key: '7D', label: '7 ngày', size: 7 },
  { key: '30D', label: '30 ngày', size: 30 },
  { key: '90D', label: '90 ngày', size: 90 },
  { key: '1Y', label: '1 năm', size: 365 },
];

const NUMBER_KEYS = [
  'value',
  'count',
  'total',
  'amount',
  'views',
  'users',
  'documents',
  'posts',
  'revenue',
  'credit',
  'y',
];

const LABEL_KEYS = [
  'label',
  'date',
  'day',
  'name',
  'month',
  'time',
  'x',
];

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function findFirstKey(item, keys) {
  if (!item || typeof item !== 'object') return null;
  return keys.find((key) => Object.prototype.hasOwnProperty.call(item, key)) || null;
}

function normalizeData(input) {
  if (!Array.isArray(input)) return [];

  return input.map((item, index) => {
    if (typeof item === 'number') {
      return {
        label: `Mốc ${index + 1}`,
        value: toFiniteNumber(item),
      };
    }

    if (!item || typeof item !== 'object') {
      return {
        label: `Mốc ${index + 1}`,
        value: 0,
      };
    }

    const numberKey = findFirstKey(item, NUMBER_KEYS);
    const labelKey = findFirstKey(item, LABEL_KEYS);

    const fallbackNumberKey = Object.keys(item).find(
      (key) => typeof item[key] === 'number'
    );

    return {
      ...item,
      label: String(
        item[labelKey]
        ?? item.created_at
        ?? item.createdAt
        ?? `Mốc ${index + 1}`
      ),
      value: toFiniteNumber(
        item[numberKey]
        ?? item[fallbackNumberKey]
        ?? 0
      ),
    };
  });
}

function formatCompactNumber(value) {
  const number = toFiniteNumber(value);

  return new Intl.NumberFormat('vi-VN', {
    notation: Math.abs(number) >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(number);
}

function formatFullNumber(value) {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2,
  }).format(toFiniteNumber(value));
}

function formatPercent(value) {
  const number = toFiniteNumber(value);

  if (Math.abs(number) >= 100) {
    return `${number > 0 ? '+' : ''}${number.toFixed(0)}%`;
  }

  return `${number > 0 ? '+' : ''}${number.toFixed(1)}%`;
}

function getChange(current, previous) {
  const safeCurrent = toFiniteNumber(current);
  const safePrevious = toFiniteNumber(previous);

  if (safePrevious === 0) {
    if (safeCurrent === 0) return 0;
    return 100;
  }

  return ((safeCurrent - safePrevious) / Math.abs(safePrevious)) * 100;
}

function buildSmoothPath(points) {
  if (!points.length) return '';

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;

    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function buildAreaPath(points, chartBottom) {
  if (!points.length) return '';

  const linePath = buildSmoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath} L ${last.x} ${chartBottom} L ${first.x} ${chartBottom} Z`;
}

function getDirection(change) {
  if (change > 0.001) return 'up';
  if (change < -0.001) return 'down';
  return 'flat';
}

function directionIcon(direction, size = 16) {
  if (direction === 'up') return <ArrowUpRight size={size} />;
  if (direction === 'down') return <ArrowDownRight size={size} />;
  return <Minus size={size} />;
}

function safeFormatter(formatter, value) {
  if (typeof formatter === 'function') {
    try {
      return formatter(value);
    } catch {
      return formatFullNumber(value);
    }
  }

  return formatFullNumber(value);
}

export default function MarketChart({
  title = 'Biểu đồ tăng trưởng',
  subtitle = 'Theo dõi biến động dữ liệu theo thời gian',
  data = [],
  values,
  labels,
  series,
  datasets,
  formatValue,
  valueFormatter,
  metricLabel = 'Tổng giá trị',
  unit = '',
  loading = false,
  compact = false,
  height = 360,
  showTable = true,
  showRange = true,
  className = '',
}) {
  const sourceData = useMemo(() => {
    if (Array.isArray(data) && data.length) {
      return normalizeData(data);
    }

    if (Array.isArray(series) && series.length) {
      const firstSeries = series[0];

      if (Array.isArray(firstSeries?.data)) {
        return normalizeData(firstSeries.data);
      }

      return normalizeData(series);
    }

    if (Array.isArray(datasets) && datasets.length) {
      const firstDataset = datasets[0];
      const datasetValues = Array.isArray(firstDataset?.data)
        ? firstDataset.data
        : [];

      return datasetValues.map((value, index) => ({
        label: String(labels?.[index] ?? `Mốc ${index + 1}`),
        value: toFiniteNumber(value),
      }));
    }

    if (Array.isArray(values) && values.length) {
      return values.map((value, index) => ({
        label: String(labels?.[index] ?? `Mốc ${index + 1}`),
        value: toFiniteNumber(value),
      }));
    }

    return [];
  }, [data, values, labels, series, datasets]);

  const [range, setRange] = useState('30D');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tableOpen, setTableOpen] = useState(true);

  const activeRange = RANGE_OPTIONS.find((item) => item.key === range)
    || RANGE_OPTIONS[1];

  const visibleData = useMemo(() => {
    if (!sourceData.length) return [];

    const amount = Math.min(activeRange.size, sourceData.length);
    return sourceData.slice(sourceData.length - amount);
  }, [sourceData, activeRange.size]);

  const summary = useMemo(() => {
    const valuesList = visibleData.map((item) => item.value);

    if (!valuesList.length) {
      return {
        current: 0,
        previous: 0,
        change: 0,
        direction: 'flat',
        high: 0,
        low: 0,
        average: 0,
        total: 0,
      };
    }

    const current = valuesList[valuesList.length - 1] ?? 0;
    const previous = valuesList[valuesList.length - 2] ?? current;
    const change = getChange(current, previous);

    return {
      current,
      previous,
      change,
      direction: getDirection(change),
      high: Math.max(...valuesList),
      low: Math.min(...valuesList),
      average: valuesList.reduce((sum, value) => sum + value, 0) / valuesList.length,
      total: valuesList.reduce((sum, value) => sum + value, 0),
    };
  }, [visibleData]);

  const formatter = formatValue || valueFormatter;
  const selectedPoint = hoveredIndex == null
    ? null
    : visibleData[hoveredIndex] || null;

  const chart = useMemo(() => {
    const width = 1040;
    const top = 26;
    const right = 22;
    const bottom = 52;
    const left = 54;
    const chartWidth = width - left - right;
    const chartHeight = Math.max(180, Number(height) - top - bottom);
    const chartBottom = top + chartHeight;

    if (!visibleData.length) {
      return {
        width,
        top,
        right,
        bottom,
        left,
        chartWidth,
        chartHeight,
        chartBottom,
        points: [],
        min: 0,
        max: 0,
        ticks: [0, 0, 0, 0, 0],
        linePath: '',
        areaPath: '',
      };
    }

    const valuesList = visibleData.map((item) => item.value);
    let min = Math.min(...valuesList);
    let max = Math.max(...valuesList);

    if (min === max) {
      const padding = Math.max(Math.abs(min) * 0.2, 1);
      min -= padding;
      max += padding;
    } else {
      const padding = (max - min) * 0.18;
      min -= padding;
      max += padding;
    }

    const points = visibleData.map((item, index) => {
      const x = visibleData.length === 1
        ? left + chartWidth / 2
        : left + (index / (visibleData.length - 1)) * chartWidth;

      const ratio = (item.value - min) / (max - min);
      const y = top + chartHeight - ratio * chartHeight;

      return {
        x,
        y,
        value: item.value,
        label: item.label,
        index,
      };
    });

    const ticks = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      return max - ratio * (max - min);
    });

    return {
      width,
      top,
      right,
      bottom,
      left,
      chartWidth,
      chartHeight,
      chartBottom,
      points,
      min,
      max,
      ticks,
      linePath: buildSmoothPath(points),
      areaPath: buildAreaPath(points, chartBottom),
    };
  }, [visibleData, height]);

  const lineTone = summary.direction === 'down' ? 'down' : 'up';
  const chartClassName = [
    'market-board',
    compact ? 'is-compact' : '',
    `is-${lineTone}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={chartClassName}>
      <div className="market-board__header">
        <div className="market-board__heading">
          <span className="market-board__heading-icon">
            <LineChart size={21} />
          </span>

          <div>
            <div className="market-board__eyebrow">
              <Activity size={13} />
              DỮ LIỆU PHÂN TÍCH
            </div>

            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>

        {showRange && (
          <div className="market-board__ranges" aria-label="Chọn khoảng thời gian">
            {RANGE_OPTIONS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={range === item.key ? 'is-active' : ''}
                onClick={() => setRange(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="market-board__summary">
        <article className="market-board__quote">
          <div className="market-board__quote-topline">
            <span>{metricLabel}</span>

            <span className={`market-board__live-dot is-${summary.direction}`}>
              <i />
              Cập nhật
            </span>
          </div>

          <div className="market-board__main-value">
            {safeFormatter(formatter, summary.current)}
            {unit && <small>{unit}</small>}
          </div>

          <div className={`market-board__change is-${summary.direction}`}>
            {directionIcon(summary.direction, 17)}
            <strong>{formatPercent(summary.change)}</strong>
            <span>
              so với mốc trước
            </span>
          </div>
        </article>

        <div className="market-board__mini-cards">
          <article>
            <span>Cao nhất</span>
            <strong>{safeFormatter(formatter, summary.high)}</strong>
            <small>
              <TrendingUp size={14} />
              Đỉnh kỳ
            </small>
          </article>

          <article>
            <span>Thấp nhất</span>
            <strong>{safeFormatter(formatter, summary.low)}</strong>
            <small>
              <TrendingDown size={14} />
              Đáy kỳ
            </small>
          </article>

          <article>
            <span>Trung bình</span>
            <strong>{safeFormatter(formatter, summary.average)}</strong>
            <small>
              <BarChart3 size={14} />
              Bình quân
            </small>
          </article>

          <article>
            <span>Tổng kỳ</span>
            <strong>{safeFormatter(formatter, summary.total)}</strong>
            <small>
              <CalendarDays size={14} />
              {activeRange.label}
            </small>
          </article>
        </div>
      </div>

      <div className="market-board__chart-shell">
        {loading ? (
          <div className="market-board__state">
            <span className="market-board__loader" />
            <strong>Đang tải dữ liệu...</strong>
            <p>Hệ thống đang tổng hợp số liệu mới nhất.</p>
          </div>
        ) : !visibleData.length ? (
          <div className="market-board__state">
            <BarChart3 size={34} />
            <strong>Chưa có dữ liệu thống kê</strong>
            <p>Dữ liệu thật sẽ xuất hiện tại đây khi hệ thống có hoạt động.</p>
          </div>
        ) : (
          <>
            <svg
              className="market-board__chart"
              viewBox={`0 0 ${chart.width} ${chart.chartBottom + chart.bottom}`}
              role="img"
              aria-label={`${title}: ${visibleData.length} mốc dữ liệu`}
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient
                  id="marketAreaUp"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#1d8a5b" stopOpacity="0.30" />
                  <stop offset="70%" stopColor="#1d8a5b" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#1d8a5b" stopOpacity="0" />
                </linearGradient>

                <linearGradient
                  id="marketAreaDown"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#cf4a4a" stopOpacity="0.26" />
                  <stop offset="70%" stopColor="#cf4a4a" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#cf4a4a" stopOpacity="0" />
                </linearGradient>

                <filter id="marketLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {chart.ticks.map((tick, index) => {
                const y = chart.top + (index / 4) * chart.chartHeight;

                return (
                  <g key={`grid-${index}`}>
                    <line
                      x1={chart.left}
                      x2={chart.left + chart.chartWidth}
                      y1={y}
                      y2={y}
                      className="market-board__grid-line"
                    />

                    <text
                      x={chart.left - 11}
                      y={y + 4}
                      className="market-board__axis-value"
                      textAnchor="end"
                    >
                      {formatCompactNumber(tick)}
                    </text>
                  </g>
                );
              })}

              <path
                d={chart.areaPath}
                className="market-board__area"
                fill={
                  lineTone === 'down'
                    ? 'url(#marketAreaDown)'
                    : 'url(#marketAreaUp)'
                }
              />

              <path
                d={chart.linePath}
                className="market-board__line-glow"
                filter="url(#marketLineGlow)"
              />

              <path
                d={chart.linePath}
                className="market-board__line"
              />

              {chart.points.map((point, index) => {
                const isHovered = index === hoveredIndex;
                const previous = index > 0
                  ? chart.points[index - 1].value
                  : point.value;

                const change = getChange(point.value, previous);
                const pointDirection = getDirection(change);

                return (
                  <g
                    key={`${point.label}-${index}`}
                    className="market-board__point-group"
                    onMouseEnter={() => setHoveredIndex(index)}
                  >
                    <rect
                      x={point.x - Math.max(12, chart.chartWidth / Math.max(visibleData.length, 1) / 2)}
                      y={chart.top}
                      width={Math.max(24, chart.chartWidth / Math.max(visibleData.length, 1))}
                      height={chart.chartHeight}
                      fill="transparent"
                    />

                    {isHovered && (
                      <>
                        <line
                          x1={point.x}
                          x2={point.x}
                          y1={chart.top}
                          y2={chart.chartBottom}
                          className="market-board__crosshair"
                        />

                        <line
                          x1={chart.left}
                          x2={chart.left + chart.chartWidth}
                          y1={point.y}
                          y2={point.y}
                          className="market-board__crosshair is-horizontal"
                        />
                      </>
                    )}

                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isHovered ? 7 : 4.5}
                      className={`market-board__point is-${pointDirection}`}
                    />

                    {isHovered && (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="13"
                        className="market-board__point-ring"
                      />
                    )}
                  </g>
                );
              })}

              {chart.points.map((point, index) => {
                const every = Math.max(1, Math.ceil(chart.points.length / 7));

                if (
                  index !== 0
                  && index !== chart.points.length - 1
                  && index % every !== 0
                ) {
                  return null;
                }

                return (
                  <text
                    key={`label-${index}`}
                    x={point.x}
                    y={chart.chartBottom + 30}
                    className="market-board__axis-label"
                    textAnchor={
                      index === 0
                        ? 'start'
                        : index === chart.points.length - 1
                          ? 'end'
                          : 'middle'
                    }
                  >
                    {point.label}
                  </text>
                );
              })}
            </svg>

            {selectedPoint && chart.points[hoveredIndex] && (
              <div
                className="market-board__tooltip"
                style={{
                  left: `${(chart.points[hoveredIndex].x / chart.width) * 100}%`,
                  top: `${Math.max(
                    8,
                    ((chart.points[hoveredIndex].y - 74) / (chart.chartBottom + chart.bottom)) * 100
                  )}%`,
                }}
              >
                <span>{selectedPoint.label}</span>
                <strong>
                  {safeFormatter(formatter, selectedPoint.value)}
                  {unit && <small>{unit}</small>}
                </strong>

                {hoveredIndex > 0 && (
                  <em className={`is-${getDirection(
                    getChange(
                      selectedPoint.value,
                      visibleData[hoveredIndex - 1]?.value
                    )
                  )}`}>
                    {directionIcon(getDirection(
                      getChange(
                        selectedPoint.value,
                        visibleData[hoveredIndex - 1]?.value
                      )
                    ), 13)}
                    {formatPercent(
                      getChange(
                        selectedPoint.value,
                        visibleData[hoveredIndex - 1]?.value
                      )
                    )}
                  </em>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showTable && visibleData.length > 0 && (
        <div className="market-board__table-wrap">
          <button
            className="market-board__table-toggle"
            type="button"
            onClick={() => setTableOpen((value) => !value)}
          >
            <span>
              <BarChart3 size={17} />
              Bảng biến động chi tiết
            </span>

            <ChevronDown
              size={17}
              className={tableOpen ? 'is-open' : ''}
            />
          </button>

          {tableOpen && (
            <div className="market-board__table-scroll">
              <table className="market-board__table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Giá trị</th>
                    <th>Thay đổi</th>
                    <th>Tỷ lệ</th>
                    <th>Xu hướng</th>
                  </tr>
                </thead>

                <tbody>
                  {[...visibleData]
                    .slice(-10)
                    .reverse()
                    .map((item, reverseIndex, reversedList) => {
                      const originalIndex = visibleData.length - 1 - reverseIndex;
                      const previous = originalIndex > 0
                        ? visibleData[originalIndex - 1]?.value ?? item.value
                        : item.value;

                      const delta = item.value - previous;
                      const change = getChange(item.value, previous);
                      const direction = getDirection(change);

                      return (
                        <tr key={`${item.label}-${reverseIndex}`}>
                          <td>
                            <strong>{item.label}</strong>
                          </td>

                          <td>
                            {safeFormatter(formatter, item.value)}
                            {unit && <small>{unit}</small>}
                          </td>

                          <td className={`is-${direction}`}>
                            {directionIcon(direction, 15)}
                            {delta > 0 ? '+' : ''}
                            {safeFormatter(formatter, delta)}
                          </td>

                          <td className={`is-${direction}`}>
                            {formatPercent(change)}
                          </td>

                          <td>
                            <span className={`market-board__trend-pill is-${direction}`}>
                              {direction === 'up'
                                ? <TrendingUp size={15} />
                                : direction === 'down'
                                  ? <TrendingDown size={15} />
                                  : <Minus size={15} />}

                              {direction === 'up'
                                ? 'Tăng'
                                : direction === 'down'
                                  ? 'Giảm'
                                  : 'Đi ngang'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
